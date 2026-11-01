# Executor complexity drift investigation

Recorded 2026-10-17. Audience: skill maintainers and execution controllers.
Purpose: preserve the smallest complete design through long task sequences and
context restoration without weakening safety or adding another approval stage.

## Evidence and attribution

The Sam workspace incident was inspected read-only in the roam-ai primary
planning directory, the controller's external revision-2 backups/task reports,
and the feature worktree. These external artifacts are incident evidence, not
runtime dependencies of any skill. They contain planning and synthetic-check
claims; those claims were not independently rerun against roam-ai.

| Evidence | Finding |
| --- | --- |
| Revision-2 `PLAN.md`, high-level design and Task 6 | The plan equated removal of aggregate FAQ ceilings with streaming access. It explicitly required a derived SQLite lookup, custom lexical/hash handling, and online activation with generations, leases and CAS. Complexity was already planned before execution. |
| Revision-2 discovery and current revision-3 `DISCOVERY.md` | No demonstrated constant-memory, huge-bank or zero-downtime requirement justified that architecture. The recorded pilot was 96 FAQs, with hundreds/thousands anticipated. |
| `FLOW.json`, simplicity history and reviews | The earlier simplicity pass removed a second format while retaining the streaming/cache premise. Revision 2 was approved; Tasks 1–4 received clean task reviews. Local conformance did not establish whole-system proportionality. |
| Interrupted Task-6 dirty `bank_activation.py`, `_publish` | Backup restoration after replacement/fsync failure elaborated the chosen online-activation contract. Removing the unnecessary online mutation eliminates that recovery obligation; deleting safety handling while keeping that contract would not be equivalent. This was unfinished source, not a released contract. |
| Task-3 report and Task-6 brief | Reports preserved pending-generation/polling state and bank-generation/lease interfaces as downstream obligations. The brief demanded implementation of approved architecture. An implementer could comply and still compound total complexity. |
| Current revision-3 plan and FLOW approval | Startup JSON/Pydantic plus ID map, existing batch16/full verification, admin publication/coordinated restart, awaited generation and durable one-shot send receipts replace those mechanisms. FLOW records approval; planning headers retained their earlier halted state. |

The controller acknowledged accepting unsupported streaming/cache implications
and allowing local safety additions to compound. Existing planner, implementer
and reviewer instructions already rejected speculative layers. This was partly
failure to apply existing guidance, not absence of KISS guidance.

The controller also reported that compacted handoffs preserved mechanisms as
obligations. No compaction transcript or chronology was independently inspected.
Compaction is therefore a supported amplification risk, not a proven origin of
the incident. The approved revision-2 plan demonstrates an earlier mistake.

## Focused changes

- The executor keeps relevant rationale, workload, accepted tradeoffs, non-goals
  and rejected heavier alternatives in its existing plan/ledger. Resume restores
  these alongside requirements and progress; a summary cannot promote an
  assumption into a requirement.
- Existing task checks examine cumulative machinery across the affected flow.
  Dispatch carries bounded rationale and adjacent contracts without the whole
  transcript or a broader review target.
- Finding triage separates the violated invariant from a reviewer's suggested
  mechanism. Reuse, deletion or native facilities may fix the same failure.
  Semantic changes still use the existing plan workflow.
- Implementer and code-review guidance trace the invariant's owner before adding
  custom state or recovery. They retain security, concurrency, data integrity,
  supported compatibility and genuine resource constraints.

No new required skill, ledger schema, complexity score, scheduled review,
publication action or blanket approval gate was added. Planner and plan-reviewer
packages were left unchanged because their existing contracts already cover
unsupported architecture; executor handoff/enforcement needed the narrower fix.

## Evaluation method

Baseline: commit `c578e99`, with the three affected skill packages copied before
editing. The new [scenario set](../skills/wnz-phase-executor/evals/evals.json)
exercises controller, implementer and reviewer decisions, including metadata-only
trigger/non-trigger classification. Separate fresh native Codex contexts receive
baseline or revised packages and the same prompts without expected outcomes.
Cases run sequentially inside each condition's context, not in a fresh context
per case; cross-case influence remains possible.
The scenarios simulate workflow decisions; they do not execute a production
plan or a native context-compaction event.

An initial pair accidentally read expected-output fields and was interrupted.
Only replacement contexts receiving a prompts-only file count as evaluation
evidence. Raw outputs, per-assertion evidence and static review viewers are
retained under `/tmp/llm-executor-evals/` outside the repository.

## Observed results

An independent grader assessed concrete decisions against the same rubric for
both conditions. These small counts measure scenario answers, not production
success or statistical confidence.

| Run | Baseline assertions | Revised assertions | Observation |
| --- | --- | --- | --- |
| Initial 10 paired cases | 34/38; 7/10 wholly passing | 37/38; 9/10 wholly passing | Revised handoff/flow checks were more explicit, but one response incorrectly called proposed restart downtime already accepted. Both versions passed modest-bank reuse, genuine bounded-memory need, durable send protection, missing dependency and activation cases. |
| Fresh targeted followup: resume and reviewer recovery detection | 9/12 | 11/12 | One sentence now distinguishes assumptions/proposed tradeoffs from recorded decisions. Revised resume no longer invented acceptance and preserved rationale/non-goals/rejected alternatives. Revised reviewer routed the architecture conflict to the controller's existing plan gate. |

Both followup resume responses omitted the rubric's concrete startup-bank,
ID-map/coordinated-restart candidate. They challenged unsupported architecture
and returned design correction to the planner instead. This is a recorded
specificity miss, not evidence that either executed the simpler design. No
all-cases-passing claim is made. The baseline already made sound lean choices
in most scenarios; these runs support explicit context retention and triage,
not a claim that earlier guidance had no simplicity controls.

A separate fresh context exercised 33 bounded review/implementer regression
decisions, including the review reference's six required scope/contract cases,
delegation/authority boundaries, four existing implementer cases, unsafe send
simplification, and unwanted recovery across adjacent task diffs. All matched
the stated contracts in simulation. The recovery case identified a startup
model rerun after response loss and restored the awaited contract while
preserving actual worker/budget ownership. Literal in-memory Python executions
also reproduced stale-caller `KeyError`, unhandled error propagation, aliased
state and stale verification; these are miniature fixtures, not application
integration tests. Full decisions are in `regression-decisions.md` under the
external results directory.

Package verification:

- `python3 -m unittest discover -s tests -v`: 21 tests passed.
- PyYAML parsed all three affected packages' frontmatters. All 21 package
  Markdown files passed contained-relative-link, fence and prose/XML checks.
- Evaluation JSON parsed with 11 unique cases, valid roles, required fields and
  fixture paths. Declared dependencies and host discovery/missing-dependency
  behavior remain unchanged; the scenario checks missing required cleanup.
- `git diff --check` passed. No executable source was removed. Existing
  activation/dispatch/analysis links still reach each changed behavior; new
  evals are linked from executor maintenance and this report from README.

Only Codex-host simulations were run. Evaluator model/effort identities were
unexposed; requested policy defaults were not claimed as enforced. Timing and
token measurements are unavailable. Native compaction, a complete long-running
implementation, actual side-effect failure recovery and Claude-host behavior
remain untested. The change reduces known guidance gaps; it cannot guarantee
that a controller will obey them.

## Controller action

Keep revision-3 tradeoffs and rejected mechanisms in current task briefs and
resume handoffs. Preserve required content approval, exact send authorization,
unknown-send blocking, worker/budget ownership and complete index verification.
Report genuine safety defects even when a heavier alternative was rejected.
Do not replace installed skills mid-execution; this change only edits the
llm-dev-skills source worktree. No roam-ai or installed skill was modified.

## Verification sequencing update — 2026-10-24

The Itemsbase session `01a16f18-7577-77e3-8f87-2cea149ee2cd`
spent nearly two hours preparing and repairing a runtime fixture before any
product fix. Its planner made baseline convergence a prerequisite for all
fixes; simplicity and independent plan review accepted that dependency. Native
setup, a shared Maestro session/port collision and fixture defects then blocked
all product work. This attribution comes from the session transcript, planner
and review reports, and feature commit history; the app behavior was not rerun.

The planner now distinguishes evidence needed before editing, at task completion
and at final acceptance. Prerequisites identify a consumed interface or unresolved
fact preventing safe implementation. Plan reviewers challenge unsupported
dependencies; simplicity review includes cumulative preparation cost. The
executor routes repeated tooling failures to a bounded dependency reassessment
through the existing plan gate. Implementers report the blocked assertion and
use affected checks after harness changes. Preservation, authorization, replay
safety, genuine diagnostic/interface prerequisites and required acceptance proof
remain binding. No dependency, ledger schema or approval stage was added.

### Checks and observed behavior

Five packages changed: `wnz-implementation-planner`, `wnz-plan-reviewer`,
`wnz-plan-simplicity-review`, `wnz-task-implementer` and `wnz-phase-executor`.
The added cases live in each package's existing `evals/evals.json`.

- Two fresh Claude CLI contexts compared baseline `0026c73` with the initial
  revision on ten prompts and ten metadata-only activation decisions. Expected
  outcomes were withheld. Both selected the intended sequencing and safety
  actions; this comparison does not demonstrate an improvement over baseline.
- Independent Claude review applied `wnz-code-reviewer` and `wnz-dead-code`
  read-only. It found a conflict with the existing review-cycle cap, missing
  diagnostic-prerequisite coverage, an expected-verdict mismatch when source
  evidence is unavailable, and the initially missing verification record.
  Corrections preserve the cap/operator rule, add diagnostic/interface cases,
  distinguish incomplete assessment from known findings, and record results.
- Suggestions incorporated: planner-owned dependency judgment, no implementation
  during a pending plan gate, standalone blocker routing, and rerunning checks
  that depend on changed fixtures.
- A second independent Claude review identified a remaining in-worker repair
  loop: escalation covered expansion but not repeated in-scope repairs. The
  implementer now returns `BLOCKED` when corrected attempts still fail without
  new diagnostics or repeated setup repairs prevent product assertions. Added
  regression coverage for that handoff and standalone diagnostic prerequisites.
- A final fresh Claude simulation answered all 15 added cases consistently
  with their expectations, including unknown-root-cause diagnosis, consumed
  interfaces, preserved safety gates, bounded harness work and exhausted Round 2.
  Its ten description-only activation decisions matched expectations. The author
  compared complete responses against the independent expected-output fields.
- `python3 -m unittest discover -s tests -q`: 29 tests passed. Package checks
  cover contained relative resources, fences, dependency declarations/discovery
  instructions and missing-dependency stop rules. PyYAML-backed skill validation
  passed all five packages; evaluation JSON and unique case IDs parsed.
- `git diff --check` passed. No runtime source, scripts, exports, dependency
  declarations or resource links were removed or orphaned. The existing planner
  template and review/implementer entrypoints reach the changed instructions.

### Limits

These are single-run Claude scenario simulations, grouped by condition rather
than isolated per case. They do not execute a full implementation, native skill
activation, missing-package installation, device tooling or production recovery.
No comparative performance improvement, cross-host behavioral equivalence or
statistical confidence is established. The last wording corrections received
behavior checks rather than a third independent package review. Provider model/effort controls were not
overridden; no runtime identity claim is made. Temporary prompts and provider
streams were consumed in full and removed by invocation cleanup.

## Bounded execution and merged-contract checks — 2026-11-01

After merging the native-review routing changes, six new plan-reviewer and
simplicity prompts now establish the same qualified-child scenario as their
existing substantive cases. That wording describes a scenario; actual native
identity and parent-observed non-inheritance remain necessary for real review.

A fresh native Codex worker received the revised packages and eleven prompts
without expected outputs. A separate fresh worker received only frontmatter
metadata and ten activation queries. Actual spawn calls used `fork_turns: none`,
requested `gpt-6.1-sol` with medium effort, and returned distinct native worker
identities. Resolved model identities were unavailable. The controller retained
the invocation records and complete responses outside the installed packages.

| Cases | Observed decisions |
| --- | --- |
| Planner 26–27 | Reused sufficient parser coverage and native tooling; added a regression for the duplicate-ID gap and retained authorization-denial coverage despite pressure to skip it. |
| Executor 41 | Left private helper naming to the worker; returned a consumed-interface change through the existing planner/review gate; rejected an extra checker, ledger and approval stage. |
| Implementer 15–16 | Kept supporting work within acceptance criteria, reported unrelated defects without expanding scope, stopped unnecessary reruns, retained referenced evidence, and required affected checks after a new edit. |
| Plan reviewer 13–15 | Challenged the unsupported blanket harness prerequisite, retained safety and diagnostic/interface prerequisites, and reported missing source/cleanup evidence without approval. |
| Simplicity review 10–12 | Suggested regression-first sequencing where safe, retained authorization/snapshot and bounded diagnostic prerequisites, and kept source-dependent advice conditional. |

Metadata classifications activated the six plan/execution/review requests and
excluded four authoring-versus-review near misses. These are description-based
decisions, not observed client discovery. The behavior worker answered the
eleven cases sequentially in one context; cross-case influence remains possible.
No baseline comparison, live device work, full implementation or statistical
improvement claim is made. These checks supplement the historical Claude runs;
they do not establish cross-host behavioral equivalence. The host exposes no
supported worker close/shutdown control.

After the prompt corrections, `python3 -B -m unittest discover -s tests -q`
passed all 34 tests and `git diff --check` passed. No source, exports, scripts,
dependency declarations or resource links were removed. The changed evals
remain reachable through their existing package maintenance links.
