# Standard development flow for Herdr

One read-only dashboard for Claude Code, Codex and any Git repository using the standard 13-step `FLOW.json` workflow. Canonical source lives in `wnz99/llm-dev-skills`, under `plugins/flow-status`; the plugin ID is `herdr.flow-status`.

Flows need no Linear issue or external ticket. Choose a stable local flow ID such as `cache-cleanup` and store its record at `.planning/drafts/cache-cleanup/FLOW.json`. Schema 1 keeps the historical `ticket` key for this required local ID. Omit `linear_id` or set it to `null` when unlinked; attach a Linear issue explicitly when wanted. Use `prs: []` when no PR is attached. Existing linked records keep working without migration.

## Set up another repository

Ask either agent:

```text
Read /absolute/path/to/llm-dev-skills/plugins/flow-status/setup/PROMPT.md and follow its prompt to set up the standard local development flow in this repository for both Claude Code and Codex. BUNDLE_ROOT is /absolute/path/to/llm-dev-skills/plugins/flow-status.
```

Replace the two absolute paths with this checkout's actual location. [The exact prompt](setup/PROMPT.md) delegates [the setup procedure](setup/PROCEDURE.md). The bundle includes the shared workflow, Claude and Codex loader templates, an approval-free `FLOW.json` example, and plan/discovery templates. Installation preserves existing repo policy, uses private ignored instructions, and does not start a feature. Both clients load one workflow body.

## Install the dashboard

Requirements: macOS or Linux, Herdr 0.9.1+, Git and Bun 1.3.13+. Run from this directory:

```sh
bun install --frozen-lockfile
herdr plugin link "$PWD" --enabled
```

The dashboard reads `.planning/drafts/<flow-id>/FLOW.json` from the primary Git worktree, including when opened from linked worktrees. It selects the pane's current branch flow or the most recently updated active flow. Invalid/missing records stay visible with errors. It shows all 13 steps, evidence, tasks, reviews, approval records and optional Linear/PR status. It never edits workflow state or remote services.

FLOW.json is a schema-1 dashboard projection written by the workflow coordinator. The executor's canonical ledger and detailed reports remain authoritative for execution gates and resume; discover their runtime contract through the installed `wnz-phase-executor` skill. Required executor evidence stays outside the draft folder in an approved ignored location or external scratch path under that contract. Put supported summaries and artifact pointers in FLOW.json's existing fields, never unsupported canonical gate/dispatch/source-state/role-status fields. Neither FLOW.json nor GSD summaries authorize executor gates; missing canonical artifacts block dependent execution even if the dashboard shows completion or approval.

Direct terminal use:

```sh
bun src/main.ts --cwd /absolute/path/to/project --offline
bun src/checkFlow.ts /absolute/path/to/project/.planning/drafts
```

A terminal is required. `j`/`k` select flows, `d` toggles completed flows, PageUp/PageDown scroll details, `r` refreshes, and `q` exits. Local records reload every 30 seconds. Network requests run on initial live opening or explicit refresh, with a 15-second timeout. Offline mode makes no remote requests. Error text is sanitized before terminal rendering.

An unassociated flow shows `Linear: not linked` and never queries Linear. With no attached PRs either, live opening and refresh make no provider calls. Local IDs never imply Linear associations. Explicit PRs work even without a Linear link. Live GitHub status uses `gh pr view` and existing authentication. Linked Linear reads use `LINEAR_API_KEY` from the **Herdr server's environment**. Keep credentials in an approved external mode-600 environment file. Missing credentials for linked sources/CI checks are displayed as unavailable/none, never success. See the [procedure](setup/PROCEDURE.md) for verified pane selection, worktree setup and credential handling.

## Development

```sh
bun install --frozen-lockfile
bun run check
bun run format
```

`src/flowCore.ts` owns the schema and 13-step vocabulary. `src/sources.ts` owns file/process/network boundaries. `src/dashboardView.ts` owns rendering/navigation; `src/dashboard.ts` owns terminal lifecycle and request cancellation. The plugin manifest and `launch.sh` are native Herdr entrypoints. [Development details](docs/development.md) include quality gates and extraction provenance.

This component reuses the TypeScript repo starter's strict types, ESLint/Clean Code/SonarJS/Unicorn, Prettier, Knip/Fallow and pinned dependency baseline. Existing repository governance owns Git hooks, CI and publishing; this component does not install its own competing root hooks or CI. Optional integrations and repository merge/branch decisions remain with the target repository's owner.
