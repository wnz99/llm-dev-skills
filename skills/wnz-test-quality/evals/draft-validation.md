# Validation record

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
