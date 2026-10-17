# ASCII diagram skill research and validation

Evaluated on 2026-10-17 for diagrams delivered directly in terminal
conversations, plain text, and Markdown. This is a fit assessment among the
candidates found, not an exhaustive ecosystem ranking.

## Candidate comparison

| Candidate | Useful behavior | Tradeoff for this task |
| --- | --- | --- |
| [jasnell/ascii-art-diagrams](https://github.com/jasnell/opencode-skill-ascii-art-diagrams) | Broad diagram patterns, explicit layout planning, Python grid and verifier | Strongest starting reference for correctness, but repetitive instructions and unsafe confidence in helper results |
| [bbdaii/ascii-diagrams](https://github.com/bbdaii/ascii-diagrams-skill) | Lightweight proactive use, narrow-terminal guidance, small box helper | Lower ceremony; its tree example contradicts its plain-ASCII rule |
| [github/plantuml-ascii](https://github.com/github/awesome-copilot/tree/main/skills/plantuml-ascii) | Generate text through an established diagram tool | Requires PlantUML; unnecessary setup for ordinary conversation diagrams |
| [seflerZ/md-ascii-diagram](https://github.com/seflerZ/md-ascii-diagram) | Visual editing and document image rendering | Browser/editor and image workflow do not fit direct terminal output |

Discovery used native web search and `npx --yes skills find ascii`. Jasnell's
full skill, reference, and both scripts were inspected at commit
`45be22bab19beea7d4d8fcae87c55fcaa4afabd7`. The lighter candidate's skill and
helper were inspected at `0cd533f310e9a28f0eea68f47ee455361ce61ad1`.
Other candidates were compared from their published skill descriptions and
instructions; they were not installed or benchmarked.

Direct probes of Jasnell's helpers found:

- Placing `DATABASE` in a four-column grid silently produces `DATA`.
- The Unicode scan accepts `中文` despite the ASCII contract.
- Box detection reports no issue for unequal `+----+` and `+-------+` borders
  surrounding `| DB |`.
- Arrow detection treats the comparison `a > b` as a floating arrow.

The new `wnz-ascii-diagrams` package is independently written. It retains the
useful meaning/layout/check progression without copying upstream prose or
code. It uses a deliberately limited character/width checker rather than
heuristics that imply reliable geometry validation. Geometry and semantic
tracing remain explicit agent obligations. No renderer or sibling skill is
required; Python is optional with a manual fallback.

## Package and checker evidence

- Anthropic's official skill-creator and repository prompt standard were read
  before authoring.
- `quick_validate.py` through `uv run --with pyyaml`: valid frontmatter and
  skill metadata.
- Package-contained Markdown links, balanced fences, absence of XML prose,
  package contents, and all eight pattern blocks checked.
- A copied package checker ran with isolated Python from a temporary directory,
  without repository context or sibling skills. Missing-skill behavior is not
  applicable because the package declares no skill dependencies.
- Six CLI tests cover exact width, shorter rows, overflow rejection, controls,
  non-ASCII input, CRLF, empty input, invalid UTF-8, and invalid width arguments.
- The new package is included in the existing installed-resource contract test.

Reproduce the repository suite:

```bash
python3 -m unittest discover -s tests
```

The suite contains 21 tests at this revision. The checker checks portability
and width only; it cannot establish connector alignment or semantic truth.

## Behavioral evaluation

Five prompts in the bundled `evals/evals.json` were executed by two fresh native
agents: one with the new skill and one without a diagram skill. Each agent
handled its five prompts in a batch. Cases covered a 36-column pipeline,
cache hit/miss branching, a three-party sequence, Unicode names with an
untrusted command-like label, and a malformed box repair.

The controller reran character/width checks on every diagram and manually
graded the full responses against the recorded criteria. Both configurations
met all five cases. The with-skill responses used compact bracketed layouts
and an explicit cache branch/merge junction. The equal scores establish no
measured effectiveness gain.

A third fresh agent made eight metadata-routing decisions: all matched the
expected outcomes, including Mermaid, SVG, image-to-ASCII, and no-diagram
near-misses. Its input exposed license and compatibility metadata in addition
to the requested name/description, but not the skill body. This was simulated
routing, not observed activation through a host skill loader.

Resolved native model snapshots, timing, and token counts were unavailable.
One batch per configuration does not measure variance or case independence.
Outputs, grading, benchmark data, and a static skill-creator review viewer
were generated in a temporary authoring workspace outside the installed package.

## Independent review corrections

A fresh native reviewer used `wnz-code-reviewer` and traced the complete package,
checker, tests, and README additions. It caught two misaligned reference
connectors that the portability checker correctly did not diagnose. Both were
corrected, and targeted column assertions checked the retry return path and
the API-to-storage junction. The review also prompted adding this package to
the existing resource-link contract test. These findings reinforce the
documented separation between portability checks and geometry inspection.
The reviewer rechecked both corrected patterns, all eight examples, six checker
tests, and four package tests, then reported no remaining findings.

## Additional reference and plan integration

The user-suggested
[HelioFernandes404/ascii-diagrams-skill](https://github.com/HelioFernandes404/ascii-diagrams-skill)
was inspected at `e0caaac81d61765b7ace0b4a3f8c3b9cf72172d0`, including
its skill and all seven bundled reference files. Useful ideas were expressed
in new wording: include source-comment prefixes in width and alignment checks,
preserve shared identifiers and direction in before/after views, and label
memory offsets and units without implying a false visual scale. Its fixed
title/diagram/bullet output format and automatic Unicode allowance for rendered
Markdown were not adopted because they conflict with explicit output requests
and this package's ASCII contract. No upstream text or diagram was copied.

`wnz-phase-executor` now routes optional plan-file diagram use through
`wnz-implementation-planner`, which owns plan authoring. Both packages declare
host-based discovery and the same missing-package fallback: continue with the
planner template's ASCII guidance, without automatic installation or a blocker.
Diagram sections remain conditional. Diagram checks do not replace independent
plan approval, including after semantic revisions.

All three copied packages passed YAML parsing, package-contained links,
Markdown fences, XML-prose checks, and evaluation JSON validation. Existing
package-contract tests cover their local resource links. Runtime helper code
did not change in this update; the 21-test repository suite passed.

A fresh agent simulated the five integration cases without expected answers:
available adjunct, absent adjunct, semantic revision, irrelevant diagram, and
hostile label. Controller inspection found the expected discovery, fallback,
and approval decisions in each response. This checks workflow interpretation,
not live host discovery or complete plan execution.

Another fresh agent produced the new comment and memory-layout examples.
The Python comment diagram used at most 14 columns including prefixes; the
packet output used at most 46 columns, preserved byte offsets 0/4/6/8 and sizes,
and identified schematic spacing. Both passed executed portability checks;
geometry and meaning were checked separately. A fresh metadata-only agent
matched all ten current activation choices, including comment and plan-file
positives. This remains simulated routing, not observed host activation.

A fresh `wnz-code-reviewer` leaf reviewed the executor/planner integration,
comment and memory guidance, and associated cases. It reported no findings,
traced the missing-package fallback and semantic approval boundary, and ran
the checker and package tests plus comment/packet probes. Model identity and
effort resolution were not exposed. New routing cases 16/17 and this evidence
record were added after that review; they do not change runtime instructions.
