# Agent coordinator validation

Recorded 2026-10-23 for the new
[wnz-agent-coordinator](../skills/wnz-agent-coordinator/SKILL.md) package.
The baseline repository commit was `f5ab940`. This report separates package
checks, simulated behavior, and independent review from live orchestration.

## Scope and design

The skill coordinates existing independent workers while preserving each
worker's goal, the group's acceptance criteria, and existing workflow authority.
It includes fixed activity/assignment/handoff templates, simplicity and drift
checks, narrow ownership/reservations, durable pending operations, recovery,
and an optional bus guide. It adds no runtime, daemon, dashboard schema,
mandatory sibling skill, or automatic installation.

The source catalog, installation handbook, and existing package test lists
include the new skill. Its optional executor/reviewer handoffs use host skill
discovery and stop only the affected handoff when dependencies are missing.
The bus guide's command forms were checked against installed `llm-bus` help;
no test messages or remote operations were sent for this validation.

## Executed checks

| Check | Observed result | Limit |
| --- | --- | --- |
| Repository unittest suite | 30 tests passed | Structural/package protection, not instruction enforcement |
| PyYAML parser | Frontmatter, current-view template, and generated probe YAML parsed | Parser validation does not prove task correctness |
| Isolated package copy | Runtime references contained and reachable; fences and prose hierarchy checked | No installed-client discovery claim |
| Recovery regression mutation | Removing `pending_operations` from an isolated copy caused the guard to fail | Source was not mutated |
| Scenario evaluation, initial candidate and baseline | Both met author-assessed outcome rubrics on 12 prompts | One response per condition; six behavior cases and six scope classifications |
| Final candidate/baseline repeat | 12 responses per condition inspected; no demonstrated comparative gain | Reused evaluator contexts, not independent statistical trials |
| Final record artifact probe | Unknown merge effect survives in canonical current view before handoff; event/operation joins parsed | Fictional scenario, not a real crash or remote merge |
| Missing durable location probe | Read-only work continues; dependent effects wait; temporary handoff does not claim durability | Supplemental probe, not yet a separate packaged eval |
| Whitespace check | `git diff --check` passed | Formatting only |

The six behavior scenarios cover dependency/interface drift, peer-derived live
authority, duplicate notifications, ambiguous merge effects, unavailable bus or
executor, stale ownership, narrow resource waits, remote delivery states,
invented backlog, repeated failures, and contested coordinator ownership.
Scope decisions include two positives and four realistic non-triggers.
Candidate scope decisions used frontmatter; baseline decisions had no candidate
metadata. Neither is a native host activation measurement.

Local authoring artifacts are under `/tmp/wnz-agent-coordinator-workspace/`:
initial and repeated decisions, grading evidence, source hashes, generated
record probes, and standalone evaluation viewers. They are not installed
runtime dependencies. Timing and token measurements were unavailable from
native delegation notifications and are not asserted as zero or estimated.
Broad rubrics passing equally in both conditions do not establish improvement.

## Independent Claude review and changes

The user requested a fresh Claude review through `wnz-llm-assist`. Both passes
resolved to `claude-opus-5-5`, used read-only review, and did not edit source.

R1 found a Medium mismatch: instructions required recovery of ambiguous
operations, but the fixed current view lacked a pending-operation field.
The correction adds stable operation IDs, intent, owner, observed effect,
evidence, and inspection-before-retry; events join to operations. Intent is
persisted before issuing the external effect, and the handoff references the
canonical record instead of duplicating it. A regression guard, mutation check,
and actual generated record probe cover that correction.

R1 also disclosed blocked reads of installed review dependencies and used
repository copies, so it was not counted as a fully conforming approval.
R2 received the host-discovered installed reviewer/dead-code skill contents
and applicable references verbatim. It reviewed the full package and integration
changes: Requirements Met, Quality Approved, no High/Medium findings. It
confirmed the previous Medium resolved and found no dead package artifacts.
The reviewer did not rerun author checks or exercise live bus behavior.

Optional Low suggestions remain recorded rather than becoming extra gates:

- Clarify the pointer to an executor-owned ledger when an optional handoff
  starts a new executor run. Existing rules already preserve workflow authority
  and prohibit duplicate execution ledgers.
- Make the contested-record fallback explicit for suspected concurrent writers
  without compare-and-replace. Existing takeover rules already block dependent
  writes until ownership is established.
- Promote the supplemental missing-location probe into a packaged eval case.
- Recheck bus behavior if CLI versions change; the guide already requires
  discovery/help and distinguishes transport receipts from task success.

No sustained unattended run, live remote bus exchange, deployment, skill
installation, or native negative-host enforcement was performed. Native
evaluation agents completed; this host exposed no close/shutdown control, so
resource closure is not claimed. External review invocations exited and their
private prompt/stream/result files were removed by invocation cleanup.
