"""Build a disposable audit target, or compare its file-content manifests.

Authoring-only helper. Creation writes solely to a new directory supplied by
the caller; snapshot reads that directory and prints JSON to stdout.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys


def git(repo, *args):
    git_env = {key: value for key, value in os.environ.items()
               if not key.startswith("GIT_")}
    git_env.update(GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL="/dev/null")
    return subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null",
         "-c", "commit.gpgSign=false", "-c", "core.fsmonitor=false", *args],
        cwd=repo, env=git_env, check=True, capture_output=True, text=True,
    ).stdout.strip()


def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def create(root):
    root.mkdir(parents=True, exist_ok=False)
    main = root / "main"
    main.mkdir()
    git(main, "init", "--initial-branch=main")
    git(main, "config", "core.fsmonitor", "false")
    git(main, "config", "core.hooksPath", "/dev/null")
    git(main, "config", "user.name", "Health fixture")
    git(main, "config", "user.email", "fixture@example.invalid")
    write(main / "AGENTS.md", "Read WORKFLOW.md. Audit only; do not modify this fixture.\n")
    write(main / "WORKFLOW.md", """# Fixture workflow
This synthetic fixture has its own format, not the full production FLOW schema.
Primary-worktree .planning/drafts holds private FLOW projections. Tracked GSD
registration after phase 8 lives in the feature worktree's .planning/STATE.md and
.planning/quick. Phase 2 requires no GSD registration. Paused transfers are valid.
Canonical ledger is the file named by steps.9.evidence. FLOW task values are
pending/in_progress/done; a paused ledger task maps to in_progress. No delivery
claim is made. Read-only validator: python3 validate_flow.py FLOW_PATH, run from
this worktree after inspecting its source. It checks this fixture's task enums.
""")
    write(main / "validate_flow.py", """import json
from pathlib import Path
import sys
flow = json.loads(Path(sys.argv[1]).read_text())
assert all(s in {'pending', 'in_progress', 'done'} for s in flow['tasks'].values())
print('Fixture task values valid')
""")
    write(main / ".gitignore", ".planning/drafts/\n")
    git(main, "add", ".")
    git(main, "commit", "-m", "Fixture policy")
    feature = root / "feature"
    git(main, "worktree", "add", "-b", "wip/refactor", str(feature))
    write(feature / ".planning/STATE.md", "# State\n## Registered Work\nrefactor | quick/7-refactor | paused transfer\n")
    approved_plan = "Approved parser refactor; tasks 1-3 done, 4-5 paused, 6-8 pending.\n"
    write(feature / ".planning/quick/7-refactor/PLAN.md", approved_plan)
    write(feature / ".planning/quick/7-refactor/SUMMARY.md", "User-requested transfer to wip/refactor; no delivery claim.\n")
    git(feature, "add", ".planning")
    git(feature, "commit", "-m", "Register fixture work")
    ledger = root / "ledger.md"
    write(ledger, "Canonical ledger: user-requested transfer. Tasks 1-3 done, 4-5 paused, 6-8 pending. Continue wip/refactor.\n")
    flows = {
        "refactor": {"ticket": "refactor", "status": "paused", "step": 9,
                     "branches": ["wip/refactor"], "gsd_quick": ".planning/quick/7-refactor",
                     "tasks": {str(n): "done" if n <= 3 else "in_progress" if n <= 5 else "pending"
                               for n in range(1, 9)},
                     "steps": {"9": {"evidence": str(ledger)}},
                     "next": "User-requested transfer; continue wip/refactor"},
        "annexes": {"ticket": "annexes", "status": "active", "step": 2,
                    "branches": [], "gsd_quick": None, "tasks": {},
                    "next": "Draft approved-scope plan"},
    }
    for name, flow in flows.items():
        flow.update(prs=[], updated_at="2026-10-16T09:11:24+00:00")
        draft = main / ".planning/drafts" / name
        write(draft / "FLOW.json", json.dumps(flow, indent=2) + "\n")
        write(draft / "PLAN.md", approved_plan if name == "refactor" else "Annexes plan in progress.\n")
    print(feature)


def snapshot(root):
    result = {}
    for directory, dirs, files in os.walk(root, followlinks=False):
        for name in files + [d for d in dirs if (Path(directory) / d).is_symlink()]:
            path = Path(directory) / name
            kind = stat.S_IFMT(path.lstat().st_mode)
            if stat.S_ISLNK(kind):
                content = os.fsencode(os.readlink(path))
            elif stat.S_ISREG(kind):
                content = path.read_bytes()
            else:
                result[str(path.relative_to(root))] = {"kind": kind}
                continue
            result[str(path.relative_to(root))] = {
                "kind": kind, "sha256": hashlib.sha256(content).hexdigest(),
            }
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("create", "snapshot", "compare"))
    parser.add_argument("paths", nargs="+", type=Path)
    args = parser.parse_args()
    if args.action in {"create", "snapshot"}:
        if len(args.paths) != 1:
            parser.error("create and snapshot require one directory")
        root = args.paths[0].resolve()
        if args.action == "create":
            create(root)
        else:
            if not root.is_dir():
                parser.error("snapshot target is not a directory")
            print(json.dumps(snapshot(root), indent=2, sort_keys=True))
        return 0
    if len(args.paths) != 2:
        parser.error("compare requires before and after manifest files")
    before, after = (json.loads(p.read_text()) for p in args.paths)
    changed = sorted(key for key in before.keys() | after.keys()
                     if before.get(key) != after.get(key))
    print(json.dumps({"files_before": len(before), "files_after": len(after),
                      "changed": changed}))
    return int(bool(changed))


if __name__ == "__main__":
    sys.exit(main())
