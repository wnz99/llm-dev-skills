# LLM Development Skills

A collection of Agent Skills for cross-model code review, debugging, validation, and focused clean-code refactoring. These skills target agents that support the [Agent Skills](https://agentskills.io/) format or can load `SKILL.md` folders.

## Skills

| Skill | Description |
|-------|-------------|
| [wnz-llm-assist](skills/wnz-llm-assist/) | Spawn an external LLM CLI (Claude, Codex, or OpenCode) as a cross-model thinking partner for review, debug, plan, verify, RCA, rescue, and ask modes |
| [wnz-cross-review-pr](skills/wnz-cross-review-pr/) | Comparative PR review between any two LLMs (Claude, Codex, OpenCode): both review independently, then Reviewer A validates Reviewer B's findings before synthesis |
| [wnz-code-reviewer](skills/wnz-code-reviewer/) | Fresh-context code review for local changes and remote PRs, with automatic independent reviewer delegation when supported (based on [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) code-reviewer) |
| [wnz-ascii-diagrams](skills/wnz-ascii-diagrams/) | Draw and repair terminal diagrams with width limits, ASCII patterns, and an optional portability checker |
| [wnz-test-quality](skills/wnz-test-quality/) | Design risk-based tests and audit repository setup plus every test for useful protection and safe simplification |
| [wnz-clean-code-js](skills/wnz-clean-code-js/) | Focused JavaScript/TypeScript readability and maintainability refactoring guidance |
| [wnz-clean-code-py](skills/wnz-clean-code-py/) | Focused Python readability, API clarity, and maintainability refactoring guidance |
| [wnz-clean-code-rust](skills/wnz-clean-code-rust/) | Focused Rust readability, ownership, error-handling, and API maintainability guidance |
| [wnz-doc-write-expert](skills/wnz-doc-write-expert/) | Write new or review existing technical and non-technical documentation using evidence-backed authoring, corpus-conformance, approval, and fresh-reader workflows |
| [wnz-repo-health](skills/wnz-repo-health/) | Audit stale or unfinished workflows and GSD/Git/PR inconsistencies, then propose evidence-backed repairs without changing state |
| [wnz-repo-cleanup](skills/wnz-repo-cleanup/) | Fast post-feature housekeeping with scripted inventory, brief removal proposals and guarded cleanup of approved local branches, worktrees and disposable artifacts |
| [wnz-phase-executor](skills/wnz-phase-executor/) | Keep the main session to coordination; fresh workers own substantive work and return bounded receipts with durable evidence and independent gates |
| [wnz-implementation-planner](skills/wnz-implementation-planner/) | Author evidence-backed plans with task interfaces, cleanup ownership, dependency waves and self-review |
| [wnz-plan-reviewer](skills/wnz-plan-reviewer/) | Assess existing plans read-only and return a full independent design verdict |
| [wnz-task-implementer](skills/wnz-task-implementer/) | Execute one bounded task and return status, fresh verification and cleanup evidence |
| [wnz-dead-code](skills/wnz-dead-code/) | Audit reachability read-only or remove confirmed leftovers within authorized cleanup scope |
| [wnz-plan-simplicity-review](skills/wnz-plan-simplicity-review/) | Review an existing plan for KISS, DRY, and unnecessary complexity while preserving production safeguards and workload performance |
| [wnz-pr-release-notes](skills/wnz-pr-release-notes/) | Prepare and maintain bounded, evidence-based release notes in GitHub pull request descriptions while honoring repository-specific release conventions |

## Get started

Follow the [installation handbook](docs/installation-handbook.md) to install
skills for Claude Code and Codex, include required dependencies, verify
client discovery, and update without losing local changes.

Choose the smallest workflow that fits the task:

- **Check unfinished work and GSD drift:** `wnz-repo-health`.
- **Review changes:** `wnz-code-reviewer`; request `wnz-cross-review-pr` when
  you want two model perspectives.
- **Debug or get another model's help:** `wnz-llm-assist`.
- **Plan and execute substantial work:** `wnz-phase-executor`, which uses the
  planner, plan reviewer, task implementer, code reviewer, and dead-code skills.
- **Improve a focused area:** a language clean-code skill, `wnz-test-quality`,
  `wnz-doc-write-expert`, or `wnz-ascii-diagrams`.

Name the skill in your request, for example: “Use wnz-code-reviewer to review
my local changes.” Each skill's `SKILL.md` defines its scope and prerequisites.

## Optional Flow Status dashboard

[Flow Status](plugins/flow-status/README.md) is a read-only Herdr dashboard
for local development flows. It shows phases, tasks, recorded summaries and
timing, plus optional Linear and PR status. Local flows need no external
ticket or provider credentials.

The [handbook's optional plugin guide](docs/installation-handbook.md#optional-flow-status-plugin)
covers installation, project workflow setup, and opening the panel. Skills
work without the plugin.

## Contributing

Open pull requests against `main` from short-lived feature branches. Before
changing a skill, follow [AGENTS.md](AGENTS.md) and the
[prompt engineering standard](docs/prompt-engineering.md), validate the
installed package and declared dependencies, and run relevant behavior
evaluations and regression tests.

This repository is the canonical source for its skills. Preserve intentional
local adaptations when updating an installed copy.

## Attribution

The **wnz-code-reviewer** skill is based on the code-reviewer from
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli), adapted
for Claude Code and cross-model workflows.

## License

[MIT](LICENSE)
