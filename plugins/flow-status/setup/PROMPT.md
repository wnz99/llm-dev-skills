# Set up the standard development flow

Paste this exact prompt into Claude Code or Codex from the target repository. Replace only `BUNDLE_ROOT` with the absolute folder containing this file's parent directory. The setup agent discovers repository-specific choices; this prompt does not start a feature or approve a plan.

```text
Set up my personal standard development flow locally in this repository for both Claude Code and Codex, using BUNDLE_ROOT/setup/PROCEDURE.md.

Read the procedure, bundled WORKFLOW.template.md, FLOW.example.json and both client loader templates before editing. Inspect the repository instructions, existing local client configuration, Git/worktree layout and shared skills. Preserve existing owners, instructions, credentials, hooks and unrelated edits.

Use one private workflow file shared by both clients, primary-worktree private drafts, the bundled schema-1 FLOW.json contract and the single herdr.flow-status plugin. Adapt paths and existing repository policies; ask about genuinely unresolved integration branch or merge-policy choices. Do not copy machine- or project-specific defaults from examples. Resolve required skills through host discovery and check their declared dependencies. Install missing dependencies from their declared canonical sources when authorized; otherwise report the exact missing dependency and stop dependent setup.

Support ordinary local flows without a Linear issue or external ticket. Schema 1's historical ticket key holds a stable local flow ID such as cache-cleanup; linear_id may be omitted or null, and prs may be empty. Never infer a Linear association from a local ID, folder, title or branch. Explain this authoring contract without creating a real draft during setup.

Preserve the executor's canonical ledger and detailed reports under its host-discovered runtime contract. Required executor evidence may live outside the draft folder in an approved ignored location or external scratch path. The coordinator writes only supported summaries and evidence pointers into schema-1 FLOW.json; the dashboard reads that projection. Never inject unsupported canonical fields or infer executor gate approval from FLOW.json or GSD. Missing canonical artifacts block dependent execution on resume. Do not create executor artifacts during setup.

Make local-only changes ignored through Git's shared info/exclude. Merge Claude and Codex loaders without replacing existing configuration. Do not add agents, skills, secrets or plugin source copies inside the target repository. If client-specific GSD installation is needed, explain its scope and honor existing authorization before running its local installer; do not register a task or dispatch a planner/executor during setup.

Verify both loaders resolve the same workflow, all paths are stable, Codex TOML parses, required skills are discoverable, private files are ignored and the bundled example passes the validator. Record which checks ran and what remains unavailable. Do not fabricate approvals, create a live FLOW.json, start formal planning, commit, push, merge, deploy or run paid jobs as part of setup. Open the dashboard only if I request it, after verifying the live destination pane.
```
