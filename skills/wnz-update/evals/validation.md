# Initial validation

Validated 2026-11-05 against collection version `1.0.0` in an isolated author
worktree. No live skill installations or remote machines were updated.

## Executed checks

- `python3 -B -m unittest discover -s tests`: 54 tests passed, including 20
  updater tests with disposable Git repositories and installation roots.
- Updater tests exercise unversioned history matching, content and package-set
  conflicts, unchanged-content version increases, same-version changed-release
  rejection, downgrade protection, dependency installation and missing-package
  failure, inspection races, rollback after an injected receipt-write failure,
  interrupted-install recovery, read-only checks, process lock exclusion,
  canonical runtime links, unsafe upstream paths, local-only scope, named/all
  discovery, partial-fleet failure, and self-package replacement.
- The SSH worker code executes in a real subprocess with a disposable HOME;
  the SSH transport is intercepted locally. Inventory, installation, and remote
  conflict propagation pass through the actual JSON protocol. This does not
  establish live SSH connectivity or Herdr authentication.
- Existing package contract checks now include `wnz-update` resources and evals.
  Frontmatter parsed with PyYAML; relative resources, fences, eval JSON, and
  whitespace checks passed. No required sibling skill dependency is introduced.
  Missing external tools fail the affected action; remotes are never discovered
  in default local scope.

## Simulated skill evaluation

Two fresh native agents ran cases 1–6 with and without the new skill, producing
outputs and same-agent grades. With-skill expectations passed; baseline mean
pass rate was 58.3%. These are non-blind command-selection and disposition
smoke tests, not a statistical benchmark. Baseline lacks knowledge of the newly
created command, and expectations differ in granularity between evaluators.
Activation judgments used metadata rather than an actual host catalog reload.

Artifacts and the generated skill-creator review viewer are local authoring
outputs under `/tmp/wnz-update-eval/`, outside the installed package. No token
or timing totals were exposed by the host, so none are claimed. The host has
no agent close/shutdown API; completed workers could not be explicitly closed.

## Authoring sources

- [GSD updater](https://github.com/gsd-build/get-shit-done/blob/main/get-shit-done/workflows/update.md): installation detection, version checks, preservation and restart reminders informed the workflow. GSD's npm installer and confirmation behavior were not copied.
- [Anthropic skill creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md): self-contained package and capability/activation evaluation workflow.

The collection uses one version; no per-skill version files are created.
The origin release must include this change before the default network command
can install it. The implementation does not publish or deploy itself.
