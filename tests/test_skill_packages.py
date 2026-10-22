"""Package contracts; behavioral judgment remains in fresh-context evaluations."""
from pathlib import Path
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest


SKILLS = Path(__file__).resolve().parents[1] / "skills"
WORKERS = ("wnz-implementation-planner", "wnz-plan-reviewer",
           "wnz-task-implementer", "wnz-dead-code")
CONSUMERS = ("wnz-phase-executor", "wnz-code-reviewer",
             "wnz-clean-code-js", "wnz-clean-code-py", "wnz-clean-code-rust")


class SkillPackageTests(unittest.TestCase):
    def test_plan_template_orders_review_context_before_execution(self):
        text = (SKILLS / "wnz-implementation-planner" / "references" /
                "implementation-plan-template.md").read_text(encoding="utf-8")
        template = text.split("````markdown\n", 1)[1].split("\n````", 1)[0]
        headings = re.findall(r"^## (.+)$", template, re.MULTILINE)
        self.assertEqual(headings, [
            "Features and effects", "High-level design and rationale",
            "Design diagrams", "Data-flow analysis", "Execution instructions",
        ])
        overview, execution = template.split("## Execution instructions", 1)
        self.assertIn("### F1:", overview)
        self.assertIn("Effect on the code:", overview)
        self.assertIn("Risks and safeguards:", overview)
        self.assertNotIn("### Execution topology", overview)
        for field in ("### Acceptance criteria traceability", "### Execution topology",
                      "**Delivers:**", "**Files:**", "**Interfaces:**",
                      "**Dead-code scope:**", "**Review target:**"):
            self.assertIn(field, execution)

    def test_installed_packages_resolve_local_resources(self):
        # Missing moved resources break installed behavior even if repo siblings exist.
        for name in WORKERS + CONSUMERS + ("wnz-ascii-diagrams", "wnz-repo-health",
                                          "wnz-test-quality", "wnz-repo-cleanup"):
            package = SKILLS / name
            for document in package.rglob("*.md"):
                with self.subTest(document=str(document.relative_to(SKILLS))):
                    text = document.read_text(encoding="utf-8")
                    fence = None
                    for line in text.splitlines():
                        match = re.match(r"^\s*(`{3,}|~{3,})", line)
                        if match:
                            marker = match[1]
                            if fence is None:
                                fence = marker
                            elif marker[0] == fence[0] and len(marker) >= len(fence):
                                fence = None
                        if fence is None and not match:
                            for target in re.findall(r"\]\(([^)]+)\)", line):
                                if "://" in target or target.startswith("#"):
                                    continue
                                path = (document.parent / target.split("#")[0]).resolve()
                                self.assertTrue(path.is_relative_to(package.resolve()), target)
                                self.assertTrue(path.exists(), target)
                    self.assertIsNone(fence, "unclosed Markdown fence")

    def test_package_evaluations_have_independent_expected_outcomes(self):
        for name in WORKERS + ("wnz-repo-health", "wnz-test-quality", "wnz-repo-cleanup"):
            with self.subTest(skill=name):
                data = json.loads((SKILLS / name / "evals/evals.json").read_text(encoding="utf-8"))
                self.assertEqual(data["skill_name"], name)
                kinds = {"capability", "adversarial", "activation"}
                if name == "wnz-test-quality":
                    kinds.add("implementation")
                self.assertEqual({case["kind"] for case in data["evals"]}, kinds)
                self.assertEqual(len({case["id"] for case in data["evals"]}), len(data["evals"]))
                for case in data["evals"]:
                    self.assertTrue(case["prompt"])
                    self.assertTrue(case["expected_output"])
                    self.assertIsInstance(case["files"], list)
                    for resource in case["files"] + case.get("setup_files", []):
                        path = (SKILLS / name / resource).resolve()
                        self.assertTrue(path.is_relative_to((SKILLS / name).resolve()))
                        self.assertTrue(path.is_file(), resource)

    def test_health_fixture_manifest_detects_git_and_untracked_writes(self):
        script = SKILLS / "wnz-repo-health/evals/live_fixture.py"

        def run(*args, env=None):
            return subprocess.run([sys.executable, str(script), *map(str, args)],
                                  capture_output=True, text=True, env=env)

        with tempfile.TemporaryDirectory(prefix="repo-health-test-") as directory:
            base = Path(directory)
            fixture, before, after = base / "fixture", base / "before.json", base / "after.json"
            self.assertEqual(run("create", fixture).returncode, 0)
            before.write_text(run("snapshot", fixture).stdout)
            after.write_text(run("snapshot", fixture).stdout)
            self.assertEqual(run("compare", before, after).returncode, 0)
            index = fixture / "main/.git/index"
            original = index.read_bytes()
            for path in (index, fixture / "feature/untracked-change"):
                path.write_bytes(b"controlled mutation")
                after.write_text(run("snapshot", fixture).stdout)
                result = run("compare", before, after)
                self.assertEqual(result.returncode, 1)
                self.assertEqual(json.loads(result.stdout)["changed"],
                                 [str(path.relative_to(fixture))])
                if path == index:
                    path.write_bytes(original)
                else:
                    path.unlink()
            clean = run("snapshot", fixture).stdout
            hostile_env = {**os.environ,
                           "GIT_DIR": str(fixture / "main/.git"),
                           "GIT_WORK_TREE": str(fixture / "main"),
                           "GIT_INDEX_FILE": str(index),
                           "GIT_OBJECT_DIRECTORY": str(fixture / "main/.git/objects")}
            independent = base / "independent"
            result = run("create", independent, env=hostile_env)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue((independent / "main/.git").is_dir())
            self.assertEqual(run("snapshot", fixture).stdout, clean)

    def test_required_dependency_packages_are_declared_and_discoverable(self):
        required = {
            "wnz-phase-executor": WORKERS + ("wnz-code-reviewer",),
            **{name: ("wnz-dead-code",) for name in WORKERS + CONSUMERS
               if name not in {"wnz-dead-code", "wnz-phase-executor"}},
        }
        for consumer, dependencies in required.items():
            text = (SKILLS / consumer / "SKILL.md").read_text(encoding="utf-8")
            declaration = text.split("## Required skills", 1)[1].split("\n## ", 1)[0]
            with self.subTest(consumer=consumer):
                self.assertIn("host", declaration)
                self.assertIn("discovery", declaration)
                self.assertIn("missing", declaration)
                self.assertIn("stop", declaration)
                self.assertIn("https://github.com/wnz99/llm-dev-skills", declaration)
                for dependency in dependencies:
                    self.assertIn(f"`{dependency}`", declaration)
                    self.assertTrue((SKILLS / dependency / "SKILL.md").is_file())

    def test_normal_mode_fixture_refuses_to_overwrite_existing_work(self):
        script = SKILLS / "wnz-test-quality/evals/normal_mode_fixture.py"
        with tempfile.TemporaryDirectory(prefix="test-quality-fixture-") as directory:
            for kind in ("notifications", "vouchers"):
                with self.subTest(kind=kind):
                    fixture = Path(directory) / kind
                    command = [sys.executable, str(script), kind, str(fixture)]
                    first = subprocess.run(command, capture_output=True, text=True)
                    self.assertEqual(first.returncode, 0, first.stderr)
                    generated = fixture / "tests" / f"test_{kind}.py"
                    self.assertTrue(generated.is_file())
                    with generated.open("a", encoding="utf-8") as output:
                        output.write("\n# Preserve this later test edit.\n")
                    marker = fixture / "local-work.txt"
                    marker.write_text("preserve my work", encoding="utf-8")
                    before = {p.relative_to(fixture): p.read_bytes()
                              for p in fixture.rglob("*") if p.is_file()}
                    second = subprocess.run(command, capture_output=True, text=True)
                    self.assertNotEqual(second.returncode, 0)
                    after = {p.relative_to(fixture): p.read_bytes()
                             for p in fixture.rglob("*") if p.is_file()}
                    self.assertEqual(after, before)

    def test_normal_mode_fixture_cannot_write_inside_its_source_package(self):
        with tempfile.TemporaryDirectory(prefix="test-quality-package-") as directory:
            package = Path(directory) / "skill"
            shutil.copytree(SKILLS / "wnz-test-quality", package)
            script = package / "evals/normal_mode_fixture.py"
            destination = package / "evals/files/repository-audit/nested"
            result = subprocess.run(
                [sys.executable, str(script), "vouchers", str(destination)],
                capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse(destination.exists())
