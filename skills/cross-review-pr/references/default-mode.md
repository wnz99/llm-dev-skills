# Default-Mode Mechanics

Read this reference when running the normal PR workflow. It owns the shared
prompt validator, sensitive temporary-file lifecycle, optional checkout/restore
mechanics, provider command transport, and optional posting mechanics. Deep
mode also uses the validator below; its remaining mechanics live in
`deep-mode.md`.

## Shared Prompt Validator

Install this function in the controller shell and call it for every generated
prompt. Each failed predicate returns nonzero itself, so a later successful
command cannot mask an earlier failure. The accepted shapes are deliberately
limited to the prompt forms documented by this skill: default `# Task` prompts
with `## Diff`, bounded PR diff data, or `## Source: path` fenced source; D0
deep prompts with `# Deep Review Area` and fenced `## Source: path`; and D4
deep prompts with `# Area`, `# Source Or Diff Payload`, and bounded source/diff
data.

```bash
validate_prompt() {
  prompt_file=${1:-}
  [ -n "$prompt_file" ] || return 1
  [ -f "$prompt_file" ] || return 1
  [ -r "$prompt_file" ] || return 1
  [ -s "$prompt_file" ] || return 1

  unresolved_status=0
  LC_ALL=C rg -q '\{\{[A-Z][A-Z0-9_]*\}\}' "$prompt_file" || unresolved_status=$?
  case "$unresolved_status" in
    0)
      printf '%s\n' "Prompt contains an unresolved template token: $prompt_file" >&2
      return 1
      ;;
    1)
      ;;
    *)
      printf '%s\n' \
        "Unable to scan prompt for unresolved template tokens (rg status $unresolved_status): $prompt_file" >&2
      return 1
      ;;
  esac

  LC_ALL=C awk '
    function nonblank(line) {
      gsub(/[[:space:]]/, "", line)
      return length(line) > 0
    }
    /^# Task[[:space:]]*$/ { task=1 }
    /^# Deep Review Area[[:space:]]*$/ { deep_d0=1 }
    /^# Area[[:space:]]*$/ { deep_d4=1 }
    /^# Source Or Diff Payload[[:space:]]*$/ { deep_payload_heading=1 }

    /^## Diff[[:space:]]*$/ { diff=1; next }
    diff && (/^# / || /^## /) { diff=0 }
    diff && !/^<\/?pr-diff-untrusted-data>$/ && nonblank($0) { payload=1 }

    /^## Source: [^[:space:]].*$/ { source=1; next }
    source && /^```[^`]*[[:space:]]*$/ { source_fence=1; next }
    source_fence && /^```[[:space:]]*$/ { source=0; source_fence=0; next }
    source_fence && nonblank($0) { payload=1 }

    /^<pr-diff-untrusted-data>[[:space:]]*$/ { pr_open=1; in_pr=1; next }
    /^<\/pr-diff-untrusted-data>[[:space:]]*$/ {
      if (in_pr) pr_closed=1
      in_pr=0
      next
    }
    in_pr && nonblank($0) { pr_payload=1 }

    /^<source-or-diff-untrusted-data>[[:space:]]*$/ { sd_open=1; in_sd=1; next }
    /^<\/source-or-diff-untrusted-data>[[:space:]]*$/ {
      if (in_sd) sd_closed=1
      in_sd=0
      next
    }
    in_sd && nonblank($0) { sd_payload=1 }

    END {
      bounded_pr = pr_open && pr_closed && pr_payload
      bounded_sd = sd_open && sd_closed && sd_payload
      default_ok = task && (payload || bounded_pr)
      d0_ok = deep_d0 && payload
      d4_ok = deep_d4 && deep_payload_heading && bounded_sd
      exit(default_ok || d0_ok || d4_ok ? 0 : 1)
    }
  ' "$prompt_file" || return 1
}
```

Use it in the same shell that launches the reviewer:

```bash
validate_prompt "$PROMPT_FILE" || {
  printf '%s\n' "Invalid or incomplete prompt: $PROMPT_FILE" >&2
  exit 1
}
```

## Private Temporary Lifecycle And Restore

Install this handler before writing prompt, metadata, diff, or output files:

```bash
CROSS_REVIEW_TMPDIR=$(mktemp -d /tmp/cross-review-pr-XXXXXX)
ORIGINAL_BRANCH=$(git symbolic-ref --quiet --short HEAD || true)
ORIGINAL_HEAD=$(git rev-parse --verify HEAD)
CHECKOUT_AUTHORIZED=0
CHECKOUT_ATTEMPTED=0
BRANCH_CHANGED=0
POST_CHECKOUT_BRANCH=
POST_CHECKOUT_HEAD=
capture_post_checkout_state() {
  POST_CHECKOUT_BRANCH=$(git symbolic-ref --quiet --short HEAD || true)
  POST_CHECKOUT_HEAD=$(git rev-parse --verify HEAD 2>/dev/null || true)
  if [ "$POST_CHECKOUT_BRANCH" != "$ORIGINAL_BRANCH" ] ||
     [ "$POST_CHECKOUT_HEAD" != "$ORIGINAL_HEAD" ]; then
    BRANCH_CHANGED=1
  fi
}
exit_for_cross_review_signal() {
  signal_status=$1
  if [ "$CHECKOUT_ATTEMPTED" -eq 1 ]; then
    capture_post_checkout_state
  fi
  exit "$signal_status"
}
cleanup_cross_review() {
  readonly original_status=$?
  cleanup_failure=0
  trap - EXIT HUP INT TERM
  if [ "$CHECKOUT_AUTHORIZED" -eq 1 ] && [ "$BRANCH_CHANGED" -eq 1 ]; then
    current_branch=$(git symbolic-ref --quiet --short HEAD || true)
    current_head=$(git rev-parse --verify HEAD 2>/dev/null || true)
    if [ "$current_branch" = "$ORIGINAL_BRANCH" ] &&
       [ "$current_head" = "$ORIGINAL_HEAD" ]; then
      : # Already restored; cleanup remains idempotent.
    elif [ "$current_branch" = "$POST_CHECKOUT_BRANCH" ] &&
         [ "$current_head" = "$POST_CHECKOUT_HEAD" ] &&
         test -z "$(git status --porcelain)"; then
      if [ -n "$ORIGINAL_BRANCH" ]; then
        git checkout --quiet "$ORIGINAL_BRANCH" || cleanup_failure=$?
      elif git checkout --quiet --detach "$ORIGINAL_HEAD"; then
        restored_branch=$(git symbolic-ref --quiet --short HEAD || true)
        restored_head=$(git rev-parse --verify HEAD 2>/dev/null || true)
        if [ -n "$restored_branch" ] || [ "$restored_head" != "$ORIGINAL_HEAD" ]; then
          printf '%s\n' "Failed to restore the original detached HEAD exactly." >&2
          cleanup_failure=1
        fi
      else
        cleanup_failure=$?
      fi
    else
      printf '%s\n' "Not restoring the original HEAD identity: checkout state is dirty or unexpected." >&2
      cleanup_failure=1
    fi
  fi
  if [ -n "${CROSS_REVIEW_TMPDIR:-}" ] && [ -d "$CROSS_REVIEW_TMPDIR" ]; then
    rm -rf -- "$CROSS_REVIEW_TMPDIR" || cleanup_failure=$?
  fi
  if [ "$original_status" -ne 0 ]; then
    exit "$original_status"
  fi
  exit "$cleanup_failure"
}
trap cleanup_cross_review EXIT
trap 'exit_for_cross_review_signal 129' HUP
trap 'exit_for_cross_review_signal 130' INT
trap 'exit_for_cross_review_signal 143' TERM
```

Keep the handler active through every provider and posting path. It restores
HEAD only when checkout was authorized, HEAD actually changed, the current
state still exactly matches the recorded post-checkout state, and the worktree
is clean. It preserves an original named branch or exact detached commit.

## Guarded Checkout

Read-only PR inspection is the default. If a concrete finding requires a full
checkout, explain why and obtain explicit authorization first. Then run:

```bash
CHECKOUT_AUTHORIZED=1
git status --short
test -z "$(git status --short)" || {
  printf '%s\n' "Working tree is dirty; inspect before checking out the PR."
  exit 1
}
CHECKOUT_ATTEMPTED=1
if gh pr checkout "$PR_NUM"; then
  checkout_status=0
else
  checkout_status=$?
fi
capture_post_checkout_state
if [ "$checkout_status" -ne 0 ]; then
  printf '%s\n' "PR checkout failed with status $checkout_status" >&2
  exit "$checkout_status"
fi
test -n "$POST_CHECKOUT_BRANCH" || {
  printf '%s\n' "PR checkout did not leave a recognizable branch" >&2
  exit 1
}
```

Do not check out when user changes could be disturbed. The exit handler will
refuse to overwrite dirty or unexpected post-checkout state.

## Provider Invocation

Use a distinct prompt/output file per reviewer and validation pass, validate
each prompt under the controller's semantic contract, and invoke through argv,
stdin, or an attached file:

```bash
codex exec -s read-only --ephemeral -o "$OUTPUT_FILE" - < "$PROMPT_FILE"

claude -p "Follow the instructions provided on stdin." \
  --verbose --output-format stream-json --include-partial-messages \
  < "$PROMPT_FILE" > "$OUTPUT_FILE" 2>&1

opencode run "Follow the instructions in the attached file" \
  -f "$PROMPT_FILE" --format json > "$OUTPUT_FILE" 2>&1
```

Monitor quiet processes before judging them stuck. Capture nonzero status and
handle the controller's documented partial-failure cases explicitly.

## Optional Posting

`--post` only requests a confirmation checkpoint. After rendering and
validating exactly `$CROSS_REVIEW_TMPDIR/cross-review-report.md`, show it to the
user and ask whether to post it. Only an affirmative reply authorizes:

```bash
gh pr comment "$PR_NUM" --body-file "$CROSS_REVIEW_TMPDIR/cross-review-report.md"
```

Do not post another path, an unvalidated report, or without confirmation.
