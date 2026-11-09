# Author mode workflow

For a new document, a blank-page replacement, a substantial new section or the
author leg of hybrid mode, follow these steps in order. For a scoped update,
fix or readability rewrite, apply only step 6.

## 1. Establish the writing brief

Determine from the request and repository context:

- Intended reader and their assumed knowledge
- Single primary post-read action or decision
- Document type and expected lifetime
- Scope and explicit non-goals
- Authoritative sources and subject-matter owner
- Required location, metadata, template, indexes, and links
- Technical versus non-technical depth and vocabulary
- Target language, relevant locale, and register appropriate to purpose and audience
- Term sheet: established domain loanwords and local terms, applied in every file of the task

Ask one concise round of questions only when missing answers would materially change the document. Otherwise state reasonable assumptions and proceed.

## 2. Gather evidence

Read the authoritative sources before outlining. For technical documents, inspect owning code, contracts, commands, configuration, tests, and operational rules. For non-technical documents, use approved policies, decisions, research, user-provided facts, and existing organizational terminology.

Create a private evidence ledger for non-trivial work:

| Claim/topic | Source of truth | Confidence or open question |
|---|---|---|

Do not paste this ledger into the finished document unless provenance is useful to readers.

## 3. Inspect the documentation corpus

Walk from repository root to the target location. Read applicable instruction files, parent indexes, standards, templates, and representative sibling documents. Determine:

- Whether a new document is justified
- Correct directory, filename, and document type
- Required frontmatter and index registration
- House style for headings, code fences, tables, callouts, tone, and links
- Whether another document already owns part of the proposed content

For governed bundles such as OKF, apply the declared local profile and specification. Before creating or modifying an OKF bundle, read [`okf-v0.1-spec.md`](okf-v0.1-spec.md) completely, then apply any stricter repository-local OKF profile on top. Treat the bundled document as a versioned snapshot of the [official OKF v0.1 specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md), not as a substitute for local governance. Preserve unknown metadata and respect reserved file roles.

## 4. Design the outline before drafting

Create an implementation-ready outline in reader order. Each section must have a purpose. Put prerequisites and essential context before procedures or decisions. Put reference detail after the main path.

Design the outline as a dependency chain for understanding. Before a section
uses a concept, data representation, identifier, file path, or acronym, ensure
an earlier section has established what it represents and why the reader needs
it. Prefer a progression such as familiar input → purpose of the transformation
→ concrete output → internal representation → operational consequence. Do not
front-load an architecture document with opaque IDs, schemas, or storage paths
that only become meaningful later.

Use only the sections the reader needs. Common patterns include:

- Runbook: purpose → prerequisites → safe procedure → verification → rollback/recovery
- Setup guide: outcome → prerequisites → steps → validation → troubleshooting
- Architecture/spec: context → goals/non-goals → constraints → design → interfaces/data → failure modes → verification/rollout
- ADR/proposal: context → decision/proposal → alternatives → consequences → adoption
- Policy/process: purpose → scope → roles → rules → procedure → exceptions/escalation
- Explanatory article: reader question → concise answer → evidence/examples → implications → next action

For substantial or judgment-heavy work, share the outline only when approval
would resolve a material structural choice. Otherwise confirm it internally
and continue drafting.

## 5. Draft in place

Write directly to the governed target file. Match local style and terminology. Prefer concrete statements, examples, and executable steps over abstractions.

- Copy commands, identifiers, and field names from their sources.
- State prerequisites before they are used.
- Introduce each project-specific concept immediately before its first use: explain its role in plain language, then give its technical name, exact representation, and example when useful.
- For a transformation or data flow, show the input, explain what the stage changes and why, then show the output. State what remains unchanged when identity or provenance matters.
- Give tables and diagrams a short explanatory lead-in and interpretation. They should support the narrative, not force the reader to infer its meaning unaided.
- Delay internal IDs, hashes, file paths, schemas, and framework-specific objects until the reader knows which real-world or system concept they identify.
- Explain why a constraint matters when it changes reader behavior.
- Define project-specific terms; do not re-explain universal concepts to an expert audience.
- Use tables only for repeated mappings or genuine comparisons.
- Avoid filler introductions, recap conclusions, decorative language, and conversational history.
- Avoid brittle line-number references in durable prose unless the corpus explicitly uses them.
- Mark examples as examples and recommendations as recommendations.

## 6. Validate factual and corpus correctness

Recheck every material claim against its source. Run relevant lightweight commands when a document promises a command, path, schema, or procedure. Validate frontmatter, links, indexes, and required structure using project-local tooling when available.

Parse every YAML frontmatter block with a real YAML parser before completion;
visual inspection is insufficient because punctuation can change YAML syntax.
Quote plain scalar values that contain syntax-sensitive text such as `: ` or
` #`, or use a YAML block scalar when that improves readability. For example,
write `title: "Data flow: current architecture"`, not
`title: Data flow: current architecture`. Prefer the repository's validator;
otherwise use an available standards-compliant YAML parser and validate every
frontmatter-bearing document changed in the corpus.

## 7. Reader-test

First run the fluency, fidelity and inference passes from
[language-and-register.md](language-and-register.md) on new or changed prose.

Read the finished document from top to bottom as a fresh member of the intended audience:

- Is the purpose clear immediately?
- Does the prose read naturally in the target language, with consistent terminology and a register suited to this audience and document type?
- At every first use of a term, identifier, data shape, reference, or component, has the document already supplied the context needed to understand it?
- Does each transformation proceed from recognizable input through purpose and change to a concrete output, instead of presenting disconnected implementation artifacts?
- Can the named action be completed without tribal knowledge?
- Are prerequisites, risks, ownership, and failure handling present where needed?
- Does each section earn its place?
- Are facts distinguishable from recommendations and open questions?
- Can the document be found through the corpus navigation?

Close gaps and cut content that does not serve the reader action.
