# Remote PR Preparation

Read this file during step 4 (Preparation) when the review target is a remote
PR, including an existing PR in loop mode. The read-only default and checkout
rules in `SKILL.md` still apply.

## Steps

1.  **Read without checkout by default**: Inspect metadata and the patch without
    changing the user's branch or worktree.
    ```bash
    gh pr view <PR_NUMBER> --json title,body,baseRefName,headRefName,baseRefOid,headRefOid,files
    gh pr diff <PR_NUMBER>
    ```
    Checkout only when the user explicitly requests it. If focused verification
    requires full-tree access, ask for checkout permission. Before checkout,
    inspect the worktree; if local changes could be disturbed, explain the risk
    rather than switching branches.
2.  **Context**: Read the PR title, description, changed file list, and relevant discussion to understand the goal and history.
3.  **Project Instructions**: Read nearby project instructions (`AGENTS.md`, `CLAUDE.md`, or equivalent) before judging style or architecture.
4.  **Verification Signals**: If the project has an obvious local verification command, note it and run it only when appropriate for the review scope and environment. Do not assume `npm run preflight` exists.
