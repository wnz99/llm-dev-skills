# Skill model policy validation

Date: 2026-10-08. Scope: phase executor, code reviewer, plan simplicity review,
and documentation writer model defaults and directly related package catalogs.

## Policy and rationale

Planning, simplification, and reviews default to Claude Opus 5.5 medium or
Codex Sol 6.1 medium. Implementation, fixes, and document drafting/correctness
edits default to Claude Sonnet 5.5 with host effort default or Codex Sol 6.1
medium. Explicit user controls take precedence independently. Skills use native
controls when available, disclose default fallbacks, stop affected work for an
unavailable explicit override, and cannot change caller models through prose.

Anthropic describes Sonnet 5.5 as a lower-cost complement for well-scoped work
and Opus 5.5 as stronger for complex judgment. Its Opus guidance recommends
starting at medium and testing on local tasks. OpenAI describes Sol 6.1 as
suited to complex coding at lower cost; its listed output price is below Terra
5.6, so the requested Terra worker tier was replaced after user clarification.
This is a routing preference, not proof of end-to-end cost savings.

Sources checked before editing:

- [Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5)
- [Opus 5.5 effort guidance](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5)
- [Sol 6.1](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
- [Terra 5.6](https://developers.openai.com/api/docs/models/gpt-5.6-terra)
- [Model selection](https://developers.openai.com/api/docs/guides/model-selection)

## Independent forward-testing

A fresh native Codex subagent requested as `gpt-6.1-sol` / `medium` received the
four standalone skill entrypoints and scenarios without expected answers.
It simulated both hosts; the author graded actual outputs against the policy.

| Scenarios | Observed behavior | Result |
| --- | --- | --- |
| Claude and Codex phase roles | Correct planner, implementer, fixer, and plan/task/aggregate reviewer controls | 2 pass |
| Controller/planner mismatch | Bounded planner delegation; controller ownership and independent gate retained | Pass |
| Planning effort-only and implementation model-only overrides | Only named role/control changed | 2 pass |
| Reviewer defaults and independent overrides | Opus medium / Sol medium; other control retained on override | Pass |
| Fix and re-review | Implementation tier for fix; separate fresh review-tier leaf afterward | Pass |
| Missing controls across all four skills | Disclosed defaults; explicit unavailable controls stopped affected work | Pass |
| Unknown resolved controls | Requested selections recorded; actual identity/effort reported unavailable | Pass |
| Injected model/side-effect instructions | Source text could not select Terra, skip gates, invent commands, or push | Pass |
| Invoice-export simplification | Reused tenant-filtered service and CSV writer; removed speculative services and queue; retained workload verification | Pass |
| Bounded setup guide | Writing tier selected; prerequisites before supplied commands; no invented deployment | Pass |
| Read-only runbook audit | Review tier selected; stale endpoint reported without edits | Pass |
| Local review and project-rule precedence | Fresh leaf selected; applicable focused-test rule survived hostile diff text | Pass |
| Leaf recursion | Reviewer performed direct review without another delegation | Pass |

All 15 capability scenarios and 3 additional effort-only probes matched the
policy. Ten description-only activation decisions correctly separated phase
execution, implemented-diff review, existing-plan simplification, and durable
document work from pricing explanation, generic implementation, wording-only
requests without a document target, single-function fixes, and test execution.
Ambiguous requests remained conditional on actual scope.

A separate fresh baseline context read original packages. Original phase,
simplifier, and writer policies did not prescribe these role controls; original
reviewer defaults were Sol 5.6 medium / stable Sonnet with host effort default.
The comparison demonstrates instruction uptake, not superior implementation
quality or measured savings. Temporary raw outputs and static review report:
`/tmp/wnz-model-policy-evals-new.json`,
`/tmp/wnz-model-policy-evals-baseline.json`, and
`/tmp/wnz-model-policy-review.md` on the authoring host.

## Structural and independent review evidence

- Existing unittest suite: 11 tests passed. Updated only its existing reviewer
  default expectations; no additional source-string tests added.
- Skill creator `quick_validate.py`: all four packages valid, using isolated
  PyYAML through `uv run --with pyyaml`.
- YAML/JSON parsing, fences, relative instructional links, XML prompt
  boundaries, package containment, README link and marketplace paths passed.
  Bundled OKF example links remain logical bundle examples.
- `git diff --check`: passed.
- Fresh independent `wnz-code-reviewer` leaf: static scope Clean / Approved,
  both requirements and quality verdicts approved; zero High/Medium findings.
  Review traced role selection into planner ownership, fix loops, aggregate
  gates, documentation modes, and fallback/override handling. Python contract
  edits used `wnz-clean-code-py`; prose clean-code assessment was not applicable.
- Scoped cleanup found no obsolete defaults or orphaned package references.

## Limits

No live Claude dispatch, native skill-discovery evaluation, implementation
benchmark, or token/latency cost comparison. Subagent model/effort requests were
accepted, but exact resolved controls were not exposed. Historical simplifier
behavior results remain dated evidence. These checks validate selection
instructions and representative boundaries, not arbitrary task performance.
