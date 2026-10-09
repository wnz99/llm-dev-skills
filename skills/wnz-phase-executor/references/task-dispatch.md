# Task dispatch

Read this file in full before preparing task briefs or dispatching any
implementer, fix, or reviewer subagent. It defines what each subagent receives
and how approved parallel waves run. The statuses, verdicts, and loop rules
that the controller enforces stay in `SKILL.md`.

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
- A task report path and the required status contract from `SKILL.md`.

The implementer must reread the task requirements before editing, execute the
task's planned micro-steps in order (TDD steps where planned), use the repo's
established patterns, keep edits scoped to the current task, run fresh
verification after the final edit, self-review the diff against the task, and
report one status.

When the task changes public behavior, update the relevant docs or runbooks in
the same task unless the plan intentionally separates documentation. Verify
documentation claims against live code/config evidence, preserve local corpus
metadata and placement, and update indexes and inbound links when concepts move
or are created.

Verification should include, as appropriate:

- Unit tests for new pure logic and edge cases.
- CLI/help or dry-run tests for operator-facing commands.
- Type/lint checks for the touched subtree.

The task report records changed files, requirement-by-requirement coverage,
commands and outputs, per-step dead-code scope/evidence/removals or retention
reasons, commits if authorized, self-review findings, and concerns.
The implementer's chat response stays short and points to that report.

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
- Clean-code guidance: the `wnz-clean-code-*` skill to apply for each changed
  language, or the bundled checklist text when that skill is not installed.

Do not ask the reviewer to rerun verification already captured in the fresh
implementer report unless the evidence is missing, stale, suspicious, or the
review itself changes code.

## Reviewer instructions

Delegate a fresh-context review of only the current task's requirements, diff,
evidence, and relevant repository contracts. Instruct the reviewer to:

- Use the `wnz-code-reviewer` skill when available and return both the requirements
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
