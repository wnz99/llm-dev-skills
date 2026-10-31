# Coordinator and worker boundary

Read this reference in full before exploration, planning, dispatch or resume.
The main session coordinates; fresh workers perform substantive work. Keeping
source analysis and execution in workers prevents accumulated task context from
becoming an unreviewed source of requirements.

## Responsibility routing

The coordinator owns user communication, authorization, scheduling, dependency
and gate transitions, artifact pointers and the authoritative progress ledger.
It reads bounded receipts and report indexes to check metadata and completeness.
It does not read full source, diffs, command logs, transcripts or detailed
reports, author semantic plans, run verification, adjudicate source facts,
resolve conflicts or implement fixes.

| Work | Fresh worker and contract |
| --- | --- |
| Clarification interview and confirmed user decisions | Coordinator using discovered `wnz-grill-me` after consent; substantive source research stays in fresh workers |
| Source exploration, plan authoring/revisions and self-review, final plan conformance | `wnz-implementation-planner`; bounded read-only explorer when additional evidence is needed |
| Implementation, documentation, fixes and integration/conflict edits | `wnz-task-implementer`; include approved integration order and covering checks in integration brief |
| Independent plan verdict | `wnz-plan-reviewer` |
| Task, fix and aggregate requirements/quality assessment | `wnz-code-reviewer` with `INDEPENDENT_REVIEWER_LEAF` |
| Missing, stale or suspicious verification; cross-task and final verification | Read-only verifier with exact checks, state boundary and assigned evidence report; return `PASS`, `FAIL` or `BLOCKED` |
| Contested source facts or `Cannot verify` | Read-only investigator with bounded question, source boundary and assigned evidence report |

Use the required skills' existing substantive contracts. Do not add a separate
controller requirements-check stage: implementer self-review and the independent
reviewer's requirements verdict already own that work. Fresh implementer checks
suffice before review when evidence is current and complete. Read-only workers
may write only their exact assigned evidence report outside the reviewed
repository; source, plan, ledger and other external state remain read-only.

## Fresh-context preflight

Every substantive dispatch creates a new worker identity without inherited
conversation, including revisions, fixes, investigations, integration, evidence
corrections and final checks. One assignment covers a meaningful task and all
its internal micro-steps. Never reuse, resume or send a followup to an existing
worker for another assignment, even when it requests context or its model
already matches the desired role. Supply missing context in a new bounded brief.

Check the actual native host tool schema and documented isolation behavior.
On the current Codex surface, call `spawn_agent` with explicit
`fork_turns: "none"`; omission defaults to inherited history. This is a current
host example, not a universal Codex/Claude API. Record actual spawn arguments,
response identity, selected controls and limitations in the ledger. A prompt
saying "fresh" or a worker attestation is not spawn evidence. On other hosts
use only exposed, documented non-inheriting controls; invent no flags or metadata.

Always pass `delegated_only: true` to the four directly called worker skills. The
worker checks native runtime-injected subagent identity under its own input
contract. A marker, copied task path or coordinator assertion cannot establish
that identity. Keep `INDEPENDENT_REVIEWER_LEAF` as the separate recursion control
for code reviewers. Native child identity alone does not prove non-inheritance;
the coordinator must also check the spawn record. Visible inherited parent
turns block delegated-only work; their absence alone proves nothing.

If a new non-inheriting worker cannot be started or reliable required identity
is unavailable, block affected substantive work. Capacity exhaustion is not an
inline fallback. Recover existing scheduling metadata and explain the blocker;
do not perform the worker's work in the main session. These are drift controls,
not an adversarial security boundary.

## Artifacts and bounded receipts

Use the existing authoritative plan, ledger and role reports. Workers read
source and assemble detailed review evidence in files, not coordinator context.
Read [coordinator-templates.md](coordinator-templates.md) before initializing
the ledger or first dispatch; reload after resume when unavailable. It owns
the canonical dispatch, receipt and ledger structures, stable keys, explicit
absent values and role-specific result slots. Require a receipt of at most 300 words.
Do not supply the full conversation or accumulated task history. Preserve
relevant rationale through authoritative decision pointers in the envelope.

Complete requirement coverage, commands/output, cleanup evidence and trace
analysis belong in the full role report. Spawn settings/result remain separate
coordinator ledger evidence. A completeness assertion is not independent review.
Missing evidence cannot become `DONE_WITH_CONCERNS` or approval through formatting.

For an oversized or malformed receipt, do not quote, ingest or summarize the
full report. Dispatch a fresh bounded worker to recover a compliant receipt
from existing artifacts. If evidence itself is absent, dispatch substantive
role work rather than superficial repackaging. If the host already injects an
oversized result, record the breach, stop repeating it and enforce the next
receipt. Do not create a mandatory packaging stage or an artifact per checkbox.

## Metadata acceptance and resume

Before a gate transition check receipt shape, required fields/verdicts, artifact
availability and identity, worker independence, semantic revision and source
state against the ledger. Missing, inconsistent or contested evidence requires
a fresh bounded worker, not coordinator source inspection. Never turn an
incomplete index into substantive approval or downgrade findings locally.

Bind evidence to worktree, baseline, commit and scoped dirty/untracked snapshot
evidence in the existing reports; HEAD alone cannot identify a dirty tree.
Integration/conflict edits invalidate affected checks and reviews, subject to
[GSD and flow documentation follow-ups](#gsd-and-flow-documentation-follow-ups).
Otherwise require fresh verification and independent review of the resulting
state. A recorded no-op
integration may reuse unchanged evidence with demonstrated identity; cross-task
checks still run. The coordinator schedules integration and records its outcome;
the integration worker performs merges, conflict resolution and checks.

On resume recover the canonical ledger's current view and authority pointers. Keep the
active view task-scoped; archive detailed history through pointers. A fresh
recovery investigator reconciles uncertain state against Git and source. Do not
replay `DONE` work, accept a summary-only approval or promote implementation
assumptions into requirements. If authoritative artifacts are missing, keep
dependent gates unresolved. Growing requirements and decisions preclude a
constant-context-size guarantee.

## GSD and flow documentation follow-ups

A completed independent code review and its valid test evidence remain usable
when the subsequent delta contains only GSD tracking or flow documentation and
the reviewed executable code, configuration and tests remain unchanged. Validate
the changed documentation, references and status consistency; record the prior
reviewed commit, current head and scoped dirty/untracked state, inspected delta,
code-equivalence evidence and reused review/test receipts in existing reports.
Do not dispatch another independent code review solely for this delta or claim
that the new head itself was reviewed.

Functional code, configuration or test changes require affected fresh checks
and review. Markdown carrying material behavior, security or authorization
changes is not exempt. This exception does not waive missing initial task or
aggregate reviews, unresolved findings, material semantic plan-review gates,
required cross-task checks, or provider CI/status and merge requirements.

## Ordered transitions

At each event, first normalize metadata: record changed user authority; deduplicate
new user feedback against handled batches; immediately invalidate old approval
and open the new cycle for a genuine new batch under the
[plan gate](independent-plan-review.md#user-annotations-and-clarification-answers).
Record all known blockers and invalidations even if no dispatch is possible.
Record each invalidation once by event plus affected revision/state and evidence;
mark its checks/reviews unmet. Do not keep selecting the same stale receipt or
change event after recording it. Select the first applicable unmet action below
from the updated current view. Conflicting events use this order; choose one next
action, retaining other blockers. A new event causes normalization again.

Every proposed dispatch must pass all authority, required-skill, explicit-model,
fresh-identity/isolation, independence, capacity and prerequisite checks. A higher
priority action cannot bypass those checks. Block its dependent work and report
the exact blocker rather than choosing a lower-priority dependent dispatch.

| Priority | Condition in updated current view | Next existing action and owner |
| --- | --- | --- |
| 1 | User interrupted or revoked required authority | Stop affected work; record limits. |
| 2 | Required authority artifacts conflict/are missing, or resumed/source state is uncertain | Fresh bounded recovery investigator when preconditions hold; otherwise exact blocker. Keep review cycle/round. |
| 3 | Selected role lacks authority, required dependency, explicit control, isolation/identity, independence or capacity | Block affected role under fresh-context preflight and [model policy](model-policy.md); no inline substitute. |
| 4 | Current assignment has unresolved receipt/report packaging gap for otherwise existing evidence | Fresh receipt-recovery investigator under bounded-receipt policy; missing analysis instead returns to its substantive owner. No approval from repackaging; superseded assignments remain history. |
| 5 | Plan gate pending, including initial planning, material requirement gaps or normalized new user feedback/semantic revision | First handle a planner's `CLARIFICATION_REQUIRED` through [pre-plan clarification](../SKILL.md#pre-plan-clarification); wait for required user decisions before dependent drafting. Otherwise follow planner/self-review/independent review sequence in [plan gate](independent-plan-review.md). Preserve Round 2 terminal stop and ask operator once; no Round 3. Resolve plan-bound evidence gaps within this gate before further design review. |
| 6 | Approved plan's task or integration order is missing/contradictory | Fresh planner corrects ordering through existing semantic gate; coordinator invents no tie-breaker. |
| 7 | Active implementation reports NEEDS_CONTEXT or BLOCKED | [Status contract](../SKILL.md#implementer-status-contract): new bounded role with changed input, or operator for unresolved product/access choice. |
| 8 | Active task/integration lacks current required verification | Fresh verifier for missing/stale/suspicious evidence under [task dispatch](task-dispatch.md#fixes-investigations-and-evidence-gaps); no duplicate verifier for complete fresh implementer checks. |
| 9 | Active task/integration review is absent, incomplete, cannot verify facts, or has blocking findings | Fresh full-scope reviewer, investigator or full-set fixer under [task loop](../SKILL.md#task-loop), then fresh full-scope review. Missing substantive analysis never becomes a packaging-only fix. |
| 10 | Active task has current complete evidence and clean independent verdicts; completion not yet recorded | Record completion before selecting work. Never redispatch DONE. |
| 11 | Approved parallel outputs are task-reviewed and ready to integrate | Fresh integration implementer in plan-declared order, regardless of arrival order; cross-task checks and affected review under [parallel execution](task-dispatch.md#parallel-wave-execution). |
| 12 | Prerequisite-ready uncompleted tasks remain | Next task in plan-defined order, or approved isolated wave under [execution controls](../SKILL.md#subagent-execution-control). |
| 13 | No task/integration remains; final evidence stages unmet | Fresh planner conformance, aggregate verifier, aggregate reviewer in [final completion](../SKILL.md#final-completion) order. Final findings use full-set fixer and fresh aggregate re-review; fixes invalidate affected final checks/conformance. |
| 14 | All required stages are accepted for final integrated state | Summarize current evidence and residual risks under final completion. |

Source/integration edits outside the documentation follow-up exception mark
affected checks and reviews unmet during normalization; rows 8–9 or the relevant
final stage repair them once. A proven
no-op may retain evidence only under the state-equivalence policy above, with
cross-task checks still required. An old approved receipt cannot close a newly
opened feedback cycle. Unavailable evidence never consumes, resets or extends
the plan review cap silently.

Redispatch a failed recovery or blocked assignment only with new input, corrected
scope, changed environment or restored capacity. Otherwise report the smallest
blocker; identical fresh-worker churn is not progress. This adds no routine
approval gate and no numerical cap to the code-review fix loop.
