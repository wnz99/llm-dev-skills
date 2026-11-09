# Language guidance validation

## Scope and sources

Validated on 2026-11-04. The change adds explicit target-language composition,
purpose-sensitive register, terminology consistency, and separate fluency and
fidelity checks without changing review routing or required dependencies.

Instruction patterns were checked against:

- [Microsoft localization style guides](https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides): language-specific conventions and technical publication styles.
- [Google global-audience guidance](https://developers.google.com/style/translation): clear technical instructions and consistent terminology. Its English grammar rules are not imposed on other languages.
- [Localization Writer skill](https://github.com/SkillMedev/skills/blob/main/skills/localization-guide/SKILL.md): locale, formality, and contextual adaptation.
- [Context-Aware Localization skill](https://github.com/first-fluke/oh-my-agent/blob/main/.agents/skills/oma-translation/SKILL.md): natural prose with exact technical content preserved.

These are authoring sources, not runtime dependencies. Marketing-oriented
adaptations such as changing currency or cultural context were not adopted as
defaults for evidence-backed documentation.

## Checks and results

- Package contract suite: 9 tests passed.
- YAML frontmatter parsed with PyYAML; relative links, code fences, unique eval
  IDs, and JSON syntax passed. `git diff --check` passed.
- Two native test agents executed cases 8–13 against the old and revised skill.
  Both reported 6/6 passing: Italian runbook, French tutorial, Spanish source
  injection, Italian activation, chat-only non-trigger, and language selection
  with an explicit literal-translation exception.
- Existing dependency declaration retains host discovery, installation guidance,
  and stop-on-missing behavior. No dependency or routing behavior changed.

## Limits

These are qualitative smoke tests, not proof of improved fluency: the baseline
also passed. Each agent saw the expected results and reused one context across
cases. Activation judgments used metadata but lacked separate isolated runs.
No human native-speaker validation occurred. Glossary handling and locale
formatting were inspected but not exercised by these cases. Raw run outputs
were saved locally as `/tmp/doc-language-eval-new.md` and
`/tmp/doc-language-eval-old.md`; they are not required package resources.

The host exposes no agent close/shutdown control; completed agents could not
be explicitly closed.

## Readability revision (2026-11-09)

### Trigger

Codex-authored Italian infrastructure documentation stayed telegraphic despite
the 2026-11-04 guidance. The session that wrote it had loaded this skill, had a
terse response mode active and rewrote a README inside a generated code string
while implementing a refactor, so documentation was a side effect of code work.

### Method

Three tasks ran in fresh non-interactive Codex CLI 0.167.0 (`codex exec`,
configured default `gpt-6.1-sol`, medium effort) and Claude Code 2.1.316
(`claude -p`, configured default model and effort) sessions, each in an
isolated directory with a telegraphic `AGENTS.md`:

- T1: rewrite a telegraphic Italian README section for readability;
- T2: write Italian and Spanish runbooks from terse English notes;
- T3: implement a flag and update the Italian README as part of the change.

Variants were the previous skill (v0), v0 with the terse mode switched off,
and two drafts (v1: register isolation, sentence checks and separate passes;
v2: v1 plus implementation-time writing, paragraph checks, meta-text and the
inference audit). Outputs were anonymized and scored for fluency and fidelity
(1–10 each) by one Claude and one Codex judge that did not know the writers.
Judges saw the task source, not the full workspace.

### Results

Sums of fluency plus fidelity over T1, T2-it, T2-es and T3 in the second
judging round:

| Writer | Judge | v0 | v1 | v2 |
| --- | --- | --- | --- | --- |
| Codex | Claude | 51 | 57 | 62 |
| Codex | Codex | 65 | 72 | 74 |
| Claude | Claude | 69 | 67 | 67 |
| Claude | Codex | 71 | 71 | 70 |

Codex improved from v0 to v2 under both judges, mainly in fidelity: the
inference audit removed plausible but unstated claims, and T3 fidelity rose
from 7 to 9 under both judges. The v1 to v2 step under the Codex judge (72 to
74) is within judging noise. Claude was already strong and stayed flat; its
lower v2 T3 fidelity came mostly from correct environment variable names that
the judge could not see in its source excerpt. Switching the terse mode off
had no consistent effect in single-shot runs. Codex fluency stayed at about
6–7 of 10 under the Claude judge: residual fact-list paragraphs, calques and
short disconnected sentences are not fully solved by instructions.

A confirmation round re-ran Codex on all tasks with v3, the v2 wording revised
for tone, and judged it blind against v0 and v2: Claude judge 54, 66 and 70;
Codex judge 66, 75 and 75. Re-judging the same v0 and v2 outputs moved their
scores by 1–4 points, so differences of that size are noise; the v0 to v3 gain
is larger. Claude was re-run with v3 on T3 only, scoring 14 (Claude judge) and 16 (Codex
judge) out of 20; the judges flagged correct workspace variables as unsupported
and one omitted registry statement.

After independent review, the published package differs from v3: explicit
document-style requests and a deliberate style of the target document or its
siblings take precedence over the register rule; procedure steps may use the
infinitive or imperative; readability requests authorize voice changes, while
other edits keep untouched text unchanged; duplicated checks were merged; the
inference audit accepts facts verified from code; reference examples no longer
reuse eval tokens; a terse `AGENTS.md` sets the style only when it is itself the
target; and the description excludes code comments and docstrings. T1 and T2
were not re-run on this revision.

On the published package, T3 and case 17 ran once per host with a telegraphic
`AGENTS.md` in the workspace. Both hosts wrote connected Italian prose and did
not imitate the `AGENTS.md` style. Codex added no unsupported facts. Claude
added unsupported statements in both tasks: in T3 that the UUID appears in the
Coolify page URL, and in case 17 a consequence of the retention period, an
escalation path and a purpose of the restore test. The inference audit reduces
but does not eliminate plausible additions.

Cases 21–23 exercise the precedence and scope rules. With the published
package, fresh Codex and Claude sessions each added a verbless item to the
verbless cheat sheet (21), changed only the port while leaving the telegraphic
paragraphs untouched (22), and rewrote only the requested section in connected
prose with its facts and approval obligation (23): 6 of 6 runs as expected.

Cases 14–16 were written from the incident that motivated this change, so they
are not fully held out from the guidance; the published examples avoid their
literal tokens, but their failure patterns are the ones the checks target.

### Activation

From metadata alone, cases 6, 7, 11, 12, 18, 19 and 20 were classified twice by
Claude (Sonnet) and Codex. The previous description activated on the docstring
case 20 in one of two Claude runs; the published description, which excludes
code comments and docstrings, matched all seven expectations on both hosts.

### Package checks

`python3 -m unittest discover -s tests` passed (55 tests). `evals/evals.json`
parses with unique IDs 1–23; frontmatter, relative links and
`git diff --check` passed. Raw run outputs, judge packets and verdicts were
kept in the author's session scratch directory; they are not package
resources.

### Limits

One run per cell; LLM judges, one of each family, with visible self-preference
in absolute scores but agreement on direction; judges saw only the task source;
no human native-speaker review; single-shot runs do not reproduce a long
session in a terse mode. New eval cases 14–23 cover these behaviors for future
regression checks.

## Progressive disclosure split (2026-11-09)

### Change

`SKILL.md` shrank from 3,865 to 1,309 words. The language and register rules,
the author workflow, the review workflow and the model policy moved verbatim
to `references/`, with explicit load conditions in `SKILL.md`; a scoped update
still verifies changed claims and parses changed YAML frontmatter. The
contract tests now read the moved text from `references/author-workflow.md`
and check every load link.

### Behavior checks

Fresh sessions ran the split package (v5) once per host on T1, T2, T3, case 17
and cases 21–23, with the published 1.1.7 package (v4) on T1 and T2 for
comparison. Both hosts opened `references/language-and-register.md` and
`references/author-workflow.md` before writing; Claude reads were confirmed
from its tool-call stream. Cases 22 and 23 behaved as with v4 on both hosts.
In case 21 one of three Codex runs added a verb to the verbless cheat sheet;
the other two kept its style, as did Claude. In case 17 Claude still added
unsupported statements, as with v4.
