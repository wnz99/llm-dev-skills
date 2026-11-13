# Implementation Plan Authoring

Read in full before authoring or revising a plan. This file owns the compact
plan contract and author self-review. A plan supports human annotation and a
fresh implementer; it is not a prewritten implementation transcript.

## Scope and evidence

Inspect requirements, owning source, tests, wiring and affected consumers before
defining tasks. Split unrelated deliverables rather than hiding separate projects
in phases. Reuse DISCOVERY or existing reports for facts, measurements, file maps
and detailed results; point to stable headings/source anchors with observed state
and limitations. Do not require a new artifact or schema. Distinguish observed
facts, recommendations and approved scope; silence never approves a recommendation.

Define each requirement and material contract once with a stable ID, such as
R1, C1 and A1. Other sections reference IDs rather than repeating their prose.
Keep review-critical information in the plan: outcome/scope, approach/tradeoffs,
architecture, public/data/cross-task contracts, security/compatibility safeguards,
migration order/rollback, observable acceptance, human decisions and implementer
discretion. Resolve design-invalidating unknowns with evidence before approval;
an evidence pointer must be usable, not hide an unresolved design decision.
Include data-flow analysis or an ASCII diagram only when it clarifies changed
trust boundaries, representation, state or interactions better than prose.

## Detail boundary

Use the shortest complete plan; word budgets are soft editing aids, never reasons
to omit safeguards. Routine exact tests/commands, private signatures, fixtures
and internal control flow are prepared by the existing implementer near dispatch
from current source, in its existing task report/brief. No second plan, mandatory
artifact, preparation agent or gate is needed. Preserve exact names/shapes where
public behavior or another task depends on them before approval. Material semantic
discoveries return to the existing plan gate; routine choices within approved
contracts go through implementation and code review.

## Plan template

Replace placeholders; omit inapplicable sections/fields. IDs provide joins to
each requirement/contract's one canonical definition.

````markdown
# <Feature> — revision <revision>

## Outcome and scope

<Observable result, affected users/components, non-goals and compatibility.>

- R1: <canonical requirement>
- A1 (R1): <observable acceptance and sufficient evidence; task T1>

## Approach and material contracts

<Responsibilities, reuse/removal/addition, relevant alternative and tradeoff.>

- C1: <exact public/data/cross-task contract; producer/consumer and safeguards>
- <Material risks, security/compatibility safeguards, migration order and rollback
  where applicable; reference R/C/A IDs instead of repeating definitions.>
- Evidence: <DISCOVERY/report/source anchors, observed state and limitations>

## Decisions and discretion

<Confirmed human decisions and authority; unresolved material choices block
dependent approval. Identify routine choices left to the implementer.>

## Tasks and dependencies

<For one task, a sentence states sequential execution and prerequisites. Use a
wave table only when multiple tasks or concurrency warrant comparing order.
For parallel-safe work give non-overlapping writes/resources, isolation,
integration order/owner and wave verification; record actual parallel permission
and applicable host/model controls without inferring authorization.>

### T1: <independently reviewable deliverable>

- Deliverable/acceptance: <R/A IDs>
- Ownership: <paths/resources and exclusions; nearest source/pattern anchors>
- Dependencies: <task IDs and consumed fact/interface; timing of safety-critical
  prerequisite checks versus task/final acceptance proof where material>
- Contracts: consumes <C IDs>; produces <C IDs>
- Safeguards and review: <contract IDs and task-specific risks to inspect>
- Cleanup: <single task-specific obligation: candidates/consumers, removal owner,
  reachability/post-cleanup evidence; explicit exceptions>

## Self-review receipt

Revision <revision>; checked <coverage, contracts, ordering/safety, evidence,
cleanup and simplicity>; gaps <specific unresolved items or none>;
evidence <usable pointers>. History/results: <existing report/ledger>.
````

## Reference rules and self-review

- Prefer `path:symbol`, `path:heading` or `path:key`; use a line locator only
  without a stable anchor. Cite inspected current-state evidence, not proposed
  identifiers as facts. Include only execution-relevant maps.
- Trace original requirements through IDs to tasks and observable proof. Check
  scope, approach and contracts agree, without hidden decisions or unsafe deferred
  unknowns. Exact command spelling is prepared later unless a material contract.
- Check exact public/schema/event/property names across producers/consumers;
  ensure dependencies precede consumption. Challenge preparatory harnesses as
  prerequisites: retain safety/preservation checks before dependent actions and
  required runtime proof at acceptance without blocking independent safe work.
- Treat parallel-safe as a correctness claim: check writes, mutable services,
  migrations, generated artifacts, fixtures, isolation and deterministic
  integration. Otherwise use sequential execution.
- Apply required dead-code audit and retain reachability evidence. Plan one
  cleanup obligation per task with explicit exceptions; execution still records
  evidence as reachability changes and justified reuse for unchanged steps.
  Do not require six repeated cleanup fields or unsupported “none” claims.
- Reuse sufficient checks; add regressions only for demonstrated gaps at practical
  seams. Preserve security, data integrity, concurrency and required gates.
  Mechanical/prose changes can use existing validation with a concrete reason
  no new test is needed.
- Check documentation placement/metadata/inbound links; remove unsupported
  machinery and duplicate knowledge. PLAN contains the compact receipt; existing
  reports/ledger hold review history and complete results.
- On follow-up identify delta, impacted contract/acceptance IDs and unresolved
  findings. Reuse unchanged evidence only after checking state, scope and relevant
  consumers; inspect affected areas fresh. Material semantic changes reopen
  existing gates, preserving caps and approval binding to latest revision.
