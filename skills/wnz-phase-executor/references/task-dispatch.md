# Task dispatch

Read this file in full before preparing task briefs or dispatching any
implementer, fix, or reviewer subagent. It defines what each subagent receives
and how approved parallel waves run. The worker owns statuses/reports in `wnz-task-implementer`; the controller
enforces verdicts and loop rules in `SKILL.md`.

## Task brief

Prepare one task brief per task. The brief is the task's full plan section,
global constraints that apply verbatim, earlier-task interfaces it consumes,
exact acceptance criteria, and report contract. Do not send the whole plan or
accumulated session history to a fresh subagent.

## Implementer dispatch

Give each fresh implementer:

- One sentence explaining where the task fits.
- The task brief path or complete bounded task text.
- Exact repository instructions and allowed scope.
- Interfaces and decisions from completed prerequisite tasks.
- The baseline commit or diff boundary.
- A task report path and the required status/report contract from `wnz-task-implementer`.

Require the worker to discover and apply `wnz-task-implementer` directly.
That skill owns micro-step execution, documentation, verification, cleanup and
the status/report contract. Include its report destination and pass through its
required fields rather than copying a second execution checklist.

## Parallel wave execution

For approved parallel execution, create the planned isolation boundary for
each concurrent implementer before dispatch. Record its worktree/branch,
baseline, owned files, verification scope, and integration order. The
controller remains the sole integration and conflict-resolution owner.

For an approved parallel-safe wave, dispatch all wave implementers concurrently
in their isolated worktrees or other plan-defined non-overlapping environments,
using the selected implementation model and effort from
[`model-policy.md`](model-policy.md), or
its disclosed fallback. Preserve applicable user overrides.

After a parallel wave completes, verify and review each task against its own
baseline before integration. Integrate tasks in the plan's declared order,
rerun cross-task verification after each integration, resolve conflicts in the
controller, then run the wave-level integration tests. A failed task or review
blocks dependent waves but does not invalidate independent completed tasks.

## Review package

After implementation, assemble a task-scoped review package containing:

- The task brief and binding global constraints.
- The implementer report and verification evidence.
- The complete diff from the recorded task baseline to the current state,
  including every task commit.
- Relevant unchanged contracts that the diff depends on.
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
