# Installation handbook

Install this collection for local Claude Code and Codex sessions, then add the
optional Herdr Flow Status dashboard if you want a panel for development flows.
The skills work independently of the dashboard.

## Before you install

Use an installed, authenticated Claude Code or Codex client. Review the
selected skill's `SKILL.md` and bundled files before allowing it to run tools.
You need Git to clone this repository; the optional Skills CLI needs Node.js
and `npx`. Manual installation needs neither Node.js nor Bun.

Clone the canonical source to a persistent location:

```sh
git clone https://github.com/wnz99/llm-dev-skills.git
cd llm-dev-skills
```

Keep this checkout if you install Flow Status: Herdr links to its plugin
directory rather than copying it.

## Choose skills and dependencies

Use the [skill catalog](../README.md#skills) to choose a starting point.
Install each selected skill's complete directory, including bundled scripts,
references and assets. Also install its required skills explicitly; do not
assume an installer resolves skill dependencies.

| Selected skill | Required skills or tools |
| --- | --- |
| `wnz-code-reviewer`, `wnz-implementation-planner`, `wnz-plan-reviewer`, `wnz-task-implementer`, `wnz-clean-code-js`, `wnz-clean-code-py`, `wnz-clean-code-rust` | `wnz-dead-code` |
| `wnz-phase-executor` | `wnz-implementation-planner`, `wnz-plan-reviewer`, `wnz-task-implementer`, `wnz-code-reviewer`, `wnz-dead-code`; native fresh workers without inherited history and reliable worker identity evidence |
| `wnz-llm-assist` | Installed and authenticated CLI for the selected external provider; normally Claude from Codex, or Codex from Claude |
| `wnz-cross-review-pr` | CLIs for selected external reviewers, plus authenticated GitHub CLI (`gh`) for PR work |
| `wnz-pr-release-notes` | Authenticated GitHub CLI (`gh`) |

The other catalog skills have no required sibling skill. For structured
inline review with `wnz-cross-review-pr`, also install `wnz-code-reviewer` and
`wnz-dead-code`; its inline leg can otherwise use direct analysis. Each `SKILL.md`
remains authoritative about when a dependency is needed and what optional
fallbacks exist. Missing required dependencies block the affected work.

## Install shared skills

Keep one canonical copy under `~/.agents/skills/`. Codex reads this user
location. Claude Code reads personal skills under `~/.claude/skills/` and
supports symlinks to the canonical copy. See the official
[Codex skill locations](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills)
and [Claude Code skill locations](https://code.claude.com/docs/en/skills#where-skills-live).

### Manual installation

From this repository's root, install a review skill and its required dependency:

```sh
mkdir -p "$HOME/.agents/skills" "$HOME/.claude/skills"
for skill in wnz-code-reviewer wnz-dead-code; do
  if [ -e "$HOME/.agents/skills/$skill" ] || [ -L "$HOME/.agents/skills/$skill" ] ||
     [ -e "$HOME/.claude/skills/$skill" ] || [ -L "$HOME/.claude/skills/$skill" ]; then
    printf 'Already installed; compare before updating: %s\n' "$skill"
    continue
  fi
  cp -R "skills/$skill" "$HOME/.agents/skills/$skill"
  ln -s "$HOME/.agents/skills/$skill" "$HOME/.claude/skills/$skill"
done
```

Replace the two names with your chosen skills and all their dependencies.
For Codex only, omit the Claude directory, Claude-specific collision checks
and `ln` command. Keep the canonical directory's collision checks.
For an existing canonical copy, inspect it first and add only a missing Claude
link after confirming that the link destination is unused. Do not overwrite
an existing directory or link merely to make discovery succeed.

### Skills CLI alternative

The [Skills CLI](https://github.com/vercel-labs/skills) can select packages
and create agent discovery links. Inspect its current help before installing:

```sh
npx skills --help
npx skills add wnz99/llm-dev-skills --list
npx skills add wnz99/llm-dev-skills -g --agent universal claude-code \
  --skill wnz-code-reviewer wnz-dead-code
```

The `universal` target keeps the canonical copy in
`~/.agents/skills/` and adds Claude's discovery link; Codex reads the canonical
location directly. Check the proposed paths before accepting. Avoid `--copy`
when you want both clients to share one copy. To select the whole collection,
replace the entire `--skill` clause with `--skill '*'`. Individual selection uses
`--skill`, not an assumed repository subpath.

## Verify discovery and use

Check that each installed skill has its complete package and that Claude's
link resolves to it. For the review example:

```sh
test -f "$HOME/.agents/skills/wnz-code-reviewer/SKILL.md"
test -f "$HOME/.agents/skills/wnz-dead-code/SKILL.md"
ls -ld "$HOME/.claude/skills/wnz-code-reviewer" "$HOME/.claude/skills/wnz-dead-code"
```

Start a new session in each client you use. Ask it to list the installed
`wnz-code-reviewer` and `wnz-dead-code` skills and report their resolved paths.
Then request a bounded task, such as “Use wnz-code-reviewer to review my local
changes.” File existence alone does not prove client discovery. If a skill is
missing, check the client location, symlink target, permissions and duplicate
names before reinstalling. A missing dependency must not silently skip a gate.

## Update without losing local changes

Compare installed packages with the matching `skills/<name>/` directories
before replacing them. Back up intentional local adaptations outside the
installed skill folders, update the source checkout, and reconcile differences.
For example, inspect a package from the repository root with:

```sh
git pull --ff-only
diff -ru skills/wnz-code-reviewer "$HOME/.agents/skills/wnz-code-reviewer"
```

A nonzero `diff` exit status can mean differences were found. Review them
before copying or rerunning the selected Skills CLI installation command.
Update dependencies with their consumers, preserve valid discovery links,
and verify both clients again. Avoid leaving multiple installed packages with
the same skill name.

## Optional Flow Status plugin

Flow Status is a read-only Herdr panel. It shows a flow's next action, phases
and tasks, their recorded summaries, and recorded elapsed and finish times.
Elapsed time includes pauses and review loops. Missing historical summaries
or timestamps remain unknown; the panel does not reconstruct them.

### Install the panel

Requirements: macOS or Linux, Git, Bun 1.3.13+, and Herdr 0.9.1+. From the
plugin directory in your persistent checkout:

```sh
cd plugins/flow-status
bun install --frozen-lockfile
herdr plugin link "$PWD" --enabled
```

This registers `herdr.flow-status` once per Herdr machine. It does not install
the skills or create development flow records. The
[plugin README](../plugins/flow-status/README.md) owns the panel and record
reference.

### Set up a project's flow producer

The panel reads records written by a workflow coordinator. In the target Git
repository, ask Claude Code or Codex to run the bundled setup prompt:

```text
Read /absolute/path/to/llm-dev-skills/plugins/flow-status/setup/PROMPT.md and follow its prompt to set up the standard local development flow in this repository for both Claude Code and Codex. BUNDLE_ROOT is /absolute/path/to/llm-dev-skills/plugins/flow-status.
```

Replace both paths with your persistent checkout's actual location. Setup
checks the workflow's required skills, including `wnz-plan-simplicity-review`,
and per-project GSD. It preserves repository policy and installs private
client loaders pointing to one shared workflow. Follow the
[setup procedure](../plugins/flow-status/setup/PROCEDURE.md) for GSD checks,
client trust/restart requirements and loaders in linked worktrees.

Setup does not start a feature or create a sample flow. After setup, discuss
your task and explicitly choose formal planning to create a real flow.
The coordinator maintains its `FLOW.json` record under
`.planning/drafts/<flow-id>/` in the primary Git worktree and validates updates.
Choose a stable local ID such as `cache-cleanup`; no external ticket is needed.
Schema 1 stores this ID in `ticket`. Keep `linear_id` absent or `null`, and
`prs: []`, for local-only work.

The dashboard summarizes workflow state. The executor's canonical ledger and
detailed reports remain authoritative for execution gates and resume.

### Open and check the panel

Run `herdr agent list` and identify the intended session, project and visible
pane. Set `PANE` to that verified pane ID and `PROJECT_CWD` to its actual
checkout path. Check your installed CLI with `herdr plugin pane open --help`,
then open an offline panel:

```sh
herdr plugin pane open --plugin herdr.flow-status --entrypoint flow \
  --placement split --direction right --target-pane "$PANE" \
  --cwd "$PROJECT_CWD" --env HERDR_FLOW_STATUS_OFFLINE=1 --focus
```

Verify the expected branch and flow. Use `j`/`k` to select flows, `d` to show
completed flows, PageUp/PageDown to scroll, `r` to refresh and `q` to quit.
Local records reload every 30 seconds. An empty panel can mean no real flow
has been created yet. Reopen existing panes after updating the plugin.

For a standalone terminal, run this from `plugins/flow-status`:

```sh
bun src/main.ts --cwd /absolute/path/to/project --offline
```

Local operation needs no Linear or GitHub credentials. Enable live sources
only when wanted: attached PRs use existing `gh` authentication; explicitly
linked Linear issues use `LINEAR_API_KEY` in the Herdr server environment.
Follow the [live-source procedure](../plugins/flow-status/setup/PROCEDURE.md#plugin-and-optional-live-sources)
before removing offline mode. Keep credentials out of Git, command arguments
and Herdr `--env`; missing credentials are shown as unavailable.
