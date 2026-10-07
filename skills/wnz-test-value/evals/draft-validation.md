# Draft validation

Checked on 2026-10-07. Status: draft; no comparative effectiveness claim.

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
