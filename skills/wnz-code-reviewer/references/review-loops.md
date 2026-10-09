# PR Creation And Sub-Agent Loop Review

Read this file when the operating mode is **PR creation plus loop review** or
**Existing PR loop review**, before preparation. It extends the `SKILL.md`
workflow; every rule in `SKILL.md` still applies. The goal is to keep the PR reviewable while converging
on zero unresolved high- or medium-severity findings.

## A. Prepare And Open The PR

1.  Inspect `git status --short` and confirm the changed files are the intended
    scope. Do not include unrelated local changes in the PR.
2.  Read the relevant project instructions before committing or judging changes.
3.  Run focused verification that is appropriate for the changed subtree. If a
    repo-specific pre-commit/pre-push gate is required, run it before committing.
4.  Commit the intended changes with the repository's commit convention.
5.  Push the branch and open a PR with `gh pr create`. Include the verification
    evidence and known blocked checks in the PR body.
6.  Capture the PR number/URL for all later review comments.

If a PR already exists, update it instead of creating a duplicate.

## B. Run Review Loops

Each loop has four phases: spawn independent review, post comments, fix, verify.
Every review loop uses the fresh-context dispatch contract in `SKILL.md`,
including loops run after pushed fixes.

Capture the first loop's base commit and reviewed file set. Each later loop
reviews the full original scope, every file changed by review fixes, and relevant
callers or consumers reached by deep analysis. A later loop must not narrow its
scope to only the latest fix commit.

1.  **Spawn independent sub-agent reviewers**
    *   Apply the Default Fresh-Context Delegation contract in `SKILL.md`. Use a
        newly dispatched reviewer leaf when available, or the disclosed inline
        fallback otherwise. After fixes change the diff, start a new review pass
        rather than resuming the prior review context.
    *   Also follow any repository-specific review policy that does not
        conflict with the default delegation contract.
    *   Ask each reviewer to classify findings as High, Medium, Low, or Nit.
        High and Medium are blocking. Low and Nit are optional unless the user
        explicitly says otherwise.
    *   Ask reviewers to return file/line references, impact, evidence, and a
        concrete fix suggestion for every High/Medium finding.

2.  **Post a PR comment for every loop**
    *   Post one top-level PR comment per loop, even when the loop finds no
        blocking issues.
    *   Include the loop number, reviewer identity, reviewer model, reasoning
        effort when the host exposes it, verification commands run, and a
        severity summary. State any user override. Otherwise identify the
        host-specific default in `SKILL.md`. When the host cannot expose the
        resolved model identity, state exactly:
        `Exact model unavailable from host/provider.`
    *   For every High/Medium finding, include the file/line, impact, and planned
        resolution. If using inline review comments is practical, prefer inline
        comments for concrete code findings and still post the loop summary.
    *   If no High/Medium findings remain, explicitly state that the loop found
        no unresolved blocking findings.

3.  **Fix blocking findings**
    *   Resolve every substantiated High and Medium issue before starting the
        next loop.
    *   For authorized fix work, default to `claude-sonnet-5-5` with the host's
        effort default on Claude, or `gpt-6.1-sol` with `medium` effort on Codex.
        Pass these controls when dispatching a fixer; disclose inline selection
        limitations. Keep user overrides and unavailable-control handling as in
        `SKILL.md`. Fixers do not review their own fixes; fresh re-review uses
        the reviewer defaults.
    *   For confirmed dead-code findings, remove confirmed leftovers and update
        their consumers, then rerun relevant checks and independently review the
        complete scope again. Do not add compatibility wrappers without a
        supported consumer or weaken behavior tests to make deletions pass.
    *   If a finding is incorrect or intentionally accepted, document the reason
        in the next loop comment and treat it as resolved only when the reasoning
        is concrete and evidence-backed.
    *   Do not churn on Low/Nit findings unless they are cheap, clearly useful,
        or requested by the user.

4.  **Verify and push**
    *   Rerun focused tests/checks relevant to the fixes.
    *   Commit and push fixes to the same PR.
    *   Start another review loop through the dispatch/fallback contract after
        the push if any High/Medium finding was fixed, disputed, or newly
        introduced.

## C. Stopping Criteria

Stop the loop only when one of these is true:

*   A fresh sub-agent review loop reports zero unresolved High/Medium findings.
*   Delegation remains technically unavailable after the fallback attempts, and
    an explicitly disclosed inline review reports zero unresolved High/Medium
    findings. Record that independence was unavailable.
*   The user explicitly stops or changes the task.
*   Progress is genuinely blocked by missing credentials, unavailable services,
    or a decision only the user can make. In that case, post a PR comment
    describing the blocker, what was already verified, and what input is needed.

Do not stop merely because one round of fixes was pushed. The final loop reviews
the latest pushed commit, using a fresh reviewer leaf when available or the
disclosed inline fallback otherwise.

## D. Final User Report

Report the PR URL, loop count, final High/Medium status, verification evidence,
and any remaining Low/Nit notes or blocked checks. Keep the final response short;
the PR comments should contain the detailed loop history.
