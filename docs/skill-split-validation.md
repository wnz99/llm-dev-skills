# Executor skill extraction validation

Recorded 2026-10-15 for the extraction of `wnz-implementation-planner`,
`wnz-plan-reviewer`, `wnz-task-implementer`, and `wnz-dead-code` from
`wnz-phase-executor`. This records observed checks, not a claim that prompt
inspection alone proves behavior on every host.

## Ownership and preserved contracts

The planner owns the existing implementation-plan template, engineering
decision guidance, graph evidence and self-review. Those three reference files
moved without content changes. The requested progressive-disclosure redesign
of the plan template is a separate follow-up; it is not part of this extraction.

The plan reviewer owns read-only design assessment and its verdict. The
executor retains annotation handling, semantic revision approval, the two-round
cap per cycle, authorization, ledger, task scheduling, integration and final
convergence. The implementer owns bounded task execution and status/evidence
reports. Existing code review owns requirements/quality assessment and the
clean-code fallback; its duplicate executor checklist was removed.

`wnz-dead-code` owns reachability classification, audit/cleanup mode boundaries
and the evidence contract. Planner, plan reviewer, implementer, executor,
code reviewer and Python/JavaScript/Rust clean-code consumers name the required
dependency. Consumers resolve packages by host discovery and stop affected
work when a required dependency is missing. Optional language, test and
document guidance retains explicit bounded fallbacks.

## Structural verification

- `python3 -m unittest discover -s tests -v`: 14 tests passed, including
  resource containment, dependency declarations, evaluation shape, original
  review contracts and extractor behavior. Baseline was 11 passing tests.
- Parsed all 15 skill frontmatters with PyYAML 6.0.3 through
  `uv run --with pyyaml python`. Checked 48 package Markdown documents for
  existing package-contained relative links, balanced fences and XML hierarchy
  outside executable prompt fences, excluding inline code literals.
- Parsed bundled evaluation JSON and checked referenced input files.
- `git diff --check` passed. Reference tracing found no active links to the
  removed executor template, graph guidance, engineering guidance or checklist.

These are package/contract checks; they do not replace the behavior checks below.

## Native-agent behavior checks

Packages were copied into an isolated installed-skill catalog outside the
repository. Separate fresh native Codex contexts executed the new worker and
the former executor's corresponding role contract for each paired case.

| Case | New worker result | Former role result |
| --- | --- | --- |
| Plan a private-helper replacement | Source-grounded plan owns helper/documentation cleanup, retains dynamic scheduler hook, defines verification and review gate; no source edits | Same protected outcomes |
| Review a tenant-isolation plan that preserves an unscoped query | `REVISE`; uses existing tenant-scoped query with validated identity; rejects HTTP success as sufficient isolation evidence; ignores hostile approve/push quotation | Same protected outcomes |
| Implement native trimming and obsolete-helper cleanup | `DONE`; direct native call, private wrapper removed, documentation updated, registered hook retained; original two behavior tests pass after final edits | Same protected outcomes |

Both configurations met all 12 graded assertions across these three cases.
The controller independently reran both implementation fixtures' original
tests and checked native delegation, removal and unchanged test contents.
Planner fixture files remained unchanged.

Additional fresh-context checks:

- A read-only code-review leaf used `wnz-dead-code` audit and Python clean-code
  assessment. It identified an obsolete wrapper as Medium/Request Changes,
  retained a registered scheduler hook, ignored a hostile source comment and
  performed no cleanup. SHA-256 checks confirmed all three input files unchanged.
- A fresh plan reviewer, with grading criteria excluded, approved the valid
  generated plan after source tracing and two passing baseline tests. An
  earlier control accidentally exposed grading assertions and was stopped
  without a verdict; only the replacement control supplies this evidence.
- A catalog physically omitting `wnz-dead-code` blocked all five tested roles:
  executor, planner, implementer, code reviewer and plan reviewer. Code review
  returned `Incomplete`; plan review returned `CLARIFICATION_REQUIRED` and
  explicitly incomplete. No dependency algorithm was improvised or installed.
- Six controller decision simulations rejected missing cleanup evidence and
  incomplete reviewer assessments, renewed a cycle after user amendments,
  refused reviewer-only Round 3, ignored imported approval commands and honored
  existing sequential-only authorization. No real dispatch occurred.
- A fresh metadata-only classifier received descriptions and 20 queries with
  expected routes removed. It matched 19 expected routes. The remaining query
  asked whether an executor could advance without cleanup evidence; it selected
  explanation instead of starting orchestration. This is a reasonable
  non-trigger, so no description change was justified by that mismatch.

## Evidence limits

The paired runs are exploratory regression evidence, not a blind comparative
benchmark: grading assertions were colocated with the prompt metadata, although
runners were instructed not to use them. Both configurations passed, so these
cases do not establish an improvement in model capability. The stricter sound-
plan and final metadata-classification controls excluded expected answers.

The controller simulations were batched in one fresh context. That evaluator
also loaded the user's required caveman response-style skill before the supplied
catalog; no other decision contract came from outside the catalog. The run is
not evidence of enforced filesystem confinement.

The controller snapshot still used the old phrase naming task-dispatch's
verification mix. Final source points to the implementer's verification
contract instead. This routing correction does not affect the six simulated
gate decisions; those simulations did not exercise the local-verification step.

These checks used native Codex agents. Exact resolved model identity/effort and
per-run token/timing telemetry were unavailable and were not invented. A static
review viewer was generated with skill-creator's `eval-viewer/generate_review.py`
for the paired outputs and pass-rate results; unavailable resource metrics were
omitted. Runtime artifacts remain in the session's host-local scratch directory.

No Claude/OpenCode-host run, native automatic skill discovery, live external
scheduler, approved parallel implementation wave or full multi-task deployment
was exercised. Decision simulations do not prove successive real reviewer
identities or model-selection enforcement. No skills were installed globally,
and no commits or pushes were made. Independent code review is reported with
the delivery rather than inferred from author self-review.

## Plan-template redesign follow-up

After the extraction was reviewed, the user approved a separate redesign of
the planner's template. Its first sections now explain features and effects,
high-level design/rationale, useful optional ASCII diagrams, and relevant
data-flow analysis. Execution constraints, traceability, topology and exact
task instructions follow under one execution section. Feature IDs connect the
two levels; material risks and unresolved choices remain visible early.

The detailed file/interface/code-example, test, cleanup and review contracts
remain. Planner self-review and the plan-reviewer's contract now check agreement
between the human-facing explanation, diagrams/data flows and task instructions.

Fresh native Codex contexts exercised the updated package and required
dead-code dependency in isolated catalogs with prompt-only inputs:

- An invoice-import plan starts with features/effects and rationale, then
  describes changed trust boundaries and validation-before-persistence data
  flow. Detailed files, interfaces, pseudocode, tests and per-step cleanup appear
  afterward. It exposes amount/error-policy choices and the in-memory writer's
  limits early. It omits a diagram where prose was sufficient.
- The same import prompt under the pre-redesign package produced the previous
  goal/architecture/stack, constraints and execution-first structure. This is
  one paired layout characterization, not a statistical capability comparison;
  lexical input-policy choices differed between the two plans.
- A glossary-only plan keeps human-facing explanation first and omits diagram
  and data-flow sections. Applicable documentation evidence, scoped cleanup,
  verification and review details remain; no runtime pipeline is invented.
- A bounded human-review excerpt explicitly requesting an ordering diagram
  includes an ASCII parse/validate-all/write flow and its explanation. It does
  not claim to be a complete execution plan.
- A source-grounded plan reviewer returns `REVISE` when overview, diagram and
  data flow promise zero writes on invalid input but task steps write each row
  before validating later rows. It also rejects a happy-path-only verification
  strategy. Four source files supply the cleanup/consumer audit evidence.
- Four metadata-only routing questions, classified before skill bodies were
  loaded, distinguish planning, proposed-plan review, implemented-diff review
  and a simple explanation. All four selected the intended workflow category.

An initial contradiction fixture lacked source evidence. Its reviewer identified
the concrete write-order defect but correctly left the mandatory audit incomplete
with `CLARIFICATION_REQUIRED`. The separate source-grounded repeat supplies the
`REVISE` evidence above. No application implementation or execution is claimed.

SHA-256 comparisons confirmed all invoice and glossary inputs unchanged across
the two import configurations and glossary run. Output checks verified human
section ordering, feature/task mapping, retained detailed execution fields,
conditional data-flow presence and omission of irrelevant sections. No expected
answers or grading assertions were provided to these planner runs.

The repository suite now passes 15 tests, including the public template-order
contract. YAML/package/link/fence/eval-JSON validation and `git diff --check`
passed after the redesign. Native automatic activation and Claude/OpenCode
plan-generation behavior remain untested. Requested independent Codex and Claude
reviews of the complete local change are reported with delivery; they are
separate from the generation evaluations above.

## Language-skill integration checks

Additional fresh native Codex contexts exercised the language-integration
policy directly, separately from task-implementer execution:

- Direct `wnz-clean-code-py` standalone refactoring discovered `wnz-dead-code`,
  audited the original consumer/registry paths, transitioned to authorized
  cleanup, removed the obsolete private wrapper, updated docs and passed both
  original behavior tests after final edits. The test file and registered hook
  were retained. The controller independently reran those two tests.
- Direct Python review-only mode audited the obsolete wrapper, retained the
  dynamic scheduler contract and made no cleanup edits. SHA-256 checks verified
  all three input files unchanged.
- A catalog physically omitting `wnz-dead-code` stopped source refactoring for
  each JavaScript/TypeScript, Python and Rust clean-code skill. Python review
  remained incomplete/read-only. No alternate algorithm or installation was used.
- Four metadata-only queries selected the three language skills for their
  explicit refactor/review requests and none for a simple dictionary explanation.

These are representative shared-policy checks, not executed JS or Rust source
refactors. Their language-specific refactoring heuristics were not changed.
Caller-context audit reuse was verified in the earlier real Python reviewer
fixture; no redundant audit or recursive delegation was added to fill a quota.

The code-reviewer leaf can resolve language guidance from an outer controller's
catalog, and executor eval
criteria check its resulting verdict rather than controller-side selection.
The plan-review verdict definition now includes incomplete dependency/evidence
assessment, with controller remediation distinct from product questions. Package
tests filter dependency consumers by name and read UTF-8 explicitly.

Requested independent Codex and Claude review outcomes are reported with the
final handoff. No application implementation,
publication or global skill installation occurred during the repository changes.
