# Skill authoring governance

These rules apply to the entire repository.

Anyone adding or modifying a skill must, before editing:

1. Read [`docs/prompt-engineering.md`](docs/prompt-engineering.md) in full.
2. Read Anthropic's official
   [`skill-creator`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md).
3. Inspect the target skill as a standalone installable package, including each
   bundled reference, script, asset, and relative link it uses.

Follow the repository format contract: Markdown owns all `SKILL.md`
instructional hierarchy, prose, workflows, rules, and checklists. XML is
allowed only inside embedded executable prompt templates to delimit injected
dynamic, untrusted, long, or repeated content whose boundary matters. Do not
use XML wrappers directly in skill prose.

Keep each skill independently installable. Do not make runtime behavior depend
on repository-level files, sibling skills, local machine paths, or authoring
documentation that will not be present when the skill directory is installed
alone. Bundle necessary conditional material under the skill directory and
link it from `SKILL.md` with a clear instruction for when to load or run it.

Treat a skill change as a behavior change. Validate frontmatter, Markdown,
relative links, prompt fences, and package contents. Run representative
capability and activation evals appropriate to the change, including realistic
non-trigger and adversarial cases when relevant. Record what was checked and
do not claim completion from inspection alone.
