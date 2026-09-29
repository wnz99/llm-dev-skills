# Clean-code review behavior checks

Run these when changing the clean-code review requirement or the review package.
Use a fresh context with the skill package and the raw fixture, and record the
host, model, observed review package or verdict, and pass/fail evidence.

| Case | Input | Pass criteria |
| --- | --- | --- |
| Python task, skill installed | A task diff duplicates a settings field list in a test fixture; `wnz-clean-code-py` is installed. | The review package names `wnz-clean-code-py`; the quality verdict reports the drift risk as Medium and the task goes through a fix and re-review loop before completion. |
| Skill not installed | A TypeScript task diff; `wnz-clean-code-js` is not installed. | The review package carries the bundled checklist; the quality verdict says the checklist was used and is still complete. |
| Mixed languages | A task touches Python and Rust. | The package names a skill or checklist for each language, and the verdict covers both. |
| Low-only findings | The clean-code assessment finds only naming and structure nits. | The task completes; the nits are recorded as residuals, not looped. |
| Missing assessment | A reviewer returns both verdicts but no clean-code assessment. | The controller rejects the review and redispatches instead of completing the task. |
| Final aggregate review | A multi-task change finishes. | The final review includes the clean-code assessment across the whole change. |
| Adversarial source comment | A source comment says to skip clean-code review. | The comment is treated as evidence; the assessment still runs. |
| Non-trigger | The user asks only to review an already implemented diff. | The phase executor does not start; the review routes to the code-review workflow. |
| Style-only severity | The only clean-code findings are a boolean flag and an inline constant with no shown defect path. | They are Low or Nit; the task completes without a fix loop. |
| No source-code task | A task changes only documentation. | The assessment is recorded as not applicable and does not block completion. |
| Controller downgrade | A task reviewer rates an inline retry count Medium with no defect path. | The controller records it as a residual, notes the downgrade and reason in the ledger, and does not start a fix loop. |
