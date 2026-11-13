# {{FLOW_ID}} — {{TITLE}}

## Outcome and scope

State the observable outcome and boundaries. Define requirements once with stable
R IDs; distinguish observed facts, recommendations and approved scope.

## Acceptance criteria

Define A IDs with observable behavior and sufficient proof, referencing R IDs
and owning tasks. Reuse evidence in DISCOVERY or existing reports.

## Approach, contracts and decisions

Explain responsibilities, reuse and material tradeoffs. Define public/data/cross-task
contracts once with C IDs, including security, compatibility, migration order and
rollback when applicable. Resolve design-invalidating unknowns before approval.
Record human decisions and routine implementer discretion.

## Tasks and dependencies

Use compact deliverable, ownership, dependency, consumed/produced C IDs,
safeguards, cleanup obligation and A IDs for each task. One task needs only a
sequential-order sentence; use wave tables when ordering/concurrency warrants.
The installed wnz-implementation-planner template owns the full contract.

## Self-review receipt

Record revision, checks, gaps and evidence pointers. Keep detailed history and
results in existing reports. The existing implementer prepares routine exact
commands/tests/private details near dispatch; no extra prep agent or gate.
