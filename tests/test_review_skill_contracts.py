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
            "default to `gpt-6.1-sol` with `medium` reasoning effort",
            normalized_skill,
        )
        self.assertIn(
            "default to `claude-opus-5-5` with `medium` reasoning effort",
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

    def test_review_skills_require_clean_code_assessment(self) -> None:
        language_skills = ("wnz-clean-code-py", "wnz-clean-code-js", "wnz-clean-code-rust")
        for skill_dir in (CODE_REVIEWER, PHASE_EXECUTOR):
            with self.subTest(skill=skill_dir.name):
                skill = (skill_dir / "SKILL.md").read_text(encoding="utf-8")
                checklist = skill_dir / "references" / "clean-code-checklist.md"
                for name in language_skills:
                    self.assertIn(f"`{name}`", skill)
                self.assertIn("(references/clean-code-checklist.md)", skill)
                self.assertTrue(checklist.is_file())
                checklist_text = checklist.read_text(encoding="utf-8")
                for sibling in language_skills:
                    # The fallback must work with no sibling skill installed.
                    self.assertNotIn(sibling, checklist_text)

        reviewer = " ".join(
            (CODE_REVIEWER / "SKILL.md").read_text(encoding="utf-8").split()
        )
        self.assertIn("#### Mandatory Clean-Code Assessment", reviewer)
        clean_code_section = reviewer.split("#### Mandatory Clean-Code Assessment", 1)[1]
        clean_code_section = clean_code_section.split("### 6. Provide Feedback", 1)[0]
        self.assertIn("(references/review-evals.md)", clean_code_section)
        self.assertIn("(references/clean-code-checklist.md)", clean_code_section)
        leaf_prompt = reviewer.split("INDEPENDENT_REVIEWER_LEAF Review the change", 1)[1]
        leaf_prompt = leaf_prompt.split("<review_scope>", 1)[0]
        self.assertIn("Rate a clean-code finding Medium only when you show", leaf_prompt)
        self.assertIn("linter output is not repeated", leaf_prompt)
        self.assertIn("{{CLEAN_CODE_SKILL_PER_LANGUAGE_OR_BUNDLED_CHECKLIST}}", reviewer)
        self.assertIn("report `Incomplete`, not `Clean`", reviewer)
        reviewer_evals = (CODE_REVIEWER / "references" / "review-evals.md").read_text(
            encoding="utf-8"
        )
        self.assertIn("## Clean-code assessment cases", reviewer_evals)
        self.assertIn("Skill not installed", reviewer_evals)

        executor = " ".join(
            (PHASE_EXECUTOR / "SKILL.md").read_text(encoding="utf-8").split()
        )
        self.assertIn("## Clean-Code Review", executor)
        self.assertIn(
            "a quality verdict that omits the clean-code assessment", executor
        )
        self.assertIn("(references/clean-code-evals.md)", executor)
        self.assertTrue(
            (PHASE_EXECUTOR / "references" / "clean-code-evals.md").is_file()
        )
        for text in (reviewer, executor):
            self.assertIn("not applicable", text)
            self.assertIn("a boolean flag, a magic value, or a naming choice", text)
        self.assertEqual(
            (CODE_REVIEWER / "references" / "clean-code-checklist.md").read_text(
                encoding="utf-8"
            ),
            (PHASE_EXECUTOR / "references" / "clean-code-checklist.md").read_text(
                encoding="utf-8"
            ),
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

    def test_phase_executor_reviews_user_feedback_in_fresh_bounded_cycles(self) -> None:
        skill = (PHASE_EXECUTOR / "SKILL.md").read_text(encoding="utf-8")
        review = (PHASE_EXECUTOR / "references" / "independent-plan-review.md").read_text(
            encoding="utf-8"
        )
        normalized = " ".join(review.split())
        self.assertIn("Each review cycle is capped at two independent design reviews", skill)
        self.assertIn("Keep plan review at design altitude", review)
        self.assertIn("Never dispatch Round 3 within the same cycle", normalized)
        self.assertIn("open a new review cycle automatically", normalized)
        self.assertIn("Even annotations accepted without questions require this review", normalized)
        self.assertIn("When the user answers, incorporate the answers", normalized)
        self.assertIn("Reviewer feedback, controller edits, or a renamed revision alone do not renew the cap", normalized)
        self.assertIn("Bind approval to the latest semantic plan revision", normalized)
        self.assertNotIn("two-review limit is total for one planning effort", review)
        self.assertNotIn("they do not authorize more than two plan-review rounds", skill)
        self.assertIn("(references/annotation-review-evals.md)", skill)
        self.assertTrue((PHASE_EXECUTOR / "references" / "annotation-review-evals.md").is_file())

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
