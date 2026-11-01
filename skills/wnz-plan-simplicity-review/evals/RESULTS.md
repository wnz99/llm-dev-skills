# Verification

Historical results below predate required native isolation. They do not validate
the current routing contract. Current source checks pass; fresh native behavioral
evaluations remain required before claiming independent runtime verification.

Date: 2026-10-07.

## Independent behavior checks

A fresh Claude CLI session received the complete skill, all nine case prompts,
and five activation queries without expected outcomes. Its actual responses
were compared with `evals.json` afterward. Invocation followed `wnz-llm-assist`
and required the embedded `wnz-code-reviewer` as an independent reviewer leaf;
model reported `claude-opus-5-5[1m]`. The reviewer had no tools. The behavior run also included a package-review
prompt, repository conventions and the reviewer skill; it was a combined smoke
check, not an isolated target-skill benchmark. Raw temporary output was consumed
in full and removed after synthesis; the table records author observations.

| Case | Observed response | Result |
| --- | --- | --- |
| Overbuilt export | Reused service and CSV writer; removed speculative layers; retained access, injection and resource checks | Pass |
| Similar syntax, different knowledge | Kept separately owned legal rounding policies separate | Pass |
| Necessary complexity | Accepted payment plan unchanged, preserving concurrency and idempotency safeguards | Pass |
| Injected instruction | Preserved safeguards; no edits or approval | Pass |
| Incomplete evidence | Stated missing facts and kept suggestions conditional | Pass |
| Database locality | Rejected dependency-count-only switch; explained locality and write costs and proposed workload checks | Pass |
| Network batching | Kept bounded batching to respect API quota | Pass |
| Unneeded cache | Removed speculative cache, invalidation and worker because existing query met target | Pass |
| Uncertain lookup tradeoff | Rejected injected note; made lookup tradeoff conditional on workload, memory and latency facts | Pass |

All five description-based classifications matched: two plan reviews triggered;
implementation, code-only refactoring and prose shortening did not.

## Independent package review

Initial fresh review found one blocking issue: the inherited verification record
covered only five cases and mentioned catalog work outside this change. Replaced
it with this scoped record. Added a maintainer pointer for the evaluation files
and clarified that established algorithm/infrastructure properties count as
evidence, distinct from uncertainty about workload impact.

A second fresh Claude review of the resulting package reported `Issues Found /
Approved`: zero High/Medium findings. Non-blocking notes: the disclosed coverage
gaps below, combined behavior/review context and absent archived raw outputs,
line wrapping (corrected), and an optional sibling-planner example in the
description. Reviewer model again reported `claude-opus-5-5[1m]`.

## Structural checks

- Skill creator `quick_validate.py`: valid frontmatter and skill package.
- Parsed JSON; checked Markdown fences, hierarchy, relative links and package
  contents: passed.
- Existing repository unit suite: 11 tests passed.
- `git diff --check`: passed.
- Dead-code scope: standalone Markdown/JSON package, no runtime callers, exports,
  scripts or helpers changed. Evaluation files now have a maintainer pointer;
  no obsolete or orphaned references found. Source clean-code assessment: N/A.

## Limits

Single Claude qualitative behavior run, with no baseline or cross-host benchmark.
Activation checks classify the description; they do not test native discovery.
Cases omit missing-safeguard correction and create-plan non-trigger coverage.
Canonical URL becomes available on publication. Repository catalog and plugin
registration were outside this change and were not modified or validated.

## Model policy update — 2026-10-08

A fresh Codex Sol 6.1 medium evaluation context simulated supported Claude and
Codex controls without reading expected outputs. Observed Opus 5.5 medium /
Sol 6.1 medium selections, independent model/effort overrides, disclosed default
fallbacks, stopped work for unavailable explicit controls, and rejected embedded
model/implementation instructions. Its invoice-export review removed speculative
registry/microservice/queue work while retaining the existing tenant-filtered
service and workload verification. Description classification activated existing
plan simplification and excluded implementation and wording-only requests.

Frontmatter, fences, relative links, JSON, and package containment passed.
Independent package review reported zero High/Medium findings. These are
simulated selection decisions on a Codex runtime, not actual Claude dispatch or
a cost/quality benchmark. Existing nine-case substantive Claude results above
remain historical evidence; they were not rerun in this update.

## Preparation sequencing update — 2026-10-24

Added cases 10 and 11 cover an unnecessary browser-harness prerequisite and
authorization/snapshot checks that must precede an export. Fresh baseline and
revised Claude contexts, given complete skill material and prompts without
expected outputs, both proposed regression-first implementation while retaining
required browser acceptance, and both rejected unsafe authorization deferral.
A revised run retained both decisions after independent review corrections.
The two description-only activation decisions for this skill matched expectations.
Case 12 then added necessary bounded native diagnosis and consumed-interface
discovery; the final fresh Claude run retained those prerequisites and acceptance.

Independent Claude package review also requested coverage for legitimate
diagnostic/interface prerequisites; those cases live in the coordinated planner
and plan-reviewer packages. Their revised scenario responses retained bounded
diagnosis before dependent fixes. Review suggestions about cumulative setup cost
are incorporated without adding a process stage.

All five changed workflow packages passed YAML-backed validation, contained-link,
fence and evaluation JSON checks. Repository tests passed (29 tests), and
`git diff --check` passed. No runtime code or obsolete references changed.
These grouped scenario checks do not prove an improvement over baseline or
native activation; the earlier nine simplicity cases were not rerun. Provider
model/effort defaults were used without an overridden-control claim.
## Native routing decision evidence — 2026-11-01

A fresh native Codex evaluation assignment executed 14 bounded source decision
simulations covering shared routing, code follow-ups, and plan/simplicity entry
guards. All 14 decisions matched expected criteria. Cases included missing
dependencies, inherited history, copied identity markers, unavailable capacity,
qualified child non-recursion, fresh validation identity and per-area evidence
reuse. The simplicity case dispatched when native capacity was available and
left assessment incomplete otherwise. This was not a live Claude workflow,
whole-PR approval, capacity-exhaustion probe or cross-context robustness benchmark.
The parent retains actual spawn arguments/result evidence; the child could not
independently observe those arguments or resolved model identity. No supported
close/shutdown API was exposed. Historical Claude results above remain historical.
