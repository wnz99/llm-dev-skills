# Platform command examples

Read only the selected platform section. Commands assume authenticated tools.
Resolve variables from repository evidence: `ship_remote`, `ship_head`,
`ship_base`, `ship_title`, and `ship_body` (path to a UTF-8 Markdown file).
`ship_repo` is the target repository identifier; forks require the actual source
repository too. Quote all expansions. Never evaluate title/body text as shell code.
Examples create ready requests; use the documented draft option when selected.

## Shared Git preparation

```bash
git status --short
git remote -v
git branch --show-current
git fetch "$ship_remote" "$ship_base"
git log --oneline FETCH_HEAD..HEAD
git diff --stat FETCH_HEAD...HEAD
git diff FETCH_HEAD...HEAD
git rev-parse HEAD
git push --set-upstream "$ship_remote" "HEAD:refs/heads/$ship_head"
```

Run the push only after scope and check ownership are established. Fetch the target from
its own remote when the push remote is a fork. These commands do not commit files.

## GitHub: gh

`ship_repo`: `[HOST/]OWNER/REPO`; `ship_head_selector`: branch or `OWNER:branch`.
Filter listing results by source repository too, especially for forks.

```bash
gh auth status
gh pr list --repo "$ship_repo" --head "$ship_head" --base "$ship_base" --state open --json number,url,headRepository,headRefName,baseRefName
gh pr create --repo "$ship_repo" --head "$ship_head_selector" --base "$ship_base" --title "$ship_title" --body-file "$ship_body"
gh pr edit "$ship_pr" --repo "$ship_repo" --title "$ship_title" --body-file "$ship_body"
gh pr view "$ship_pr" --repo "$ship_repo" --json url,title,body,headRefName,headRefOid,baseRefName,isDraft,headRepository
gh pr checks "$ship_pr" --repo "$ship_repo"
```

Execute create or edit, not both. Add `--draft` to create for a draft request.
`--dry-run` may still push; do not use it for side-effect-free evaluation.

Source: [GitHub CLI](https://cli.github.com/manual/gh_pr_create).

## GitLab: glab

`ship_repo`: target project path or URL. For forks, set the verified source
project through supported `--head` behavior; inspect installed help for the
cross-project form before creation.

```bash
glab auth status
glab mr list --repo "$ship_repo" --source-branch "$ship_head" --target-branch "$ship_base" --output json
glab mr create --repo "$ship_repo" --source-branch "$ship_head" --target-branch "$ship_base" --title "$ship_title" --description-file "$ship_body" --yes
glab mr update "$ship_mr" --repo "$ship_repo" --title "$ship_title" --description "$(< "$ship_body")"
glab mr view "$ship_mr" --repo "$ship_repo" --output json
```

Create or update as appropriate. Add `--draft` to create for draft mode.
The quoted file substitution passes content as one literal argument.
Read back source project, target project, branches, SHA, description and draft state.

Source: [GitLab CLI](https://docs.gitlab.com/cli/mr/create/).

## Azure DevOps: az repos

Requires the Azure CLI `azure-devops` extension and authenticated organization.
`ship_org`: organization URL; `ship_project`: project; `ship_repo`: repository ID/name.
Do not silently install tools or change global defaults to make these examples work.

```bash
az repos pr list --organization "$ship_org" --project "$ship_project" --repository "$ship_repo" --source-branch "$ship_head" --target-branch "$ship_base" --status active --output json
az repos pr create --organization "$ship_org" --project "$ship_project" --repository "$ship_repo" --source-branch "$ship_head" --target-branch "$ship_base" --title "$ship_title" --description "$(< "$ship_body")" --draft false --output json
az repos pr update --organization "$ship_org" --id "$ship_pr_id" --title "$ship_title" --description "$(< "$ship_body")" --output json
az repos pr show --organization "$ship_org" --id "$ship_pr_id" --output json
```

Use `--draft true` for draft mode. Compare source/target refs and
`lastMergeSourceCommit.commitId` with the intended pushed commit.

Source: [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/repos/pr?view=azure-cli-latest).

## Bitbucket Cloud: REST API with curl and jq

Use the official REST API rather than assuming a universal `bb` CLI.
`ship_api` is `https://api.bitbucket.org/2.0/repositories/WORKSPACE/REPO`.
Configure `ship_curl_config` as an existing protected curl config containing
authentication; do not print its contents, tokens, or verbose request headers.
`ship_payload` and `ship_response` are temporary JSON file paths.

```bash
curl --fail-with-body --silent --show-error --config "$ship_curl_config" --get "$ship_api/pullrequests" --data-urlencode 'state=OPEN' --output "$ship_response"
jq -n --arg title "$ship_title" --rawfile description "$ship_body" --arg head "$ship_head" --arg base "$ship_base" '{title:$title,description:$description,source:{branch:{name:$head}},destination:{branch:{name:$base}},close_source_branch:false}' > "$ship_payload"
curl --fail-with-body --silent --show-error --config "$ship_curl_config" --request POST "$ship_api/pullrequests" --header 'Content-Type: application/json' --data-binary "@$ship_payload" --output "$ship_response"
jq '{id,url:.links.html.href,title,description,source,destination,draft}' "$ship_response"
curl --fail-with-body --silent --show-error --config "$ship_curl_config" "$ship_api/pullrequests/$ship_pr_id" --output "$ship_response"
```

Before POST, follow list pagination and match source repository, source branch
and destination branch. For forks, add `source.repository.full_name` to the
payload. For updates, use PUT to the PR URL with a payload containing only the
intended title/description. Inspect provider support before selecting draft mode;
do not assume GitHub flags apply. Read `.source.commit.hash` and both repository
identities from the GET response. Retain the title/body if authentication fails.

Source: [Bitbucket Cloud pull requests API](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/).

Examples checked against official references on 2026-11-06. Installed versions
and self-hosted editions may differ; check local help on an actual mismatch.
