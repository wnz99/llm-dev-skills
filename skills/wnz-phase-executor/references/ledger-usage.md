# Execution ledger command

Read this reference before initializing or migrating the canonical ledger,
changing task lifecycle metadata, or repairing its dashboard projection.
The coordinator owns these metadata operations. The command does not approve
gates, verify source state or replace required role evidence.

## Initialize or migrate

Resolve `scripts/ledger.py` inside the host-discovered `wnz-phase-executor`
package. It requires Python 3 and POSIX file locking, with no third-party
dependencies. Use absolute paths for the command and artifacts. In the examples,
`SCRIPT` means that resolved script path and `LEDGER` means the approved ignored
or external canonical JSON path.

Prepare a reviewed JSON seed from the
[current-view skeleton](coordinator-templates.md#ledger-and-current-view).
Retain all authority, approval tuples, dispatch records, task/report pointers,
invalidations and remaining-stage metadata. Each task has a unique `unit_id`,
verbatim plan `title`, `status` (`pending`, `in_progress` or `done`), nullable
ISO-8601 `started_at` and `completed_at`, `report_refs` and
`accepted_state_ref`. Optional `dashboard_id` supplies a stable projection key
when the dashboard uses a different ID; keep projection keys distinct.

```sh
python3 SCRIPT --ledger LEDGER init --seed /absolute/path/reviewed.json
python3 SCRIPT --ledger LEDGER init --seed /absolute/path/reviewed.json --flow /absolute/path/FLOW.json --history /absolute/path/old-ledger.md
```

Choose one initialization command. The second explicitly migrates reviewed
metadata and links the original Markdown history without modifying it.
Migration is opt-in; do not migrate active flows merely because this helper
exists. Never infer historical times from estimates, file modification times,
resume time or `updated_at`. Leave unknown times `null`.

Initialization adds `ledger_schema: 1`, `updated_at`, a compact `history` array
and `dashboard_path`. This JSON becomes the single canonical current view;
the old Markdown remains historical evidence. Review metadata updates under
the existing gate rules; preserve the command-owned task fields and history.

## Record lifecycle events

```sh
python3 SCRIPT --ledger LEDGER add task-7 --title 'Exact plan task heading' --dashboard-id task7
python3 SCRIPT --ledger LEDGER start task-7
python3 SCRIPT --ledger LEDGER complete task-7 --evidence /absolute/path/accepted-receipt.md
python3 SCRIPT --ledger LEDGER reopen task-7 --evidence /absolute/path/invalidation.md
python3 SCRIPT --ledger LEDGER recover-time task-7 --field started_at --at 2026-11-12T10:00:00Z --evidence /absolute/path/timestamped-spawn.md
python3 SCRIPT --ledger LEDGER sync
python3 SCRIPT --ledger LEDGER check
```

`add` records a newly planned task; omit `--dashboard-id` when the stable task
key already matches the dashboard. Run `start` at the first implementer
dispatch. It records the real clock time once. Run `complete` only after the
existing acceptance gates pass, with the accepted evidence pointer. Repeating
completion preserves the original completion time. Run `reopen` when accepted
completion is invalidated; it retains the original start and clears completion.
Elapsed time therefore includes reviews, retries and pauses.

Use `recover-time` only to fill a missing timestamp from authoritative timestamped
evidence. It cannot replace a known time. A missing timestamp alone does not
justify another worker dispatch or invalidate known source state.

## Projection and recovery

When initialized with `--flow`, each lifecycle mutation projects supported task
status, title summary and known times to the existing schema-1 dashboard.
Summaries fit the dashboard's 200 UTF-16-unit limit; truncation reserves one
unit for `…` and preserves complete Unicode characters.
Unknown times are omitted. Gate, dispatch, authority and role-result metadata
stay canonical in the ledger; the dashboard cannot approve execution.

The ledger owns the dashboard's entire task map; include every projected task
in the reviewed seed. Other dashboard fields remain unchanged except `updated_at`.
Writes serialize among cooperating helper processes with POSIX file locking
and atomically replace each file. Persistent `.lock` files protect lock identity;
retain them beside their ledger or dashboard while either remains in use.
The ledger is written before the dashboard. A projection failure can therefore
leave a valid new ledger and a stale dashboard. Preserve the ledger, correct the
reported dashboard problem, then run `sync` and `check`; do not replay the task
event or hand-copy timing fields. Retrying a lifecycle command also repairs the
projection. `check` checks ledger/projection consistency; run the dashboard's
existing full schema validator separately. The helper does not bundle or import
that plugin validator. Without `--flow`, ledger operations work independently.
