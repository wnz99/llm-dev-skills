"""Exercise installed ledger CLI through real files and subprocesses."""

from datetime import datetime, timezone
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[1] / "skills/wnz-phase-executor/scripts/ledger.py"


class TaskLedgerTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        # An installed package must not depend on its repository or sibling skills.
        self.script = self.root / "ledger.py"
        shutil.copyfile(SCRIPT, self.script)
        self.ledger = self.root / "ledger.json"
        self.seed = self.root / "seed.json"
        self.metadata = {"authority": {"requirements_ref": "requirements.md"},
                         "gate": {"status": "PENDING"}, "dispatches": [], "tasks": []}
        self.seed.write_text(json.dumps(self.metadata))

    def cli(self, *arguments, success=True):
        result = subprocess.run([sys.executable, str(self.script), "--ledger", str(self.ledger),
                                 *map(str, arguments)], capture_output=True, text=True)
        if success:
            self.assertEqual(result.returncode, 0, result.stderr)
        else:
            self.assertNotEqual(result.returncode, 0)
        return result

    def load(self):
        return json.loads(self.ledger.read_text())

    def init_task(self, *options):
        self.cli("init", "--seed", self.seed, *options)
        self.cli("add", "task-2", "--title", "Extract shared primitives", "--dashboard-id", "2")

    def test_clock_lifecycle_retries_and_reopening_preserve_first_start(self):
        self.init_task()
        before = datetime.now(timezone.utc)
        self.cli("start", "task-2")
        started = self.load()["tasks"][0]["started_at"]
        self.assertGreaterEqual(datetime.fromisoformat(started.replace("Z", "+00:00")), before)
        self.cli("start", "task-2")
        self.assertEqual(self.load()["tasks"][0]["started_at"], started)
        self.cli("complete", "task-2", "--evidence", "reports/review.md")
        completed = self.ledger.read_bytes()
        self.cli("complete", "task-2", "--evidence", "reports/review.md")
        self.assertEqual(self.ledger.read_bytes(), completed)
        self.cli("start", "task-2", success=False)
        self.cli("reopen", "task-2", "--evidence", "new requirement")
        task = self.load()["tasks"][0]
        self.assertEqual(task["started_at"], started)
        self.assertIsNone(task["completed_at"])
        self.assertIsNone(task["accepted_state_ref"])
        self.assertEqual(task["status"], "in_progress")
        self.assertEqual(self.load()["gate"], {"status": "PENDING"})

    def test_invalid_transitions_and_input_never_change_ledger(self):
        self.init_task()
        original = self.ledger.read_bytes()
        cases = [("complete", "task-2", "--evidence", "review"),
                 ("reopen", "task-2", "--evidence", "change"),
                 ("start", "unknown"),
                 ("add", "other", "--title", "Other", "--dashboard-id", "2"),
                 ("add", "empty", "--title", " "),
                 ("recover-time", "task-2", "--field", "started_at", "--at",
                  "2026-01-01T00:00:00Z", "--evidence", "log")]
        for arguments in cases:
            with self.subTest(arguments=arguments):
                self.cli(*arguments, success=False)
                self.assertEqual(self.ledger.read_bytes(), original)

    def test_projection_and_retry_after_missing_dashboard(self):
        flow = self.root / "FLOW.json"
        result = self.cli("init", "--seed", self.seed, "--flow", flow, success=False)
        self.assertIn("ledger saved; dashboard sync failed", result.stderr)
        self.assertTrue(self.ledger.exists())
        # Restore projection target; sync may not reset task metadata or gates.
        flow.write_text(json.dumps({"schema": 1, "tasks": {}, "updated_at": "2020-01-01T00:00:00Z",
                                    "steps": {"9": {"state": "active"}}, "next": "wave gate"}))
        self.cli("add", "task-2", "--title", "x" * 210, "--dashboard-id", "2")
        self.cli("start", "task-2")
        canonical = self.ledger.read_bytes()
        self.cli("sync")
        self.assertEqual(self.ledger.read_bytes(), canonical)
        projected = json.loads(flow.read_text())
        task = projected["tasks"]["2"]
        self.assertEqual(task["status"], "in_progress")
        self.assertEqual(task["started_at"], self.load()["tasks"][0]["started_at"])
        self.assertNotIn("completed_at", task)
        self.assertEqual(task["summary"], "x" * 199 + "…")
        self.assertEqual(projected["steps"], {"9": {"state": "active"}})
        self.assertEqual(projected["next"], "wave gate")
        self.cli("check")
        projected["tasks"]["2"]["status"] = "done"
        flow.write_text(json.dumps(projected))
        before = flow.read_bytes()
        self.cli("check", success=False)
        self.assertEqual(flow.read_bytes(), before)
        self.cli("sync")
        self.cli("check")
        self.cli("add", "unicode", "--title", "😀" * 110)
        unicode_summary = json.loads(flow.read_text())["tasks"]["unicode"]["summary"]
        self.assertEqual(unicode_summary, "😀" * 99 + "…")

    def test_recovery_requires_missing_time_and_preserves_evidence(self):
        self.metadata["tasks"] = [{"unit_id": "task-2", "title": "Legacy", "status": "done",
                                   "started_at": None, "completed_at": "2020-01-01T00:05:00Z"}]
        self.seed.write_text(json.dumps(self.metadata))
        legacy = self.root / "old-ledger.md"
        legacy.write_text("original history, including estimates\n")
        self.cli("init", "--seed", self.seed, "--history", legacy)
        self.cli("recover-time", "task-2", "--field", "started_at", "--at",
                 "2020-01-01T00:00:00Z", "--evidence", "session.jsonl:42")
        ledger = self.load()
        self.assertEqual(ledger["tasks"][0]["started_at"], "2020-01-01T00:00:00Z")
        self.assertEqual(ledger["history"][-1]["evidence"], "session.jsonl:42")
        self.assertEqual(legacy.read_text(), "original history, including estimates\n")
        self.cli("recover-time", "task-2", "--field", "started_at", "--at",
                 "2020-01-01T00:01:00Z", "--evidence", "estimate", success=False)
        self.cli("init", "--seed", self.seed, success=False)

    def test_concurrent_writers_keep_all_tasks(self):
        self.cli("init", "--seed", self.seed)
        writers = [subprocess.Popen([sys.executable, str(self.script), "--ledger", str(self.ledger),
                                     "add", str(i), "--title", f"Task {i}"],
                                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                   for i in range(8)]
        for writer in writers:
            _, error = writer.communicate(timeout=10)
            self.assertEqual(writer.returncode, 0, error)
        self.assertEqual({task["unit_id"] for task in self.load()["tasks"]}, {str(i) for i in range(8)})

    def test_duplicate_keys_symlinks_and_bad_timestamps_rejected(self):
        self.seed.write_text('{"tasks": [], "tasks": []}')
        self.cli("init", "--seed", self.seed, success=False)
        self.assertFalse(self.ledger.exists())
        self.seed.write_text(json.dumps(self.metadata))
        self.init_task()
        self.cli("recover-time", "task-2", "--field", "started_at", "--at",
                 "2020-01-01T00:00:00", "--evidence", "log", success=False)
        real = self.root / "real.json"
        self.ledger.rename(real)
        self.ledger.symlink_to(real)
        self.cli("start", "task-2", success=False)

    def test_failed_atomic_replace_retains_original_and_cleans_temporary(self):
        specification = importlib.util.spec_from_file_location("task_ledger", self.script)
        module = importlib.util.module_from_spec(specification)
        specification.loader.exec_module(module)
        self.init_task()
        before = self.ledger.read_bytes()
        with patch.object(module.os, "replace", side_effect=OSError("disk failure")):
            with self.assertRaises(OSError):
                module.write(self.ledger, {"broken": True})
        self.assertEqual(self.ledger.read_bytes(), before)
        self.assertEqual(list(self.root.glob(".ledger.json.*")), [])


if __name__ == "__main__":
    unittest.main()
