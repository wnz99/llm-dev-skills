# LLM Development Skills

A collection of Agent Skills for cross-model code review, debugging, validation, and focused clean-code refactoring. These skills target agents that support the [Agent Skills](https://agentskills.io/) format or can load `SKILL.md` folders.

## Skills

| Skill | Description |
|-------|-------------|
| [llm-assist](skills/llm-assist/) | Spawn an external LLM CLI (Claude, Codex, or OpenCode) as a cross-model thinking partner for review, debug, plan, verify, RCA, rescue, and ask modes |
| [cross-review-pr](skills/cross-review-pr/) | Comparative PR review between any two LLMs (Claude, Codex, OpenCode): both review independently, then Reviewer A validates Reviewer B's findings before synthesis |
| [code-reviewer](skills/code-reviewer/) | Fresh-context code review for local changes and remote PRs, with automatic independent reviewer delegation when supported (based on [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) code-reviewer) |
| [clean-code-js](skills/clean-code-js/) | Focused JavaScript/TypeScript readability and maintainability refactoring guidance |
| [clean-code-py](skills/clean-code-py/) | Focused Python readability, API clarity, and maintainability refactoring guidance |
| [clean-code-rust](skills/clean-code-rust/) | Focused Rust readability, ownership, error-handling, and API maintainability guidance |
| [doc-write-expert](skills/doc-write-expert/) | Write new or review existing technical and non-technical documentation using evidence-backed authoring, corpus-conformance, approval, and fresh-reader workflows |
| [phased-implementation-review-loop](skills/phased-implementation-review-loop/) | Plan a multi-step change, then implement each step under a verify → in-code review → independent cross-model sub-agent review loop, fixing until no High/Medium findings remain before advancing |

## Install

### All skills

```bash
npx skills add wnz99/llm-dev-skills -g
```

### Individual skills

```bash
npx skills add wnz99/llm-dev-skills/llm-assist -g
npx skills add wnz99/llm-dev-skills/cross-review-pr -g
npx skills add wnz99/llm-dev-skills/code-reviewer -g
npx skills add wnz99/llm-dev-skills/clean-code-js -g
npx skills add wnz99/llm-dev-skills/clean-code-py -g
npx skills add wnz99/llm-dev-skills/clean-code-rust -g
npx skills add wnz99/llm-dev-skills/doc-write-expert -g
npx skills add wnz99/llm-dev-skills/phased-implementation-review-loop -g
```

Or manually copy any `skills/<name>/` directory to your agent's skills
directory, such as `~/.claude/skills/`, `~/.codex/skills/`, or
`~/.agents/skills/`. OpenCode users can install manually under
`~/.config/opencode/skills/`.

## Prerequisites

- **llm-assist** and **cross-review-pr** require at least one external LLM CLI installed:
  - [Claude Code](https://code.claude.com/docs/en/cli-reference): `npm i -g @anthropic-ai/claude-code && claude auth login`
  - [Codex CLI](https://github.com/openai/codex): `npm i -g @openai/codex && codex login`
  - [OpenCode](https://dev.opencode.ai/docs/): `npm i -g opencode-ai`
- **cross-review-pr** also requires [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- **code-reviewer**, **clean-code-\***, and **doc-write-expert** skills work standalone with no extra dependencies

## How it works

These skills are designed to complement each other:

1. **code-reviewer** provides structured review (correctness, security, maintainability, etc.) and automatically uses a fresh independent sub-agent when the host supports delegation
2. **llm-assist** adds cross-model validation by running analysis through a different LLM architecture (Codex or OpenCode)
3. **cross-review-pr** orchestrates both: two LLMs review independently, then Reviewer A validates Reviewer B's findings before producing a unified report with confidence scores
4. **clean-code-\*** skills provide language-specific guidance for small, behavior-preserving readability and maintainability refactors
5. **doc-write-expert** writes new technical and non-technical documents from authoritative evidence and keeps existing documentation honest. It establishes the reader and intended action, follows local corpus rules, inventories and verifies checkable claims, gates review edits behind a findings report, and cold-reads the result before completion.

## Canonical source and updates

This repository is the canonical source for every skill it contains. Each `SKILL.md` links back to its own upstream directory so an installed copy can locate its origin.

Authors and reviewers should follow the [cross-model prompt engineering standard](docs/prompt-engineering.md). It defines the shared provider guidance, provider-specific caveats, and the repository rule that Markdown owns all `SKILL.md` instructions while XML is reserved for injected content boundaries inside executable prompt templates.

Root [`AGENTS.md`](AGENTS.md) makes that standard required for every skill
addition or modification and adds validation, evaluation, and standalone-
installability gates for contributors and coding agents.

When updating, reinstalling, downloading, or replacing an installed skill, compare it with the matching `skills/<name>/` directory here and use the newest compatible upstream version. Preserve intentional local adaptations and review divergences before overwriting them.

To refresh all globally installed skills from this repository:

```bash
npx skills add wnz99/llm-dev-skills -g
```

To refresh a single skill, use its individual installation command from the section above.

**cross-review-pr** supports any combination of Claude, Codex, and OpenCode as Reviewer A / Reviewer B via `--from` / `--to` flags. The default is `--from claude --to codex`. Running `--from codex --to claude` starts with Codex's independent review, then asks Claude for an independent review before Codex validates Claude's findings.

The cross-model approach helps reduce sycophancy bias and can catch bugs that any single model might miss.

## Attribution

The **code-reviewer** skill is based on the code-reviewer from [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli), adapted for use with Claude Code and cross-model workflows.

## License

MIT
