# Verification

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
