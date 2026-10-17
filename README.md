# LLM Development Skills

A collection of Agent Skills for cross-model code review, debugging, validation, and focused clean-code refactoring. These skills target agents that support the [Agent Skills](https://agentskills.io/) format or can load `SKILL.md` folders.

## Skills

| Skill | Description |
|-------|-------------|
| [wnz-llm-assist](skills/wnz-llm-assist/) | Spawn an external LLM CLI (Claude, Codex, or OpenCode) as a cross-model thinking partner for review, debug, plan, verify, RCA, rescue, and ask modes |
| [wnz-cross-review-pr](skills/wnz-cross-review-pr/) | Comparative PR review between any two LLMs (Claude, Codex, OpenCode): both review independently, then Reviewer A validates Reviewer B's findings before synthesis |
| [wnz-code-reviewer](skills/wnz-code-reviewer/) | Fresh-context code review for local changes and remote PRs, with automatic independent reviewer delegation when supported (based on [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) code-reviewer) |
| [wnz-ascii-diagrams](skills/wnz-ascii-diagrams/) | Draw and repair terminal diagrams with width limits, ASCII patterns, and an optional portability checker |
| [wnz-test-quality](skills/wnz-test-quality/) | Select, write, organize, and audit tests by failure detection, with clear fixtures and mocks, balanced DRY/KISS, and no redundant coverage |
| [wnz-clean-code-js](skills/wnz-clean-code-js/) | Focused JavaScript/TypeScript readability and maintainability refactoring guidance |
| [wnz-clean-code-py](skills/wnz-clean-code-py/) | Focused Python readability, API clarity, and maintainability refactoring guidance |
| [wnz-clean-code-rust](skills/wnz-clean-code-rust/) | Focused Rust readability, ownership, error-handling, and API maintainability guidance |
| [wnz-doc-write-expert](skills/wnz-doc-write-expert/) | Write new or review existing technical and non-technical documentation using evidence-backed authoring, corpus-conformance, approval, and fresh-reader workflows |
| [wnz-phase-executor](skills/wnz-phase-executor/) | Coordinate focused planning, design-review and implementation workers with authorization, approval cycles, verification and independent code-review gates |
| [wnz-implementation-planner](skills/wnz-implementation-planner/) | Author evidence-backed plans with task interfaces, cleanup ownership, dependency waves and self-review |
| [wnz-plan-reviewer](skills/wnz-plan-reviewer/) | Assess existing plans read-only and return a full independent design verdict |
| [wnz-task-implementer](skills/wnz-task-implementer/) | Execute one bounded task and return status, fresh verification and cleanup evidence |
| [wnz-dead-code](skills/wnz-dead-code/) | Audit reachability read-only or remove confirmed leftovers within authorized cleanup scope |
| [wnz-plan-simplicity-review](skills/wnz-plan-simplicity-review/) | Review an existing plan for KISS, DRY, and unnecessary complexity while preserving production safeguards and workload performance |
| [wnz-pr-release-notes](skills/wnz-pr-release-notes/) | Prepare and maintain bounded, evidence-based release notes in GitHub pull request descriptions while honoring repository-specific release conventions |

## Install

### All skills

```bash
npx skills add wnz99/llm-dev-skills -g
```

### Individual skills

```bash
npx skills add wnz99/llm-dev-skills/wnz-llm-assist -g
npx skills add wnz99/llm-dev-skills/wnz-cross-review-pr -g
npx skills add wnz99/llm-dev-skills/wnz-code-reviewer -g
npx skills add wnz99/llm-dev-skills/wnz-ascii-diagrams -g
npx skills add wnz99/llm-dev-skills/wnz-test-quality -g
npx skills add wnz99/llm-dev-skills/wnz-clean-code-js -g
npx skills add wnz99/llm-dev-skills/wnz-clean-code-py -g
npx skills add wnz99/llm-dev-skills/wnz-clean-code-rust -g
npx skills add wnz99/llm-dev-skills/wnz-doc-write-expert -g
npx skills add wnz99/llm-dev-skills/wnz-phase-executor -g
npx skills add wnz99/llm-dev-skills/wnz-implementation-planner -g
npx skills add wnz99/llm-dev-skills/wnz-plan-reviewer -g
npx skills add wnz99/llm-dev-skills/wnz-task-implementer -g
npx skills add wnz99/llm-dev-skills/wnz-dead-code -g
npx skills add wnz99/llm-dev-skills/wnz-pr-release-notes -g
```

Or manually copy any `skills/<name>/` directory to your agent's skills
directory, such as `~/.agents/skills/` for shared installations or
`~/.claude/skills/` for Claude-only installations. OpenCode users can install manually under
`~/.config/opencode/skills/`.

## Prerequisites

- **wnz-llm-assist** and **wnz-cross-review-pr** require at least one external LLM CLI installed:
  - [Claude Code](https://code.claude.com/docs/en/cli-reference): `npm i -g @anthropic-ai/claude-code && claude auth login`
  - [Codex CLI](https://github.com/openai/codex): `npm i -g @openai/codex && codex login`
  - [OpenCode](https://dev.opencode.ai/docs/): `npm i -g opencode-ai`
- **wnz-cross-review-pr** also requires [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- **wnz-pr-release-notes** requires [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- **wnz-test-quality**, **wnz-doc-write-expert**, and **wnz-dead-code** have no required sibling skills.
- **wnz-implementation-planner**, **wnz-plan-reviewer**, **wnz-task-implementer**, **wnz-code-reviewer**, and **wnz-clean-code-\*** require **wnz-dead-code** for their scoped cleanup assessments.
- **wnz-phase-executor** requires **wnz-implementation-planner**, **wnz-plan-reviewer**, **wnz-task-implementer**, **wnz-code-reviewer**, and **wnz-dead-code**, plus a host that permits fresh implementer and independent reviewer delegation.

Install each required skill explicitly when installing an individual package;
do not assume the installer resolves dependencies automatically. Each package
names when its dependencies are needed. Agents resolve them through host skill
discovery and stop affected work when a required skill is unavailable. Optional
language/test/document skills have bounded fallbacks in their consumers.

`wnz-dead-code` defaults to read-only audit. Cleanup uses existing authorized
edit scope. Code review always performs its own audit; loading a language skill
during review does not authorize refactoring.

## How it works

These skills are designed to complement each other:

1. **wnz-code-reviewer** provides structured review (correctness, security, maintainability, etc.) and automatically uses a fresh independent sub-agent when the host supports delegation
2. **wnz-llm-assist** adds cross-model validation by running analysis through a different LLM architecture (Codex or OpenCode)
3. **wnz-cross-review-pr** orchestrates both: two LLMs review independently, then Reviewer A validates Reviewer B's findings before producing a unified report with confidence scores
4. **wnz-clean-code-\*** skills provide language-specific guidance for small, behavior-preserving readability and maintainability refactors
5. **wnz-phase-executor** owns authorization, annotation cycles, scheduling, integration and convergence. **wnz-implementation-planner** owns plan structure and self-review; **wnz-plan-reviewer** owns the independent design verdict; **wnz-task-implementer** owns bounded execution and task reports. **wnz-code-reviewer** assesses implemented task and aggregate changes. **wnz-dead-code** supplies the shared reachability and cleanup evidence contract.
6. **wnz-doc-write-expert** writes new technical and non-technical documents from authoritative evidence and keeps existing documentation honest. It establishes the reader and intended action, follows local corpus rules, inventories and verifies checkable claims, gates review edits behind a findings report, and cold-reads the result before completion.

## Canonical source and updates

This repository is the canonical source for every skill it contains. Each `SKILL.md` links back to its own upstream directory so an installed copy can locate its origin.

Authors and reviewers should follow the [cross-model prompt engineering standard](docs/prompt-engineering.md). It defines the shared provider guidance, provider-specific caveats, and the repository rule that Markdown owns all `SKILL.md` instructions while XML is reserved for injected content boundaries inside executable prompt templates.

Root [`AGENTS.md`](AGENTS.md) makes that standard required for every skill
addition or modification and adds validation, evaluation, and declared-dependency package
installability gates for contributors and coding agents.

See [executor extraction validation](docs/skill-split-validation.md) for the
recorded package checks, behavior evaluations and their limits.

When updating, reinstalling, downloading, or replacing an installed skill, compare it with the matching `skills/<name>/` directory here and use the newest compatible upstream version. Preserve intentional local adaptations and review divergences before overwriting them.

To refresh all globally installed skills from this repository:

```bash
npx skills add wnz99/llm-dev-skills -g
```

To refresh a single skill, use its individual installation command from the section above.

## Standard development flow and Herdr dashboard

[Flow Status](plugins/flow-status/README.md) is one read-only Herdr plugin for the standard 13-step `FLOW.json` workflow in any project. Its [reusable setup prompt](plugins/flow-status/setup/PROMPT.md) and [procedure](plugins/flow-status/setup/PROCEDURE.md) configure one private workflow shared by Claude Code and Codex, with client loader templates and an approval-free flow example. The bundle discovers the skills above through the host rather than copying their algorithms.

## Contributing

Open pull requests against `main` for all updates. Use short-lived feature
branches; this repository does not maintain development or staging branches.
Before changing a skill, follow [`AGENTS.md`](AGENTS.md), validate its installed package and declared dependencies, and run the relevant behavior evaluations and regression tests.

## Migration from legacy names

The skills now use a `wnz-` prefix to avoid collisions with similarly named
skills from other packages. `phased-implementation-review-loop` was also
renamed to `wnz-phase-executor` so review-only requests route to
`wnz-code-reviewer`.

When upgrading an existing install, remove legacy skill directories after
installing the new names. Leaving both copies installed can make skill routing
ambiguous.

| Legacy name | Current name |
|-------------|--------------|
| `llm-assist` | `wnz-llm-assist` |
| `cross-review-pr` | `wnz-cross-review-pr` |
| `code-reviewer` | `wnz-code-reviewer` |
| `clean-code-js` | `wnz-clean-code-js` |
| `clean-code-py` | `wnz-clean-code-py` |
| `clean-code-rust` | `wnz-clean-code-rust` |
| `doc-write-expert` | `wnz-doc-write-expert` |
| `phased-implementation-review-loop` | `wnz-phase-executor` |
| `pr-release-notes` | `wnz-pr-release-notes` |
| `wnz-test-value` | `wnz-test-quality` |

**wnz-cross-review-pr** supports any combination of Claude, Codex, and OpenCode as Reviewer A / Reviewer B via `--from` / `--to` flags. The default is `--from claude --to codex`. Running `--from codex --to claude` starts with Codex's independent review, then asks Claude for an independent review before Codex validates Claude's findings.

The cross-model approach helps reduce sycophancy bias and can catch bugs that any single model might miss.

## Attribution

The **wnz-code-reviewer** skill is based on the code-reviewer from [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli), adapted for use with Claude Code and cross-model workflows.

## License

MIT
