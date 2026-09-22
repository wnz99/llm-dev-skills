from __future__ import annotations

import json
from pathlib import Path
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
CROSS_REVIEW = ROOT / "skills" / "wnz-cross-review-pr"
LLM_ASSIST = ROOT / "skills" / "wnz-llm-assist"
PHASE_EXECUTOR = ROOT / "skills" / "wnz-phase-executor"
DOC_WRITE_EXPERT = ROOT / "skills" / "wnz-doc-write-expert"
CODE_REVIEWER = ROOT / "skills" / "wnz-code-reviewer"


class ReviewSkillContractsTest(unittest.TestCase):
    def test_code_reviewer_uses_host_specific_reviewer_defaults(self) -> None:
        skill = (CODE_REVIEWER / "SKILL.md").read_text(encoding="utf-8")
        evals = (CODE_REVIEWER / "references" / "delegation-evals.md").read_text(
            encoding="utf-8"
        )
        normalized_skill = " ".join(skill.split())
        normalized_evals = " ".join(evals.split())

        self.assertIn(
            "default to `gpt-5.6-sol` with `medium` reasoning effort",
            normalized_skill,
        )
        self.assertIn(
            "default to Sonnet through the host's current stable Sonnet selector",
            normalized_skill,
        )
        self.assertIn(
            "An explicit user instruction overrides only the control it names; "
            "retain the applicable default for every unspecified control",
            normalized_skill,
        )
        self.assertIn(
            "If a default selector is unavailable, use the nearest capable "
            "host-supported alternative and report the fallback",
            normalized_skill,
        )
        self.assertIn(
            "Do not silently replace a user-selected model or reasoning control "
            "that the host cannot honor; report the unavailable override and "
            "leave the review `Incomplete` until the user supplies or permits "
            "an alternative",
            normalized_skill,
        )
        self.assertIn(
            "If selection succeeds but the host does not reveal the resolved "
            "model identity, keep the selection and report the identity as "
            "unavailable rather than inventing one",
            normalized_skill,
        )
        self.assertIn("Codex reviewer default", evals)
        self.assertIn("Claude reviewer default", evals)
        self.assertIn("Codex model-only override", evals)
        self.assertIn("Codex effort-only override", evals)
        self.assertIn("Claude model override", evals)
        self.assertIn("Default selector unavailable", evals)
        self.assertIn("Explicit selector unavailable", evals)
        self.assertIn("Exact model identity unavailable", evals)
        self.assertIn(
            "does not substitute silently, reports the unavailable override, "
            "and leaves the review `Incomplete` until the user supplies or "
            "permits an alternative",
            normalized_evals,
        )
        self.assertIn(
            "keeps the selected default and reports `Exact model unavailable "
            "from host/provider.` without inventing a version",
            normalized_evals,
        )

    def test_doc_writer_requires_progressive_reader_context(self) -> None:
        skill = (DOC_WRITE_EXPERT / "SKILL.md").read_text(encoding="utf-8")

        self.assertIn("Build understanding progressively", skill)
        self.assertIn("familiar input → purpose of the transformation", skill)
        self.assertIn("Delay internal IDs, hashes, file paths, schemas", skill)
        self.assertIn("support the narrative", skill)

    def test_doc_writer_requires_parser_validated_yaml_frontmatter(self) -> None:
        skill = (DOC_WRITE_EXPERT / "SKILL.md").read_text(encoding="utf-8")

        self.assertIn("Parse every YAML frontmatter block with a real YAML parser", skill)
        self.assertIn('title: "Data flow: current architecture"', skill)
        self.assertIn("validate every\nfrontmatter-bearing document", skill)

    def test_phase_executor_caps_plan_review_at_two_design_rounds(self) -> None:
        skill = (PHASE_EXECUTOR / "SKILL.md").read_text(encoding="utf-8")
        review = (PHASE_EXECUTOR / "references" / "independent-plan-review.md").read_text(
            encoding="utf-8"
        )

        self.assertIn("capped at two independent review rounds", skill)
        self.assertIn("Round 2 is final", skill)
        self.assertIn("Keep plan review at design altitude", review)
        self.assertIn("Never dispatch Round 3", review)

    def test_cross_review_description_excludes_ordinary_review_loops(self) -> None:
        skill = (CROSS_REVIEW / "SKILL.md").read_text(encoding="utf-8")
        frontmatter = skill.split("---", 2)[1]

        self.assertIn("Trigger only when the user explicitly asks", frontmatter)
        self.assertIn("Do not trigger for ordinary review requests", frontmatter)
        self.assertIn("review loops", frontmatter)

    def test_trigger_evals_cover_positive_and_negative_near_misses(self) -> None:
        evals = json.loads(
            (CROSS_REVIEW / "evals" / "evals.json").read_text(encoding="utf-8")
        )["evals"]
        expectations = [case["expected_output"] for case in evals]

        self.assertTrue(any("Do not activate" in value for value in expectations))
        self.assertTrue(any("Activate wnz-cross-review-pr" in value for value in expectations))

    def test_both_skills_bundle_a_standalone_extractor(self) -> None:
        for skill in (CROSS_REVIEW, LLM_ASSIST):
            extractor = skill / "scripts" / "extract-claude-result.py"
            self.assertTrue(extractor.is_file())
            self.assertNotIn("wnz-llm-assist", extractor.read_text(encoding="utf-8"))

    def test_llm_assist_extractor_preserves_multiline_result(self) -> None:
        extractor = LLM_ASSIST / "scripts" / "extract-claude-result.py"
        expected = "Finding one\n\nDetails remain intact.\nOverall verdict: Request Changes"
        self._run_extractor(extractor, expected)

    def test_cross_review_extractor_accepts_detailed_request_changes(self) -> None:
        extractor = CROSS_REVIEW / "scripts" / "extract-claude-result.py"
        expected = """Severity: High
File: workflow.yml
Location: 10
Title: Lost findings
Description: Line selection discards details.
Suggested fix: Preserve the full result.
Overall verdict: Request Changes"""
        self._run_extractor(extractor, expected, "--contract", "cross-review")

    def test_cross_review_extractor_rejects_verdict_only_request_changes(self) -> None:
        extractor = CROSS_REVIEW / "scripts" / "extract-claude-result.py"
        with tempfile.TemporaryDirectory() as directory:
            stream = Path(directory) / "stream.jsonl"
            output = Path(directory) / "result.md"
            stream.write_text(
                json.dumps({"type": "result", "result": "Overall verdict: Request Changes"})
                + "\n",
                encoding="utf-8",
            )

            result = subprocess.run(
                [
                    "python3",
                    str(extractor),
                    "--contract",
                    "cross-review",
                    str(stream),
                    str(output),
                ],
                capture_output=True,
                check=False,
                text=True,
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertFalse(output.exists())
            self.assertIn("missing detailed finding fields", result.stderr)

    def _run_extractor(
        self, extractor: Path, expected: str, *extra_arguments: str
    ) -> None:
        with tempfile.TemporaryDirectory() as directory:
            stream = Path(directory) / "stream.jsonl"
            output = Path(directory) / "result.md"
            events = [
                {"type": "assistant", "message": "progress"},
                {"type": "result", "result": expected},
            ]
            stream.write_text(
                "\n".join(json.dumps(event) for event in events) + "\n",
                encoding="utf-8",
            )

            subprocess.run(
                ["python3", str(extractor), *extra_arguments, str(stream), str(output)],
                check=True,
            )

            self.assertEqual(output.read_text(encoding="utf-8"), expected + "\n")


if __name__ == "__main__":
    unittest.main()
