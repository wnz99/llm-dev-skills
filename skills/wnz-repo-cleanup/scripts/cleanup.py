"""Bounded Git housekeeping. Discovery never authorizes removal."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys


def git(repo, *args, check=True):
    env = {k: v for k, v in os.environ.items()
           if not k.startswith("GIT_")}
    result = subprocess.run(
        ["git", "--no-optional-locks", "-C", str(repo), *args],
        env=env, capture_output=True, text=True)
    if check and result.returncode:
        raise ValueError(result.stderr.strip() or "Git command failed")
    return result


def root(path):
    return Path(git(path, "rev-parse", "--show-toplevel").stdout.strip()).resolve()


def oid(repo, ref):
    return git(repo, "rev-parse", "--verify", "--end-of-options", f"{ref}^{{commit}}").stdout.strip()


def merged(repo, tip, base):
    result = git(repo, "merge-base", "--is-ancestor", tip, base, check=False)
    if result.returncode not in (0, 1):
        raise ValueError(result.stderr.strip() or "Cannot establish ancestry")
    return result.returncode == 0


def worktrees(repo):
    records = []
    for block in git(repo, "worktree", "list", "--porcelain", "-z").stdout.split("\0\0"):
        record = {}
        for field in block.split("\0"):
            if field:
                key, _, value = field.partition(" ")
                record[key] = value
        if record:
            records.append(record)
    return records


def status(repo):
    return git(repo, "status", "--porcelain=v1", "--untracked-files=normal",
               "--ignored=matching").stdout


def inspect(repo, base):
    base_tip = oid(repo, base)
    trees = worktrees(repo)
    branches = []
    integrated = set(git(repo, "for-each-ref", f"--merged={base_tip}",
                         "--format=%(refname)", "refs/heads").stdout.splitlines())
    for row in git(repo, "for-each-ref", "--format=%(refname:short)%09%(objectname)",
                   "refs/heads").stdout.splitlines():
        name, tip = row.split("\t")
        branches.append({"branch": name, "tip": tip,
                         "ancestor_of_base": f"refs/heads/{name}" in integrated})
    for tree in trees:
        path = Path(tree["worktree"])
        tree["status_including_ignored"] = status(path) if path.exists() else None
    return {"repo": str(repo), "base": base, "base_tip": base_tip,
            "snapshot": "local refs; ownership and staleness require separate evidence",
            "branches": branches, "worktrees": trees,
            "stash_ids": git(repo, "stash", "list", "--format=%gd").stdout.splitlines(),
            "current_status_including_ignored": status(repo)}


def check_base(repo, base, expected):
    actual = oid(repo, base)
    if actual != expected:
        raise ValueError("Base changed; inspect and propose again")
    return actual


def remove_branch(repo, args):
    base_tip = check_base(repo, args.base, args.expect_base)
    name = args.target
    base_ref = git(repo, "rev-parse", "--symbolic-full-name", args.base).stdout.strip()
    if (name in {"main", "master", "develop", "dev", "trunk", "stable"}
            or name.startswith("release/") or f"refs/heads/{name}" == base_ref):
        raise ValueError("Protected/integration branch")
    tip = oid(repo, f"refs/heads/{name}")
    if tip != args.expect_tip or not merged(repo, tip, base_tip):
        raise ValueError("Branch changed or is not integrated into the verified base")
    if any(tree.get("branch") == f"refs/heads/{name}" for tree in worktrees(repo)):
        raise ValueError("Branch is checked out; resolve its worktree first")
    # Native -d adds Git's own merge and worktree checks. Never escalate to -D.
    return git(repo, "branch", "-d", "--", name).stdout.strip()


def remove_worktree(repo, args):
    base_tip = check_base(repo, args.base, args.expect_base)
    trees = worktrees(repo)
    requested = Path(args.target)
    if requested.is_symlink():
        raise ValueError("Use the registered worktree path, not a symlink")
    matches = [t for t in trees if Path(t["worktree"]).resolve() == requested.resolve()]
    if len(matches) != 1:
        raise ValueError("Target is not an exact registered worktree path")
    tree = matches[0]
    target = Path(tree["worktree"])
    if (target.resolve() in {repo, Path(trees[0]["worktree"]).resolve()}
            or Path.cwd().resolve().is_relative_to(target.resolve())
            or "locked" in tree or "prunable" in tree):
        raise ValueError("Current, primary, locked or missing worktree is protected")
    tip = oid(target, "HEAD")
    if tip != args.expect_tip or not merged(repo, tip, base_tip):
        raise ValueError("Worktree changed or contains unintegrated commits")
    if status(target):
        raise ValueError("Worktree contains changes, untracked or ignored data")
    git(repo, "worktree", "remove", "--", str(target))
    return f"Removed worktree {target}"


def artifact(repo, name):
    path = Path(name)
    path = path if path.is_absolute() else repo / path
    # Reject symlinks before resolve, including intermediate components.
    path = Path(os.path.abspath(path))
    anchor = next((p for p in (path, *path.parents) if p.resolve() == repo), None)
    if anchor is None or path == anchor:
        raise ValueError("Artifact must be a strict descendant of this worktree")
    for parent in (path, *path.parents):
        if parent == anchor:
            break
        if parent.is_symlink():
            raise ValueError("Symlink artifacts/ancestors are not supported")
    path = repo / path.relative_to(anchor)
    if not path.exists():
        raise ValueError("Artifact is missing")
    relative = path.relative_to(repo).as_posix()
    if git(repo, "ls-files", "-z", "--", f":(literal){relative}").stdout:
        raise ValueError("Tracked content requires a separate reviewed source change")
    digest = hashlib.sha256()
    count = 0
    paths = [path]
    if path.is_dir():
        for directory, dirs, files in os.walk(path, followlinks=False):
            paths.extend(Path(directory) / name for name in dirs + files)
    for entry in sorted(paths):
        parts = entry.relative_to(repo).parts
        if any(p in {".git", ".ssh", ".aws", ".claude", ".agents"}
               or p == ".env" or p.startswith(".env.") for p in parts):
            raise ValueError("Protected metadata/credential path inside artifact")
        if entry.is_symlink() or not (entry.is_dir() or entry.is_file()):
            raise ValueError("Symlinks and special files inside artifacts are protected")
        contents = hashlib.sha256()
        if entry.is_file():
            count += 1
            with entry.open("rb") as source:
                for chunk in iter(lambda: source.read(1024 * 1024), b""):
                    contents.update(chunk)
        metadata = [entry.relative_to(path.parent).as_posix(),
                    "file" if entry.is_file() else "directory",
                    entry.stat().st_mode, contents.hexdigest()]
        digest.update(json.dumps(metadata, ensure_ascii=True).encode() + b"\n")
    return path, relative, digest.hexdigest(), count


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    scan = commands.add_parser("inspect")
    scan.add_argument("repo")
    scan.add_argument("base")
    for name in ("branch", "worktree"):
        delete = commands.add_parser(f"remove-{name}")
        delete.add_argument("repo")
        delete.add_argument("base")
        delete.add_argument("target")
        delete.add_argument("--expect-base", required=True)
        delete.add_argument("--expect-tip", required=True)
    for name in ("preview-artifact", "remove-artifact"):
        item = commands.add_parser(name)
        item.add_argument("repo")
        item.add_argument("target")
        if name == "remove-artifact":
            item.add_argument("--expect-sha", required=True)
    args = parser.parse_args()
    repo = root(args.repo)
    if args.command == "inspect":
        output = inspect(repo, args.base)
    elif args.command == "remove-branch":
        output = remove_branch(repo, args)
    elif args.command == "remove-worktree":
        output = remove_worktree(repo, args)
    else:
        path, relative, digest, count = artifact(repo, args.target)
        literal = f":(literal){relative}"
        if args.command == "preview-artifact":
            output = {"path": str(path), "sha256": digest, "files": count,
                      "git_dry_run": git(repo, "clean", "-ndx", "--", literal).stdout}
        else:
            if digest != args.expect_sha:
                raise ValueError("Artifact changed; preview and propose again")
            output = git(repo, "clean", "-fdx", "--", literal).stdout
            if path.exists():
                raise ValueError("Git retained the artifact; do not force removal")
    print(json.dumps(output, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError) as error:
        print(f"Cleanup refused: {error}", file=sys.stderr)
        sys.exit(1)
