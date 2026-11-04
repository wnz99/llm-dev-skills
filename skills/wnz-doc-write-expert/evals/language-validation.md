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
