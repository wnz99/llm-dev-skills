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

## Recorded validation — 2026-10-19

- Final five with-skill snapshot audits: 16/16 assertions passed. Reports were
  saved before expected outcomes and assertions were exposed.
- Initial baseline without the skill: 12/13 capability assertions passed. The
  expanded rerun passed 16/16, but reused a worker already exposed to original
  expectations. These runs do not establish an improvement over baseline.
- Fresh blinded description-selection run: 6/6 decisions matched expected labels.
  An earlier unblinded run was superseded for activation evidence.
- Package checks cover evaluation JSON, bundled Markdown links and fences;
  frontmatter was parsed with PyYAML. The repository suite passed 26 tests.

An additional adversarial case (11) checks incompatible status vocabularies.
The first live fixture run proposed an unverified `paused` projection value;
the skill was revised to require the owner's mapping before diagnosing or
prescribing such changes. The final live audit correctly left that comparison
unresolved. It discovered drafts in the primary worktree and registration on
the feature branch, preserving a legitimate handoff. Before/after SHA256
manifests matched for all 60 fixture files, including Git metadata.

These are bounded smoke evaluations on the available Codex workers, not a
cross-provider benchmark. Cases share one worker per snapshot configuration;
they are not independent repeated trials. No time, token, general quality gain,
live provider behavior, or automatic host-discovery claim follows from these
results. Rerun after material instruction or host changes.
