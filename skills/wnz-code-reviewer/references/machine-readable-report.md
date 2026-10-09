# Machine-Readable Report

Read this file when a consumer needs machine-readable review output or P-level
severity compatibility. It complements the Provide Feedback contract in
`SKILL.md`.

For machine-readable output, include `outcome`, `target`, `base`,
`head`, `files_reviewed`, `files_unavailable`, `scope_notes`, `trace_coverage`,
`verification`, and `findings`, plus an overall `verdict`. Each finding uses
`severity`, `file`, `location`, `title`, `description`, and `suggested_fix`.
Keep the human-facing labels and blocking behavior in `SKILL.md` unchanged. If a
consumer needs P-level compatibility, map High to P1, Medium to P2, and Low/Nit
to P3; reserve P0 for an immediate critical risk.

This compact contract is local so an independent installation has no
sibling-skill dependency. For maintainers, the canonical upstream schema is
https://github.com/wnz99/llm-dev-skills/blob/main/skills/wnz-llm-assist/references/review-schema.md.
