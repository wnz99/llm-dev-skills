"""Run only in temporary repos: real Git and filesystem loss-prevention checks."""

import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/cleanup.py"


class CleanupTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="cleanup-check-")
        self.addCleanup(self.temporary.cleanup)
        self.home = Path(self.temporary.name)
        self.repo = self.home / "repo with spaces"
        self.repo.mkdir()
        self.git("init", "-b", "main")
        self.git("config", "user.name", "Fixture")
        self.git("config", "user.email", "fixture@example.test")
        (self.repo / "tracked.txt").write_text("keep\n")
        (self.repo / ".gitignore").write_text(".cache/\n")
        self.git("add", ".")
        self.git("commit", "-m", "initial")
        self.base = self.git("rev-parse", "HEAD").stdout.strip()

    def git(self, *args, repo=None):
        return subprocess.run(["git", "-C", str(repo or self.repo), *args],
                              capture_output=True, text=True, check=True)

    def command(self, name, *args, okay=True, env=None):
        result = subprocess.run([sys.executable, str(SCRIPT), name,
                                 str(self.repo), *map(str, args)],
                                capture_output=True, text=True, env=env,
                                cwd=self.home)
        if okay:
            self.assertEqual(result.returncode, 0, result.stderr)
        else:
            self.assertNotEqual(result.returncode, 0, result.stdout)
        return result

    def tree(self):
        worktree = self.home / "feature checkout"
        self.git("worktree", "add", "-b", "done", str(worktree))
        return worktree

    def remove_tree(self, worktree, **kwargs):
        return self.command("remove-worktree", "main", worktree,
                            "--expect-base", self.base, "--expect-tip", self.base,
                            **kwargs)

    def remove_branch(self, name, **kwargs):
        return self.command("remove-branch", "main", name,
                            "--expect-base", self.base, "--expect-tip", self.base,
                            **kwargs)

    def test_clean_merged_worktree_then_branch_removed(self):
        worktree = self.tree()
        (worktree / "tracked.txt").write_text("delivered feature\n")
        self.git("add", "tracked.txt", repo=worktree)
        self.git("commit", "-m", "feature", repo=worktree)
        self.git("merge", "--ff-only", "done")
        self.base = self.git("rev-parse", "main").stdout.strip()
        self.remove_branch("done", okay=False)
        self.remove_tree(worktree)
        self.assertFalse(worktree.exists())
        self.remove_branch("done")
        refs = self.git("for-each-ref", "--format=%(refname)").stdout
        self.assertNotIn("refs/heads/done", refs)
        self.assertEqual(self.git("rev-parse", "main").stdout.strip(), self.base)

    def test_unique_commits_and_dirty_worktree_are_retained(self):
        worktree = self.tree()
        (worktree / "new.txt").write_text("uncommitted work")
        self.remove_tree(worktree, okay=False)
        self.git("add", "new.txt", repo=worktree)
        self.remove_tree(worktree, okay=False)
        self.git("commit", "-m", "unfinished", repo=worktree)
        tip = self.git("rev-parse", "HEAD", repo=worktree).stdout.strip()
        self.command("remove-worktree", "main", worktree, "--expect-base", self.base,
                     "--expect-tip", tip, okay=False)
        self.assertEqual((worktree / "new.txt").read_text(), "uncommitted work")
        scan = json.loads(self.command("inspect", "main").stdout)
        self.assertFalse(next(b for b in scan["branches"] if b["branch"] == "done")["ancestor_of_base"])

    def test_unstaged_and_ignored_data_block_worktree_removal(self):
        worktree = self.tree()
        (worktree / "tracked.txt").write_text("local edit")
        self.remove_tree(worktree, okay=False)
        self.git("restore", "tracked.txt", repo=worktree)
        (worktree / ".cache").mkdir()
        (worktree / ".cache/data").write_text("keep until approved")
        self.remove_tree(worktree, okay=False)
        self.assertTrue((worktree / ".cache/data").exists())

    def test_locked_primary_and_changed_base_are_protected(self):
        worktree = self.tree()
        self.git("worktree", "lock", str(worktree))
        self.remove_tree(worktree, okay=False)
        self.remove_tree(self.repo, okay=False)
        self.command("remove-worktree", "main", worktree, "--expect-base", "0" * 40,
                     "--expect-tip", self.base, okay=False)
        self.remove_branch("main", okay=False)
        self.assertTrue(worktree.exists())

    def test_unmerged_unused_branch_is_protected(self):
        self.git("checkout", "-b", "unfinished")
        (self.repo / "unique.txt").write_text("unique")
        self.git("add", ".")
        self.git("commit", "-m", "unique")
        tip = self.git("rev-parse", "HEAD").stdout.strip()
        self.git("checkout", "main")
        self.command("remove-branch", "main", "unfinished", "--expect-base", self.base,
                     "--expect-tip", tip, okay=False)
        self.assertEqual(self.git("rev-parse", "unfinished").stdout.strip(), tip)

    def test_only_exact_previewed_artifact_removed(self):
        target = self.repo / "scratch [one]"
        target.mkdir()
        (target / "report.md").write_text("temporary output")
        sibling = self.repo / "scratch o"
        sibling.write_text("unrelated")
        preview = json.loads(self.command("preview-artifact", target).stdout)
        self.command("remove-artifact", target, "--expect-sha", preview["sha256"])
        self.assertFalse(target.exists())
        self.assertEqual(sibling.read_text(), "unrelated")
        self.assertEqual((self.repo / "tracked.txt").read_text(), "keep\n")

    def test_changed_content_and_file_type_invalidate_preview(self):
        target = self.repo / "scratch"
        target.write_text("")
        preview = json.loads(self.command("preview-artifact", target).stdout)
        target.unlink()
        target.mkdir()
        self.command("remove-artifact", target, "--expect-sha", preview["sha256"], okay=False)
        (target / "later.txt").write_text("new work")
        self.command("remove-artifact", target, "--expect-sha", preview["sha256"], okay=False)
        self.assertEqual((target / "later.txt").read_text(), "new work")

    def test_tracked_nested_git_secrets_and_external_paths_refused(self):
        self.command("preview-artifact", "tracked.txt", okay=False)
        self.command("preview-artifact", self.home, okay=False)
        target = self.repo / "scratch"
        target.mkdir()
        for name in (".git", ".env"):
            marker = target / name
            marker.write_text("protected fixture")
            self.command("preview-artifact", target, okay=False)
            self.assertTrue(marker.exists())
            marker.unlink()
        (target / "link").symlink_to(self.home)
        self.command("preview-artifact", target, okay=False)

    def test_inspection_resists_inherited_git_environment(self):
        env = {**os.environ, "GIT_DIR": str(self.home / "missing.git"),
               "GIT_WORK_TREE": str(self.home)}
        before = (self.repo / ".git/index").read_bytes()
        scan = json.loads(self.command("inspect", "main", env=env).stdout)
        self.assertEqual(scan["repo"], str(self.repo.resolve()))
        self.assertEqual(scan["base_tip"], self.base)
        self.assertEqual((self.repo / ".git/index").read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
