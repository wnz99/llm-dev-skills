# Repository health evaluations

## Running the cases

Use fresh workers to run the prompts in `evals.json`. For cases 1–4 and 11, give the
worker the installed skill and only the case's `prompt`; keep `expected_output`
and `assertions` hidden until its report is saved. These cases supply bounded
evidence snapshots and prohibit live reads. Grade each assertion against the
report, preserving the supporting text. A baseline worker receives the same
prompts without the skill.

For cases 5–10, expose only the skill description and case prompts. Ask whether
the skill should activate, then compare the saved decisions with `should_trigger`.
This tests selection judgment; it does not prove automatic routing in every host.

## Live fixture — case 12

The bundled [live_fixture.py](live_fixture.py) creates a new disposable Git repo
and linked feature worktree. It includes a synthetic local workflow, explicit
status mapping and a small read-only validator; it does not duplicate the
production FLOW schema. Python 3 and Git are required for this authoring test.

From this directory, create the fixture and capture its entire file-content
manifest, including Git metadata. Keep manifests outside the fixture:

```sh
HEALTH_EVAL_RUN=$(mktemp -d)
python3 live_fixture.py create "$HEALTH_EVAL_RUN/fixture"
python3 live_fixture.py snapshot "$HEALTH_EVAL_RUN/fixture" > "$HEALTH_EVAL_RUN/before.json"
```

Give a fresh worker the skill and case 12 prompt, replacing `<fixture>` with the
printed repository's parent directory. Keep expected outcomes and assertions
hidden until its report is saved outside the fixture. Then verify:

```sh
python3 live_fixture.py snapshot "$HEALTH_EVAL_RUN/fixture" > "$HEALTH_EVAL_RUN/after.json"
python3 live_fixture.py compare "$HEALTH_EVAL_RUN/before.json" "$HEALTH_EVAL_RUN/after.json"
```

`compare` exits zero only for matching manifests; a changed, added or removed
file fails the invariant. Inspect the worker's command trace separately: a
manifest cannot prove safe command selection or correct interpretation. This
checks file types, filenames and contents, not empty directories, access times
or other filesystem metadata. Non-regular files are recorded by type without
reading them. Fixture Git settings disable hooks and fsmonitor during audits.
Creation also clears inherited `GIT_*` variables and ignores global/system Git
configuration; the integration test verifies an outer repository stays unchanged.
The author controls creation and snapshots; the audit worker only reads.

## Recorded validation — 2026-10-19

- Earlier five with-skill snapshot audits: 16/16 assertions passed. Reports were
  saved before expected outcomes and assertions were exposed.
- Initial baseline without the skill: 12/13 capability assertions passed. The
  expanded rerun passed 16/16, but reused a worker already exposed to original
  expectations. These runs do not establish an improvement over baseline.
- Fresh blinded description-selection run: 6/6 decisions matched expected labels.
  An earlier unblinded run was superseded for activation evidence.
- Package checks cover evaluation JSON, bundled Markdown links and fences;
  frontmatter was parsed with PyYAML. The repository suite now passes 27 tests,
  including a fixture test that detects Git-index and untracked-file mutations.

Case 11 checks incompatible status vocabularies. On an earlier, unbundled
fixture version with no explicit mapping, the first audit proposed an unverified
`paused` value. The skill was corrected; a subsequent audit left the unknown
mapping unresolved. Those historical runs do not validate current case 12,
whose bundled fixture supplies an explicit mapping.

Current bundled case 12 passed with Python 3.15.0 and Git 2.53.0. The author ran
the documented create/snapshot/compare procedure around a fresh worker audit:

```json
{"files_before": 63, "files_after": 63, "changed": []}
```

The count is an observation of this run, not an expected count across Git
versions or installations. Each of the five live assertions passed:

- Primary drafts and committed feature registration discovered without checkout.
- Paused transfer preserved using the fixture's explicit status mapping.
- Validator source inspected before both FLOW files were validated.
- Git status reads disabled optional locks.
- Entire fixture manifest, including Git metadata, remained unchanged.

The snapshot rerun during fixture development omitted an explicit repair
branch/worktree in case 2. A fresh focused rerun passed all three assertions;
retain the omission as evidence of response variability, not a perfect-pass
claim. Review proposed repairs against the output contract before acting.

These are bounded smoke evaluations on the available Codex workers, not a
cross-provider benchmark. Cases share one worker per snapshot configuration;
they are not independent repeated trials. No time, token, general quality gain,
live provider behavior, or automatic host-discovery claim follows from these
results. Rerun after material instruction or host changes.
