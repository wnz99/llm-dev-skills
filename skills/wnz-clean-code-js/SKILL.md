---
name: wnz-clean-code-js
description: Improve JavaScript or TypeScript readability and maintainability when the task explicitly involves refactoring, code quality, naming, function design, error handling, or reducing accidental complexity. Use this skill for JS/TS cleanup reviews or targeted refactors. Do not use it to override repo-local conventions, force large rewrites, or apply generic "Clean Code" rules when the task is mainly a bug fix or feature change.
---

# Clean Code for JavaScript and TypeScript

Inspired by *Clean Code* by Robert C. Martin (Robert Cecil Martin), adapted
for AI-agent use in modern JS/TS codebases.

Use this skill to make JS/TS code easier to read, safer to change, and more
consistent with the surrounding codebase.

This is an agent workflow, not a license to rewrite code until it looks
"textbook clean."

## Canonical source and updates

This skill is maintained in [wnz99/llm-dev-skills](https://github.com/wnz99/llm-dev-skills/tree/main/skills/wnz-clean-code-js). When asked to update, reinstall, download, or replace this skill with a newer version, inspect that upstream directory first and use the newest compatible version. Preserve intentional installation-specific adaptations and report any divergence instead of silently overwriting it.

## Migration note

This skill was previously published as `clean-code-js`. Prefer
`wnz-clean-code-js` in prompts and installed skill directories. Remove the
legacy `clean-code-js` copy after upgrading to avoid ambiguous routing.

## Operating Rules

Follow the user request, repository instructions, and established local
conventions in that order. Apply the heuristics below only as advisory
refinements.

1. Read local conventions first.
   Check the repo's lint, format, test, framework, and file-organization rules before applying generic advice.
2. Prefer the smallest useful refactor.
   Improve the specific problem you can name. Do not refactor "just in case."
3. Preserve behavior.
   Clarity improvements do not justify subtle contract changes unless the user asked for them.
4. Optimize for the call site.
   The best API is the one that makes the caller obviously correct.
## Workflow

### 1. Identify the actual smell

Name the concrete issue before editing:

- unclear naming
- mixed abstraction levels
- hidden mutation or hidden I/O
- function doing too many unrelated things
- weak or inconsistent error contract
- deep nesting / hard-to-scan control flow
- module boundary leaking implementation details

If you cannot name the smell precisely, do not start a cleanup rewrite.

### 2. Check the local pattern first

Before changing shape, inspect nearby files for:

- function style and file layout
- error handling style: throw, return union/result-like objects, or framework-specific responses
- TS strictness and type patterns
- preferred React / Node / library patterns already in use

### 3. Choose the least invasive fix

Good fixes:

- rename for clarity
- extract one helper with a real name
- flatten control flow with an early return
- replace repeated literals with a named constant
- separate validation from execution
- tighten types at the boundary

Avoid:

- extracting trivial one-line wrappers
- replacing simple conditionals with class hierarchies
- introducing abstractions only to satisfy a style slogan
- rewriting sync/async boundaries without a strong reason

### 4. Verify the contract

After refactoring, verify:

- types still communicate intent
- errors still surface through the expected path
- tests or typechecks still pass
- the call site got simpler, not just the callee

If a relevant focused test, typecheck, or lint command cannot run, state which
check was skipped and why.

## JS/TS Heuristics

Apply these only when they improve the identified smell without expanding scope
or changing public behavior.

### Naming

- Prefer names that reveal the domain meaning, not the implementation detail
- Drop redundant suffixes like `Data`, `Info`, `Manager`, `Helper` unless they add real meaning
- Use booleans that read like questions: `isReady`, `hasAccess`, `shouldRetry`
- Keep terminology consistent across adjacent files

### Functions

- A function should have one reason to change
- Prefer 0-2 direct parameters; when several values travel together, use an object parameter
- Do not introduce an options object just to satisfy an arbitrary parameter count if positional args are already clear
- Extract only when the new function name explains something useful

### Types

- In TypeScript, prefer stronger types over explanatory comments
- Use discriminated unions for branching states when the code already operates on variants
- Narrow external data early; keep the rest of the code on trusted shapes
- Prefer `readonly` and immutable updates when the surrounding codebase already leans that way

### Error Handling

- Do not apply "exceptions everywhere" blindly
- Follow the existing boundary style:
  if the project throws, throw typed/structured errors cleanly;
  if it returns result objects or framework responses, keep that contract consistent
- Wrap third-party errors at system boundaries when that improves diagnostics or shields callers from vendor-specific details
- Avoid returning `null` / `undefined` for error states when the codebase already distinguishes "not found" from "failed"

### Control Flow

- Prefer guard clauses to deep nesting when they make the happy path more obvious
- Break apart validation, transformation, and side effects when they are currently tangled
- Keep async orchestration readable: fetch, validate, transform, persist, notify

### Comments

- Comments should explain why, constraints, or non-obvious tradeoffs
- Do not add comments that restate obvious code
- In public libraries, document exported APIs that are not self-evident

## Review Checklist

- Can a reader understand the main behavior without reading every line?
- Are names consistent with nearby modules?
- Is the error contract explicit?
- Does each extracted helper earn its existence?
- Did the refactor reduce branching or merely redistribute it?
- Did the change preserve framework and repo-local patterns?

## References

Read [references/patterns.md](references/patterns.md) when you need concrete
refactoring patterns for JS/TS cleanup.
