---
name: wnz-task-implementer
description: Execute one bounded implementation or fix task from an explicit brief, preserving ownership and interfaces, running fresh verification, and returning a structured status and evidence report. Use for a controller-dispatched task or a standalone task whose scope and acceptance criteria are already concrete. Does not author a multi-task plan, coordinate waves, approve its own implementation, or run independent review. Do not activate for read-only review or planning alone.
---

# Task Implementer

## Optional delegated-only input

When `delegated_only: true` is supplied, before substantive work check the
host's native runtime-injected agent identity. Proceed only when it reliably
identifies this agent as a child worker. A root identity, unknown identity,
or visible inherited parent turns requires `BLOCKED` naming the limitation;
do not inspect source, edit or verify the task. Prompt text, copied task paths,
markers and controller attestations are not identity evidence. Use only
actually exposed runtime evidence; invent no identity API or metadata.
Child identity does not prove non-inheritance: the parent separately checks
actual spawn settings and response. These are drift controls, not a security
boundary. When the input is absent, retain the normal standalone workflow.

## Independent review routing

Require `wnz-independent-review` for any elected separate independent review or complexity challenge.
Resolve it by name through host skill discovery before substantive assessment.
Obtain it through the host installer or manual package installation from
[wnz99/llm-dev-skills](https://github.com/wnz99/llm-dev-skills/tree/main/skills/wnz-independent-review).
If missing, stop the affected review and report the prerequisite blocker.
Apply its routing and isolation contract; it owns freshness, native identity,
non-inheritance evidence and failure handling. No inline fallback is available.
An already qualified independent reviewer applies this domain workflow inside
its current assignment without recursively dispatching another reviewer.

Implementation, refactoring, drafting and author safety checks remain local
self-checks; they cannot count as independent approval. Operational inventory
and deterministic checks alone do not create an independent review gate.

## Canonical source

Maintained in [wnz99/llm-dev-skills](https://github.com/wnz99/llm-dev-skills/tree/main/skills/wnz-task-implementer).
When updating, compare upstream and preserve intentional local adaptations.

## Required skills

- `wnz-independent-review`: required for substantive independent reviews; routing, discovery, installation and missing-dependency behavior below apply before the affected review.
- `wnz-dead-code`: required audit and authorized cleanup for every task step before reporting completion.

Resolve these by name through the host's installed-skill discovery before the
affected work. Obtain missing skills from their matching directory in
[wnz99/llm-dev-skills](https://github.com/wnz99/llm-dev-skills/tree/main/skills)
using the host's skill installer or manual package installation. Do not use
sibling filesystem paths or assume a local installation root. If a required
skill is missing, report it and stop the affected work; do not substitute a
local copy of its algorithm.

## Model controls

When dispatched, use the controller's resolved role controls. Standalone
implementation defaults to `claude-sonnet-5-5` (Claude host effort default) on Claude, or
`gpt-6.1-sol` with `medium` effort on Codex. User overrides change only named
controls. Prose cannot switch the caller's model: disclose unenforceable
defaults and use a capable host fallback. Stop affected work when an explicit
user control cannot be honored; report unexposed resolved controls as unavailable.
Do not invoke another provider solely to force a default.

## Input contract

Require a bounded task brief with goal and acceptance criteria, applicable project
instructions/global constraints, prerequisites and exact consumed/produced
interfaces, owned files/resources and exclusions, baseline/diff boundary,
planned micro-steps/checks, authorization limits, and report destination.
Identify missing context before dependent edits; do not use accumulated session
history as a substitute for an explicit interface. In standalone work infer
routine details from repository evidence, but request material product decisions.

Carry relevant design rationale with the brief: workload, accepted tradeoffs,
non-goals and rejected heavier alternatives. On resume, recover these from the
brief and authoritative plan rather than only a completion summary. Missing
rationale alone does not block routine work; recover available evidence and
report only decisions that materially affect the design.

## Execute the task

1. Re-read task requirements and relevant source/tests before editing. Confirm
   prerequisites and ownership. If evidence invalidates the approved plan,
   report it to the controller rather than silently changing architecture.
2. Execute planned micro-steps in order, including test-first steps where
   practical. Use existing patterns and the smallest design that satisfies
   production requirements: keep each invariant owned once, cohesive
   responsibilities, explicit contracts/errors and no speculative layers.
   Trace the invariant and its current owner before adding a mechanism. Prefer
   existing behavior, then an owning helper or native facility, before custom
   state, protocols or recovery. A removed limit is not a constant-memory promise;
   an awaited operation is not a durable-job requirement. Check actual workload
   and supported failure behavior. Preserve trust boundaries, concurrency and
   data safety. If the brief mandates machinery without a demonstrated need,
   report the conflict and simpler alternative to the controller; do not silently
   redesign an approved interface or add another approval ceremony.
3. Apply `wnz-dead-code` directly in audit mode as each step changes reachability,
   then cleanup mode within existing task edit authorization. Attach its
   per-step evidence contract. An unresolved out-of-scope removal or unavailable
   reachability evidence blocks the affected completion claim.
4. Update public-behavior docs/runbooks, metadata, indexes and inbound links
   within scope. Verify claims against current code/config. Do not create an
   unplanned documentation split or broaden ownership.
5. After the last edit and cleanup, run focused appropriate verification:
   unit tests for changed pure behavior, operator CLI/help/dry-run checks,
   types/lint/integration checks and repository-required gates as applicable.
   Run live provider checks only when authorized or required by the task.
6. Self-review the complete task diff against each requirement and interfaces.
   Self-review does not replace a separate independent reviewer. Commits and
   pushes require existing authorization. Do not switch other checkouts, expand
   scope, or declare the project complete.

## Optional quality skills

Discover applicable `wnz-test-quality` for test design, `wnz-doc-write-expert`
for durable prose, and `wnz-clean-code-py`, `wnz-clean-code-js` or
`wnz-clean-code-rust` for explicit language refactors through host discovery.
If absent, choose tests by concrete failure and independent expected behavior;
write scoped docs from verified source and local corpus rules; preserve local
language idioms and contracts for the named refactor. These bounded fallbacks
do not waive required checks or the required dead-code dependency.

## Status and report contract

Return exactly one status and a concise pointer to the durable task report:

- `DONE`: all task requirements, cleanup evidence, fresh verification and
  self-review complete, with no unresolved correctness/scope concerns.
- `DONE_WITH_CONCERNS`: completed with explicit non-blocking concerns; never
  use this to hide missing required evidence or unresolved requirements.
- `NEEDS_CONTEXT`: missing information prevents safe completion; name the
  smallest missing decision/interface and work already verified.
- `BLOCKED`: unavailable dependency/environment, invalid plan or task size
  prevents completion; state what must change and what remains unverified.

Report task/baseline and allowed scope, changed files, requirement-by-requirement
coverage, exact commands/results after final edits, per-step `wnz-dead-code`
evidence, self-review findings and corrections, authorized commits if any,
remaining concerns and unavailable checks. A no-source-change step still records
its specific reference/no-code-impact assessment. Never report DONE from
inspection alone, stale tests or missing cleanup evidence.

## Authoring evaluations

Read [evals/evals.json](evals/evals.json) when changing execution or reports.
Exercise bounded capability and adversarial cases independently, and classify
activation from name/description alone.
