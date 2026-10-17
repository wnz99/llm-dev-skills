"""Package contracts; behavioral judgment remains in fresh-context evaluations."""
from pathlib import Path
import json
import re
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
        for name in WORKERS + CONSUMERS + ("wnz-ascii-diagrams",):
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

    def test_worker_evaluations_have_independent_expected_outcomes(self):
        for name in WORKERS:
            with self.subTest(skill=name):
                data = json.loads((SKILLS / name / "evals/evals.json").read_text(encoding="utf-8"))
                self.assertEqual(data["skill_name"], name)
                self.assertEqual({case["kind"] for case in data["evals"]},
                                 {"capability", "adversarial", "activation"})
                self.assertEqual(len({case["id"] for case in data["evals"]}), len(data["evals"]))
                for case in data["evals"]:
                    self.assertTrue(case["prompt"])
                    self.assertTrue(case["expected_output"])
                    self.assertIsInstance(case["files"], list)

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
