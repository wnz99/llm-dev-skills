# Skill maintenance

## Canonical source and updates

This skill is maintained in [wnz99/llm-dev-skills](https://github.com/wnz99/llm-dev-skills/tree/main/skills/wnz-phase-executor). When asked to update, reinstall, download, or replace this skill with a newer version, inspect that upstream directory first and use the newest compatible version. Preserve intentional installation-specific adaptations and report any divergence instead of silently overwriting it.

## Migration note

Install the complete package, including `scripts/ledger.py` and
`references/ledger-usage.md`. The ledger command requires Python 3 on a POSIX
host; run `python3 <resolved-package-path>/scripts/ledger.py --help` to check
availability without creating records. Read the ledger reference before
initialization or explicit migration. An update does not migrate existing
Markdown ledgers; preserve their history and review the JSON seed separately.
When using Flow Status, refresh the installed workflow from its current setup
template so task bookkeeping uses the command.

This skill was previously published as `phased-implementation-review-loop`.
Prefer `wnz-phase-executor` in prompts and installed skill directories. Remove
the legacy `phased-implementation-review-loop` copy after upgrading to avoid
ambiguous routing, especially for review-only requests that should use
`wnz-code-reviewer`.
