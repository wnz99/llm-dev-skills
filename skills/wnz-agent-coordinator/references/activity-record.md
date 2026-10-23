# Activity record and handoff templates

Load before first coordination action and on recovery when no longer available.
Keep these semantic fields fixed. Replace placeholders with observed facts;
use `none`, `not applicable: reason`, or `unavailable: reason` explicitly.
The template is a recording contract, not a new workflow engine or validation
library. Repeated records use stable IDs, not names guessed from prose.

## Existing ledger adaptation

First find the authoritative task/flow ledger and its schema. Map each field
below into its existing supported fields, task briefs, or evidence references.
Document that mapping once in the ledger's permitted notes/reference field.
Do not add unsupported fields, duplicate a worker's execution ledger, or make a
dashboard the authority. Missing optional historical metadata alone does not
invalidate otherwise sound work or justify a recovery worker.

If no ledger exists, create one Markdown file using this envelope. The
coordinator is its single writer; workers return receipts. Update atomically
with host-native facilities and check the previous revision before replacing it
when another writer may exist. `record_version` is the schema version, not a
concurrency token: use the store's revision/ETag or an observed file digest with
a supported atomic compare-and-replace. Comparing `updated_at` alone is not
exclusive ownership. An ownership label does not enforce exclusion.
On takeover, establish a supported exclusive claim or explicit handover before
mutating shared records/resources. If unavailable, keep dependent writes blocked
while reconciling read-only; do not invent a distributed lock service.

## Current view

```yaml
record_version: 1
group:
  goal_ref: <authoritative outcome and observable acceptance criteria>
  non_goals_ref: <excluded outcomes>
  authority_ref: <user authorization and limits, including approvals delegated>
  coordinator: <observed identity and claim/handover evidence>
  updated_at: <actual ISO-8601 timestamp>
  next_action: <owner and action>
  next_wake: <supported event or check; unavailable with reason if unsupported>
workers:
  - worker_id: <observed session or native child identity>
    assignment_id: <stable ID for this dispatch>
    task_ref: <worker's existing bounded objective and acceptance criteria>
    goal_contribution: <how this advances the group outcome>
    owns: <paths, interfaces, resources; exclusions>
    depends_on: <task IDs and required outputs, or none>
    state: <pending|active|blocked|verifying|done|cancelled|unknown>
    last_evidence_ref: <receipt or authoritative observation and timestamp>
    blocker: <specific cause and resolving owner, or none>
    next_action: <owner and action>
reservations:
  - resource: <conflicting shared operation, or none>
    owner: <observed identity>
    scope: <exact protected mutations>
    release_condition: <observable event, not an unexplained indefinite hold>
    evidence_ref: <grant, last observation, release or recovery evidence>
pending_operations:
  - operation_id: <stable ID recorded before the external effect>
    action: <intended effect and exact target>
    owner: <observed identity>
    issued_at: <actual timestamp; none before issuing, unavailable if unknown>
    observed_effect: <unknown|confirmed|absent>
    evidence_ref: <last observation, or none>
    inspect_before_retry: <authoritative state query and resolving owner>
history_ref: <events below or archived durable history>
```

Use `pending` before dispatch, `active` on execution evidence, `blocked` for a
known unmet prerequisite, `verifying` while acceptance is unresolved, and `done`
only for the specific task's verified acceptance. `unknown` means insufficient
current evidence; it is not proof of failure. Retain history when reopening a
task and record why its old evidence no longer suffices.

## Significant activity event

Append one event per material dispatch, agreement, scope/authority change,
blocker, result, invalidation, integration, or handoff. A repeated notification
about the same event does not create new work or duplicate history.

```yaml
event_id: <stable event identity; bus message ID when applicable>
operation_id: <associated pending operation ID, or none>
occurred_at: <actual timestamp, or unavailable with reason>
actor: <observed identity>
task_ref: <affected task or group>
goal_contribution: <outcome served>
action: <what changed or was decided>
result: <observed result and uncertainty>
evidence_ref: <artifact and source/environment identity where relevant>
decision_reason: <constraint, tradeoff, or simplest fitting approach>
next_action: <owner and action, or none>
```

Keep detailed logs in authorized referenced files. Preserve decisions and
failed approaches needed for recovery, not every tool transcript. Never copy
credentials into records. Corrections supersede an event with a new event;
do not silently erase consequential history.

## Bounded assignment or coordination request

```text
assignment_id: <new unique dispatch ID, or existing task ID for coordination>
task_ref: <authoritative task; do not duplicate its whole plan>
group_contribution: <outcome this task serves>
objective_and_acceptance: <bounded deliverable and observable criteria>
authority_ref: <allowed actions, decisions, and limits>
owns: <paths/resources; exact exclusions>
prerequisites_interfaces: <required inputs and produced interface>
evidence_destination: <authorized report path or existing ledger receipt>
next_action: <needed action or decision>
```

Adapt an existing worker's receipt contract rather than replacing its native
role result. Otherwise request: assignment ID, observed identity, outcome,
evidence reference with state binding, blockers/residuals, and next action.
Keep the receipt concise; full analysis stays in its report. IDs join records;
they do not establish identity, independence, authorization, or source equality.

## Resume handoff

Reference the canonical record rather than duplicating its state. If it is
unavailable or contested, include the minimum goals, authority, ownership,
pending operations and evidence required for safe recovery, marked temporary;
do not overwrite or replace the contested authority.

```text
record_ref: <canonical record path and current revision>
next_safe_action: <specific action and owner>
wake_and_shutdown: <supported next wake; owned resource cleanup and limitations>
unrecorded_context: <minimum temporary recovery facts, or none>
```
