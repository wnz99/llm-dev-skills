"""Behavioral updater tests: real Git fixtures and disposable installations."""
import base64
import importlib.util
import json
import os
from pathlib import Path
import shutil
import shlex
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / 'skills/wnz-update/scripts/update.py'
spec = importlib.util.spec_from_file_location('wnz_update', SCRIPT)
updater = importlib.util.module_from_spec(spec)
spec.loader.exec_module(updater)


class UpdateTests(unittest.TestCase):
    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory()
        self.addCleanup(self.scratch.cleanup)
        self.base = Path(self.scratch.name)
        self.source, self.home = self.base / 'source', self.base / 'home'
        self.source.mkdir()
        self.home.mkdir()
        self.git('init', '-q', '-b', 'main')
        self.git('config', 'user.name', 'Fixture')
        self.git('config', 'user.email', 'fixture@example.invalid')
        (self.source / 'VERSION').write_text('1.0.0\n')
        self.package('wnz-one', 'old content')
        path = self.source / 'skills/wnz-update/references'
        path.mkdir(parents=True)
        (path / 'dependencies.json').write_text('{}')
        (path.parent / 'SKILL.md').write_text('---\nname: wnz-update\n---\nUpdater')
        self.commit()
        root = self.home / '.agents/skills'
        root.mkdir(parents=True)
        shutil.copytree(self.source / 'skills/wnz-one', root / 'wnz-one')
        (self.home / '.claude/skills').mkdir(parents=True)
        (self.home / '.claude/skills/wnz-one').symlink_to(root / 'wnz-one')

    def git(self, *args):
        return subprocess.check_output(['git', '-C', str(self.source), *args],
                                       env=updater.git_environment()).decode().strip()

    def commit(self):
        self.git('add', '.')
        self.git('commit', '-qm', 'fixture')

    def package(self, name, text):
        path = self.source / 'skills' / name
        path.mkdir(parents=True, exist_ok=True)
        (path / 'SKILL.md').write_text(f'---\nname: {name}\n---\n{text}\n')

    def upgrade(self):
        (self.source / 'VERSION').write_text('1.1.0\n')
        self.package('wnz-one', 'new content')
        self.commit()

    def plan(self):
        return updater.plan(self.source, updater.inventory(self.home),
                            (self.source / 'VERSION').read_text().strip(),
                            self.git('rev-parse', 'HEAD'))

    def receipt(self):
        return json.loads((self.home / '.agents/wnz-installation.json').read_text())

    def snapshot(self):
        return {str(p.relative_to(self.home)): (os.readlink(p) if p.is_symlink() else p.read_bytes())
                for p in self.home.rglob('*') if p.is_file() or p.is_symlink()}

    def test_unversioned_upgrade_records_one_version_and_preserves_links(self):
        self.upgrade()
        result = updater.install(self.home, self.plan())
        self.assertEqual(self.receipt()['version'], '1.1.0')
        self.assertNotIn('version', self.receipt()['packages']['wnz-one'])
        self.assertTrue((Path(result['backup']) / 'wnz-one/SKILL.md').exists())
        self.assertTrue((self.home / '.claude/skills/wnz-one').is_symlink())

    def test_unknown_local_changes_block_without_writes(self):
        target = self.home / '.agents/skills/wnz-one/SKILL.md'
        target.write_text('private edits')
        self.upgrade()
        before = self.snapshot()
        with self.assertRaisesRegex(ValueError, 'locally modified'):
            self.plan()
        self.assertEqual(before, self.snapshot())

    def test_tracked_local_changes_and_added_packages_block(self):
        updater.install(self.home, self.plan())
        self.package('wnz-two', 'extra')
        shutil.copytree(self.source / 'skills/wnz-two', self.home / '.agents/skills/wnz-two')
        with self.assertRaisesRegex(ValueError, 'Locally modified package set'):
            self.plan()

    def test_same_version_changed_contents_and_downgrade_block(self):
        updater.install(self.home, self.plan())
        self.package('wnz-one', 'unversioned upstream change')
        with self.assertRaisesRegex(ValueError, 'version bump'):
            self.plan()
        (self.source / 'VERSION').write_text('0.9.0')
        with self.assertRaisesRegex(ValueError, 'downgrade'):
            self.plan()

    def test_dependencies_installed_and_linked_with_consumer(self):
        self.upgrade()
        self.package('wnz-required', 'dependency')
        (self.source / 'skills/wnz-update/references/dependencies.json').write_text(
            '{"wnz-one": ["wnz-required"]}')
        updater.install(self.home, self.plan())
        self.assertEqual(set(self.receipt()['packages']), {'wnz-one', 'wnz-required'})
        self.assertTrue((self.home / '.claude/skills/wnz-required').is_symlink())

    def test_missing_dependency_blocks_before_replacement(self):
        (self.source / 'skills/wnz-update/references/dependencies.json').write_text(
            '{"wnz-one": ["wnz-missing"]}')
        with self.assertRaisesRegex(ValueError, 'missing from origin'):
            self.plan()
        self.assertFalse((self.home / '.agents/wnz-installation.json').exists())

    def test_published_phase_executor_installs_cleanup_dependency(self):
        published = SCRIPT.parents[3]
        shutil.copytree(published / 'skills', self.source / 'skills', dirs_exist_ok=True)
        shutil.copyfile(published / 'VERSION', self.source / 'VERSION')
        self.commit()
        root = self.home / '.agents/skills'
        shutil.copytree(self.source / 'skills/wnz-phase-executor', root / 'wnz-phase-executor')

        updater.install(self.home, self.plan())

        self.assertIn('wnz-repo-cleanup', self.receipt()['packages'])
        self.assertEqual(
            (root / 'wnz-repo-cleanup/SKILL.md').read_bytes(),
            (published / 'skills/wnz-repo-cleanup/SKILL.md').read_bytes())
        self.assertTrue((self.home / '.claude/skills/wnz-repo-cleanup').is_symlink())
        self.assertFalse((root / 'wnz-ascii-diagrams').exists())

    def test_install_detects_inspection_race(self):
        payload = self.plan()
        (self.home / '.agents/skills/wnz-one/SKILL.md').write_text('racing writer')
        with self.assertRaisesRegex(ValueError, 'changed since inspection'):
            updater.install(self.home, payload)

    def test_failure_rolls_back_every_package_and_receipt(self):
        updater.install(self.home, self.plan())
        old = (self.home / '.agents/skills/wnz-one/SKILL.md').read_bytes()
        receipt = self.receipt()
        self.upgrade()
        payload = self.plan()
        original = updater.write_json

        def fail_receipt(path, data):
            if path.name == 'wnz-installation.json' and data['version'] == '1.1.0':
                raise OSError('injected disk failure')
            return original(path, data)

        with patch.object(updater, 'write_json', side_effect=fail_receipt):
            with self.assertRaisesRegex(OSError, 'disk failure'):
                updater.install(self.home, payload)
        self.assertEqual(self.receipt(), receipt)
        self.assertEqual((self.home / '.agents/skills/wnz-one/SKILL.md').read_bytes(), old)
        self.assertFalse((self.home / '.agents/wnz-pending.json').exists())

    def test_killed_update_requires_recovery_and_restores_old_package(self):
        root = self.home / '.agents/skills'
        backup = self.home / '.agents/wnz-backups/killed'
        backup.mkdir(parents=True)
        journal = {'backup': str(backup), 'packages': {'wnz-one': True},
                   'new_links': [], 'old_receipt': None}
        updater.write_json(self.home / '.agents/wnz-pending.json', journal)
        os.replace(root / 'wnz-one', backup / 'wnz-one')
        shutil.copytree(self.source / 'skills/wnz-one', root / 'wnz-one')
        (root / 'wnz-one/SKILL.md').write_text('partial new package')
        with self.assertRaisesRegex(ValueError, 'Interrupted update'):
            updater.inventory(self.home)
        updater.recover(self.home)
        self.assertIn('old content', (root / 'wnz-one/SKILL.md').read_text())
        self.assertIsNone(updater.inventory(self.home)['receipt'])

    def test_check_cli_is_read_only_and_current_bump_updates_receipt(self):
        before = self.snapshot()
        with patch.object(Path, 'home', return_value=self.home), patch.object(
                updater.sys, 'argv', ['update.py', '--check', '--source', str(self.source)]):
            self.assertEqual(updater.main(), 0)
        self.assertEqual(before, self.snapshot())
        updater.install(self.home, self.plan())
        (self.source / 'VERSION').write_text('1.0.1\n')
        self.commit()
        with patch.object(Path, 'home', return_value=self.home), patch.object(
                updater.sys, 'argv', ['update.py', '--source', str(self.source)]):
            self.assertEqual(updater.main(), 0)
        self.assertEqual(self.receipt()['version'], '1.0.1')

    def test_local_scope_does_not_discover_remotes(self):
        with patch.object(updater, 'run', side_effect=AssertionError('remote discovery')):
            self.assertEqual(updater.machine_targets(False, None), [('local', None)])

    def test_all_scope_and_named_machine(self):
        machines = [{'enabled': True, 'id': 'a', 'label': 'Home London', 'target': 'home'},
                    {'enabled': False, 'id': 'b', 'label': 'Disabled', 'target': 'other'}]
        with patch.object(updater, 'run', return_value=json.dumps(machines).encode()):
            self.assertEqual(updater.machine_targets(True, None),
                             [('local', None), ('Home London', 'home')])
            self.assertEqual(updater.machine_targets(False, 'Home London'), [('Home London', 'home')])

    def test_remote_worker_runs_real_inventory_and_install_in_disposable_home(self):
        original = subprocess.run

        def ssh_on_fixture(command, **kwargs):
            self.assertEqual(command[0], 'ssh')
            remote_command = shlex.split(command[-1])
            remote_command[0] = sys.executable
            return original(remote_command, env={**os.environ, 'HOME': str(self.home)}, **kwargs)

        payload = self.plan()
        with patch.object(updater.subprocess, 'run', side_effect=ssh_on_fixture):
            self.assertEqual(updater.remote('fixture', 'inventory'), updater.inventory(self.home))
            self.assertEqual(updater.remote('fixture', 'install', payload)['status'], 'updated')
            (self.home / '.agents/skills/wnz-one/SKILL.md').write_text('changed after inspection')
            with self.assertRaisesRegex(ValueError, 'changed since inspection'):
                updater.remote('fixture', 'install', payload)

    def test_partial_fleet_failure_continues_to_reachable_targets(self):
        original = updater.operate

        def operate_fixture(target, action, payload=None):
            if target == 'offline':
                raise OSError('unreachable')
            return original(None, action, payload)

        with patch.object(Path, 'home', return_value=self.home), patch.object(
                updater, 'machine_targets', return_value=[('offline', 'offline'), ('local', None)]), \
                patch.object(updater, 'operate', side_effect=operate_fixture), \
                patch.object(updater.sys, 'argv', ['update.py', '--all', '--source', str(self.source)]):
            self.assertEqual(updater.main(), 1)
        self.assertEqual(self.receipt()['version'], '1.0.0')

    def test_updater_can_replace_its_own_installed_package(self):
        root = self.home / '.agents/skills'
        shutil.copytree(self.source / 'skills/wnz-update', root / 'wnz-update')
        self.upgrade()
        self.package('wnz-update', 'new updater package')
        self.commit()
        updater.install(self.home, self.plan())
        self.assertIn('new updater package', (root / 'wnz-update/SKILL.md').read_text())

    def test_bad_ssh_target_and_unavailable_remote_fail_closed(self):
        machines = [{'enabled': True, 'id': 'a', 'label': 'bad', 'target': '-oProxyCommand=bad'}]
        with patch.object(updater, 'run', return_value=json.dumps(machines).encode()):
            with self.assertRaisesRegex(ValueError, 'Unsafe SSH target'):
                updater.machine_targets(True, None)
        failure = subprocess.CompletedProcess([], 255, stdout=b'', stderr=b'unavailable')
        with patch.object(updater.subprocess, 'run', return_value=failure):
            with self.assertRaisesRegex(ValueError, 'SSH target unavailable'):
                updater.remote('offline', 'inventory')

    def test_symlinked_or_duplicate_packages_block(self):
        path = self.home / '.claude/skills/wnz-one'
        path.unlink()
        shutil.copytree(self.source / 'skills/wnz-one', path)
        with self.assertRaisesRegex(ValueError, 'Conflicting runtime'):
            updater.inventory(self.home)

    def test_upstream_path_traversal_never_writes_outside_stage(self):
        payload = self.plan()
        payload['packages']['wnz-one']['../../escape'] = {
            'data': base64.b64encode(b'bad').decode(), 'executable': False}
        with self.assertRaisesRegex(ValueError, 'Unsafe upstream path'):
            updater.install(self.home, payload)
        self.assertFalse((self.home / '.agents/skills/escape').exists())

    def test_two_update_processes_cannot_share_installation_lock(self):
        with updater.installation_lock(self.home):
            with self.assertRaisesRegex(ValueError, 'holds the installation lock'):
                with updater.installation_lock(self.home):
                    self.fail('second lock unexpectedly acquired')

    def test_collection_version_and_dependency_inventory_are_valid(self):
        repository = SCRIPT.parents[3]
        updater.version((repository / 'VERSION').read_text().strip())
        dependencies = json.loads((SCRIPT.parent.parent / 'references/dependencies.json').read_text())
        for name, required in dependencies.items():
            self.assertTrue((repository / 'skills' / name / 'SKILL.md').exists())
            for dependency in required:
                self.assertTrue((repository / 'skills' / dependency / 'SKILL.md').exists())


if __name__ == '__main__':
    unittest.main()
