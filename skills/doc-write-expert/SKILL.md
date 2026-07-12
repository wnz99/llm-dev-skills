---
name: doc-write-expert
description: Expertly write new or review and refresh existing technical and non-technical documentation. Use whenever the user asks to create, draft, document, rewrite, review, audit, verify, or update a README, runbook, guide, proposal, architecture document, ADR, specification, process document, policy, knowledge-base article, AGENTS.md/CLAUDE.md, or other durable prose. Derive claims from authoritative evidence, follow repository and documentation-corpus rules, design for the intended reader and action, and keep existing-document changes surgical. Prefer this skill over ad hoc documentation work; use a fixed generator only when the repository explicitly requires one.
---

# Doc Write Expert

Create trustworthy documents from scratch and keep existing documents aligned with reality. Work as both an expert writer and a rigorous reviewer across technical and non-technical material.

The standard is the same in both modes: understand the reader, identify the action the document must enable, establish authoritative evidence, follow the local documentation system, and test the result as a fresh reader.

## Origin and local extension

This skill is maintained in [wnz99/llm-dev-skills](https://github.com/wnz99/llm-dev-skills/tree/main/skills/doc-write-expert) and extends that repository's original `doc-review` workflow. When asked to update, reinstall, download, or replace this skill with a newer version, inspect that upstream directory first and use the newest compatible version. Preserve intentional installation-specific adaptations and reconcile them with both the evidence-backed review mode and the authoring mode rather than overwriting them silently.

## Announce on trigger

Post one short line identifying the mode and target:

- New document: `Using **doc-write-expert** to author <document/purpose> — I'll establish the reader, evidence, corpus rules, and structure before drafting.`
- Existing document: `Using **doc-write-expert** to review <relative path> — I'll inventory checkable claims, verify them, and report findings before editing.`

## Choose the mode

### Author mode

Use when the requested durable document does not exist, needs a replacement written from a blank page, or the user explicitly asks for a new draft.

### Review mode

Use when a document already exists and the user wants it checked, refreshed, corrected, reorganized, or brought into conformance.

### Hybrid mode

Use when reviewing an existing document reveals that a split, replacement, or companion document is necessary. Complete the review findings and obtain approval for structural changes before creating the new document.

Do not use either mode for fixed generated documentation when the repository mandates a generator. Use the owning generator and review its inputs and output instead.

## Shared operating principles

1. **Evidence before prose.** Verify factual claims against authoritative code, configuration, schemas, policies, source material, or user-provided facts. Never fill gaps from memory.
2. **Write for a named reader and action.** Define who will read the document and what they should be able to decide, understand, or do afterward.
3. **Respect local governance.** Read applicable `AGENTS.md`, `CLAUDE.md`, contribution rules, documentation standards, indexes, templates, and sibling documents before choosing a location or structure.
4. **Treat the corpus as a contract.** Placement, filename, frontmatter, document type, index membership, links, reserved filenames, and generated/manual ownership can all be correctness requirements.
5. **Separate fact from judgment.** Mark recommendations, decisions, hypotheses, examples, and unresolved questions distinctly from verified facts.
6. **Prefer the smallest durable artifact.** Do not create documentation that duplicates an existing source of truth or records transient conversational history.
7. **Preserve navigability.** Update relevant indexes and inbound links whenever adding, moving, splitting, or renaming documents.
8. **Cold-read before completion.** Test whether a reader without session context can take the intended action safely.

## Author mode workflow

### 1. Establish the writing brief

Determine from the request and repository context:

- Intended reader and their assumed knowledge
- Single primary post-read action or decision
- Document type and expected lifetime
- Scope and explicit non-goals
- Authoritative sources and subject-matter owner
- Required location, metadata, template, indexes, and links
- Technical versus non-technical depth and vocabulary

Ask one concise round of questions only when missing answers would materially change the document. Otherwise state reasonable assumptions and proceed.

### 2. Gather evidence

Read the authoritative sources before outlining. For technical documents, inspect owning code, contracts, commands, configuration, tests, and operational rules. For non-technical documents, use approved policies, decisions, research, user-provided facts, and existing organizational terminology.

Create a private evidence ledger for non-trivial work:

| Claim/topic | Source of truth | Confidence or open question |
|---|---|---|

Do not paste this ledger into the finished document unless provenance is useful to readers.

### 3. Inspect the documentation corpus

Walk from repository root to the target location. Read applicable instruction files, parent indexes, standards, templates, and representative sibling documents. Determine:

- Whether a new document is justified
- Correct directory, filename, and document type
- Required frontmatter and index registration
- House style for headings, code fences, tables, callouts, tone, and links
- Whether another document already owns part of the proposed content

For governed bundles such as OKF, apply the declared local profile and specification. Preserve unknown metadata and respect reserved file roles.

### 4. Design the outline before drafting

Create an implementation-ready outline in reader order. Each section must have a purpose. Put prerequisites and essential context before procedures or decisions. Put reference detail after the main path.

Use only the sections the reader needs. Common patterns include:

- Runbook: purpose → prerequisites → safe procedure → verification → rollback/recovery
- Setup guide: outcome → prerequisites → steps → validation → troubleshooting
- Architecture/spec: context → goals/non-goals → constraints → design → interfaces/data → failure modes → verification/rollout
- ADR/proposal: context → decision/proposal → alternatives → consequences → adoption
- Policy/process: purpose → scope → roles → rules → procedure → exceptions/escalation
- Explanatory article: reader question → concise answer → evidence/examples → implications → next action

For a substantial or judgment-heavy document, show the outline to the user before drafting. For straightforward work, draft in place after confirming the outline internally.

### 5. Draft in place

Write directly to the governed target file. Match local style and terminology. Prefer concrete statements, examples, and executable steps over abstractions.

- Copy commands, identifiers, and field names from their sources.
- State prerequisites before they are used.
- Explain why a constraint matters when it changes reader behavior.
- Define project-specific terms; do not re-explain universal concepts to an expert audience.
- Use tables only for repeated mappings or genuine comparisons.
- Avoid filler introductions, recap conclusions, decorative language, and conversational history.
- Avoid brittle line-number references in durable prose unless the corpus explicitly uses them.
- Mark examples as examples and recommendations as recommendations.

### 6. Validate factual and corpus correctness

Recheck every material claim against its source. Run relevant lightweight commands when a document promises a command, path, schema, or procedure. Validate frontmatter, links, indexes, and required structure using project-local tooling when available.

### 7. Reader-test

Read the finished document from top to bottom as a fresh member of the intended audience:

- Is the purpose clear immediately?
- Can the named action be completed without tribal knowledge?
- Are prerequisites, risks, ownership, and failure handling present where needed?
- Does each section earn its place?
- Are facts distinguishable from recommendations and open questions?
- Can the document be found through the corpus navigation?

Close gaps and cut content that does not serve the reader action.

## Review mode workflow

### 1. Read the target end-to-end

Read the complete document and inventory checkable claims:

- Commands, paths, directory layouts, symbols, packages, and APIs
- Environment variables, configuration keys, resources, accounts, and URLs
- Workflow names, task-runner targets, version pins, model IDs, and dependencies
- Procedures, ordering, prerequisites, warnings, diagrams, and structural tables
- Policies, ownership, roles, dates, decisions, commitments, and stated outcomes

Also record tone, formatting, frontmatter, containing indexes, inbound links, reserved filename status, and corpus rules.

### 2. Read local guidance and map claims to evidence

Read applicable repository and subtree instructions, contribution guidance, documentation standards, indexes, and representative sibling documents. Locate the authoritative source for every material claim using exact searches first, then semantic exploration where necessary.

### 3. Classify findings

Classify each claim as:

- **CORRECT** — verified; no change
- **STALE** — contradicted by current evidence
- **OUTDATED** — superseded by a newer supported path
- **AMBIGUOUS** — incomplete or misleading without nuance
- **UNVERIFIABLE** — no authoritative evidence found
- **MISSING** — material behavior or guidance is absent
- **NONCONFORMANT** — violates corpus or document-type rules
- **MISPLACED** — belongs elsewhere under corpus ownership rules

Only stale, outdated, ambiguous, missing, nonconformant, and approved misplaced findings become edits. Unverifiable findings become questions.

### 4. Report before editing

Unless the user has already explicitly approved immediate edits, provide:

```markdown
# Doc Review: <relative path>

## Summary
- N claims checked
- N stale, N outdated, N missing, N nonconformant/misplaced, N unverifiable
- Overall verdict: <fresh | mostly fresh | significant drift | substantially outdated>

## Findings

### 1. [CLASSIFICATION] <finding>
- **Doc says:** <short quote or precise section reference>
- **Evidence says:** <authoritative source>
- **Proposed fix:** <smallest faithful change>

## Corpus conformance
<Metadata, placement, index, and link findings when applicable.>

## Open questions
<Unverifiable claims and judgment calls.>
```

If the document is fresh, say so and stop. Do not manufacture edits.

### 5. Apply approved edits surgically

- Prefer one finding per edit.
- Preserve correct content, voice, examples, warnings, and formatting.
- Copy exact commands and identifiers from evidence.
- Update affected indexes, anchors, and inbound links.
- Avoid unrelated tone rewrites and whitespace churn.
- Separate broad restructuring from correctness fixes and obtain approval first.

### 6. Cold-read and verify

For procedural or onboarding material, confirm a fresh reader can complete the workflow. Re-run relevant commands or checks proportionate to the risk. For reference documents, emphasize schema, link, and corpus validation.

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
- Rewriting an existing document in a new voice without correctness justification
- Inventing commands, flags, policies, dates, or examples
- Treating an opinion as stale merely because the reviewer disagrees
- Dropping warnings or caveats without evidence they are obsolete
- Creating or moving documents without updating navigation
- Producing a review report and then editing without approval
- Claiming completion without a factual, corpus, and fresh-reader check

## Repository precedence

Repository and subtree instructions override this generic workflow. If the corpus mandates a template, generator, approval process, terminology set, or prohibition such as avoiding paths in durable docs, follow it and state the adaptation.
