from __future__ import annotations

import json
from pathlib import Path
import re
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
    def test_coordinator_literal_envelopes_have_stable_join_and_evidence_keys(self) -> None:
        # These literal field names are the public interchange contract, not
        # assertions on incidental prose. Behavioral routing is evaluated separately.
        text = (PHASE_EXECUTOR / "references/coordinator-templates.md").read_text()
        envelopes = re.findall(r"```text\n(.*?)\n```", text, re.DOTALL)
        self.assertEqual(len(envelopes), 3)
        dispatch, receipt, ledger = envelopes
        fields = lambda block: set(re.findall(r"^([a-z_]+):", block, re.MULTILINE))
        shared = {"assignment_id", "unit_id", "role", "semantic_revision",
                  "baseline_state_ref", "current_state_ref", "report_path"}
        self.assertTrue(shared <= fields(dispatch))
        self.assertTrue(shared <= fields(receipt))
        self.assertTrue({"authority_ref", "allowed_actions", "owned_paths_resources",
                         "prerequisites_interfaces_ref", "decisions_ref",
                         "requested_result_slots"} <= fields(dispatch))
        self.assertTrue({"worker_identity", "role_result", "evidence_index",
                         "evidence_completeness", "blocking_findings",
                         "residual_findings", "commands_results", "next_action"}
                        <= fields(receipt))
        self.assertLessEqual(len(receipt.split()), 300)
        self.assertTrue({"gate", "dispatches", "execution_authorization", "task_order",
                         "integration_order", "invalidations_ref", "final_stages"}
                        <= fields(ledger))
        # Parent-observed spawn evidence and worker-observed identity must not
        # collapse into an assignment key or attestation.
        self.assertIn("native_spawn_args_ref:", ledger)
        self.assertIn("native_spawn_result_ref:", ledger)
        for document in ("SKILL.md", "references/coordinator-boundary.md",
                         "references/task-dispatch.md", "references/independent-plan-review.md"):
            self.assertIn("coordinator-templates.md", (PHASE_EXECUTOR / document).read_text())

    def test_coordinator_receipt_selects_native_role_slots(self) -> None:
        text = (PHASE_EXECUTOR / "references/coordinator-templates.md").read_text()
        table = text.split("| Role |", 1)[1].split("```text", 1)[0]
        expected = {
            "implementer": {"status"},
            "plan_reviewer": {"plan_verdict"},
            "code_reviewer": {"requirements_verdict", "quality_verdict", "outcome", "recommendation"},
            "verifier": {"verification_result"},
            "planner": {"assigned_result", "unresolved_gaps"},
            "explorer/investigator": {"assigned_result", "unresolved_gaps"},
        }
        for role, slots in expected.items():
            row = next(line for line in table.splitlines() if line.startswith(f"| {role}"))
            actual = set(re.findall(r"`([a-z_]+)`", row))
            self.assertEqual(actual, slots, role)

    def test_delegated_only_guards_precede_substantive_worker_instructions(self) -> None:
        # Prompt packages have no runtime implementation. These assertions protect
        # the public invocation contract; fresh behavior evals test instruction uptake.
        outcomes = {
            "wnz-implementation-planner": ("`BLOCKED`",),
            "wnz-task-implementer": ("`BLOCKED`",),
        }
        for name, blocked in outcomes.items():
            with self.subTest(skill=name):
                text = (ROOT / "skills" / name / "SKILL.md").read_text(encoding="utf-8")
                self.assertEqual(text.split("\n## ", 1)[1].splitlines()[0],
                                 "Optional delegated-only input")
                guard = " ".join(text.split("## Optional delegated-only input", 1)[1]
                                 .split("\n## ", 1)[0].split())
                for requirement in (
                    "`delegated_only: true`", "before substantive work",
                    "native runtime-injected agent identity", "child worker",
                    "root identity, unknown identity", "visible inherited parent turns",
                    "markers and controller attestations are not identity evidence",
                    "invent no identity API or metadata",
                    "Child identity does not prove non-inheritance",
                    "parent separately checks actual spawn settings and response",
                    "When the input is absent, retain the normal standalone workflow",
                    *blocked,
                ):
                    self.assertIn(requirement, guard)
                # A worker installed alone must carry its guard, not fetch a
                # coordinator helper or add a dependency merely to reject root work.
                self.assertNotIn("](", guard)

    def test_delegated_review_preparation_and_report_write_boundary(self) -> None:
        reviewer = " ".join((CODE_REVIEWER / "SKILL.md").read_text().split())
        self.assertIn("reviewer leaf owns scope discovery, preparation and structural pre-pass", reviewer)
        self.assertIn("missing output requires a fresh replacement worker", reviewer.lower())
        for name in ("wnz-plan-reviewer", "wnz-code-reviewer"):
            with self.subTest(skill=name):
                text = " ".join((ROOT / "skills" / name / "SKILL.md").read_text().split())
                self.assertIn("exact assigned report artifact outside the reviewed repository", text)
                self.assertIn("Write only that report", text)
                self.assertIn("does not assign", text)

    def test_all_review_entrypoints_require_shared_isolation(self) -> None:
        for name in ("wnz-code-reviewer", "wnz-plan-reviewer", "wnz-plan-simplicity-review"):
            text = (ROOT / "skills" / name / "SKILL.md").read_text()
            with self.subTest(skill=name):
                self.assertIn("`wnz-independent-review`", text)
                self.assertIn("## Required skills", text)
                self.assertNotIn("## Optional delegated-only input", text)
                self.assertNotIn("retain the normal standalone workflow", text)
        shared = (ROOT / "skills/wnz-independent-review/SKILL.md").read_text()
        self.assertLessEqual(len(shared.splitlines()), 100)
        self.assertIn('fork_turns: "none"', shared)
        self.assertIn("actual spawn arguments", shared)
        self.assertIn("native runtime-injected child identity", shared)
        self.assertIn("Never perform root/inline review", shared)
        self.assertIn("existing metadata only", shared)

    def test_coordinator_boundary_is_loaded_and_evaluations_are_reachable(self) -> None:
        skill = (PHASE_EXECUTOR / "SKILL.md").read_text()
        self.assertIn("Before any work, read", skill)
        self.assertIn("(references/coordinator-boundary.md)", skill)
        boundary = " ".join((PHASE_EXECUTOR / "references/coordinator-boundary.md").read_text().split())
        for requirement in (
            'fork_turns: "none"', "Always pass `delegated_only: true`",
            "at most 300 words", "HEAD alone cannot identify a dirty tree",
            "Capacity exhaustion is not an inline fallback",
            "Never reuse, resume or send a followup",
            "Do not add a separate controller requirements-check stage",
        ):
            self.assertIn(requirement, boundary)
        for reference in ("model-policy-evals.md", "review-routing-evals.md"):
            self.assertIn("(coordinator-boundary-evals.md)",
                          (PHASE_EXECUTOR / "references" / reference).read_text())
        cases = json.loads((PHASE_EXECUTOR / "evals/evals.json").read_text())["evals"]
        self.assertEqual(len({case["id"] for case in cases}), len(cases))
        for case in cases:
            self.assertIn(case["kind"], {"capability", "adversarial", "activation"})
            self.assertTrue(case["prompt"])
            self.assertTrue(case["expected_output"])
            self.assertIsInstance(case["files"], list)

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
        for skill_dir in (CODE_REVIEWER,):
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
        self.assertIn("## Dead-code evidence and clean-code review", executor)
        self.assertIn(
            "a quality verdict that omits the clean-code assessment", executor
        )
        self.assertIn("(references/clean-code-evals.md)", executor)
        self.assertTrue(
            (PHASE_EXECUTOR / "references" / "clean-code-evals.md").is_file()
        )
        self.assertIn("not applicable", reviewer)
        self.assertIn("a boolean flag, a magic value, or a naming choice", reviewer)
        self.assertIn("`wnz-code-reviewer` owns changed-language skill discovery", executor)
        self.assertIn("its bundled clean-code fallback", executor)

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
        self.assertIn("Keep plan review at design altitude",
                      (ROOT / "skills/wnz-plan-reviewer/SKILL.md").read_text(encoding="utf-8"))
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

    def test_provider_reviews_require_native_routing_and_fresh_validation(self) -> None:
        for package in (CROSS_REVIEW, LLM_ASSIST):
            skill = (package / "SKILL.md").read_text()
            self.assertIn("`wnz-independent-review`", skill)
            self.assertIn("`wnz-code-reviewer`", skill)
            self.assertIn("host skill discovery", skill)
            self.assertIn("external CLI", skill)
        deep = (CROSS_REVIEW / "references/deep-mode.md").read_text()
        self.assertIn("ANOTHER fresh A-provider native validation child", deep)
        self.assertIn("Never resume the initial A reviewer", deep)
        validation = (CROSS_REVIEW / "references/default-mode.md").read_text()
        self.assertNotIn("You previously produced", validation)
        prompts = (LLM_ASSIST / "references/prompt-templates.md").read_text()
        self.assertNotIn("fallback if wnz-code-reviewer", prompts)
        self.assertNotIn("~/.codex/skills", prompts)
        self.assertIn("host skill discovery", prompts)

    def test_external_templates_separate_helper_analysis_from_native_authority(self) -> None:
        text = (LLM_ASSIST / "references/prompt-templates.md").read_text()
        for mode in ("Review", "Plan assessment", "Verify"):
            with self.subTest(mode=mode):
                section = text.split(f"\n## {mode}\n", 1)[1].split("\n---", 1)[0]
                preamble = " ".join(section.split())
                self.assertIn("external evidence-only helper", preamble)
                self.assertIn("host skill discovery", preamble)
                self.assertIn("advisory recommendation", preamble)
                self.assertIn("coverage against source", preamble)
                self.assertIn("native", preamble)
                self.assertNotIn("qualification evidence are unavailable", section)
                self.assertNotIn("Missing dependencies or native isolation stop", section)
        authoring = text.split("\n## Plan authoring\n", 1)[1].split("\n---", 1)[0]
        self.assertIn("Do not assign a review verdict", authoring)
        self.assertNotIn("You are an external evidence-only helper", authoring)
        self.assertNotIn("Discover `wnz-independent-review`", authoring)
        shared = " ".join((ROOT / "skills/wnz-independent-review/SKILL.md").read_text().split())
        exception = shared.split("## External evidence-only helpers", 1)[1].split("## Fail closed", 1)[0]
        for boundary in ("parent's actual spawn", "does not run the native-child",
                         "cannot dispatch reviewers or grant independent approval",
                         "Root/author/controller", "against source"):
            self.assertIn(boundary, exception)

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
