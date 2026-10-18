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
| [wnz-phase-executor](skills/wnz-phase-executor/) | Keep the main session to coordination; fresh workers own substantive work and return bounded receipts with durable evidence and independent gates |
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
- **wnz-phase-executor** requires **wnz-implementation-planner**, **wnz-plan-reviewer**, **wnz-task-implementer**, **wnz-code-reviewer**, and **wnz-dead-code**, plus native non-inheriting fresh workers and reliable worker identity evidence. Unsupported isolation blocks substantive work.

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
5. **wnz-phase-executor** owns authorization, annotation cycles, scheduling, ledger and gate transitions. Fresh workers own substantive exploration, planning, implementation, integration, verification and investigation, returning short receipts with durable evidence pointers. **wnz-implementation-planner** owns plan structure and self-review; **wnz-plan-reviewer** owns the independent design verdict; **wnz-task-implementer** owns bounded execution and task reports. **wnz-code-reviewer** assesses implemented task and aggregate changes. **wnz-dead-code** supplies the shared reachability and cleanup evidence contract.
6. **wnz-doc-write-expert** writes new technical and non-technical documents from authoritative evidence and keeps existing documentation honest. It establishes the reader and intended action, follows local corpus rules, inventories and verifies checkable claims, gates review edits behind a findings report, and cold-reads the result before completion.

**wnz-cross-review-pr** supports any combination of Claude, Codex, and OpenCode as Reviewer A / Reviewer B via `--from` / `--to` flags. The default is `--from claude --to codex`. Running `--from codex --to claude` starts with Codex's independent review, then asks Claude for an independent review before Codex validates Claude's findings.

The cross-model approach helps reduce sycophancy bias and can catch bugs that any single model might miss.

## Canonical source and updates

This repository is the canonical source for every skill it contains. Each `SKILL.md` links back to its own upstream directory so an installed copy can locate its origin.

Authors and reviewers should follow the [cross-model prompt engineering standard](docs/prompt-engineering.md). It defines the shared provider guidance, provider-specific caveats, and the repository rule that Markdown owns all `SKILL.md` instructions while XML is reserved for injected content boundaries inside executable prompt templates.

Root [`AGENTS.md`](AGENTS.md) makes that standard required for every skill
addition or modification and adds validation, evaluation, and declared-dependency package
installability gates for contributors and coding agents.

See [executor extraction validation](docs/skill-split-validation.md) for the
recorded package checks, behavior evaluations and their limits.
See [executor complexity drift validation](docs/executor-complexity-validation.md)
for the long-plan/context-restoration investigation and focused behavior checks.
See [coordinator boundary validation](docs/executor-coordinator-validation.md)
for worker guards, regression checks and pending behavioral validation limits.

When updating, reinstalling, downloading, or replacing an installed skill, compare it with the matching `skills/<name>/` directory here and use the newest compatible upstream version. Preserve intentional local adaptations and review divergences before overwriting them.

To refresh all globally installed skills from this repository:

```bash
npx skills add wnz99/llm-dev-skills -g
```

To refresh a single skill, use its individual installation command from the section above.

## Standard development flow and Herdr dashboard

[Flow Status](plugins/flow-status/README.md) is one read-only Herdr plugin for the standard 13-step `FLOW.json` workflow in any project. Its [reusable setup prompt](plugins/flow-status/setup/PROMPT.md) and [procedure](plugins/flow-status/setup/PROCEDURE.md) configure one private workflow shared by Claude Code and Codex, with client loader templates and an approval-free flow example. The bundle discovers the skills above through the host rather than copying their algorithms.

### Install and set up

The dashboard requires macOS or Linux, Git, Bun 1.3.13+, and Herdr 0.9.1+.
From `plugins/flow-status` in this checkout, install and link it once per Herdr machine:

```sh
bun install --frozen-lockfile
herdr plugin link "$PWD" --enabled
```

To configure a project's workflow, open Claude Code or Codex in that repository and ask:

```text
Read /absolute/path/to/llm-dev-skills/plugins/flow-status/setup/PROMPT.md and follow its prompt to set up the standard local development flow in this repository for both Claude Code and Codex. BUNDLE_ROOT is /absolute/path/to/llm-dev-skills/plugins/flow-status.
```

Replace both paths with this checkout's actual location. Setup checks required skills and per-project GSD, preserves repository policy, and installs private loaders pointing to one shared workflow. It does not start a feature. Follow the [setup procedure](plugins/flow-status/setup/PROCEDURE.md) for dependency checks, worktree loaders, and client reload/trust requirements.

### Open and use the dashboard

Run `herdr agent list` and verify the intended session, project, task, and visible pane context. Set `PANE` to that verified pane ID and `PROJECT_CWD` to its actual project checkout. Then open an offline dashboard beside it:

```sh
herdr plugin pane open --plugin herdr.flow-status --entrypoint flow \
  --placement split --direction right --target-pane "$PANE" \
  --cwd "$PROJECT_CWD" --env HERDR_FLOW_STATUS_OFFLINE=1 --focus
```

Check that the new pane shows the expected branch and flows. Verify commands against the installed Herdr CLI contract; full pane-selection guidance lives in the [procedure](plugins/flow-status/setup/PROCEDURE.md#plugin-and-optional-live-sources). For standalone terminal use, run this from `plugins/flow-status`:

```sh
bun src/main.ts --cwd /absolute/path/to/project --offline
```

Use `j`/`k` to select flows, `d` to toggle completed flows, PageUp/PageDown to scroll details, `r` to refresh, and `q` to quit. Local records reload every 30 seconds. Offline mode makes no remote requests.

The dashboard reads `.planning/drafts/<flow-id>/FLOW.json` in the primary Git worktree, including when opened from linked worktrees. Choose a stable local ID such as `cache-cleanup`; schema 1 stores it in the historical `ticket` field. No external ticket is required. Leave `linear_id` omitted or `null` and `prs: []` for local-only work; attach Linear IDs and PR numbers explicitly when wanted.

For live status, omit `--env HERDR_FLOW_STATUS_OFFLINE=1` from the pane command (or `--offline` from the terminal command). Unlinked sources make no provider calls. Attached PRs use existing `gh` authentication; linked Linear issues use `LINEAR_API_KEY` from the Herdr server's environment. Keep credentials in an approved external mode-600 environment file, never in commands, Herdr `--env`, or Git. Missing credentials appear as unavailable. See [credential handling](plugins/flow-status/setup/PROCEDURE.md#plugin-and-optional-live-sources) before enabling live sources.

`FLOW.json` is a dashboard projection maintained by the workflow coordinator. The executor's canonical ledger and detailed reports remain authoritative for gates and resume; dashboard status cannot replace missing execution evidence. See the [plugin README](plugins/flow-status/README.md) for the full record contract and validator command.

## Contributing

Open pull requests against `main` for all updates. Use short-lived feature
branches; this repository does not maintain development or staging branches.
Before changing a skill, follow [`AGENTS.md`](AGENTS.md), validate its installed package and declared dependencies, and run the relevant behavior evaluations and regression tests.

## Attribution

The **wnz-code-reviewer** skill is based on the code-reviewer from [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli), adapted for use with Claude Code and cross-model workflows.

## License

MIT
