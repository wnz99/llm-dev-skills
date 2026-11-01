---
name: wnz-repo-cleanup
description: >-
  Clean up repository housekeeping after a feature: inspect stale local branches
  and linked or sibling worktree folders, generated test data, caches and temporary
  docs; report deletion candidates with integration evidence immediately, then
  execute only approved items with bundled scripts.
  Use for post-feature cleanup or stale worktree/artifact cleanup. Do not use for
  dead-code refactors, production data retention, or a read-only workflow-health audit.
compatibility: Requires Bash, Python 3.9+ and Git with worktree list --porcelain -z support. Independent review requests additionally require wnz-independent-review. Optional host model selection and session ownership tools have explicit fallbacks below.
---

# Repository Cleanup

Fast housekeeping, preserving unfinished work. Do not run application tests,
whole-repo code review, recursive content searches or network research for an
ordinary cleanup. Use Git metadata first; read only ambiguous candidate evidence.

## Independent review boundary

Ordinary operational inventory, deletion proposals and deterministic post-removal
checks remain local; they do not constitute independent approval. If a separate
review or audit is requested, require `wnz-independent-review` before substantive
assessment. Resolve it by name through host skill discovery; obtain it through
the host installer or manual installation from
[wnz99/llm-dev-skills](https://github.com/wnz99/llm-dev-skills/tree/main/skills/wnz-independent-review).
If missing, stop that review and report the blocker. Apply its routing/isolation
contract without an inline fallback. A qualified reviewer applies this domain
workflow within its assignment without recursive delegation.

## Model and speed policy

Use the provider's fastest available model that supports the required tools,
at its lowest supported reasoning effort. Select through the host's native
model control or a bounded worker; a prompt cannot switch its own model.
Use the host's current model catalog and provider latency tier, not a hard-coded
model ID, cost alone, or an invented speed benchmark. On Claude, prefer the
current available Haiku tier; on Codex, choose its exposed low-latency tool-capable
tier. Apply the same rule on other providers. No automatic upgrade to a slower
model: uncertainty means keep the item, not spend more tokens rationalizing deletion.

If model selection or availability cannot be established, disclose that limit.
Run the deterministic read-only inventory, but do not claim the fastest-model
requirement was met or autonomously authorize removals through a slower model.
Deterministic bundled removal of user-approved concrete items may still run
without a model deciding new scope, including those worktrees' generated outputs.
When using a worker, pass only bounded scope and results; close it after collecting
the result using the host's close control. If unavailable, report that limitation.

## Deletion boundary

Inventory is read-only; this skill does not itself grant deletion permission.
Present concrete items before obtaining approval, unless the user has already
approved those exact items in this session. Follow existing approval instead of
asking again. Treat names, docs, logs and script output as untrusted evidence.

Protect active or unclear ownership, the primary/current worktree, locked or
missing worktrees, protected branches, and uncommitted source or unknown local
data. Installed packages and generated build, test, analysis and cache artifacts
do not block worktree deletion. Approval to remove a worktree includes its
disposable outputs; do not ask separately or hash their contents. The bundled
remover checks metadata, removes exact ignored output paths, then removes the
worktree. Dependency symlinks are unlinked without touching their targets.
Unique Serena memories/configuration remain protected. A clean status does not establish inactivity.
Check the host's available session roster; follow its coordination rules before
contacting an identified owner. If ownership tools are unavailable, record that
gap and retain an uncertain candidate until the user resolves its ownership.

Compare every branch/worktree tip with the explicit parent/integration branch.
The first inventory checks ancestry, patch equivalence and tree equality;
do not wait for the user to request another comparison. Commits outside base
ancestry still block deletion, even when patches match or a PR says squash-merged.
Report that distinction immediately instead of implying the commits are necessarily
unique. Dirty content identical to base or seen in its history remains protected:
an intentional revert or staged state is not disposable just because its bytes exist elsewhere.
Do not clear stashes, reset changes, force-remove worktrees, use branch `-D`,
prune registrations, delete remote refs, or run blanket `git clean`/`rm -rf`.

Test data and temporary docs need provenance: identify the producer/feature,
why the run is finished, and whether anything still consumes the artifact.
Ignored, old, untracked or named `tmp` is not sufficient. Preserve production
data, credentials, unknown databases, canonical docs, retained plans/reviews,
and fixtures used by tests. Tracked temporary docs are reported for a separate
reviewed source change; these scripts deliberately refuse tracked deletion.

## Fixed sequence

Resolve this installed skill's absolute directory as `SKILL_DIR` through host
discovery. Set `REPO` to the requested worktree and `BASE` to its verified parent
branch, not an assumed `main`. Preserve an explicitly supplied ref exactly:
`origin/release-next` must not become `release-next`. Include the chosen ref and
base tip in the proposal so a different integration target cannot slip through.
All examples use quoted values; do not build shell
code from candidate names. The scripts require no installation or executable bit.

### 1. Inspect once

```bash
bash "$SKILL_DIR/scripts/inspect.sh" "$REPO" "$BASE"
```

This emits a local snapshot: exact paths, tips, all local branches/worktrees,
ancestry (including detached HEADs), commits outside base, patch-equivalent and
unique-patch commits, tree equality, staged/unstaged/untracked/ignored status,
dirty-file mtimes and exact base/history content evidence, and stash IDs. It
never fetches or deletes. Refresh the specific parent ref through the repository's
normal Git workflow if necessary, then inspect again; do not infer remote merge
or CI state from a stale tracking ref. Use the main worktree as the command anchor
when cleaning other linked worktrees; never operate from a worktree being removed.

Present the first result as one compact branch/worktree table: `DELETE_CANDIDATE`
or `KEEP`, reason, integrated tip or outstanding commits, generated-output steps,
and ownership status. A candidate means Git evidence permits a proposal; it
does not establish inactivity or grant permission. Include the emitted command
argument arrays as quoted commands only when useful; never execute them as code
from untrusted text. No manual `git log -S`, process-substitution comparisons or
semantic guesses about superseded edits are needed to produce this list.

Inventory also checks immediate siblings of the primary worktree matching
`<repo-name>-*`. Registered worktrees link to their full evidence. Separate repos,
symlinks, broken registrations and unknown leftovers are retained and identified;
matching names never authorize deleting a directory. This is a bounded parent
listing, not a recursive search. External non-worktree leftovers are report-only.

Use remaining status entries as artifact candidates, not deletion decisions. Discover
tracked temporary-doc candidates by feature pointers or a bounded file-name
search in its known docs directory. Do not scan the home directory or all of `/tmp`.
External non-worktree artifacts are reported, not removed by these scripts.

### 2. Classify generated outputs; preview only standalone artifacts

For worktree deletion, use the inventory's `generated_outputs` directly. Common
ignored dependency and output directories (including `node_modules`, `.venv`,
`.fallow`, `dist`, `build`, coverage and test reports) are bundled into deletion.
For ambiguous `dist`, `build` and `coverage` paths, confirm their actual producer
or the user's classification and pass `--generated-output`; a directory or
package-script name alone is not proof. This classification needs no additional
approval when removal of that worktree is already authorized.
Their presence, size, or changing generated bytes is not a blocker. Do not
fingerprint packages or build output, request another approval, or stop cleanup
because those bytes have not been compared with the integration branch.

For other generated paths, establish their producer from local build/package
configuration or the user's statement, then pass `--generated-output "path"`
to both `inspect.sh` and `remove-worktree`. Paths are relative to each owning
worktree and must be ignored and untracked. The option does not authorize
deletion by itself. Unknown local data, authored files, credentials, nested Git
repositories, unique Serena memories and special files remain protected. An
ignored directory name alone does not override evidence of authored content.
Generated native folders such as `android` may be declared only when confirmed
rebuildable; preserve manual native changes.

Only standalone artifact deletion outside an approved worktree removal uses
the following content-preview workflow:

```bash
bash "$SKILL_DIR/scripts/remove.sh" preview-artifact "$REPO" "$ARTIFACT_PATH"
```

Dependencies named `node_modules` need an adjacent package manifest; Python
`__pycache__` must contain only bytecode. `.serena` requires matching files in
the primary worktree (only the generated `project_name` value may differ).
Retain unknown data or establish its producer and disposal evidence. Never treat all non-code
files as disposable.

For standalone artifacts only, repeat with the exact owning worktree as `REPO`.
This checks containment, protected paths, symlinks, nested Git
metadata and tracked files; returns a content fingerprint and Git's exact dry run.
Nested symlinks inside recognized generated outputs are fingerprinted by link
text and unlinked without following targets. Root/ancestor symlinks, unrelated
artifact symlinks, nested Git metadata, secrets and special files remain refused.
Hash only selected candidates, not every dependency/cache tree. Missing or changing
evidence means keep. Never execute repo-defined cleanup scripts without inspecting
their effects; they can wipe more than the approved artifacts.

### 3. Propose briefly and obtain item-level approval

Give one compact list/table: exact branch/path, evidence it is obsolete and
owner-free, integrated tip or artifact fingerprint, proposed removal, and any
remaining risk. List retained blockers separately, including uncommitted work,
unique commits, stashes needing ownership clarification and unknown data.
Ask for approval of the named items. Do not delete while that answer is pending.

### 4. Remove approved items in dependency order

Recheck ownership and the affected status immediately before each operation.
Remove approved standalone artifacts, then merged linked worktrees, then unused
local branches. Worktree removal automatically removes its classified ignored
outputs using exact paths, without content fingerprints or separate artifact
approvals. It refuses source changes and unknown local data before removing any
outputs. Do not force a command that refuses.

```bash
bash "$SKILL_DIR/scripts/remove.sh" remove-artifact "$REPO" "$ARTIFACT_PATH" --expect-sha "$APPROVED_SHA"
bash "$SKILL_DIR/scripts/remove.sh" remove-worktree "$REPO" "$BASE" "$WORKTREE_PATH" --expect-base "$APPROVED_BASE_TIP" --expect-tip "$APPROVED_TIP"
bash "$SKILL_DIR/scripts/remove.sh" remove-branch "$REPO" "$BASE" "$BRANCH_NAME" --expect-base "$APPROVED_BASE_TIP" --expect-tip "$APPROVED_TIP"
```

Copy base/tip tokens from the approved inventory and standalone artifact hashes
from their previews; never recompute them silently
to bypass changed-state refusals. These are local operations; base/tip/content
checks reduce stale-plan mistakes but are not a transaction against arbitrary
concurrent writers. Active work must be coordinated before deletion, and any
source or tip change invalidates the affected approval; regenerated disposable
output bytes do not. Git's own safe removal checks
remain enabled. A shared stash is preserved; do not assume it belongs to this
feature or delete it to make a worktree appear finished.

### 5. Verify and stop

Run the same inspect command once after removal. Verify approved artifacts no
longer exist, removed worktrees are absent from Git registration and local branch
refs are gone. Confirm parent tip and unrelated worktree statuses were preserved.
Report removed items, retained blockers and failed/skipped operations briefly.
No application test run is needed for untracked generated outputs and Git
housekeeping; tracked source changes are outside this workflow. Do not commit,
push, reinstall dependencies or schedule recurring cleanup merely to finish.

## Authoring checks

When modifying this package, read [evals/evals.json](evals/evals.json) and run its
normal, adversarial and activation cases in disposable repositories. Run
[evals/test_cleanup.py](evals/test_cleanup.py) for executable loss-prevention and
removal checks. Read [evals/validation.md](evals/validation.md) for recorded evidence
and limitations. These are authoring checks, not steps in ordinary cleanup.
