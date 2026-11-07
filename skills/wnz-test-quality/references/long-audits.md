# Resumable semantic audits

Use this protocol when a repository audit spans turns or workers repeatedly
return partial work. Keep focused test tasks lightweight. Preserve the user's
depth, model and execution selections from the audit ledger; this protocol
does not authorize model substitution, runtime collection, fixes or execution.

## Separate controller work from semantic review

The controller owns the immutable revision, inventory, dispatch, artifact checks
and exact remaining membership. A qualified independent reviewer owns semantic
assessment under the skill's required routing contract. A scanner or successful
ledger check cannot approve test quality.

Start with one module or a bounded named section of a large file. Include its
fixture/setup and production dependencies, plus pointers to shared CI-selection
evidence. Grow batches only after observing useful completed assessments. A
model being available does not establish exhaustive-review capacity; repeated
partial returns do not establish that another model is stronger.

## Read through a reliable, bounded channel

Read required instructions fully before affected assessment, in bounded chunks
that fit the tool's output limit. Apply the same approach to source and reports.
Printing a file into redirected output, requesting more than the channel can
return, or receiving a pending process ID does not mean its contents were read.
Poll pending operations using the returned handle. If output is lost or
truncated, replay the missing range before advancing its acknowledged cursor.
Keep replay idempotent; do not skip unread content or mark it assessed.

Use explicit file/range cursors and source hashes when reads span turns. Record
whether offsets count bytes, characters or lines. An emitted-range receipt
proves delivery and provenance only, not comprehension or a semantic decision.
Check the actual interpreter/parser used by each tool transport. Pin a suitable
available executable when resolution differs; syntax or capability errors are
inventory gaps, not evidence that tests are absent. Do not import project code
to repair a static-only inventory.

## Checkpoint the review while it is unfinished

Persist a semantic entry after each assessed ID or small coherent group. Record
its behavior, oracle, fidelity, distinct protection and disposition as required
by the audit ledger. Keep shared setup/selection evidence once and refer to it.
Separate source-read progress from completed assessments; reading every body
does not by itself cover every ID.

A planned worker turn may end while the initial review pass remains
`in_progress`. Preserve the same qualified reviewer's context, immutable source,
assignment and exact next action when continuing that unfinished pass. Do not
give it author feedback or ask it to approve fixes. This is continuation of one
pass, not reuse for a later review. A finalized incomplete report, fix review,
dispute or independent validation requires a fresh native reviewer under
`wnz-independent-review`; do not relabel a final outcome to evade freshness.
If the host cannot continue the unfinished pass, use that fresh routing path.

Record the actual stop reason: planned checkpoint, voluntary early return,
missing prerequisite, tool failure, or a surfaced host limit. Preserve a host
error when one exists. Do not infer execution-budget exhaustion from an agent's
partial report or unsupported claim. Return useful assessed entries even when
the rest remains unresolved; never manufacture a completed verdict.

## Reconcile complete sets, not the current page

Use the full immutable inventory as the expected membership. Check artifact
types, revision, scope, evidence, duplicates and unexpected IDs. Derive exact
remaining IDs as expected minus semantically assessed IDs. Reject a summary
string in place of an ID array and reject a remaining list computed from only
the current metadata page. Equal totals can conceal omissions and duplicates.
Persist the verified checkpoint and next unit before dispatching more work.

For provisional source IDs, retain visible parameter families and input
partitions explicitly. Reconcile discovery false positives and generated cases
with source/configuration evidence; record unresolved dynamic expansion rather
than inventing exact runtime IDs. Static-only assessment may finish with runtime
collection, execution and environment gaps clearly stated. Missing execution
does not automatically leave every static assessment unfinished, and completed
static membership never proves that CI executes those assertions.

Accept a batch only after opening its final artifacts and validating membership
and semantic-entry completeness. Independent validation, when required by the
owning workflow, must assess findings and uncovered scope through fresh routing;
controller checks are not that gate. Keep the whole repository audit incomplete
until its full selected scope is reconciled, even when a trial batch succeeds.
