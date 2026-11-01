---
name: wnz-independent-review
description: Route reviews of any kind through fresh independent native sub-agents before substantive assessment. Required by review skills and controllers for code, plan, simplicity, document, and follow-up validation reviews. Does not perform domain review, implementation self-checks, or choose models.
---

# Independent Review

## Scope

This skill owns routing and context isolation only. Apply the domain skill for
analysis, model controls, read-only boundaries and existing verdict/report slots.
Author self-checks remain useful but cannot supply independent approval.
No skill dependencies are required by this routing package.

## Route before assessment

Before substantive assessment, determine the current assignment from actual
native runtime identity and context. A root/controller dispatches a bounded
review child; a child qualified for this exact review executes locally.
A child author, fixer or controller is not a qualified reviewer merely because
it is a child. Helpers within the same qualified review do not recursively
dispatch the review again.

Use a fresh native identity for every later fix review, validation review,
disputed-finding assessment or replacement of an incomplete report. Do not
resume or send follow-up work to the previous reviewer. Close completed workers
through supported host controls; if none exist, disclose that limitation.

## Parent evidence

Use native collaboration with no inherited author/controller conversation.
On Codex pass `fork_turns: "none"`; on other hosts use a documented equivalent.
Record the actual spawn arguments and returned identity/result using existing
evidence metadata or report pointers. A prose promise of freshness is not proof.
Check that the successful dispatch establishes the requested isolation and
assignment. Do not invent runtime APIs, IDs or evidence fields.

Supply only bounded requirements, current artifact/revision and baseline/diff
pointers, applicable rules, verification evidence and qualified prior report
pointers. Exclude author reasoning, preferred conclusions, severity hints and
conversation history. Prior reports are evidence pointers: the new reviewer
qualifies per-area unchanged evidence under the domain's reuse rules and reads
fixes, affected contracts and uncovered scope fresh.

## Child evidence

Before substantive review, check native runtime-injected child identity,
assignment and absence of inherited parent history. Visible inherited history,
unknown identity or isolation, and unsupported runtime evidence leave review
incomplete. Absence of visible parent turns alone does not prove isolation;
the parent separately validates actual spawn arguments and result.
`INDEPENDENT_REVIEWER_LEAF`, `delegated_only: true`, copied task paths and
controller attestations are routing hints, never identity or isolation proof.

## Fail closed

If native capacity, isolation, required dependency or identity evidence is
unavailable, stop affected review and report the limitation through the domain's
existing incomplete/non-approval outcome. Never perform root/inline review as
a fallback. A known unsafe invocation may be rejected before loading a missing
dependency. A request to avoid delegation cannot produce independent approval.
A fresh external-provider perspective may help a qualified native review child;
external CLI execution alone never replaces the native child requirement.

Keep task IDs, times, receipts, verdict slots, ledger shapes, schema versions
and plugin behavior unchanged. Attach evidence through existing metadata only.

Missing dependency is a prerequisite failure, not semantic plan feedback or a
completed review. Preserve existing verdict slots while naming the incomplete
assessment and missing input; never fabricate a completed gate.

## Authoring checks

When changing routing, run [evals/evals.json](evals/evals.json) capability,
adversarial and metadata-only activation cases. Distinguish simulated decisions
from observed native spawn/isolation evidence.
