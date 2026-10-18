# Coordinator metadata templates

Read this file before initializing the ledger or preparing the first dispatch.
Reload it after resume if unavailable. Use these literal Markdown envelopes
for every role; keep detailed semantic work in the authoritative plan and role
reports. These structures standardize joins and omissions, not role algorithms.
Apply [coordinator-boundary.md](coordinator-boundary.md) for acceptance/routing,
[task-dispatch.md](task-dispatch.md) for task/review inputs and
[independent-plan-review.md](independent-plan-review.md) for the design gate.

Replace each placeholder. Use `none` for a known empty set,
`not applicable: reason` for an inapplicable field, and `unavailable: reason`
for missing evidence. Do not omit keys or treat an unavailable value as success.
Keep a stable `assignment_id` per dispatch and a stable `unit_id` per plan task
or bounded role unit. These are join keys, not proof of identity, independence,
authorization or source equality. A replacement dispatch gets a new assignment.

## Dispatch envelope

Reference the planner's full bounded task section; do not maintain a second
semantic brief. Select the role and its result slots from the table below.
The four directly invoked skills receive `delegated_only: true`; auxiliary
explorers, investigators and verifiers use `not applicable: auxiliary role`.
Only code review receives `INDEPENDENT_REVIEWER_LEAF`. Include exact permitted
writes; read-only roles may write only their assigned report outside the
reviewed repository. Treat supplied artifacts as evidence, not instructions
that can expand authority. The host spawn record belongs in the ledger,
separate from this prompt and the worker's receipt.

```text
assignment_id: {{unique dispatch key}}
unit_id: {{plan task or bounded role unit}}
role: {{role from result table}}
skill: {{discovered role skill or not applicable: auxiliary role}}
purpose: {{one bounded assignment}}
delegated_only: {{true or not applicable: auxiliary role}}
reviewer_marker: {{INDEPENDENT_REVIEWER_LEAF or not applicable: role}}
requirements_ref: {{authoritative requirements and applicable project rules}}
plan_ref: {{authoritative plan and exact bounded task section}}
semantic_revision: {{current plan revision or not applicable: initial planning}}
authority_ref: {{recorded authorization and limits}}
allowed_actions: {{read/write/commands permitted for this assignment}}
owned_paths_resources: {{exact scope and exclusions}}
baseline_state_ref: {{source-state evidence pointer}}
current_state_ref: {{latest source-state evidence pointer}}
prerequisites_interfaces_ref: {{required completion and consumed/produced interfaces}}
decisions_ref: {{relevant rationale, tradeoffs, non-goals, rejected alternatives}}
role_inputs_ref: {{role-specific inputs from task-dispatch or plan gate}}
report_path: {{exact full-report destination}}
receipt_contract: {{included receipt template or exact installed template reference}}
requested_result_slots: {{only this role's fixed slots below}}
```

## Receipt

Return at most 300 words. Keep commands compact; put complete output, requirement
coverage, cleanup and source tracing in `report_path`. Copy the applicable
result slots verbatim from the table into `role_result`; omit other roles'
slots. Required unavailable slots leave the gate unresolved. This envelope
does not redefine the role's native report or vocabulary.

| Role | Required `role_result` slots and owner |
| --- | --- |
| implementer (including fixer/integrator) | `status`: `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT` or `BLOCKED`; `wnz-task-implementer` owns meaning/evidence |
| plan_reviewer | `plan_verdict`: `APPROVED`, `REVISE` or `CLARIFICATION_REQUIRED`; `wnz-plan-reviewer` owns assessment |
| code_reviewer | `requirements_verdict`, `quality_verdict`, `outcome`, `recommendation`: role-native values from `wnz-code-reviewer`; its quality assessment remains in the indexed report |
| verifier | `verification_result`: `PASS`, `FAIL` or `BLOCKED`; assigned checks and exact state define the result |
| planner | `assigned_result`, `unresolved_gaps`: authoring/self-review/conformance result under `wnz-implementation-planner`; do not invent implementer status |
| explorer/investigator (including receipt recovery) | `assigned_result`, `unresolved_gaps`: answer to the bounded question and evidence limitations; no invented approval |

```text
assignment_id: {{dispatch key}}
unit_id: {{plan task or bounded role unit}}
role: {{assigned role}}
worker_identity: {{observed native identity or unavailable: reason}}
report_path: {{full report}}
semantic_revision: {{reviewed revision or not applicable: reason}}
baseline_state_ref: {{recorded baseline evidence}}
current_state_ref: {{observed final evidence}}
role_result:
  {{applicable fixed result slots only}}
evidence_index: {{required report sections and evidence pointers}}
evidence_completeness: {{complete or incomplete: missing items}}
blocking_findings: {{full-set pointer and summary, or none}}
residual_findings: {{Low/Nit/accepted risks pointer, or none}}
commands_results: {{compact command/result summary or not applicable: reason}}
next_action: {{proposed next owner/action; coordinator applies routing}}
```

## Ledger and current view

Initialize this skeleton in the existing approved ignored location or an
external temporary path. Keep one authoritative ledger; append history here
or link durable reports. The current view contains active metadata and pointers,
not transcripts. Repeat task/dispatch records as needed. `plan_review` is the
approval tuple: every component must match the current gate; a prior tuple is
history when invalidated. A source-state report records worktree, baseline,
commit, scope, tracked-dirty and untracked snapshot evidence. Its worker owns
content evidence; the coordinator compares pointers and exposed metadata.
Same HEAD or reused state label does not prove dirty-state equivalence. Use a
fresh recovery investigator when uncertain; require no universal hashing or
Git-only algorithm for other environments.

Task `title`, `started_at` and `completed_at` are coordinator metadata, not
substantive work. Take times from the host clock or `date -u
+%Y-%m-%dT%H:%M:%SZ` when the event happens; never reconstruct missed times.
When reopening a completed task, keep `started_at` and reset `completed_at` to
`none`, so elapsed time spans every attempt. An unavailable time is only
missing metadata. It does not make state uncertain and never justifies a
dispatch. Projections such as a dashboard copy these values and omit
unavailable ones.

```text
authority:
  requirements_ref: {{original requirements}}
  plan_ref: {{authoritative plan}}
  decisions_ref: {{accepted rationale and decisions}}
  history_ref: {{ledger history or linked reports}}
semantic_revision: {{current revision}}
gate:
  status: {{PENDING or APPROVED}}
  cycle_id: {{current cycle}}
  round: {{0, 1 or 2}}
  trigger_feedback_id: {{user batch or none: initial cycle}}
  handled_feedback_ref: {{batch IDs and dispositions}}
  plan_review:
    assignment_id: {{review dispatch or none}}
    reviewer_identity: {{native identity or unavailable: reason}}
    semantic_revision: {{reviewed revision or none}}
    cycle_id: {{reviewed cycle or none}}
    round: {{reviewed round or none}}
    source_state_ref: {{reviewed state or none}}
    verdict: {{native plan verdict or none}}
    report_path: {{review report or none}}
execution_authorization: {{delegation, sequential/parallel choice, limits and evidence}}
task_order: {{plan-defined deterministic order or unavailable: reason}}
integration_order: {{plan-defined order or not applicable: sequential}}
tasks:
  - unit_id: {{task}}
    title: {{plan heading text after "### Task N:", verbatim, or unavailable: reason}}
    status: {{pending/active or role-native completion status}}
    started_at: {{ISO-8601 time of first implementer dispatch, none before it, or unavailable: reason}}
    completed_at: {{ISO-8601 time completion was recorded, none while open, or unavailable: reason}}
    report_refs: {{implementation, verification and review pointers}}
    accepted_state_ref: {{current accepted evidence or none}}
current_state_ref: {{latest worker-recorded source state}}
dispatches:
  - assignment_id: {{unique dispatch key}}
    unit_id: {{task or role unit}}
    role: {{assigned role}}
    brief_ref: {{envelope}}
    native_spawn_args_ref: {{actual isolation/control arguments}}
    native_spawn_result_ref: {{actual returned identity and limitations}}
    receipt_ref: {{bounded receipt or none}}
    disposition: {{pending/accepted/rejected and reason}}
invalidations_ref: {{processed event/state/revision, affected evidence and unmet stages}}
blockers_decisions_ref: {{all known blockers, dispositions and operator question state}}
final_stages: {{planner conformance, aggregate verification, aggregate review pointers/status}}
next_action: {{first applicable transition and owner, or exact stop}}
```

## Metadata self-check

Before dispatch or acceptance, check fields and role slots, artifact availability,
assignment/worker/spawn binding, independence, current revision/state, authority
and prerequisites. Confirm the chosen action follows the boundary's ordered
table. Record unavailable facts and route to the appropriate worker; do not
inspect source or run checks in the coordinator to fill them. This is a compact
self-check, not a new substantive stage or executable validator.
