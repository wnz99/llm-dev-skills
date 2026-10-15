# Implementation Plan Authoring

Read this file in full before writing or revising a plan. It covers the
structure analysis that precedes tasks, how to populate the plan, the plan
template that is the plan's output contract, and the plan self-review.

## Scope and structure before tasks

Write one plan for two readers: a human deciding whether the proposed change
is complete and appropriately simple, and a capable implementer with fresh
context. Explain features, effects and design before execution mechanics.
The implementer understands software engineering, but not this repository,
its domain or testing conventions.

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
5. Build a task dependency graph. For every task, name its prerequisites,
   produced interfaces, owned files, mutable external resources, and review
   gate. Group dependency-free tasks into explicit execution waves. Tasks may
   share a wave only when they can be implemented and verified concurrently
   without overlapping writes, shared migrations, mutable services, generated
   artifacts, test fixtures, or ordering-sensitive contracts.
6. Mark each wave `parallel-safe` or `sequential-only` and explain the reason.
   When parallel work needs isolated Git worktrees or branches, include the
   integration order and conflict-resolution owner in the plan. Never label a
   shared-working-tree edit wave parallel-safe merely because its tasks concern
   different concepts.

Avoid opportunistic restructuring. If a touched file is too large to change
safely, make the boundary-improving split an explicit task with its own test and
review gate.

## Populating the plan

Retain every template section that applies; omit an optional section only when
it genuinely has no content. Trace every requirement to tasks and observable
verification; anchors, evidence, and TDD follow **Reference rules** below.

A task is the smallest unit with its own test cycle and a meaningful fresh
reviewer gate. Fold setup, configuration, migration, and documentation into the
task whose deliverable requires them. Split tasks only when a reviewer could
reasonably accept one and reject its neighbor.

Use exact paths, symbols, commands, inputs, assertions, and expected output.
Do not write `TBD`, `TODO`, "add validation", "handle edge cases", "write tests",
"similar to Task N", or reference an interface that no task defines. Include
enough code or pseudocode to remove ambiguity, but do not paste large finished
implementations that will go stale before execution.

For non-obvious code changes, include exact signatures, assertions, control
flow, validation behavior, and transformation snippets. Boilerplate may be
omitted only when the plan names the exact existing symbol or repository pattern
to follow.

Prefer DRY and YAGNI.

## Progressive disclosure

Start from the template below. Keep the first two sections useful on their own:
a human should understand what changes, what it affects and why the design is
reasonable without reading the execution instructions. Introduce domain
concepts before internal identifiers; defer exact paths, signatures, commands
and substantial code examples to the execution section.

Give each feature or cohesive change a stable ID such as `F1`. Describe its
intent once, then map it to tasks and verification. Keep review-critical risks,
compatibility changes, unresolved choices and acceptance outcomes visible in
the human-facing sections; do not bury them in task checkboxes. Summaries must
agree with the detailed instructions. Do not create two independently maintained
plans or repeat the same implementation narrative in both halves.

Include the design-diagram section only when an ASCII diagram clarifies
boundaries, dependencies, state or interactions better than prose. Use meaningful
labels, a legend when necessary and text explaining what the diagram shows.
Diagrams describe the real proposed design, not hypothetical architecture.

Include data-flow analysis when the change affects data movement, representation,
validation, access boundaries, storage or outputs. Trace relevant inputs through
transformations to observable results, including material failure paths. Explain
what changes from current behavior and which contracts remain. Do not invent a
pipeline for a prose, naming or other change with no relevant data-flow impact.
Omit inapplicable optional sections entirely rather than leaving empty headings.

## Plan template

Use this template for every phased implementation plan. Replace every angle-
bracket placeholder before execution. Remove optional rows or bullets that do
not apply; do not leave empty headings, `TBD`, or speculative current-state
claims. **Current-state evidence** is optional only when a task creates wholly
new behavior and modifies no existing symbol. In that case, cite the nearest
contract, sibling pattern, and/or registration/composition point that exists
under **Read first**, then define the new identifiers under **Intended edits** and
**Interfaces**.

````markdown
# <Feature> Implementation Plan

## Features and effects

<Briefly explain the overall observable result in familiar domain language.>

### F1: <Feature or cohesive change>

- Problem and current behavior: <what happens now and why it needs to change>
- Proposed behavior: <what will happen after this change, with a concrete example when useful>
- Effect on the code: <affected components and how their responsibilities or interactions change>
- Scope and compatibility: <boundaries, relevant non-goals and supported contracts affected>
- Acceptance outcomes: <observable results that establish this feature is complete>
- Execution mapping: <Task 1 and any other tasks delivering F1>

## High-level design and rationale

<Explain the proposed components, their responsibilities and how they fit the
existing system. Identify what is reused, changed, removed or added and why.>

- Design choices: <why this is the simplest complete approach; material alternatives and tradeoffs only>
- Risks and safeguards: <material compatibility, security, data integrity, migration/rollback or operational consequences>
- Open decisions: <unresolved choices requiring human input; omit when none>

## Design diagrams

<Optional: include only when an ASCII diagram makes the design easier to assess.>

```text
[<entrypoint>] --> [<owning component>] --> [<existing dependency>]
```

<Explain the relationships and any change from the current design.>

## Data-flow analysis

<Conditional: explain relevant current-to-proposed changes in inputs, processing,
validation/access boundaries, storage and outputs before presenting the steps.>

| Stage | Input and source | Processing and owner | Output or side effect | Material failure handling |
| --- | --- | --- | --- | --- |
| <stage> | <meaning, trust boundary and relevant shape> | <transformation/validation and responsible component> | <next consumer, persistence or observable result> | <rejection, recovery or propagated error> |

<Include representative data examples or another ASCII flow only when they
clarify a changed contract. Do not repeat unchanged or irrelevant stages.>

## Execution instructions

**Tech stack:** <languages, frameworks, libraries and tools relevant to execution>

### Global constraints

- <binding requirement or repository rule>

### Acceptance criteria traceability

| Feature and requirement | Task(s) | Verification |
| --- | --- | --- |
| F1: <observable requirement> | Task 1 | `<exact command or inspection>` |

### Execution topology

| Wave | Tasks | Mode | Prerequisites | Isolation and integration | Wave verification |
| --- | --- | --- | --- | --- | --- |
| 1 | Task 1, Task 2 | parallel-safe | none | Separate worktrees; integrate Task 1 then Task 2 | `<command>` → <expected outcome> |
| 2 | Task 3 | sequential-only | Tasks 1–2 reviewed and integrated | Shared integration branch | `<command>` → <expected outcome> |

- Parallel implementation permission: `<not-requested | approved | denied>`
- Host/model policy: `<detected host>; per-role model and effort for planner, implementer/fixer, and reviewer; applicable user overrides; requested versus selected controls and host limitations`

### Task N: <independently testable deliverable>

**Goal:** <behavior completed by this task>

**Delivers:** <feature IDs such as F1; refer to their intent without repeating it>

**Execution:**

- Prerequisites: <task IDs or `none`>
- Wave: <wave number>
- Mode: <parallel-safe or sequential-only, with reason>
- Isolation: <worktree/branch and owned files, or shared-tree sequential>
- Integration order: <position and cross-task verification>

**Files:**

- Create: `exact/path/to/new_file.ext`
- Modify: `exact/path/to/existing.ext:ExistingSymbol`
- Test: `exact/path/to/test.ext:test_case_or_describe_block`
- Docs: `exact/path/to/doc.md:## Relevant heading`

**Read first:**

- `path/to/current.ext:ExistingSymbol` — <why this is the owned behavior>
- `path/to/contract.ext:ContractName` — <contract or pattern to preserve>

**Current-state evidence:**

- `path/to/current.ext:ExistingSymbol` currently <observed behavior or limitation>.
- `path/to/test.ext:test_existing_case` proves <protected behavior>, but does not cover <gap>.

**Intended edits:**

- `path/to/test.ext:test_new_case` — add <inputs, observable assertions, and intended initial failure>.
- `path/to/current.ext:ExistingSymbol` — change <control flow, validation, or mapping>; preserve <invariant>.
- `path/to/contract.ext:NewOrChangedContract` — create/update <exact exported signature, schema, event, or artifact> consumed by <named symbol/task>.

<Include short code examples or pseudocode for non-obvious changes, showing exact
signatures, validation or control flow. Follow the actual source language; omit
routine boilerplate and large finished implementations.>

**Interfaces:**

- Consumes: <exact existing names and shapes>
- Produces: <exact names, signatures, schemas, commands, routes, events, or artifacts>

**Dead-code scope:** <affected paths, entrypoints/consumers to trace, candidate
removals and retained API/dynamic contracts; scanner/search evidence to collect>

**Review target:** <behavior, dead-code cleanup, and risks the independent reviewer must inspect>

- [ ] **Step 1: Establish the pre-change check**
  - Add: <test name, inputs, and observable assertions>
  - Cleanup: <inspect affected helpers/fixtures/exports; record supported consumers>
- [ ] **Step 2: Prove the check exposes the intended gap**
  - Run: `<exact command>`
  - Expect: <specific failure caused by missing behavior>
  - Cleanup: <check artifacts/references changed by this step, or state why prior evidence still applies>
- [ ] **Step 3: Implement the minimum behavior**
  - Change: <exact symbols, control flow, validation, and error behavior>
  - Cleanup: <remove confirmed obsolete symbols/branches and update their consumers>
- [ ] **Step 4: Prove the focused behavior passes**
  - Run: `<exact command>`
  - Expect: <specific passing result>
  - Cleanup: <check final references and tests after removals; record retained candidates and reasons>
- [ ] **Step 5: Run the task gate**
  - Run: `<exact type/lint/integration/doc command>`
  - Expect: <specific clean result>
  - Cleanup: <verify no new orphaned code/artifacts; record evidence or no-code-impact reason>
- [ ] **Step 6: Review and record the task**
  - Review: <independent review scope>
  - Record: <verification, loop count, and residual risk>
  - Cleanup: <review per-step evidence/removals and confirm no known dead code remains in scope>
````

## Reference rules

- Prefer `path:symbol` for code and `path:heading` or `path:key` for docs and
  configuration. These survive unrelated edits better than line numbers.
- Use `path:line` only when the file has no stable named anchor. Treat it as a
  locator, not a contractual line position, and do not use line ranges.
- Put new identifiers in **Intended edits** and **Interfaces**. Current-state
  evidence must point only to source that was actually inspected.
- Keep evidence descriptive and edits directive. Do not repeat the same
  implementation paragraph under evidence, interfaces, steps, and acceptance
  criteria.
- Include only execution-relevant anchors. A complete file inventory is less
  useful than a small map of owned behavior, contracts, tests, and wiring.
- Treat `parallel-safe` as a correctness claim. Require non-overlapping writes
  and mutable resources, explicit isolation, deterministic integration order,
  and a wave-level verification command. Otherwise use `sequential-only`.
- For observable behavior with a practical test seam, Steps 1–2 mean a failing
  test. When no practical seam exists (for example docs, generated output, or a
  mechanical config change), replace them with an exact characterization or
  pre-change verification and state why test-first is not practical.

## Plan self-review

Before implementation or handoff:

1. Read only the human-facing sections first. Confirm they explain the changes,
   effects, responsibilities, design rationale, material risks and acceptance
   outcomes without requiring task details. Check that conditional diagrams and
   data-flow analysis are present when useful and absent when irrelevant.
2. Re-read every requirement and map it through a feature ID to a task and
   verification command. Confirm overview, diagrams, data flows and task details
   describe the same behavior; resolve contradictions and hidden decisions.
3. Scan for placeholders, vague verbs, missing paths, undefined interfaces, and
   commands without expected outcomes; replace them with executable detail.
4. Confirm every modified existing symbol has source-backed current-state
   evidence, and every evidence claim points to an inspected path plus a stable
   symbol, heading, or config key when one exists.
5. Confirm intended edits state target behavior and identifiers without
   duplicating the same prose in actions, interfaces, and acceptance criteria;
   ensure line-number drift cannot invalidate a task.
6. Check type, schema, route, event, and property names across tasks for exact
   consistency.
7. Check task ordering and ensure every dependency is produced before it is
   consumed.
8. Check documentation claims against code/config evidence and verify planned
   files follow corpus placement, metadata, index, and cross-link rules.
9. Confirm every task leaves the repository in a working, independently
   testable state, with a dead-code check and cleanup result defined for every step.
