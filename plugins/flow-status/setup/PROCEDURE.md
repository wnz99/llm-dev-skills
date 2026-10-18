# Install the flow in a repository

This procedure installs private instructions for Claude Code and Codex. It does not modify the project's tracked development policy or begin a feature. Use `PROMPT.md` when delegating the procedure to an agent.

A flow tracks local work and needs no Linear issue or external ticket. Choose a stable local flow ID such as `cache-cleanup`. Schema 1 stores that required ID in its historical `ticket` key; normally use the same ID for `.planning/drafts/<flow-id>/`. `linear_id` is optional: omit it or use `null` when unlinked. `prs: []` means no attached PRs; explicit PRs also work without Linear. Never derive a Linear association from a local ID, folder, title or branch. Existing linked records require no migration.

## Inputs and inventory

Required inputs are the target Git repository and the absolute canonical plugin directory (`FLOW_PLUGIN_ROOT`). Use macOS or Linux, Git, Bun 1.3.13 or newer, and Herdr 0.9.1 or newer for the optional dashboard. Python is not required by this plugin. Preserve existing client versions and authentication.

Read the target repository's `AGENTS.md`, `CLAUDE.md`, contribution/release policies, Git status and worktree list. Resolve `PRIMARY_REPO` from the first `worktree` entry of `git worktree list --porcelain -z`; verify it is an actual checkout, since separate Git metadata may be reported as the primary entry. For a nonstandard metadata layout, confirm the intended private-draft owner with the user rather than guessing from metadata parents; resolve `GIT_COMMON_DIR` with `git rev-parse --path-format=absolute --git-common-dir`. Resolve the target session's actual checkout separately. Do not switch a shared checkout's branch.

Determine the integration/base branch and merge method from existing repository policy. If either is unresolved, ask the user before rendering those decisions. Do not assume `develop`, `main`, merge commits, production promotion, deployment or branch cleanup rules. User approval of setup does not authorize any of those operations.

Discover these required skills through the host: `wnz-implementation-planner`, `wnz-plan-simplicity-review`, `wnz-plan-reviewer`, `wnz-phase-executor`, `wnz-task-implementer`, `wnz-code-reviewer`, `wnz-dead-code`, and their declared dependencies. Resolve installed paths through discovery, not relative sibling directories. Sources live in `wnz99/llm-dev-skills`; use each skill's installation/update instructions. Shared user skills belong under `~/.agents/skills`; preserve existing Claude discovery links. Missing dependencies block the affected workflow; do not silently omit gates. Repository-specific release-note tooling is optional; use the repository's PR template when no release-note skill is installed.

Inspect each client's installed GSD workflows. If absent, use `npx @opengsd/gsd-core --help` to verify the current installer contract before a per-project `--local --claude` or `--local --codex` install, within existing authorization. Never install GSD globally. Preserve existing runtimes and hook ownership; investigate conflicts before changing them. Setup must not invoke the full quick workflow, which also executes work.

## Private files and one instruction owner

Back up each file you will modify outside the repository with private permissions. Preserve unrelated content and concurrent edits. In the primary worktree create `.agents/feature-flow/WORKFLOW.md` by rendering `WORKFLOW.template.md`. Replace `{{PRIMARY_REPO}}`, `{{FLOW_PLUGIN_ROOT}}`, `{{BASE_BRANCH}}` and `{{MERGE_METHOD}}` with the resolved values. Render `{{VALIDATE_COMMAND}}` as one shell-safe command from the argv list `["bun", FLOW_PLUGIN_ROOT + "/src/checkFlow.ts", PRIMARY_REPO + "/.planning/drafts"]`, quoting each argument for the actual shell (for POSIX shells, Python `shlex.join` is suitable). Do not interpolate raw paths into shell commands; cover spaces, apostrophes, dollar signs and backticks. No unresolved template markers may remain. Keep this as the single workflow body.

Copy `FLOW.example.json`, `PLAN.template.md` and `DISCOVERY.template.md` to `.agents/feature-flow/` as reusable templates. Do not create a flow, a draft folder, `FLOW.json`, a feature worktree or GSD task during setup. Real drafts are created only after the user chooses formal planning, under the primary worktree's `.planning/drafts/<flow-id>/`. When creating a real draft, replace the sample's local ID, title and timestamp, and render `{{FLOW_ID}}` and `{{TITLE}}` in the plan/discovery templates. Keep unlinked `linear_id: null`, empty PRs and approvals until actual associations or approvals exist. Never infer approvals from the sample.

The draft-folder limit does not replace `wnz-phase-executor`'s canonical ledger or detailed role reports. Discover that skill's runtime references, including `references/coordinator-templates.md` and `references/coordinator-boundary.md`, through the host. During execution, keep its required evidence outside the draft folder in an approved ignored location or external scratch path under executor rules; do not create it during setup. This exception permits required executor evidence, not arbitrary extra files or duplicate transcripts. FLOW.json remains a schema-1 dashboard projection: its author records supported status, steps, tasks, reviews, approvals and evidence pointers only. Never inject canonical gate, dispatch, source-state or role-status fields. The plugin reads this projection; executor gates and resume depend on the canonical ledger/reports, never FLOW.json or GSD summaries. Missing canonical artifacts block dependent execution even if the projection reports completion or approval.

Add root-anchored exclusions to `GIT_COMMON_DIR/info/exclude` for the private files in each client checkout: `/.agents/feature-flow/`, `/CLAUDE.local.md`, and `/.codex/config.toml`. Add `/.planning/drafts/` only if that path is not intentionally tracked already. Do not change tracked ignore policy or hide already tracked files. If any proposed private instruction/config file is tracked, preserve its existing ownership and ask the user which supported local override to use; do not overwrite or silently untrack it.

Merge `claude-loader.template.md` into each relevant checkout's `CLAUDE.local.md`, rendering `{{CLAUDE_IMPORT_PATH}}` as the absolute primary-worktree workflow path, with each space escaped as `\ ` for Claude import syntax. Do not wrap the import in quotes or Markdown code spans. Preserve the actual unescaped workflow path separately for Codex. See [Claude memory imports](https://code.claude.com/docs/en/memory#import-additional-files). Claude loads this private file automatically. Update an existing managed flow block in place; otherwise append exactly one block. Preserve all existing imports and instructions.

Merge the root-level `developer_instructions` from `codex-loader.template.toml` into each relevant checkout's `.codex/config.toml`, preserving existing developer instructions and all tables, comments, hooks, MCP servers, permissions and trust. Render `{{WORKFLOW_FILE}}` to the same absolute path used by Claude. Append a single loader paragraph if the root string already contains other instructions. Do not create duplicate TOML keys or append a root key under an existing table. Encode the loader as a valid TOML string, escaping any embedded quotes/backslashes; parse TOML after editing. Project Codex configuration loads only for trusted projects; report existing trust status and let the user handle any native trust prompt. Setup must not silently grant trust.

Linked worktrees share private draft state through `PRIMARY_REPO`, but their local client files are separate. Install the loaders in the checkout(s) where sessions will run; before future sessions in newly created worktrees, repeat only the local-loader and ignore checks. Do not copy or fork the workflow body. Both clients must read the same primary-worktree path.

## Plugin and optional live sources

From `FLOW_PLUGIN_ROOT`, run `bun install --frozen-lockfile`, then `herdr plugin link "$FLOW_PLUGIN_ROOT" --enabled`. The plugin is installed once per Herdr machine, with ID `herdr.flow-status`; it runs against any pane's project directory. Do not install a separate plugin per project or copy its implementation into target repositories.

Local status works without network access or provider credentials. An unlinked flow displays `Linear: not linked`; with no attached PRs, live opening and refresh make no provider calls. Live PR status uses existing `gh` authentication only for explicit PR numbers. Live Linear status uses the standard `LINEAR_API_KEY` from the Herdr server environment only for explicit associations. Load only an approved external mode-600 environment file; do not search for or print credentials, pass them as command arguments or Herdr `--env`, or commit them. For projects with separate Linear accounts, prepare the appropriate server environment explicitly; do not guess a key from another project. A server started before credential loading does not inherit a later shell change. Missing credentials for linked sources remain an unavailable state; do not restart a shared server without coordinating affected sessions.

Open the dashboard only on request. Use live `herdr agent list` to find the unique current session/project/task pane, verify its visible context, then run the following with the verified `PANE`, actual `PROJECT_CWD`, and current Herdr CLI contract:

```sh
herdr plugin pane open --plugin herdr.flow-status --entrypoint flow \
  --placement split --direction right --target-pane "$PANE" \
  --cwd "$PROJECT_CWD" --env HERDR_FLOW_STATUS_OFFLINE=1 --focus
```

Verify the returned plugin pane shows the expected branch and flows. The offline flag is non-secret and prevents remote calls. Omit it for approved live status. The dashboard only reads state; it never writes flow records, GSD, issues or PRs.

## Verification and handoff

Run `bun "$FLOW_PLUGIN_ROOT/src/checkFlow.ts" <temporary-drafts-directory>` against a temporary flow directory containing the bundled example. Delete the temporary fixture afterward. Do not run the example as a real task. Parse Codex TOML with a TOML parser. Resolve the Claude import and Codex loader to the exact same workflow. Search rendered files for unresolved `{{...}}` markers and stale project names/paths. Verify each private file with `git check-ignore` and confirm `git ls-files` does not list it; a tracked file is not made private by an ignore rule.

Check the required skills in both client discovery contexts and each client's GSD command availability. Report missing dependencies, untrusted project configuration, unavailable live credentials and checks not run separately. Do not claim agent-loaded instructions solely because a file exists: new sessions must load the private instructions; existing sessions need a restart or the client's documented reload process. Do not launch billable agent sessions solely to test an installation without task authorization.

Report exact installed paths, resolved policies, files changed, verification evidence and the next step. The next step is discussion or an explicitly chosen plan, never automatic execution. Roll back only the managed flow edits after comparing backups for unrelated changes; remove a plugin registration only if this setup created it and no other repo uses it.

Client integration contracts: [Claude local instructions and imports](https://code.claude.com/docs/en/memory) and [Codex configuration precedence](https://learn.chatgpt.com/docs/config-file/config-basic).
