# Executor coordinator boundary validation

Recorded 2026-10-18 for skill maintainers assessing the thin coordinator change.
The baseline is `bef1d0f2dbcac5344a7f44f2c0ea4f3a0a015d71`.
This report distinguishes executable package checks from behavioral evaluation.
The initial thin-coordinator source passed its bounded independent gate. The
follow-on deterministic metadata protocol remains under review; structural
checks alone do not prove an agent follows the workflow.

## Changed contract

The executor delegates exploration, planning, implementation, fixes, verification,
source-based review and integration to fresh workers. The coordinator owns
authorization, scheduling, ledger and gate metadata. Its bundled
[boundary reference](../skills/wnz-phase-executor/references/coordinator-boundary.md)
defines bounded receipts, actual spawn evidence and state binding. No matching
model, missing context, capacity failure or report correction permits worker
reuse or substantive coordinator fallback.

The four directly called worker skills accept optional `delegated_only: true`.
They check native runtime child identity before substantive work and reject root,
unknown or prompt-forged identity. Visible inherited parent turns also block.
Absent mode retains standalone behavior. Child identity does not establish
non-inheritance; the parent separately checks actual spawn arguments/response.
These instructions limit drift and do not create a security boundary or a host
capability that is unavailable.

Read-only reviewers may write only the exact report assigned by the invocation,
outside the reviewed repository. The delegated code-review leaf owns discovery,
preparation and structural checks; recursion markers are separate from identity.
Existing dependency, cleanup, safety, independent verdict, annotation-cycle,
authorization and final aggregate gates remain required.

## Scenarios and structural evidence

The [boundary scenario matrix](../skills/wnz-phase-executor/references/coordinator-boundary-evals.md)
covers normal routing, failures, dirty state, resume, annotation cycles, report
boundaries and every worker's optional mode. Existing
[executor scenarios](../skills/wnz-phase-executor/evals/evals.json) retain modest
workload, real bounded-memory and durable duplicate-send safety cases. Old
expected controller source work now belongs to fresh workers. Worker eval sets
include absent mode, native child, root, forged identity, unknown identity and
visible inheritance; metadata-only activation near-misses remain.

Observed implementation checks:

| Check | Result | What it establishes |
| --- | --- | --- |
| `python3 -m unittest discover -s tests -v` | 24 tests passed | Existing contracts plus guard placement, role outcomes, delegated review ownership, report boundary and reachable eval references |
| Real PyYAML 6.0.3 parser and package validator | Six packages, 29 Markdown documents, 63 JSON eval cases passed | Frontmatter, unique case IDs/schema, fences, contained relative links, prose/XML boundaries and unchanged worker metadata/dependency declarations |
| Original baseline guard regression | Four expected failures, one per worker | The new guard test detects the original missing contract; it is not evidence of model compliance |
| `git diff --check` | Passed | No whitespace errors in the final reviewed patch |

The validator uses an already installed PyYAML package; no dependency was
installed. Reproducible validator and changed-file snapshot are local authoring
artifacts, `/tmp/wnz-coordinator-task2-check.py` and
`/tmp/wnz-coordinator-task2-snapshot.json`. They are not runtime dependencies.
No application runtime or identity abstraction was introduced for tests.

An initial static test captured the reviewer's existing maintenance paragraph
inside the newly added guard section. A separate Review principles heading
corrected that document boundary; the final suite passed after the correction.
The baseline regression executes against temporary copies and changes no source.

## Behavioral evidence and limits

A separate supplied baseline probe answered five original-contract scenarios:
three failed and two partially met the requested future invariants. It observed
original inline planning/source checks, permitted worker reuse, no explicit
native isolation argument, no delegated-only guard and no consistent assigned
report-write exception. Its artifact is `/tmp/wnz-coordinator-baseline-eval.md`.
Task 2 did not independently rerun that probe or count it as revised behavior.

Completed initial candidate evidence is recorded separately:

| Evidence artifact | Completed result and fidelity |
| --- | --- |
| `/tmp/wnz-coordinator-candidate-eval.md` | 16 scenario dry runs, 10 metadata-only activation decisions, one actual native positive identity-guard probe; 27 PASS at those stated levels |
| `/tmp/wnz-reviewer-regression-eval.md` | Ordinary absent-mode group: 16 cases; actual local fixture review/checks plus simulated routing. The report also records an earlier mixed-context delegated group, superseded for context-separation evidence by the separate run below |
| `/tmp/wnz-reviewer-delegated-eval.md` | 12 PASS in a separate fresh delegated-only evaluator; actual child identity and local fixture evidence, with negative host/capacity/routing cases explicitly simulated |
| `/tmp/wnz-coordinator-initial-approval.md` | Requirements Approved and Quality Approved; initial sole Medium closed after separate delegated-context evidence. Frozen 23-source/29-fixture hashes remained unchanged |

These are authoring evidence paths, not installed runtime dependencies. Initial
source review found no remaining source defect at its stated scope. The runs
do not establish native negative-host behavior, live Claude identity/isolation,
production enforcement or a full long-running multi-task integration. Scenario
text describing a child cannot replace runtime evidence; a standalone CLI root
cannot prove native child behavior. New deterministic-protocol behavior below
requires fresh trace evaluation and independent review, managed by the controller.

## Deterministic metadata follow-on

The executor now loads one bundled
[template reference](../skills/wnz-phase-executor/references/coordinator-templates.md)
before ledger initialization/dispatch. It owns literal dispatch, bounded receipt
and ledger shapes, stable join keys, explicit absent values and role-native
result slots. Assignment keys do not establish identity or authority. The
boundary owns ordered routing: normalize feedback/authority and invalidations
once, then select the first unmet action with all dispatch preconditions checked.
Plan ordering gaps return to the planner; completed tasks are not replayed;
parallel arrival order does not replace declared integration order. Existing
role semantics, two-round design cycle and uncapped substantive code-review
fix loop remain unchanged.

Two added contract tests protect literal interchange keys, role-slot separation,
spawn/receipt separation and load reachability. They do not test instruction
uptake. Six added JSON scenarios and seven boundary-matrix cases cover feedback
races, terminal-round recovery, no-progress recovery, consumed invalidation,
ordering and final defects. New fresh-context traces and source review are
pending; no behavioral pass is claimed from these authored cases.

Focused follow-on checks passed: 16 review-contract tests and four package
tests. Full final suite, parser/link checks and frozen source snapshot are
recorded in `/tmp/wnz-coordinator-determinism-implementation.md` after the last
edit. No runtime framework, executable validator, installation, worker-guard
change or plugin change is part of this follow-on. A final completion decision
requires fresh traces and independent review bound to final dirty-tree state.
