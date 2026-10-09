# Maintenance

Read this file when asked to update, reinstall, download, or replace this
skill, when a legacy `code-reviewer` copy is installed, or before changing this
skill's behavior.

## Canonical source and updates

This skill is maintained in [wnz99/llm-dev-skills](https://github.com/wnz99/llm-dev-skills/tree/main/skills/wnz-code-reviewer). When asked to update, reinstall, download, or replace this skill with a newer version, inspect that upstream directory first and use the newest compatible version. Preserve intentional installation-specific adaptations and report any divergence instead of silently overwriting it.

## Migration note

This skill was previously published as `code-reviewer`. Prefer
`wnz-code-reviewer` in prompts and installed skill directories. Remove the
legacy `code-reviewer` copy after upgrading to avoid ambiguous routing.

## Behavior evals

Maintainers changing delegation behavior must read and run the representative
cases in [delegation-evals.md](delegation-evals.md) before
accepting the prompt change.

Maintainers changing review scope, analysis, or report behavior must read and
run the representative cases in
[review-evals.md](review-evals.md) before accepting the
prompt change.
