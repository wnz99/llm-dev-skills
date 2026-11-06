# Review comments

Read before composing review findings or authorized platform comments. Follow
an explicit user format or repository template first; otherwise use the
templates below. Keep comments proportional to the issue rather than filling
empty sections. This reference adds no skill dependency.

## Language and register

Choose the artifact language from explicit user instructions, then repository
review conventions and the existing PR discussion. Do not infer it solely from
chat language or quoted source text. Ask only if unresolved ambiguity materially
affects the audience; otherwise state a reasonable language assumption.
Use English when no evidence establishes another artifact language. Keep the
conversation language separate from the artifact language.

Write directly and idiomatically in that language for the reviewers. Use natural
headings, syntax, terminology and professional forms of address instead of
translating English sentence structure. Follow available local glossaries and
established technical loanwords. Keep terminology consistent. Apply locale
typography and date/number conventions without changing values or units.

Preserve evidence, qualifications, uncertainty, blocking status and requested
actions. Keep code, commands, paths, API identifiers and exact error messages
verbatim. Keep severity tokens (`High`, `Medium`, `Low`, `Nit`), outcome tokens,
verdict tokens and machine-readable field names and enum values unchanged;
localize explanatory prose and free-text values. A required literal host
disclosure remains verbatim, with a localized explanation if useful.

When bilingual output is explicitly requested, label language sections and keep
their meaning and severity aligned. Otherwise use one artifact language. Read
the result independently for fluency, then compare against evidence for changed
meaning. Flag specific uncertain terminology for a fluent domain reviewer;
do not claim native-speaker validation.

## Finding template

Use one finding per concrete issue. Localize the prose labels below as needed.
For an inline comment, the platform supplies the location; retain other evidence
locations when needed to substantiate a cross-file failure.

```markdown
### [Medium] Short, specific issue title

Location: `path/to/file:line`

When [concrete trigger], [observed behavior] causes [consequence].
[Evidence or affected caller that establishes the failure.]

Suggested fix: [smallest concrete remedy that preserves the contract].
```

Distinguish verified failures from unresolved questions. Do not invent a trigger,
evidence, test result or line number. Optional preferences stay `Low` or `Nit`.
Do not post duplicate inline and top-level copies of the same finding; a summary
may link to an inline finding.

## Review summary template

Use for a local report or an authorized top-level review comment. Keep findings
first, ordered by severity; omit optional headings with no useful content.

```markdown
## Findings

[Findings in the format above, or a precise statement that none were found.]

## Scope and evidence

[Target, base/head, reviewed/unavailable files and scope limitations.]
[Verification commands and observed results; distinguish checks not run.]
[Concise trace coverage, including required cleanup and clean-code assessment.]

## Summary

[Brief description of the reviewed change.]

Outcome: [Clean / Issues Found / Skipped / Incomplete]
Verdict: [Approved / Request Changes / Not Reviewed]
```

For a loop comment, add loop number, actual reviewer identity, model/effort
disclosures, severity counts and blocking-finding dispositions as required by
[review-loops.md](review-loops.md). Zero blocking findings do not imply a
complete review: preserve `Incomplete` when inspection or prerequisites fail.
