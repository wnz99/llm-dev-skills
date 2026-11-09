# Model policy

Read this file before delegating writing or review work, or when the user names
a model or effort level.

For authoring, rewriting, and correctness edits, default to
`claude-sonnet-5-5` with the host's effort default on Claude, or `gpt-6.1-sol`
with `medium` effort on Codex. For read-only audits and independent document
reviews, default to `claude-opus-5-5` or `gpt-6.1-sol`, both with `medium`
effort. In hybrid work, assess the findings with the review tier and draft the
authorized replacement with the writing tier. Model choice does not authorize
structural changes or allow inventing architectural or policy decisions.

An explicit user override changes only the named model or effort control. Use
available native selection or authorized bounded delegation; prose cannot
switch the caller's model. Disclose an unenforceable default and its
host-supported fallback before work. If an explicit control cannot be honored,
stop the affected work until the user permits an alternative. Report unexposed
resolved controls as unavailable instead of claiming selection succeeded. Do
not invoke an external provider solely to enforce this policy.

When changing this policy, run the cases in
[model-policy-evals.md](model-policy-evals.md).
