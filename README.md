# LLM Development Skills

A collection of Agent Skills for developers using coding agents to plan and execute changes, review and debug code, improve tests and documentation, coordinate agents, and prepare releases. These skills target agents that support the [Agent Skills](https://agentskills.io/) format or can load `SKILL.md` folders.

## Get started

For a first code review with Codex, you need Git and an installed, authenticated
Codex client that supports fresh native review workers with isolated context.
Review the selected packages' `SKILL.md` files and bundled files before allowing
them to run tools. For Claude Code setup, other installation methods, and full
dependency requirements, use the [installation handbook](docs/installation-handbook.md).

Clone the repository and install the review skill with its two required skills:

```sh
git clone https://github.com/wnz99/llm-dev-skills.git
cd llm-dev-skills
mkdir -p "$HOME/.agents/skills"
for skill in wnz-code-reviewer wnz-dead-code wnz-independent-review; do
  if [ -e "$HOME/.agents/skills/$skill" ] || [ -L "$HOME/.agents/skills/$skill" ]; then
    printf 'Already installed; compare before updating: %s\n' "$skill"
    continue
  fi
  cp -R "skills/$skill" "$HOME/.agents/skills/$skill"
done
```

Existing packages are preserved. Follow the
[update guide](docs/installation-handbook.md#update-without-losing-local-changes)
to reconcile an older or modified installation.

Start a new Codex session in a Git repository with changes to review. Ask it to
list the three installed skills and their resolved paths, then request:

> Use wnz-code-reviewer to review my local changes.

Success means the client discovers all three skills and returns an independent
review with findings, scope, verification evidence, and a verdict. Missing
dependencies or unsupported worker isolation must be reported as an incomplete
review. See [discovery troubleshooting](docs/installation-handbook.md#verify-discovery-and-use)
if a skill is missing.

## Choose a workflow

Choose the smallest workflow that fits the task:

- **Update installed WNZ skills:** `wnz-update`; current machine by default.
- **Check unfinished work and GSD drift:** `wnz-repo-health`.
- **Review changes:** `wnz-code-reviewer`; request `wnz-cross-review-pr` when
  you want two model perspectives.
- **Open a PR/MR or prepare its description:** `wnz-ship`. WNZ workflows
  delegate creation here; review comments and bounded release notes retain
  their domain owners.
- **Debug or get another model's help:** `wnz-llm-assist`.
- **Plan and execute substantial work:** `wnz-phase-executor`, which uses the
  planner, plan reviewer, task implementer, code reviewer, and dead-code skills.
  Unclear material requirements prompt an offer to use `wnz-grill-me` before drafting.
- **Clarify an idea before planning:** `wnz-grill-me`.
- **Keep independent workers aligned and moving:** `wnz-agent-coordinator`;
  preserve their existing execution workflows and coordinate shared boundaries.
- **Improve a focused area:** a language clean-code skill, `wnz-test-quality`,
  `wnz-doc-write-expert`, or `wnz-ascii-diagrams`.

Each skill's `SKILL.md` defines its scope and prerequisites.

## Skills

| Skill | Description |
|-------|-------------|
| [wnz-update](skills/wnz-update/) | Check the collection version and update installed WNZ skills on this machine, named Herdr machines, or all configured systems |
| [wnz-llm-assist](skills/wnz-llm-assist/) | Spawn an external LLM CLI (Claude, Codex, or OpenCode) as a cross-model thinking partner for review, debug, plan, verify, RCA, rescue, and ask modes |
| [wnz-cross-review-pr](skills/wnz-cross-review-pr/) | Comparative PR review between any two LLMs (Claude, Codex, OpenCode): both review independently, then Reviewer A validates Reviewer B's findings before synthesis |
| [wnz-code-reviewer](skills/wnz-code-reviewer/) | Fresh independent native-child review for local changes and remote PRs (based on [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) code-reviewer) |
| [wnz-independent-review](skills/wnz-independent-review/) | Shared native routing and context isolation for substantive reviews; missing prerequisites block review |
| [wnz-ascii-diagrams](skills/wnz-ascii-diagrams/) | Draw and repair terminal diagrams with width limits, ASCII patterns, and an optional portability checker |
| [wnz-test-quality](skills/wnz-test-quality/) | Design risk-based tests and audit repository setup plus every test for useful protection and safe simplification |
| [wnz-clean-code-js](skills/wnz-clean-code-js/) | Focused JavaScript/TypeScript readability and maintainability refactoring guidance |
| [wnz-clean-code-py](skills/wnz-clean-code-py/) | Focused Python readability, API clarity, and maintainability refactoring guidance |
| [wnz-clean-code-rust](skills/wnz-clean-code-rust/) | Focused Rust readability, ownership, error-handling, and API maintainability guidance |
| [wnz-doc-write-expert](skills/wnz-doc-write-expert/) | Write new or review existing technical and non-technical documentation using evidence-backed authoring, corpus-conformance, approval, and fresh-reader workflows |
| [wnz-repo-health](skills/wnz-repo-health/) | Audit stale or unfinished workflows and GSD/Git/PR inconsistencies, then propose evidence-backed repairs without changing state |
| [wnz-repo-cleanup](skills/wnz-repo-cleanup/) | Fast post-feature housekeeping with scripted inventory, brief removal proposals and guarded cleanup of approved local branches, worktrees and disposable artifacts |
| [wnz-phase-executor](skills/wnz-phase-executor/) | Keep the main session to coordination; fresh workers own substantive work and return bounded receipts with durable evidence and independent gates |
| [wnz-agent-coordinator](skills/wnz-agent-coordinator/) | Supervise ongoing independent workers with explicit goals, simple solutions, durable activity records, recovery, and optional efficient llm-bus messaging |
| [wnz-implementation-planner](skills/wnz-implementation-planner/) | Author evidence-backed plans with task interfaces, cleanup ownership, dependency waves and self-review |
| [wnz-grill-me](skills/wnz-grill-me/) | Resolve material requirements before planning through focused questions and evidence-backed recommendations |
| [wnz-plan-reviewer](skills/wnz-plan-reviewer/) | Assess existing plans read-only and return a full independent design verdict |
| [wnz-task-implementer](skills/wnz-task-implementer/) | Execute one bounded task and return status, fresh verification and cleanup evidence |
| [wnz-dead-code](skills/wnz-dead-code/) | Audit reachability read-only or remove confirmed leftovers within authorized cleanup scope |
| [wnz-plan-simplicity-review](skills/wnz-plan-simplicity-review/) | Review an existing plan for KISS, DRY, and unnecessary complexity while preserving production safeguards and workload performance |
| [wnz-pr-release-notes](skills/wnz-pr-release-notes/) | Prepare and maintain bounded, evidence-based release notes in GitHub pull request descriptions while honoring repository-specific release conventions |
| [wnz-ship](skills/wnz-ship/) | Open PRs/MRs with evidence-based multilingual descriptions, adaptable templates, and command examples for GitHub, GitLab, Azure DevOps and Bitbucket Cloud |

## Optional Flow Status dashboard

[Flow Status](plugins/flow-status/README.md) is a read-only Herdr dashboard
for local development flows. It shows phases, tasks, recorded summaries and
timing, plus optional Linear and PR status. Local flows need no external
ticket or provider credentials.

The [handbook's optional plugin guide](docs/installation-handbook.md#optional-flow-status-plugin)
covers installation, global or per-repository workflow setup, and opening the
panel. Skills work without the plugin.

## Help

For installation problems, first check
[skill discovery troubleshooting](docs/installation-handbook.md#verify-discovery-and-use).
For questions or bugs, [open an issue](https://github.com/wnz99/llm-dev-skills/issues)
with the affected skill, client, steps to reproduce, and relevant error output.
Remove credentials and other private information before posting.

## Contributing

Open pull requests against `main` from short-lived feature branches. Before
changing a skill, follow [AGENTS.md](AGENTS.md) and the
[prompt engineering standard](docs/prompt-engineering.md), validate the
installed package and declared dependencies, and run relevant behavior
evaluations and regression tests.

This repository is the canonical source for its skills. Preserve intentional
local adaptations when updating an installed copy.

## Attribution

The **wnz-grill-me** skill adapts Matt Pocock's
[grill-me/grilling](https://github.com/mattpocock/skills) approach, with its
[MIT notice](skills/wnz-grill-me/LICENSE) bundled in the package.

The **wnz-code-reviewer** skill is based on the code-reviewer from
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli), adapted
for Claude Code and cross-model workflows.

## License

[MIT](LICENSE)
