---
name: phased-implementation-review-loop
description: Use this skill whenever the user asks to plan or implement a multi-step code change with subagents, execute work phase by phase, independently check requirement compliance and code quality after every phase, or keep fixing review findings until solved. It unifies implementation-ready planning, fresh implementer subagents, TDD micro-steps, requirement rereads, verification, two-verdict review gates, fix/re-review loops, durable progress, and final aggregate review.
---

# Phased Implementation Review Loop

Use this skill for substantial implementation work where correctness depends on
controlled sequencing and independent review. The workflow exists to prevent the
authoring agent from drifting away from the plan or accepting its own blind
spots as proof.

## Preconditions

Before editing code:

1. Read the relevant project instructions, including the nearest `AGENTS.md`.
2. Read the issue, todo, plan, PR description, or runbook that defines the
   target behavior.
3. Identify the smallest owning subtree for the change.
4. Inspect the current implementation and tests enough to make a concrete plan.
5. Read the applicable documentation guidance and indexes when the plan creates
   or changes docs. Treat frontmatter, placement, links, and index membership as
   part of correctness in a governed corpus such as OKF.
6. Confirm that subagent delegation is authorized by the user and host policy.
   This workflow uses a fresh implementer and a separate fresh reviewer for each
   task. If delegation is unavailable, preserve the same task and two-verdict
   review gates inline and state the limitation.
7. Select models explicitly by role when the host supports it: use a capable
   low-cost model for mechanical tasks, a standard model for integration work,
   and the strongest available reasoning model for architecture or final
   aggregate review. Reviewers need enough judgment for the task's risk; never
   omit model selection merely to inherit an expensive session default.

## Scope And Structure Before Tasks

Write the plan for a capable implementer who has fresh context: they understand
software engineering, but not this repository, its domain, or its testing
conventions.

Before defining tasks:

1. Check whether the request spans independent subsystems. Split it into
   separate plans when each subsystem can produce useful, testable software on
   its own; do not hide unrelated projects inside phases.
2. Map every file likely to be created, modified, tested, moved, or removed and
   state its responsibility. Follow existing organization and the smallest
   owning subtree. Files that change together should usually live together;
   split by responsibility, not merely technical layer.
3. Identify contracts between tasks: exact exported names, parameters, return
   types, schemas, commands, routes, events, or artifacts one task consumes and
   another produces.
4. Capture global constraints verbatim from the requirements and repository
   instructions: supported versions, dependency limits, naming, security,
   migration order, documentation format, and release rules.

Avoid opportunistic restructuring. If a touched file is too large to change
safely, make the boundary-improving split an explicit task with its own test and
review gate.

## Plan Artifact

Create a written plan before implementation. Save it when the repository or
user defines a plan location; otherwise present it in the conversation. If the
plan itself is stored in a governed documentation corpus, follow that corpus's
frontmatter, filename, placement, index, and linking rules.

Start the plan with:

```markdown
# <Feature> Implementation Plan

**Goal:** <one sentence describing the observable result>

**Architecture:** <two or three sentences describing boundaries and data flow>

**Tech stack:** <relevant languages, frameworks, libraries, and tools>

## Global constraints

- <exact project-wide requirement>

## Acceptance criteria traceability

| Requirement | Task(s) | Verification |
| --- | --- | --- |
| <requirement> | Task 1 | <exact command or inspection> |
```

Then define each task with this structure:

````markdown
### Task N: <independently testable deliverable>

**Goal:** <behavior completed by this task>

**Files:**

- Create: `exact/path/to/file`
- Modify: `exact/path/to/file:line-or-symbol`
- Test: `exact/path/to/test`
- Docs: `exact/path/to/doc-or-index`

**Interfaces:**

- Consumes: <exact existing names and shapes>
- Produces: <exact names, signatures, schemas, or artifacts for later tasks>

**Review target:** <behavior and risks the independent reviewer must inspect>

- [ ] **Step 1: Write the failing test**
  - Add: <specific test name, inputs, and assertions; include a concise code
    sketch when names or shapes are not obvious>
- [ ] **Step 2: Prove the test fails for the intended reason**
  - Run: `<exact command>`
  - Expect: `<specific failure, not merely non-zero exit>`
- [ ] **Step 3: Implement the minimum behavior**
  - Change: <exact symbols, control flow, validation, and error behavior>
- [ ] **Step 4: Prove the focused behavior passes**
  - Run: `<exact command>`
  - Expect: `<specific passing result>`
- [ ] **Step 5: Run the task gate**
  - Run: `<exact type/lint/integration/doc command>`
  - Expect: `<specific clean result>`
- [ ] **Step 6: Review and record the task**
  - Review: <independent review scope>
  - Record: <verification, loop count, residual risk>
````

A task is the smallest unit with its own test cycle and a meaningful fresh
reviewer gate. Fold setup, configuration, migration, and documentation into the
task whose deliverable requires them. Split tasks only when a reviewer could
reasonably accept one and reject its neighbor.

Use exact paths, symbols, commands, inputs, assertions, and expected output.
Do not write `TBD`, `TODO`, "add validation", "handle edge cases", "write tests",
"similar to Task N", or reference an interface that no task defines. Include
enough code or pseudocode to remove ambiguity, but do not paste large finished
implementations that will go stale before execution.

Use TDD for observable behavior when a practical seam exists. Prefer DRY and
YAGNI. Include atomic commits only when the user authorized commits and the
repository workflow permits them; use the repository's commit convention and
do not prescribe commits that would split a required test/implementation pair.

## Plan Self-Review

Before implementation or handoff:

1. Re-read every requirement and map it to a task and verification command.
2. Scan for placeholders, vague verbs, missing paths, undefined interfaces, and
   commands without expected outcomes; replace them with executable detail.
3. Check type, schema, route, event, and property names across tasks for exact
   consistency.
4. Check task ordering and ensure every dependency is produced before it is
   consumed.
5. Check documentation claims against code/config evidence and verify planned
   files follow corpus placement, metadata, index, and cross-link rules.
6. Confirm every task leaves the repository in a working, independently
   testable state.

If the user has not chosen an execution mode, offer inline phased execution or
fresh-sub-agent execution. Do not assume permission to spawn sub-agents or make
commits; the user's request and host policy control those actions.

## Subagent Execution Control

The primary agent is the controller. It owns the plan, requirements, task
ordering, working tree, progress record, conflict resolution, and completion
claim. Subagents own bounded implementation or review work; they do not decide
that the overall project is complete.

Before Task 1:

1. Re-read the plan, original requirements, global constraints, and repository
   instructions. Resolve contradictions before dispatch instead of discovering
   them piecemeal during execution.
2. Record the branch merge base and current commit when Git is available. Never
   assume `HEAD~1` is a task boundary because a task may create multiple commits.
3. Create a durable progress ledger in the repository-approved ignored scratch
   location. Record every task, status, baseline, commits, verification, review
   verdicts, and residual findings. After context compaction or resume, trust
   the ledger and Git history; do not redispatch completed tasks.
4. Prepare one task brief per task. The brief is the task's full plan section,
   global constraints that apply verbatim, earlier-task interfaces it consumes,
   exact acceptance criteria, and report contract. Do not send the whole plan or
   accumulated session history to a fresh subagent.

Run implementation tasks sequentially in a shared working tree. Parallelize
read-only exploration only when safe; do not run multiple implementation
subagents concurrently where their edits, tests, or commits can conflict.

### Implementer dispatch contract

Give each fresh implementer:

- One sentence explaining where the task fits.
- The task brief path or complete bounded task text.
- Exact repository instructions and allowed scope.
- Interfaces and decisions from completed prerequisite tasks.
- The baseline commit or diff boundary.
- A task report path and this required status contract.

The implementer must reread the task requirements before editing, follow the
planned TDD steps, keep scope bounded, run fresh verification after the final
edit, self-review the diff against the task, and report one status:

- `DONE`: implementation, focused verification, and self-review completed.
- `DONE_WITH_CONCERNS`: completed, with explicit correctness or scope concerns.
- `NEEDS_CONTEXT`: missing information prevents a safe implementation.
- `BLOCKED`: the plan, environment, or task size prevents completion.

The task report records changed files, requirement-by-requirement coverage,
commands and outputs, commits if authorized, self-review findings, and concerns.
The implementer's chat response stays short and points to that report.

Handle statuses deliberately: provide missing context and redispatch;
strengthen the model for a reasoning mismatch; split an oversized task; or ask
the user when the plan or product decision is wrong. Never repeat an identical
failed dispatch and hope for a different result.

### Review package and reviewer contract

After implementation, assemble a task-scoped review package containing:

- The task brief and binding global constraints.
- The implementer report and verification evidence.
- The complete diff from the recorded task baseline to the current state,
  including every task commit.
- Relevant unchanged contracts that the diff depends on.

Dispatch a separate fresh reviewer. Do not bias it with instructions about what
not to flag or how severe a suspected issue should be. The reviewer must return
two explicit verdicts:

1. **Requirements verdict:** Does the implementation satisfy every task
   requirement exactly, with nothing required missing and no unrequested scope?
2. **Quality verdict:** Is the implementation correct, secure, maintainable,
   appropriately tested, and consistent with repository contracts?

Each finding includes severity, file/line, violated requirement or invariant,
impact, evidence, and a concrete fix. `Cannot verify` items are resolved by the
controller using cross-task context before completion; a real gap fails the
requirements verdict.

Do not ask the reviewer to rerun verification already captured in the fresh
implementer report unless the evidence is missing, stale, suspicious, or the
review itself changes code.

## Step Loop

For every planned step, repeat this loop.

### 1. Re-read The Plan

Before changing code for the step:

- Re-read the full plan and the current step.
- Re-check the relevant code path to confirm the step still makes sense.
- If discoveries invalidate the plan, update the plan before editing and explain
  why.

### 2. Implement The Step

Dispatch the task to the fresh implementer subagent using the implementer
contract. Use the repo's established patterns. Prefer TDD when the change has
observable behavior. Keep edits scoped to the current step.

When the step changes public behavior, update the relevant docs or runbooks in
the same step unless the plan intentionally separates documentation. Verify
documentation claims against live code/config evidence, preserve local corpus
metadata and placement, and update indexes and inbound links when concepts move
or are created.

### 3. Verify Locally

Run focused verification for the changed behavior after the last code edit.

Verification should include, as appropriate:

- Unit tests for new pure logic and edge cases.
- CLI/help or dry-run tests for operator-facing commands.
- Type/lint checks for the touched subtree.
- Live provider or integration checks only when explicitly requested or already
  required by the task.

Do not claim the step is complete until fresh verification output exists after
the latest edit.

### 4. Controller Check Against Requirements

Before delegating review:

- Re-read the original requirements, global constraints, and plan's current
  step.
- Inspect the diff and the implemented code path.
- Confirm every promised behavior for the step is present in code.
- Confirm tests exercise the behavior, not just implementation details.
- Confirm documentation and index changes match the implemented behavior and
  the repository's documentation format.
- Confirm the implementer report contains fresh commands and results after the
  latest edit.
- If anything is missing, fix it before asking for sub-agent review.

### 5. Run Independent Sub-agent Review

Build the review package and delegate a fresh-context review of only the current
step's requirements, diff, evidence, and relevant repository contracts.

Reviewer instructions:

- Use the `code-reviewer` skill when available and return both the requirements
  verdict and quality verdict from the reviewer contract.
- Review requirement compliance before code quality so well-written code cannot
  hide missing or extra behavior.
- Review for Critical/High and Medium/Important issues first: correctness, data
  corruption, security, behavioral regressions, missing tests, broken
  contracts, and maintainability risks.
- Include file/line references, impact, evidence, and concrete fixes.
- Do not review the authoring agent's reasoning. Review the diff and codebase.

### 6. Fix And Loop

If either verdict fails, dispatch one bounded fix subagent with the complete
task finding set, task brief, current report, and covering test files. For every
substantiated requirement, Critical/High, or Medium/Important finding:

1. Fix the issue in the current step.
2. Re-read the requirements affected by the fix.
3. Re-run focused verification and append commands/results to the task report.
4. Re-run the controller check against the requirements and code.
5. Build a fresh diff/review package and run another independent review loop.

Stop the loop only when a fresh review after the latest fixes reports zero
requirements gaps and both verdicts approve with zero unresolved Critical/High
or Medium/Important findings.

Low and Nit findings are optional unless they are cheap, useful, or explicitly
requested. Do not let optional polish expand the step.

### 7. Step Completion Record

After review is clean, record:

- What changed.
- Verification commands and result.
- Review loop count.
- Any remaining Low/Nit findings or accepted risks.
- Whether the plan needs adjustment before the next step.

Write this to the durable progress ledger before moving to the next planned
step. Never rely only on conversation todos for completion state.

## Final Completion

After the last step:

1. Re-read the original plan and acceptance criteria.
2. Re-run the plan self-review: requirement coverage, placeholders, interface
   consistency, task ordering, documentation evidence, and corpus conformance.
3. Inspect the final code paths end to end.
4. Run the broadest appropriate local verification gate for the owning subtree.
5. Build an aggregate review package from the branch merge base through the
   final state and run a fresh, capable independent reviewer over requirements
   compliance and code quality. This final review is required for multi-task
   work, not optional based on module count.
6. If the final review finds issues, dispatch one fix subagent with the complete
   final finding set, rerun affected verification, rebuild the package, and
   re-review until both verdicts approve with no unresolved Critical/High or
   Medium/Important findings.
7. Summarize the result with requirement-to-evidence coverage, verification
   output, review-loop counts, documentation changes, and known residual risks.

## Blockers

If a step cannot proceed because of missing credentials, unavailable services,
or a product decision, stop the step loop and report:

- The exact blocker.
- What was verified before the blocker.
- What remains unverified.
- The smallest decision or access needed to continue.

Do not mark the step complete while blocked.

## Non-Negotiable Controls

- Do not start implementation without an implementation-ready plan and
  acceptance traceability.
- Do not dispatch a task without rereading its requirements and prerequisites.
- Do not give a fresh implementer the entire session transcript or accumulated
  task history; provide a bounded brief and explicit interfaces.
- Do not run conflicting implementation subagents in parallel.
- Do not accept implementer self-review as independent review.
- Do not accept a reviewer response missing either requirements or quality
  verdict.
- Do not move to the next task with an open requirement gap or unresolved
  Critical/High or Medium/Important finding.
- Do not fix review findings without rerunning covering tests and independent
  re-review.
- Do not redispatch a task marked complete in the durable ledger.
- Do not claim final completion without fresh aggregate verification and final
  aggregate review after the latest fix.
