---
name: wnz-doc-write-expert
description: Expertly write new or review and refresh existing technical and non-technical documentation. Use whenever the user asks to create, draft, document, rewrite, review, audit, verify, or update a README, runbook, guide, proposal, architecture document, ADR, specification, process document, policy, knowledge-base article, AGENTS.md/CLAUDE.md, or other durable prose, including durable prose documents updated as part of code, configuration or refactoring work. Derive claims from authoritative evidence, follow repository and documentation-corpus rules, design for the intended reader and action, and keep existing-document changes surgical. Not for code comments or docstrings. Prefer this skill over ad hoc documentation work; use a fixed generator only when the repository explicitly requires one.
---

# Doc Write Expert

Create trustworthy documents from scratch and keep existing documents aligned with reality. Work as both an expert writer and a rigorous reviewer across technical and non-technical material.

The standard is the same in both modes: understand the reader, identify the action the document must enable, establish authoritative evidence, follow the local documentation system, and test the result as a fresh reader.

## Origin and local extension

This skill is maintained in [wnz99/llm-dev-skills](https://github.com/wnz99/llm-dev-skills/tree/main/skills/wnz-doc-write-expert) and extends that repository's original `doc-review` workflow. When asked to update, reinstall, download, or replace this skill with a newer version, inspect that upstream directory first and use the newest compatible version. Preserve intentional installation-specific adaptations and reconcile them with both the evidence-backed review mode and the authoring mode rather than overwriting them silently.

## Migration note

This skill was previously published as `doc-write-expert`. Prefer
`wnz-doc-write-expert` in prompts and installed skill directories. Remove the
legacy `doc-write-expert` copy after upgrading to avoid ambiguous routing.

## Independent review routing

When changing review routing, read and run [evals/evals.json](evals/evals.json)
in fresh contexts; classify activation from metadata alone. When changing
language or register guidance, run cases 8–24 in fresh contexts on each
supported host and record the results in
[evals/language-validation.md](evals/language-validation.md).

Require `wnz-independent-review` for standalone reviews and audits, including validation-only assessments.
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

## Announce on trigger

Post one short line identifying the mode and target:

- New document: `Using **wnz-doc-write-expert** to author <document/purpose> — I'll establish the reader, evidence, corpus rules, and structure before drafting.`
- Existing document: `Using **wnz-doc-write-expert** to review <relative path> — I'll inventory checkable claims, verify them, and make only the edits the request authorizes.`
- Update during code work: `Using **wnz-doc-write-expert** to update <relative path> alongside the code change — I'll apply the sentence checks and the three passes to the changed prose.`

## Choose the mode

### Author mode

For a new durable document or a replacement drafted from a blank page, use the
author workflow.

### Review mode

For an explicit review, audit or check of an existing document, route the
review workflow independently before substantive assessment. For a pure
write/update/fix request, use the local correctness and corpus checks of
[author step 6](references/author-workflow.md#6-validate-factual-and-corpus-correctness);
these checks do not constitute independent approval.

For mixed review-and-fix requests, the independent reviewer returns findings
first; the authorized author then applies scoped corrections without a
permission pause. Keep review read-only and author edits separate; do not
create a fresh review gate for every microedit. Any requested follow-up review
uses fresh routing. Report first and obtain approval before material structural
changes.

### Hybrid mode

Use when reviewing an existing document reveals that a split, replacement, or companion document is necessary. Complete the review findings and obtain approval for structural changes before creating the new document.

Do not use either mode for fixed generated documentation when the repository mandates a generator. Use the owning generator and review its inputs and output instead.

Authorization is determined once from the request: `review`, `audit`, or
`check` alone is read-only; `update`, `fix`, `refresh`, or `rewrite` authorizes
scoped correctness and conformance edits. A readability request, to improve
readability, fluency or clarity, also authorizes changing voice and sentence
structure within its scope. Document moves, splits, replacement,
and other material structural changes require approval unless explicitly
requested.

## Model policy

For authoring, rewriting, and correctness edits, default to
`claude-sonnet-5-5` with the host's effort default on Claude, or `gpt-6.1-sol`
with `medium` effort on Codex. For read-only audits and independent document
reviews, default to `claude-opus-5-5` or `gpt-6.1-sol`, both with `medium`
effort. In hybrid work, assess the findings with the review tier and draft the
authorized replacement with the writing tier. Model choice does not authorize
structural changes or allow inventing architectural or policy decisions.

An explicit user override changes only the named model or effort control. Use
available native selection or authorized bounded delegation; prose cannot
switch the caller's model. Disclose an unenforceable default and its
host-supported fallback before work. If an explicit control cannot be honored,
stop the affected work until the user permits an alternative. Report unexposed
resolved controls as unavailable instead of claiming selection succeeded. Do
not invoke an external provider solely to enforce this policy.

When changing this policy, run the cases in
[references/model-policy-evals.md](references/model-policy-evals.md).

## Shared operating principles

Follow the user request, applicable repository and subtree instructions, and
documentation governance in that order; use this skill where those sources do
not decide the issue.

1. **Evidence before prose.** Verify factual claims against authoritative code, configuration, schemas, policies, source material, or user-provided facts. Never fill gaps from memory.
2. **Write for a named reader and action.** Define who will read the document and what they should be able to decide, understand, or do afterward.
3. **Respect local governance.** Read applicable `AGENTS.md`, `CLAUDE.md`, contribution rules, documentation standards, indexes, templates, and sibling documents before choosing a location or structure.
4. **Treat the corpus as a contract.** Placement, filename, frontmatter, document type, index membership, links, reserved filenames, and generated/manual ownership can all be correctness requirements.
5. **Separate fact from judgment.** Mark recommendations, decisions, hypotheses, examples, and unresolved questions distinctly from verified facts.
6. **Prefer the smallest durable artifact.** Do not create documentation that duplicates an existing source of truth or records transient conversational history.
7. **Preserve navigability.** Update relevant indexes and inbound links whenever adding, moving, splitting, or renaming documents.
8. **Build understanding progressively.** Introduce data, references, terminology, identifiers, and technical detail only after the reader has the context needed to understand why they matter. Technical depth is welcome; unexplained prerequisites and premature implementation detail are not.
9. **Cold-read before completion.** Test whether a reader without session context can take the intended action safely.

## Language and register

Write idiomatically in the target language for the document's readers. Chat
response modes do not set document style; the document's own conventions and
explicit style requests do.

## Load the workflow for the task

Read only the files the task needs, before the work they govern:

- **Any document prose**, including updates during code work, fixes after a
  review and fluency assessment in a review: read
  [references/language-and-register.md](references/language-and-register.md)
  before writing, editing or assessing prose. It holds the sentence checks and
  the fluency, fidelity and inference passes.
- **New document, blank-page replacement, substantial new section, or the
  author leg of hybrid mode:** read
  [references/author-workflow.md](references/author-workflow.md) and follow its
  steps in order.
- **Scoped update, fix or readability rewrite of an existing document:** read
  and apply step 6 of
  [references/author-workflow.md](references/author-workflow.md#6-validate-factual-and-corpus-correctness).
- **Review, audit or check:** after independent routing, read
  [references/review-workflow.md](references/review-workflow.md).
- **Applying review findings:** read and apply steps 5 and 6 of
  [references/review-workflow.md](references/review-workflow.md#5-apply-approved-edits-surgically).

In every case, verify changed claims against their sources and parse any
changed YAML frontmatter with a real YAML parser.

## Final handoff

Summarize:

- Files created or changed
- Reader action the document now supports
- Evidence-backed corrections or principal design choices
- Validation performed
- Open questions, deferred restructuring, or downstream documentation work

Do not commit unless the user explicitly asks. Follow repository commit rules when they do.

## Anti-patterns

- Writing from remembered facts before inspecting sources
- Drafting prose before understanding audience, purpose, placement, and outline
- Creating a second source of truth instead of linking to the owner
- Rewriting an existing document in a new voice without correctness justification or a readability request
- Inventing commands, flags, policies, dates, or examples
- Treating an opinion as stale merely because the reviewer disagrees
- Dropping warnings or caveats without evidence they are obsolete
- Creating or moving documents without updating navigation
- Editing during a review-only request, or making material structural changes
  without authorization
- Claiming completion without a factual, corpus, and fresh-reader check

## Repository precedence

Repository and subtree instructions override this generic workflow. If the corpus mandates a template, generator, approval process, terminology set, or prohibition such as avoiding paths in durable docs, follow it and state the adaptation.
