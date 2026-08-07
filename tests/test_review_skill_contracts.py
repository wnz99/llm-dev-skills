from __future__ import annotations

import json
from pathlib import Path
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
CROSS_REVIEW = ROOT / "skills" / "wnz-cross-review-pr"
LLM_ASSIST = ROOT / "skills" / "wnz-llm-assist"


class ReviewSkillContractsTest(unittest.TestCase):
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
