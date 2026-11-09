# Review mode workflow

For an explicit review, audit or check of an existing document, follow these
steps after independent routing. When applying review findings, apply steps 5
and 6.

## 1. Read the target end-to-end

Read the complete document and inventory checkable claims:

- Commands, paths, directory layouts, symbols, packages, and APIs
- Environment variables, configuration keys, resources, accounts, and URLs
- Workflow names, task-runner targets, version pins, model IDs, and dependencies
- Procedures, ordering, prerequisites, warnings, diagrams, and structural tables
- Policies, ownership, roles, dates, decisions, commitments, and stated outcomes

Also record language, locale, register, tone, formatting, frontmatter, containing indexes, inbound links, reserved filename status, and corpus rules. Apply the [language and register guidance](language-and-register.md) when assessing fluency; preserve appropriate existing voice during scoped corrections.

## 2. Read local guidance and map claims to evidence

Read applicable repository and subtree instructions, contribution guidance, documentation standards, indexes, and representative sibling documents. Locate the authoritative source for every material claim using exact searches first, then semantic exploration where necessary.

## 3. Classify findings

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

## 4. Report before editing

For a review-only request, provide this report before any editing:

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

If the document is fresh, say so and stop. Do not manufacture edits. Mixed
review-and-fix requests follow the ordering in `SKILL.md` under Review mode.

## 5. Apply approved edits surgically

- Prefer one finding per edit.
- Preserve correct content, voice, examples, warnings, and formatting.
- Copy exact commands and identifiers from evidence.
- Update affected indexes, anchors, and inbound links.
- Avoid unrelated tone rewrites and whitespace churn, except within a
  readability request.
- Separate broad restructuring from correctness fixes and obtain approval first.

## 6. Cold-read and verify

First run the fluency, fidelity and inference passes from
[language-and-register.md](language-and-register.md) on new or changed prose.
For procedural or onboarding material, confirm a fresh reader can complete the workflow. Re-run relevant commands or checks proportionate to the risk. For reference documents, emphasize schema, link, and corpus validation.
