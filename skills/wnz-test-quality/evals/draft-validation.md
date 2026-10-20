# Validation record

## Audit streamlining update (2026-10-20)

Audit mode now explicitly traces complete-run orchestration cost, recommends
removing incidental assertions and equivalent executions, and identifies safer
fixture, readiness and timing simplifications. Proposals name retained evidence
and proof; distinct runtime/packaging/security obligations remain protected.
No deletion quota, automatic audit schedule or runtime dependency was added.

Fresh native workers independently answered cases 29 and 30 with the revised
runtime package and its pre-edit snapshot. Each received only its scenario and
runtime resources, without expected answers or other workers' outputs. Native
capacity required scheduling the fourth run after a slot became available.
All workers also loaded the required independent-review skill, equally in both
configurations. Controller assessment: both versions passed all seven criteria;
no comparative effectiveness gain is established. The update makes the desired
audit emphasis explicit rather than claiming the prior version could not do it.

The revised outputs identified duplicate acceptance/lifecycle execution and
private-name coupling, preserved distinct worker and native timing obligations,
and rejected quota-driven removal, mocked trust boundaries and fabricated
speedups. A metadata-first check classified three trigger/non-trigger prompts
as expected; this simulates routing rather than observing host activation.

Package validation: all 29 repository tests passed; skill-creator quick validation
passed; PyYAML and markdown-it-py parsed the package, checked local links and
31 unique eval IDs; `git diff --check` passed. Full answers, criterion evidence,
comparison JSON and a static skill-creator review viewer remain in the external
authoring workspace. No model snapshot or timing/token metrics were exposed,
so those cost fields were omitted rather than recorded as zero.

Limits: two supplied-inventory scenarios, one run per configuration; no live
repository audit, measured suite speedup, broad historical eval rerun or
cross-host effectiveness claim. Existing fixtures were unchanged. The host
exposes no agent-close control; completed turns do not establish resource cleanup.

Original draft checked on 2026-10-07 under the name `wnz-test-value`.
Historical evidence below predates the test-organization update and rename to
`wnz-test-quality`; it does not validate the revised workflow. No comparative
effectiveness claim.

## Package and repository checks

- Skill-creator `quick_validate.py`, run through `uv` with PyYAML: valid skill.
- Parsed YAML frontmatter and Markdown with PyYAML and markdown-it-py.
- Copied the package into an isolated temporary directory and checked package
  contents, relative links, heading hierarchy, balanced prompt fences, and
  absence of XML in skill prose. No sibling skills or authoring docs required.
- Parsed all 12 cases in `evals.json`; IDs unique, both activation outcomes
  represented, and inputs require no external fixture files.
- `git diff --check`: passed.
- Existing repository suite, `python3 -m unittest discover -s tests`: 11 tests
  passed. These tests do not establish the new skill's behavioral effectiveness.

## Decision and activation evaluations

Two fresh native Codex agents answered capability/adversarial cases 1–6, one
with the skill and one without. Each configuration handled its six scenarios
in a batch, received no expected answers, and wrote separate responses. The
controller manually graded complete responses against the bundled criteria:

| Configuration | Cases meeting criteria |
| --- | --- |
| With skill | 6/6 |
| Without skill | 6/6 |

A third fresh agent saw only name, description, and activation prompts 7–12.
Its metadata-based routing decisions matched all six expected choices: three
activations and three non-activations.

Resolved native model snapshot and per-case token/timing metrics were not
available. Responses and a static skill-creator results viewer were generated
outside the installable package for human review.

These are synthetic decision checks, not executed code-writing tasks. Cases
within each configuration shared context. Activation was simulated, not observed
through a host skill loader. One sample per case does not measure variance;
the equal baseline score establishes no gain from the skill. Before asserting
improvement, use independent held-out implementation tasks and actual activation
runs on the intended hosts, with meaningful failure detection and maintenance
cost assessed alongside test counts.

## Independent Claude review

Claude Code's stable `sonnet` selector resolved to `claude-sonnet-5`. A fresh,
read-only reviewer used the installed `wnz-code-reviewer` workflow with the
independent reviewer-leaf contract. It reviewed the full skill, examples, eval
cases, and README registration against repository and official skill-creator
guidance. It reported no actionable findings and an Approved verdict.

Its only optional observation concerned additive `kind` and `should_trigger`
eval fields, which differ from the simpler sibling eval schema without breaking
the required fields. The controller confirmed no corrective change was needed.

The reviewer did not execute checks independently; it relied on supplied
verification evidence and explicitly retained the evaluation limitations above.
This validation record and its authoring-only link were added after that review;
they do not change the runtime test-selection workflow.


## Organization, DRY/KISS, and rename update

Updated on 2026-10-07. The skill is now `wnz-test-quality`; the package and
README include migration guidance from `wnz-test-value`. Changes add test
organization, reuse of stable setup, explicit scenario expectations, fresh
mutable fakes, and avoidance of configurable cross-domain test frameworks.

Two fresh native Codex agents received nine synthetic decision prompts, one
using the revised skill and one using a snapshot of the previous skill. Six
existing capability/adversarial cases were rerun alongside three new cases
covering repeated mock setup, premature DRY abstraction, and unsafe fixture
reuse. The controller manually checked complete responses against the bundled
criteria: revised skill 9/9, previous skill 9/9. The equal result establishes
no measured effectiveness gain. Outputs were generated before the identifier
rename; runtime instructions were unchanged by the rename.

Cases were batched within each configuration, not independently sampled per
case. No executable implementation tasks were performed in that comparison. Exact native model
snapshot and per-case token/timing metrics were unavailable. The comparison
viewer uses `without_skill` for its baseline schema slot; that slot contains
the previous skill, not an unassisted model.

Both the pre-rename description and the renamed name/description passed eight
metadata-routing checks,
including shared-mock cleanup and a fixture-scope explanation near-miss. This
is simulated routing, not actual host activation. Package validation and the
existing repository suite (11 tests) passed during the update. Final checks and
independent review are reported with the delivery; the historical Claude verdict
above applies only to the original draft.


## File-backed fixture refactor evaluation

Case 18 bundles `files/notification_service.py` and `files/test_notifications.py`
as an intentionally repetitive starting fixture. A fresh native agent, using the
renamed skill and its examples without expected answers, refactored only a
separate temporary copy of the test file. It extracted one local recording fake
and used unittest `setUp` for a fresh sender/service per test. Inspection confirmed
all three scenarios kept their explicit actions and independent expectations;
there was no generic framework, shared mutable singleton, or new dependency.

The agent ran unittest discovery and direct test-file execution: both collected
three tests and passed. The controller verified the production fixture was
byte-identical, then ran all six scenario orders in an isolated copy: 18 test
executions passed. Bypassing opt-out rejection failed the denial test; suppressing
send failed the delivery test. After restoring production, discovery again found
three passing tests. Mutations touched only temporary copies, not bundled inputs.

This is one executable refactor example, not a comparative effectiveness
benchmark or a guarantee across frameworks. The bundled Python files are eval
inputs; repeated setup is intentional and should not be cleaned up in the source
fixture. Updated and prior decision runs, renamed activation simulations, and
this file-backed run provide complementary evidence with the limitations noted
above.


## Final independent review

A fresh native reviewer leaf using `wnz-code-reviewer` reviewed the full update,
rename, examples, case definitions, and bundled inputs. It reported no actionable
findings and Approved. It independently reran the 11-test repository suite and
three-test fixture, confirmed all six refactored scenario orders passed, traced
the package links and migration, and checked production fixture identity. The
controller's `uv`-based skill validation supplied PyYAML; a direct reviewer retry
lacked that dependency, so the reviewer used equivalent schema/link checks and
disclosed that limitation. This paragraph records that verdict after review; it
does not change the runtime workflow.

## Repository audit mode (2026-10-19)

Added an optional whole-repository audit guide, explicit risk-based priorities
in the focused workflow, six authoring cases (19–24), and a four-file runnable
voucher fixture. Runtime resources remain inside the package; no required skill
dependency, external service, or network access was added. The fixture's test
problems and injected source comment are intentional evaluation inputs.

### Package and regression evidence

- `uv run --with pyyaml python <skill-creator>/scripts/quick_validate.py skills/wnz-test-quality` passed using the installed skill-creator package.
- An isolated package copy passed PyYAML frontmatter and markdown-it-py parsing,
  heading hierarchy, local-link containment/existence, closed fences, and
  absence of HTML/XML prose blocks. All 24 eval IDs were unique and all bundled
  input paths resolved. No sibling skills or repository authoring files needed.
- `python3 -m unittest discover -s tests -v`: 27 tests passed. Existing package
  checks now include this skill's resource links and eval input files.
- `git diff --check` passed. No source or runtime instructions were removed;
  the existing focused workflow and examples remain available.

### Fresh-context behavior checks

Cases 19, 20 and 21 each ran in separate fresh native Codex workers for the new
skill and a pre-edit skill snapshot: six independent runs, one per case and
configuration. Workers received prompts and runtime skill resources, not expected
answers. Capacity limited scheduling; pairs were not all launched simultaneously.
Model snapshot and token/timing metrics were not exposed by the native worker
notifications and are unavailable rather than estimated.

The controller inspected responses and execution logs against the bundled
assertions. Both configurations met all ten assertions across the three cases.
This equal result establishes no measured improvement. The new workflow makes
inventory, risk assessment, and completion obligations explicit; this evaluation
does not establish superiority over the prior skill.

Case 19 assessed all seven methods and three individual label subtests: nine
leaf scenarios when replacing the label container with its cases. Both runs
identified that the documented CI command collected five methods with one skip
and omitted the two real SQLite checks, which passed under explicit discovery.
Both retained cheap label checks and distinct database protection, identified
the identical mock duplicate and metadata-only assertion, ignored the injected
comment, and recommended closing the tenant-denial execution gap.

Both workers used isolated fixture/mutation copies. Removing SQLite uniqueness
left the documented CI suite green but failed the storage retry test. Removing
the tenant guard passed both normally run suites because denial was skipped.
The new-skill run additionally enabled the skipped body diagnostically: baseline
passed and guard removal failed. Diagnostic execution does not repair CI or
enable the original test. Controller hash comparison confirmed the four source
files and both baseline copies remained identical after experiments.

Cases 20 and 21 were supplied scenarios, not executed repository audits. They
checked incomplete inventory and unsafe collection, generated security
properties, arbitrary deletion scores, distinct test boundaries, and isolation
instead of retry masking. Neither configuration invented execution evidence.

A separate metadata-only worker classified nine positive and near-miss prompts,
including repository audits, discovery with value assessment, runner-only
troubleshooting, prose typos, and conceptual explanations: 9/9 expected choices.
This simulates routing; it is not an observed host-loader activation test.

Outputs, execution logs, grading, and the skill-creator static review viewer are
kept outside the installable package in the session evaluation workspace. These
are small synthetic checks, with no repeat sampling, real large-repository
audit, cross-host matrix, or end-to-end test-rewriting benchmark. Earlier cases
1–18 were not rerun as a full behavioral regression suite in this update.

### Independent review

A fresh `wnz-code-reviewer` leaf selected with `gpt-6.1-sol` and medium effort
reviewed all ten changed files and the full package, applying `wnz-dead-code`
and `wnz-clean-code-py`: Clean / Approved, no actionable findings. It reran the
27-test repository suite and both fixture commands, verified inventory and
source identity, and checked the saved evaluation reports and mutation logs.
Its optional parser rerun lacked PyYAML; it distinguished the controller's
parser evidence from its independent resource checks. This review receipt was
appended afterward; runtime instructions were unchanged.

## Normal-mode prevention and periodic audit (2026-10-20)

Normal mode now traces affected tests through actual local/CI entrypoints,
discovery and filters, verifies that relevant assertions execute, and separates
skips or unavailable execution from passing protection. It prevents issues
introduced by its own bounded changes and flags relevant inherited gaps without
requiring unrelated cleanup. Repository audit remains a periodic steering
correction when requested, not an automatic per-task gate or scheduled job.

### Executable normal-mode evaluations

Cases 25–26 use `normal_mode_fixture.py` to generate fresh disposable voucher
and notification applications from bundled inputs, including real CI workflow
files pointing to executable `ci.py` runners. Existing destinations and paths
inside the source skill package are rejected before writing. Repository tests
check both fixture variants preserve edits to generated tests and added user
files on a rejected rerun, and cannot create a fixture inside their own package.

Four fresh native Codex workers independently executed the two normal-mode
tasks: one worker per case with the revised skill, one with its pre-edit
snapshot. Each received only its task, runtime skill and disposable application,
not expected answers. Scheduling respected native capacity rather than launching
all pairs simultaneously. Controller inspection graded both versions 6/6 across
the six bundled assertions. Equal results establish no measured effectiveness
gain. Native model snapshots and timing/token metrics were unavailable.

- Voucher work extended the existing real SQLite retry scenario with distinct
  voucher IDs/amounts and independent intermediate/final balances. Both versions
  wired storage discovery into the actual workflow-selected CI runner. CI
  executed six methods and reported one inherited tenant skip; direct storage
  discovery executed two methods. Both versions detected separate lost-distinct-
  credit and duplicate-retry-credit faults through the CI entrypoint.
- Notification work reused a local recording fake with fresh per-test setup,
  retaining all three named delivery/denial scenarios and explicit expectations.
  Both versions executed all three through CI, without skips. Both detected
  wrong-delivery and ignored-opt-out faults; the revised-skill worker also
  checked suppressed delivery. Production inputs remained byte-identical in all
  four artifacts, confirmed by controller comparison.

### Independent audit after normal work

Two fresh reviewer leaves applied `wnz-code-reviewer`, its required dead-code
audit, Python clean-code review, and the candidate's repository-audit mode.
Each audited anonymous A/B final artifacts for one case against an identical
starting baseline, without creator reports or expected answers. A maps to the
revised skill and B to the prior skill. Cases were independent; variants within
each case shared an auditor, so this is not independent sampling per variant.

Both voucher artifacts: no newly introduced findings; local task Approved.
The complete audit still found inherited skipped tenant protection, duplicate
mock coverage and a metadata-only assertion. These were kept separate from
the normal-task verdict. All seven methods and three label subcases were
assessed, nine leaf obligations in each artifact. The auditor observed the new
regression's three assertions executing through CI and independently confirmed
lost-credit and duplicate-credit faults fail there. Tenant-guard removal still
passed because the inherited denial test remains skipped.

Both notification artifacts: Clean / Approved. All three scenarios and six
assertions executed through the actual CI entrypoint, fresh mutable state was
preserved, and independent disposable faults exposed missing/wrong delivery
and opt-out failures. No source edits were made during either audit.

Case 27 was answered independently as a supplied payment-discovery scenario:
direct-file success was rejected as CI proof, with bounded selection repair
and assertion execution required. No payment commands were invented. A separate
metadata-first check matched four expected trigger/non-trigger decisions;
after reading the runtime body, the same worker selected normal mode for a
current local task that merely mentioned periodic audits. No full audit or
recurring schedule was triggered. This simulates routing, not a host-loader run.

### Package evidence and limits

- `python3 -m unittest discover -s tests`: 29 tests passed after review fixes.
- Installed skill-creator `quick_validate.py` passed through `uv` with PyYAML.
- An isolated package copy passed PyYAML frontmatter and markdown-it-py checks
  for hierarchy, local link containment/existence, closed fences and absence of
  HTML/XML prose blocks. All 28 eval IDs were unique and input files existed.
  Both fixture variants generated without repository sibling dependencies, and
  their CI YAML parsed with the expected runner command.
- `git diff --check` passed. No runtime dependency was added. Existing original
  fixtures remain unchanged; the generator creates only disposable copies.

Normal outputs, inline grading, later audit reports and a static skill-creator
review viewer are held outside the installable package in the evaluation
workspace. These checks establish observed prevention on two small synthetic
tasks, not universal audit cleanliness. Hosted CI, other hosts/platforms, large
repositories and historical cases 1–24 were not rerun as a full behavior suite.

### Claude review and corrections

Claude Code reported `claude-opus-5-5`, medium effort, and used the installed
`wnz-code-reviewer` leaf workflow with dead-code and Python clean-code checks.
Its initial verdict was Issues Found / Approved: three Low findings and one
Nit, no blockers. Corrections strengthen generator source protection and the
overwrite test, remove a replaced README from case 25's setup seed list, and
fix external viewer metadata. The corrected viewer records one run per case
and configuration, real skill path, unknown model identity, and omits unavailable
time/token statistics rather than displaying zero as measured cost.

A disposable mutation allowed reuse of the output root while later workflow
creation still failed. The strengthened test caught a generated-test edit being
erased through its byte comparison despite that nonzero exit. This demonstrates
the data-preservation assertion detects a realistic partial-overwrite fault,
independently of the return-code assertion. All mutation writes were temporary.

A second fresh Claude Opus 5.5 review of the complete scope again returned
Issues Found / Approved, with no High or Medium findings. It reran all 29 tests,
quick validation, fixture and collision checks, and independent overwrite/guard
mutations. Final non-blocking corrections assert the edited generated file
already exists, distinguish controller-only `setup_files` from worker inputs,
and consolidate audit cadence rules into the main scope section. These clarify
the setup procedure actually used by the recorded workers. The CLI's argparse
choices remain the authority for the private helper's two supported variants;
its raw authoring-tool error tracebacks were left as a non-blocking style nit.
The final small corrections and this receipt were appended after that review;
fresh verification covers them. No normal-mode task gained an automatic audit.
