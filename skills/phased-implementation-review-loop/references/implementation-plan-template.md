# Implementation Plan Template

Use this template for every phased implementation plan. Replace every angle-
bracket placeholder before execution. Remove optional rows or bullets that do
not apply; do not leave empty headings, `TBD`, or speculative current-state
claims. **Current-state evidence** is optional only when a task creates wholly
new behavior and modifies no existing symbol. In that case, cite the nearest
contract, sibling pattern, and/or registration/composition point that exists
under **Read first**, then define the new identifiers under **Intended edits** and
**Interfaces**.

```markdown
# <Feature> Implementation Plan

**Goal:** <one sentence describing the observable result>

**Architecture:** <two or three sentences describing boundaries and data flow>

**Tech stack:** <languages, frameworks, libraries, and tools relevant to this change>

## Global constraints

- <binding requirement or repository rule>

## Acceptance criteria traceability

| Requirement | Task(s) | Verification |
| --- | --- | --- |
| <observable requirement> | Task 1 | `<exact command or inspection>` |

### Task N: <independently testable deliverable>

**Goal:** <behavior completed by this task>

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

**Interfaces:**

- Consumes: <exact existing names and shapes>
- Produces: <exact names, signatures, schemas, commands, routes, events, or artifacts>

**Review target:** <behavior and risks the independent reviewer must inspect>

- [ ] **Step 1: Establish the pre-change check**
  - Add: <test name, inputs, and observable assertions>
- [ ] **Step 2: Prove the check exposes the intended gap**
  - Run: `<exact command>`
  - Expect: <specific failure caused by missing behavior>
- [ ] **Step 3: Implement the minimum behavior**
  - Change: <exact symbols, control flow, validation, and error behavior>
- [ ] **Step 4: Prove the focused behavior passes**
  - Run: `<exact command>`
  - Expect: <specific passing result>
- [ ] **Step 5: Run the task gate**
  - Run: `<exact type/lint/integration/doc command>`
  - Expect: <specific clean result>
- [ ] **Step 6: Review and record the task**
  - Review: <independent review scope>
  - Record: <verification, loop count, and residual risk>
```

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
- For observable behavior with a practical test seam, Steps 1–2 mean a failing
  test. When no practical seam exists (for example docs, generated output, or a
  mechanical config change), replace them with an exact characterization or
  pre-change verification and state why test-first is not practical.
