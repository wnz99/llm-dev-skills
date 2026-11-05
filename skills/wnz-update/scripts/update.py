#!/usr/bin/env python3
"""Pinned, recoverable updates of the user-wide WNZ collection (stdlib only)."""
import argparse
import base64
from contextlib import contextmanager
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import sys
import tempfile

ORIGIN = 'https://github.com/wnz99/llm-dev-skills.git'
NAME = re.compile(r'wnz-[a-z0-9]+(?:-[a-z0-9]+)*\Z')
SCRIPT = Path(__file__).read_text() if '__file__' in globals() else ''


def require(condition, message):
    if not condition:
        raise ValueError(message)


def run(command, **kwargs):
    result = subprocess.run(command, capture_output=True, **kwargs)
    require(result.returncode == 0, 'Command failed: ' + str(command[0]))
    return result.stdout


def version(value):
    require(isinstance(value, str) and re.fullmatch(r'\d+\.\d+\.\d+', value),
            'Invalid collection version')
    return tuple(map(int, value.split('.')))


def package_files(directory):
    require(directory.is_dir() and not directory.is_symlink(),
            'Expected a canonical package directory: ' + directory.name)
    files = {}
    for path in sorted(directory.rglob('*')):
        relative = path.relative_to(directory)
        if '__pycache__' in relative.parts or path.suffix == '.pyc':
            continue
        require(not path.is_symlink(), 'Package symlink: ' + str(relative))
        if path.is_dir():
            continue
        require(path.is_file(), 'Special package file: ' + str(relative))
        files[relative.as_posix()] = {
            'data': base64.b64encode(path.read_bytes()).decode(),
            'executable': bool(path.stat().st_mode & 0o111)}
    require('SKILL.md' in files, 'Missing SKILL.md: ' + directory.name)
    return files


def fingerprint(files):
    return {name: {'sha256': hashlib.sha256(base64.b64decode(item['data'])).hexdigest(),
                   'executable': item['executable']}
            for name, item in files.items()}


def read_json(path, default=None):
    return json.loads(path.read_text()) if path.exists() else default


def write_json(path, data):
    temporary = path.with_name(path.name + '.tmp')
    with temporary.open('w') as stream:
        json.dump(data, stream, indent=2)
        stream.write('\n')
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(temporary, path)
    descriptor = os.open(path.parent, os.O_RDONLY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def inventory(home):
    agents = home / '.agents'
    require(not (agents / 'wnz-pending.json').exists(),
            'Interrupted update needs recovery through an authorized update')
    root = agents / 'skills'
    packages = {}
    for path in sorted(root.glob('wnz-*')):
        require(NAME.fullmatch(path.name), 'Invalid package name')
        packages[path.name] = fingerprint(package_files(path))
    links = {}
    for runtime in ('.claude', '.codex'):
        for path in sorted((home / runtime / 'skills').glob('wnz-*')):
            require(path.name in packages and path.is_symlink()
                    and path.resolve() == (root / path.name).resolve(),
                    'Conflicting runtime copy/link: ' + str(path))
            links[runtime + '/' + path.name] = os.readlink(path)
    return {'packages': packages, 'links': links,
            'claude': (home / '.claude/skills').is_dir(),
            'receipt': read_json(agents / 'wnz-installation.json')}


@contextmanager
def installation_lock(home):
    agents = home / '.agents'
    agents.mkdir(parents=True, exist_ok=True)
    with (agents / 'wnz-update.lock').open('a') as stream:
        try:
            fcntl.flock(stream, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise ValueError('Another WNZ update holds the installation lock')
        yield


def recover(home):
    agents = home / '.agents'
    journal = agents / 'wnz-pending.json'
    if not journal.exists():
        return
    data = read_json(journal)
    backup = Path(data['backup'])
    require(backup.parent.resolve() == (agents / 'wnz-backups').resolve(),
            'Invalid recovery backup location')
    root = agents / 'skills'
    for name, existed in data['packages'].items():
        require(NAME.fullmatch(name), 'Invalid recovery package name')
        saved, target = backup / name, root / name
        if saved.exists():
            if target.exists():
                require(not target.is_symlink(), 'Recovery target became a symlink')
                shutil.rmtree(target)
            os.replace(saved, target)
        elif not existed and target.exists():
            require(not target.is_symlink(), 'Recovery target became a symlink')
            shutil.rmtree(target)
    for name in data['new_links']:
        require(NAME.fullmatch(name), 'Invalid recovery link name')
        link = home / '.claude/skills' / name
        if link.is_symlink() and link.resolve() == (root / name).resolve():
            link.unlink()
    receipt = agents / 'wnz-installation.json'
    if data['old_receipt'] is None:
        receipt.unlink(missing_ok=True)
    else:
        write_json(receipt, data['old_receipt'])
    journal.unlink()


def install(home, payload):
    with installation_lock(home):
        recover(home)
        before = inventory(home)
        require(before == payload['expected'], 'Installation changed since inspection; retry')
        agents = home / '.agents'
        root = agents / 'skills'
        root.mkdir(parents=True, exist_ok=True)
        backups = agents / 'wnz-backups'
        backups.mkdir(exist_ok=True)
        backup = Path(tempfile.mkdtemp(prefix='update-', dir=backups))
        with tempfile.TemporaryDirectory(prefix='.wnz-stage-', dir=root) as scratch:
            stage = Path(scratch)
            for name, files in payload['packages'].items():
                require(NAME.fullmatch(name), 'Invalid upstream package name')
                for filename, item in files.items():
                    path = Path(filename)
                    require(not path.is_absolute() and '..' not in path.parts,
                            'Unsafe upstream path')
                    target = stage / name / path
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(base64.b64decode(item['data'], validate=True))
                    target.chmod(0o755 if item['executable'] else 0o644)
                require(fingerprint(package_files(stage / name)) ==
                        payload['receipt']['packages'][name], 'Staging verification failed')
            new_links = [name for name in payload['packages'] if before['claude']
                         and not (home / '.claude/skills' / name).exists()]
            journal = {'backup': str(backup),
                       'packages': {n: (root / n).exists() for n in payload['packages']},
                       'new_links': new_links, 'old_receipt': before['receipt']}
            write_json(backup / 'transaction.json', journal)
            write_json(agents / 'wnz-pending.json', journal)
            try:
                for name in payload['packages']:
                    if (root / name).exists():
                        os.replace(root / name, backup / name)
                    os.replace(stage / name, root / name)
                for name in new_links:
                    (home / '.claude/skills' / name).symlink_to(root / name)
                actual = {n: fingerprint(package_files(root / n)) for n in payload['packages']}
                require(actual == payload['receipt']['packages'], 'Installed verification failed')
                write_json(agents / 'wnz-installation.json', payload['receipt'])
                (agents / 'wnz-pending.json').unlink()
            except BaseException:
                recover(home)
                raise
        return {'status': 'updated', 'version': payload['receipt']['version'],
                'packages': sorted(payload['packages']), 'backup': str(backup)}


def git_environment():
    # Repository-local Git variables must not redirect the disposable clone.
    return {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}


def git(source, *args):
    return run(['git', '-C', str(source), *args], env=git_environment())


def historical_match(source, name, installed):
    prefix = 'skills/' + name + '/'
    commits = git(source, 'log', '--format=%H', '--', prefix).decode().splitlines()
    for commit in commits:
        entries = git(source, 'ls-tree', '-rz', commit, '--', prefix).split(b'\0')
        candidate = {}
        for entry in filter(None, entries):
            metadata, filename = entry.split(b'\t', 1)
            mode, kind, blob = metadata.decode().split()
            relative = filename.decode()[len(prefix):]
            require(kind == 'blob' and mode in ('100644', '100755'),
                    'Unsupported historical package entry')
            contents = git(source, 'cat-file', 'blob', blob)
            candidate[relative] = {'sha256': hashlib.sha256(contents).hexdigest(),
                                   'executable': mode == '100755'}
        if candidate == installed:
            return True
    return False


def plan(source, installed, release, commit):
    catalog = {p.name: p for p in (source / 'skills').glob('wnz-*') if p.is_dir()}
    names = set(installed['packages'])
    require(names, 'No installed WNZ packages found')
    dependencies = read_json(source / 'skills/wnz-update/references/dependencies.json')
    require(isinstance(dependencies, dict), 'Missing upstream dependency inventory')
    while True:
        expanded = names | {d for n in names for d in dependencies.get(n, [])}
        if expanded == names:
            break
        names = expanded
    require(names <= catalog.keys(), 'Installed package or dependency missing from origin')
    packages = {n: package_files(catalog[n]) for n in sorted(names)}
    manifests = {n: fingerprint(files) for n, files in packages.items()}
    old = installed['receipt']
    if old:
        require(old.get('origin') == ORIGIN, 'Installed provenance names a different origin')
        require(version(old['version']) <= version(release), 'Refusing collection downgrade')
        require(old['packages'] == installed['packages'], 'Locally modified package set or files')
        if old['version'] == release:
            require(old['packages'] == manifests, 'Origin changed contents without a version bump')
    else:
        for name, contents in installed['packages'].items():
            require(contents == manifests[name] or historical_match(source, name, contents),
                    'Unknown or locally modified package: ' + name)
    receipt = {'version': release, 'commit': commit, 'origin': ORIGIN, 'packages': manifests}
    return {'expected': installed, 'packages': packages, 'receipt': receipt}


def machine_targets(all_machines, requested):
    if not all_machines and not requested:
        return [('local', None)]
    if requested == 'local':
        return [('local', None)]
    machines = json.loads(run(['herdr', 'machine', 'list', '--json']))
    selected = [m for m in machines if m.get('enabled') and
                (all_machines or requested in (m.get('id'), m.get('label'), m.get('target')))]
    require(all_machines or len(selected) == 1, 'Machine name is missing or ambiguous')
    targets = [('local', None)] if all_machines else []
    seen = set()
    for machine in selected:
        target = machine['target']
        require(isinstance(target, str) and not target.startswith('-')
                and not re.search(r'[\s\x00-\x1f]', target), 'Unsafe SSH target')
        if target not in seen:
            targets.append((machine['label'], target))
            seen.add(target)
    return targets


def remote(target, action, payload=None):
    # Only trusted bundled code appears in the remote command; data uses stdin.
    encoded = base64.b64encode(SCRIPT.encode()).decode()
    code = "import base64; exec(compile(base64.b64decode(" + repr(encoded) + "), '<wnz-update>', 'exec'))"
    command = 'python3 -B -c ' + shlex.quote(code) + ' --worker'
    result = subprocess.run(
        ['ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', target, command],
        input=json.dumps({'action': action, 'payload': payload}).encode(),
        capture_output=True, timeout=180)
    try:
        response = json.loads(result.stdout)
    except ValueError:
        raise ValueError('SSH target unavailable or returned invalid worker output: ' + target)
    require(result.returncode == 0, response.get('error', 'Remote update failed'))
    return response


def operate(target, action, payload=None):
    if target:
        return remote(target, action, payload)
    home = Path.home()
    if action == 'recover':
        with installation_lock(home):
            recover(home)
        return {}
    if action == 'inventory':
        return inventory(home)
    return install(home, payload)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    group = parser.add_mutually_exclusive_group()
    group.add_argument('--all', action='store_true')
    group.add_argument('--machine')
    parser.add_argument('--source', help='Explicit local Git source for offline testing')
    parser.add_argument('--worker', action='store_true', help=argparse.SUPPRESS)
    args = parser.parse_args()
    if args.worker:
        request = json.load(sys.stdin)
        require(request['action'] in ('recover', 'inventory', 'install'), 'Unknown worker action')
        print(json.dumps(operate(None, request['action'], request.get('payload'))))
        return 0
    targets = machine_targets(args.all, args.machine)
    with tempfile.TemporaryDirectory(prefix='wnz-origin-') as scratch:
        source = Path(scratch) / 'origin'
        run(['git', 'clone', '--quiet', '--no-hardlinks', '--', args.source or ORIGIN, str(source)],
            env=git_environment(), timeout=180)
        commit = git(source, 'rev-parse', 'HEAD').decode().strip()
        release = (source / 'VERSION').read_text().strip()
        version(release)
        results = []
        for label, target in targets:
            try:
                if not args.check:
                    operate(target, 'recover')
                installed = operate(target, 'inventory')
                payload = plan(source, installed, release, commit)
                current = installed['receipt']
                unchanged = (current and current['version'] == release
                             and current['packages'] == payload['receipt']['packages'])
                if args.check or unchanged:
                    result = {'status': 'current' if unchanged else 'update_available',
                              'installed_version': current['version'] if current else 'unversioned',
                              'origin_version': release, 'packages': sorted(payload['packages'])}
                else:
                    result = operate(target, 'install', payload)
                    result['installed_version'] = current['version'] if current else 'unversioned'
                results.append({'machine': label, **result})
            except (ValueError, OSError, subprocess.SubprocessError, KeyError, TypeError) as error:
                results.append({'machine': label, 'status': 'failed', 'error': str(error)})
        print(json.dumps({'commit': commit, 'version': release, 'results': results}, indent=2))
        return int(any(r['status'] == 'failed' for r in results))


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, OSError, subprocess.SubprocessError, KeyError, TypeError) as error:
        print(json.dumps({'status': 'failed', 'error': str(error)}))
        sys.exit(1)
