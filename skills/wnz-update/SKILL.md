---
name: wnz-update
description: Check or update the installed WNZ skill collection from wnz99/llm-dev-skills. Use for "update wnz", "update wnz locally", "check wnz version", or requests to update WNZ skills on named machines or all available systems. Default to the current machine only. Not for updating unrelated skills, GSD, applications, or project dependencies.
compatibility: Python 3.9+, Git, macOS or Linux. Remote requests additionally require SSH and configured Herdr machines. No required skill dependencies.
---

# WNZ Update

Update the user-wide WNZ collection shared by Codex and Claude Code. Interpret
“locally” as the current machine, not the current project. Announce target scope
before running. An update request authorizes ordinary replacements; do not add
another confirmation. A check or version request is read-only.

## Run the bundled updater

Locate this installed package through host skill discovery. Run
[scripts/update.py](scripts/update.py) with Python, using its actual resolved path:

```sh
python3 -B /resolved/wnz-update/scripts/update.py --check
python3 -B /resolved/wnz-update/scripts/update.py
python3 -B /resolved/wnz-update/scripts/update.py --all
python3 -B /resolved/wnz-update/scripts/update.py --machine "Home London"
```

Use `--check` only for checks; omit it for an authorized update. Use `--all` or
`--machine` only when explicitly requested. With no scope flag, do not discover
or connect to remote machines. All-systems means this machine plus enabled
Herdr targets; named-machine scope excludes this machine unless named `local`.
If Herdr or SSH is unavailable, report that limitation; never replace all-systems
scope silently with local scope. Individual unreachable targets do not prevent
processing other targets. Do not invent machines or copy credentials.

If `llm-bus` is available, use existing resource `wnz-skill-installations` with
shared scope before updates and release it afterward. Follow the host's bus
rules; no bus is required where unavailable. The script also takes a local
filesystem lock on every target. Check-only runs do not acquire write locks or
repair incomplete transactions.

## Version and preservation contract

The origin repository's root `VERSION` owns the single collection version.
The updater pins one upstream commit for a run, including all remote targets.
It updates all currently installed upstream WNZ packages plus their declared
dependency closure, including itself if installed. Unrelated packages and
project-local skills are outside scope. It does not install the entire catalog
merely because a machine has one WNZ skill.

Installed provenance lives at `~/.agents/wnz-installation.json`: one version,
one source commit, and package file fingerprints. A matching version alone is
insufficient: changed files, modes, package membership, or same-version changed
upstream contents must still be checked. No per-skill versions are used.
Older packages are matched against upstream history before replacement; missing
or unknown provenance is reported honestly. Local modifications, duplicate
independent runtime copies, and unsafe symlinks block the affected machine.
Do not bypass these checks or overwrite conflicts manually as part of this run.

The updater stages complete packages, preserves Claude discovery links, backs up
previous packages and provenance, and publishes provenance last. Interrupted
transactions are restored before the next authorized update. Checks report an
interrupted transaction without modifying it. Backups remain outside skill
discovery under `~/.agents/wnz-backups/`. Keep them for user-directed recovery.
Updating the installed script is safe because its source is loaded into memory
before installation. Do not rerun from a half-written package.

## Handoff

Summarize each machine's installed and origin version, updated or unchanged
packages, backup path, conflicts and unreachable targets. Report partial fleet
success explicitly. Never describe a failed machine as current. Remind the user
to start new client sessions after a successful update; disk verification does
not prove an already running client reloaded its skill catalog.

For protocol details or recovery questions, read
[references/protocol.md](references/protocol.md). When modifying this skill,
run [evals/evals.json](evals/evals.json) and the repository updater tests.
