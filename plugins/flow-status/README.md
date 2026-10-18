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

The dashboard reads `.planning/drafts/<flow-id>/FLOW.json` from the primary Git worktree, including when opened from linked worktrees. It selects the pane's current branch flow or the most recently updated active flow. Invalid/missing records stay visible with errors. It shows the recorded next action, every step and task as one list, and optional Linear/PR status. Each row shows its own record: status, summary, elapsed time and finish time when recorded. It never infers completion, titles or times. Records with task titles, task times and `active` steps need this plugin version. Older plugin copies and repo-local legacy dashboards reject them, so reopen open panes after updating. Plans, evidence, approvals and review history stay outside the dashboard. It never edits workflow state or remote services.

FLOW.json is a schema-1 dashboard projection written by the workflow coordinator. The executor's canonical ledger and detailed reports remain authoritative for execution gates and resume; discover their runtime contract through the installed `wnz-phase-executor` skill. Required executor evidence stays outside the draft folder in an approved ignored location or external scratch path under that contract. Put supported summaries and artifact pointers in FLOW.json's existing fields, never unsupported canonical gate/dispatch/source-state/role-status fields. Neither FLOW.json nor GSD summaries authorize executor gates; missing canonical artifacts block dependent execution even if the dashboard shows completion or approval.

Direct terminal use:

```sh
bun src/main.ts --cwd /absolute/path/to/project --offline
bun src/checkFlow.ts /absolute/path/to/project/.planning/drafts
```

A terminal is required. The panel is a read-only summary. It starts with a one-line header: flow ID and status first, then branch and any directory suffix when they fit. A bounded selector appears only with several visible flows. Below it come the title, **NEXT** (first non-empty line of the recorded next action, at most two rows), then **PHASES**: all 13 steps, with the flow's tasks nested under step 9 (execution), then low-priority source and timestamp rows.

Each row has a status symbol, a summary and two right-hand columns:

- Symbols: `✓` done (green); `▸` open (cyan when running, yellow when paused or not closed in a done flow); `◦` pending (light grey); `-` skipped or n/a (dimmer, with the word); `?` an earlier step with no record.
- Labels: steps use their fixed names, with the latest plan-review cycle/round on step 4. Step 11 is `PR + review loop + merge`, with the latest recorded final/PR review cycle/round. A round appears only when recorded; the label alone does not prove review happened. Tasks show `ID summary`, or the ID alone for legacy records.
- `elapsed` is wall-clock time from start to finish, including review loops, retries and pauses. It is not active work. Open items count up to now while the flow is active (`running`) or paused (`paused`). In a done flow an open item shows `not closed` with no time.
- `finished` is local time, with the date shown when it is not today.
- Completed rows missing either timestamp show `no timing` in the elapsed column. A recorded finish still appears independently. Future phases stay blank. Timing works for all 13 phases and tasks; unavailable historical times cannot be reconstructed by the dashboard. The `finished` column drops below 52 columns and `elapsed` below 34.
- The light grey is a fixed 256-colour value (248) that assumes a dark background. Without colour, symbols keep done, open, pending and unrecorded distinct. The words `skipped` and `n/a` tell skipped and n/a rows apart while the `elapsed` column is shown (34 columns or more).

Load errors appear at the top of the body; if earlier records are still shown they are marked as last loaded. When only completed flows exist the panel says how many are hidden. The footer lists whole controls only, dropping optional ones as width shrinks: `q` quit always, then `r` refresh; when the summary overflows, wheel/PageUp/PageDown scrolling and the visible line range (for example `1–10/16`) come before `r` refresh; `j`/`k` only with several visible flows; `d` show/hide done only when completed flows exist. Unlisted shortcuts still work: arrows, Ctrl-U/Ctrl-D half page, Home/End, Ctrl-C. Local records reload every 30 seconds. Network requests run on initial live opening or explicit refresh, with a 15-second timeout. Offline mode makes no remote requests. Set `NO_COLOR` (any value, including empty) to disable color, bold and dim text; plain and colored output have identical geometry. Styling comes from the row type assigned by the renderer, never from external text, which is sanitized first.

An unassociated flow shows `Linear: not linked` and never queries Linear. With no attached PRs either, live opening and refresh make no provider calls. Local IDs never imply Linear associations. Explicit PRs work even without a Linear link. Live GitHub status uses `gh pr view` and existing authentication. Linked Linear reads use `LINEAR_API_KEY` from the **Herdr server's environment**. Keep credentials in an approved external mode-600 environment file. Missing credentials for linked sources/CI checks are displayed as unavailable/none, never success. See the [procedure](setup/PROCEDURE.md) for verified pane selection, worktree setup and credential handling.

Press `c` to enter copy mode, then drag to select text and use the terminal's Copy command. Copy mode disables mouse reporting and freezes repainting, including background refreshes and resize events, so selection stays intact. Navigation and refresh keys are ignored until `c` resumes; `q` and Ctrl-C still quit. Background data continues loading and appears on resume. The footer prioritizes `c copy` or `c resume` after `q quit` when space permits.

## Development

```sh
bun install --frozen-lockfile
bun run check
bun run format
```

`src/flowCore.ts` owns the schema and 13-step vocabulary. `src/sources.ts` owns file/process/network boundaries. `src/dashboardSummary.ts` owns summary projection, `src/dashboardList.ts` the phase/task list and `src/terminalText.ts` safe typography; `src/dashboardView.ts` owns viewport/navigation. `src/terminalInput.ts` frames mouse input before readline; `src/dashboard.ts` owns terminal lifecycle and request cancellation. The plugin manifest and `launch.sh` are native Herdr entrypoints. [Development details](docs/development.md) include quality gates and extraction provenance.

This component reuses the TypeScript repo starter's strict types, ESLint/Clean Code/SonarJS/Unicorn, Prettier, Knip/Fallow and pinned dependency baseline. Existing repository governance owns Git hooks, CI and publishing; this component does not install its own competing root hooks or CI. Optional integrations and repository merge/branch decisions remain with the target repository's owner.
