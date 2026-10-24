# Task dispatch

Read this file in full before preparing task briefs or dispatching any
implementer, fix, or reviewer subagent. It defines what each subagent receives
and how approved parallel waves run. The worker owns statuses/reports in `wnz-task-implementer`; the controller
enforces verdicts and loop rules in `SKILL.md`.
Apply [coordinator-boundary.md](coordinator-boundary.md) before every dispatch;
it owns freshness, non-inheritance, `delegated_only`, receipts and state binding.

## Task brief

Have the planner produce one bounded task brief per task. The brief is the task's full plan section,
global constraints that apply verbatim, earlier-task interfaces it consumes,
exact acceptance criteria, and report contract. Do not send the whole plan or
accumulated session history to a fresh subagent.

Include the relevant design rationale: workload, accepted operational tradeoffs,
non-goals and rejected heavier alternatives with reasons. These constrain design
choices, not which defects a reviewer may report. If a task needs a property the
plan never required, surface that mismatch instead of inferring new requirements.

## Implementer dispatch

Use the canonical [dispatch envelope](coordinator-templates.md#dispatch-envelope)
for each fresh implementer, including fixes and integration. Its plan pointer
selects the planner's complete bounded task section; purpose explains where the
task fits. Load the templates before preparing the first dispatch and after
resume when unavailable. Do not duplicate the envelope's field inventory here.

Require the worker to discover and apply `wnz-task-implementer` directly.
That skill owns micro-step execution, documentation, verification, cleanup and
the status/report contract. Include its report destination and pass through its
required fields rather than copying a second execution checklist.

Keep the assignment focused on its acceptance criteria. Routine implementation
details within owned files and the brief's interfaces are the worker's decision;
changes to architecture, interfaces, ownership, scope, or planned verification
return to the controller under the existing plan workflow. Require the
implementer's bounded tooling and verification rules; do not add extra checkers
or process stages to enforce them.

## Parallel wave execution

For approved parallel execution, dispatch bounded setup work to create the planned isolation boundary for
each concurrent implementer before dispatch. Record its worktree/branch,
baseline, owned files, verification scope, and integration order. The
coordinator owns integration scheduling and authorization. A fresh bounded
integration implementer owns merge execution, conflict edits and checks.

For an approved parallel-safe wave, dispatch all wave implementers concurrently
in their isolated worktrees or other plan-defined non-overlapping environments,
using the selected implementation model and effort from
[`model-policy.md`](model-policy.md), or
its disclosed fallback. Preserve applicable user overrides.

After a parallel wave completes, require worker verification and independent
review of each task against its own baseline before integration. Dispatch fresh
integration workers in the plan's declared order, with cross-task verification
after each integration and wave-level checks. Any integration/conflict edit
requires fresh affected verification and independent review bound to the
resulting state; a proven no-op may reuse unchanged evidence as the boundary
reference permits. A failed task or review
blocks dependent waves but does not invalidate independent completed tasks.

## Review package

After implementation, give the fresh reviewer pointers to a task-scoped package.
The implementer records artifacts; the reviewer discovers scope, assembles the
complete diff and reads the evidence directly. The coordinator supplies bounded
manifest metadata, not full reports, diffs or source. The package contains:

- The task brief and binding global constraints.
- The implementer report and verification evidence.
- The complete diff from the recorded task baseline to the current state,
  including every task commit.
- Relevant unchanged contracts that the diff depends on.
- The affected cross-task flow and its design rationale, including accepted
  failure behavior and operational tradeoffs. Keep the review target task-scoped
  while supplying enough adjacent context to assess cumulative machinery.
- Current repository-graph paths or impact evidence that materially informed
  the task, including provenance labels. Omit this item when no graph evidence
  was used.
- Changed languages and available skill catalog; `wnz-code-reviewer` owns
  language guidance discovery and its bundled checklist fallback.

Do not ask the reviewer to rerun verification already captured in the fresh
implementer report unless the evidence is missing, stale, suspicious, or the
review itself changes code.

## Reviewer instructions

Delegate a fresh-context review of only the current task's requirements, diff,
evidence, and relevant repository contracts. Mark every task, fix re-review, and
final aggregate code-review prompt `INDEPENDENT_REVIEWER_LEAF` so the dispatched
reviewer performs the review directly rather than delegating again. Instruct the
reviewer to:

- Use required `wnz-code-reviewer` and return both the requirements
  verdict and quality verdict from the reviewer contract.
- Receive `delegated_only: true` separately from the recursion marker. Own scope
  discovery, preparation and structural checks; save the full analysis in the
  exact assigned report outside the reviewed repository and return its compact
  index/receipt. The coordinator does not perform a source-based pre-pass.
- Review requirement compliance before code quality so well-written code cannot
  hide missing or extra behavior.
- Review for High and Medium issues first: correctness, data
  corruption, security, behavioral regressions, missing tests, broken
  contracts, and maintainability risks.
- Include file/line references, impact, evidence, and concrete fixes.
- Do not review the authoring agent's reasoning. Review the diff and codebase.
- Report only concrete, evidence-backed correctness or requirement gaps. Do not
  invent interfaces, telemetry, orchestration, or abstractions when existing
  contracts, reuse, or deletion can satisfy the requirement. Keep speculative
  hardening and optional architecture ideas out of blocking verdicts.
- Keep review read-only and within the phase's stated scope.

## Fixes, investigations and evidence gaps

Each fix, re-review, integration or evidence correction receives a new worker
identity and bounded artifact pointers. Never return work to the current
implementer/reviewer through followup or resume. A fresh fixer receives the full
finding set, substantiates or disputes each item against requirements and source,
corrects confirmed defects, and records disputes with evidence. The next fresh
reviewer independently validates both corrections and dismissals. Dispatch a
fresh read-only investigator for contested source facts or `Cannot verify`.
Do not add a mandatory triage agent or duplicate requirements checker.

A fresh verifier handles missing/stale/suspicious checks, integration checks and
final aggregate verification with exact commands and a source-state boundary.
It writes the assigned report and returns `PASS`, `FAIL` or `BLOCKED` plus the
common receipt fields; it does not claim implementer `DONE`. Fresh implementer
verification needs no redundant verifier when already complete and current.
