# Skill authoring governance

These rules apply to the entire repository.

Anyone adding or modifying a skill must, before editing:

1. Read [`docs/prompt-engineering.md`](docs/prompt-engineering.md) in full.
2. Read Anthropic's official
   [`skill-creator`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md).
3. Inspect the target skill as an installable package, including each bundled
   reference, script, asset, relative link, and declared skill dependency it uses.

Follow the repository format contract: Markdown owns all `SKILL.md`
instructional hierarchy, prose, workflows, rules, and checklists. XML is
allowed only inside embedded executable prompt templates to delimit injected
dynamic, untrusted, long, or repeated content whose boundary matters. Do not
use XML wrappers directly in skill prose.

Keep each skill installable with its explicitly declared dependencies. Skills
may depend on other skills when `SKILL.md` names each dependency, states when
and why it is required, and explains how to obtain it. Resolve dependencies
through the host's skill discovery rather than repository-relative sibling
paths or fixed local machine paths. Check required dependencies before the
affected work; if one is missing, report it and stop that work rather than
silently skipping its behavior. Optional integrations must define their fallback.
Do not make runtime behavior depend on repository-level files or authoring
documentation absent from the installation. Bundle necessary non-skill material
under the skill directory and link it from `SKILL.md` with a clear instruction
for when to load or run it.

Treat a skill change as a behavior change. Validate frontmatter, Markdown,
relative links, prompt fences, package contents, and dependency discovery and
missing-dependency behavior. Run representative
capability and activation evals appropriate to the change, including realistic
non-trigger and adversarial cases when relevant. Record what was checked and
do not claim completion from inspection alone.
