"""Bounded Git housekeeping. Discovery never authorizes removal."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
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


def protected_branch(name, base_ref):
    return (name in {"main", "master", "develop", "dev", "trunk", "stable"}
            or name.startswith("release/") or f"refs/heads/{name}" == base_ref)


def integration(repo, tip, base):
    ancestor = merged(repo, tip, base)
    commits = git(repo, "log", "-20", "--format=%H %s", f"{base}..{tip}").stdout.splitlines()
    patches = [] if ancestor else git(repo, "cherry", base, tip).stdout.splitlines()
    difference = git(repo, "diff", "--no-ext-diff", "--no-textconv", "--quiet", base, tip, check=False)
    if difference.returncode not in (0, 1):
        raise ValueError("Cannot compare branch trees")
    return {"ancestor_of_base": ancestor, "commits_outside_base": commits,
            "commits_outside_base_count": int(git(repo, "rev-list", "--count", f"{base}..{tip}").stdout),
            "patch_equivalent_commits": [row[2:] for row in patches if row.startswith("- ")],
            "unique_patch_commits": [row[2:] for row in patches if row.startswith("+ ")],
            "same_tree_as_base": difference.returncode == 0}


def status_entries(repo):
    fields = git(repo, "status", "--porcelain=v1", "-z", "--untracked-files=all",
                 "--ignored=matching").stdout.split("\0")
    entries = []
    index = 0
    while index < len(fields):
        field = fields[index]
        index += 1
        if not field:
            continue
        entry = {"status": field[:2], "path": field[3:]}
        if "R" in field[:2] or "C" in field[:2]:
            entry["original_path"] = fields[index]
            index += 1
        entries.append(entry)
    return entries


def generated_reason(repo, relative, anchor, declared=()):
    """Recognize reproducible outputs, never arbitrary directories by age/name."""
    path = repo / relative
    if path.name == "node_modules":
        if (path.parent / "package.json").is_file():
            return "installed dependencies; unlink symlinks without following targets"
    if relative.rstrip("/") in declared and ".serena" not in Path(relative).parts:
        return "generated output explicitly identified by the caller"
    if path.is_symlink() or not path.is_dir():
        return None
    if path.name in {"dist", "build", "coverage"}:
        return None
    if path.name in {".fallow", ".next", ".nuxt",
                     ".expo", ".turbo", ".parcel-cache", ".pytest_cache",
                     ".mypy_cache", ".ruff_cache", "test-results", "playwright-report"}:
        return "reproducible build, test or analysis output"
    if path.name == ".venv" and (path / "pyvenv.cfg").is_file():
        return "installed Python virtual environment"
    if path.name == "__pycache__":
        if all(p.is_file() and not p.is_symlink() and p.suffix == ".pyc"
               for p in path.iterdir()):
            return "Python bytecode cache"
    if relative.rstrip("/") == ".serena" and anchor != repo:
        counterpart = anchor / ".serena"
        if counterpart.is_dir() and not counterpart.is_symlink():
            for directory, dirs, files in os.walk(path, followlinks=False):
                if any((Path(directory) / name).is_symlink() for name in dirs):
                    return None
                for name in files:
                    item = Path(directory) / name
                    other = counterpart / item.relative_to(path)
                    if any(parent.is_symlink() for parent in other.parents if parent != anchor):
                        return None
                    if (item.is_symlink() or not item.is_file() or other.is_symlink()
                            or not other.is_file()):
                        return None
                    content, original = item.read_bytes(), other.read_bytes()
                    if item.relative_to(path).as_posix() in {"project.yml", "project.local.yml"}:
                        # Serena writes the checkout's name into its project configuration.
                        content = re.sub(rb"(?m)^project_name:.*$", b"project_name: <checkout>", content)
                        original = re.sub(rb"(?m)^project_name:.*$", b"project_name: <checkout>", original)
                    if content != original:
                        return None
            return "Serena files duplicated in primary worktree"
    return None


def generated_entries(repo, relative):
    """Check metadata only; never follow links or hash dependency contents."""
    path = Path(os.path.abspath(repo / relative))
    if not path.is_relative_to(repo) or path == repo:
        raise ValueError("Generated output must be inside the worktree")
    for parent in path.parents:
        if parent == repo:
            break
        if parent.is_symlink():
            raise ValueError("Generated output has a symlink ancestor")
    literal = f":(literal){path.relative_to(repo).as_posix()}"
    if git(repo, "ls-files", "-z", "--", literal).stdout:
        raise ValueError("Generated output contains tracked files")
    dependency_link = (path.name == "node_modules" and path.is_symlink()
                       and (path.parent / "package.json").is_file())
    if (not dependency_link
            and git(repo, "check-ignore", "--quiet", "--", str(path), check=False).returncode != 0):
        raise ValueError("Generated output must be ignored by Git")
    replicated_serena = (path.relative_to(repo).parts == (".serena",)
                         and generated_reason(repo, ".serena", Path(worktrees(repo)[0]["worktree"]).resolve())
                         == "Serena files duplicated in primary worktree")
    pending = [path]
    while pending:
        entry = pending.pop()
        parts = entry.relative_to(repo).parts
        if any(p in {".git", ".ssh", ".aws", ".claude", ".codex", ".agents"}
               or p == ".env" or p.startswith(".env.")
               or (p == ".serena" and not replicated_serena) for p in parts):
            raise ValueError("Generated output contains protected metadata or credentials")
        mode = entry.lstat().st_mode
        if stat.S_ISLNK(mode):
            continue
        if stat.S_ISDIR(mode):
            pending.extend(entry.iterdir())
        elif not stat.S_ISREG(mode):
            raise ValueError("Generated output contains special files")
    return literal


def file_evidence(repo, base, entry):
    result = dict(entry)
    path = repo / entry["path"]
    result["mtime_ns"] = path.lstat().st_mtime_ns if path.exists() or path.is_symlink() else None
    # Do not emit source, secrets or fuzzy semantic equivalence claims.
    if path.is_file() and not path.is_symlink():
        blob = git(repo, "hash-object", "--no-filters", "--", str(path)).stdout.strip()
        base_blob = git(repo, "rev-parse", "--verify", f"{base}:{entry['path']}", check=False)
        result["matches_base_content"] = base_blob.returncode == 0 and blob == base_blob.stdout.strip()
        result["seen_in_base_history"] = bool(git(
            repo, "log", "-1", "--format=%H", f"--find-object={blob}", base, "--",
            entry["path"]).stdout.strip())
    result["disposition"] = "KEEP: uncommitted state, even if content exists in base history"
    return result


def worktree_evidence(repo, tree, base, anchor, declared=()):
    path = Path(tree["worktree"])
    evidence = integration(repo, tree["HEAD"], base)
    blockers = []
    if path.resolve() in {repo, anchor} or "locked" in tree or "prunable" in tree or not path.exists():
        blockers.append("current, primary, locked or missing worktree")
    if not evidence["ancestor_of_base"]:
        blockers.append("tip is not an ancestor of base; patch equivalence does not authorize deletion")
    outputs, dirty = [], []
    if path.exists() and "prunable" not in tree:
        for entry in status_entries(path):
            dependency_link = (entry["status"] == "??"
                               and (path / entry["path"]).name == "node_modules"
                               and (path / entry["path"]).is_symlink())
            reason = (generated_reason(path, entry["path"], anchor, declared)
                      if entry["status"] == "!!" or dependency_link else None)
            if reason:
                try:
                    generated_entries(path, entry["path"])
                except ValueError as error:
                    dirty.append({**entry, "disposition": f"KEEP: {error}"})
                    continue
                outputs.append({"path": entry["path"], "reason": reason})
            else:
                dirty.append(file_evidence(path, base, entry))
        if dirty:
            blockers.append("uncommitted or unknown local data")
    return {**evidence, "blockers": blockers, "dirty_files": dirty,
            "generated_outputs": outputs,
            "decision": "KEEP" if blockers else "DELETE_CANDIDATE",
            "ownership": "verify session roster before proposing deletion"}


def sibling_inventory(anchor, trees):
    registered = {Path(tree["worktree"]).resolve() for tree in trees}
    result = []
    for path in sorted(anchor.parent.iterdir()):
        if not path.name.startswith(anchor.name + "-") or not (path.is_dir() or path.is_symlink()):
            continue
        if path.is_symlink():
            kind = "symlink; keep"
        elif path.resolve() in registered:
            kind = "registered_worktree"
        else:
            top = git(path, "rev-parse", "--show-toplevel", check=False)
            kind = "separate_repository" if top.returncode == 0 and Path(top.stdout.strip()).resolve() == path.resolve() else "unregistered_or_unknown"
        result.append({"path": str(path), "kind": kind,
                       "decision": "SEE_WORKTREE" if kind == "registered_worktree" else "KEEP",
                       "reason": "name alone is not disposal evidence"})
    return result


def inspect(repo, base, declared=()):
    base_tip = oid(repo, base)
    trees = worktrees(repo)
    branches = []
    base_ref = git(repo, "rev-parse", "--symbolic-full-name", base).stdout.strip()
    anchor = Path(trees[0]["worktree"]).resolve()
    removal = ["bash", str(Path(__file__).with_name("remove.sh").resolve())]
    for tree in trees:
        path = Path(tree["worktree"])
        tree["status_including_ignored"] = None
        try:
            if path.exists() and "prunable" not in tree:
                tree["status_including_ignored"] = status(path)
            tree.update(worktree_evidence(repo, tree, base_tip, anchor, declared))
        except (ValueError, OSError) as error:
            tree.update({"decision": "KEEP", "blockers": [f"inspection failed: {error}"],
                         "generated_outputs": [], "dirty_files": []})
        tree["preview_commands"] = []
        tree["removal_command"] = (removal + ["remove-worktree", str(repo), base, str(path),
                                   "--expect-base", base_tip, "--expect-tip", tree["HEAD"]]
                                   if tree["decision"] == "DELETE_CANDIDATE" else None)
        if tree["removal_command"]:
            for output in declared:
                tree["removal_command"].extend(["--generated-output", output])
    for row in git(repo, "for-each-ref", "--format=%(refname:short)%09%(objectname)",
                   "refs/heads").stdout.splitlines():
        name, tip = row.split("\t")
        attached = [tree for tree in trees if tree.get("branch") == f"refs/heads/{name}"]
        evidence = integration(repo, tip, base_tip)
        blockers = [reason for tree in attached for reason in tree["blockers"]]
        if protected_branch(name, base_ref):
            blockers.append("protected/integration branch")
        if not evidence["ancestor_of_base"]:
            blockers.append("commits outside base ancestry")
        branches.append({"branch": name, "tip": tip, **evidence,
                         "decision": "KEEP" if blockers else "DELETE_CANDIDATE",
                         "blockers": list(dict.fromkeys(blockers)),
                         "removal_command": (removal + ["remove-branch", str(repo), base, name,
                                             "--expect-base", base_tip, "--expect-tip", tip]
                                             if not blockers else None),
                         "worktrees": [tree["worktree"] for tree in attached]})
    return {"repo": str(repo), "base": base, "base_tip": base_tip,
            "snapshot": "local refs; approved worktree removal includes generated outputs; verify ownership",
            "branches": branches, "worktrees": trees,
            "sibling_directories": sibling_inventory(anchor, trees),
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
    if protected_branch(name, base_ref):
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
    evidence = worktree_evidence(repo, tree, base_tip, Path(trees[0]["worktree"]).resolve(),
                                 args.generated_output)
    if evidence["blockers"]:
        raise ValueError("; ".join(evidence["blockers"]))
    for output in evidence["generated_outputs"]:
        literal = generated_entries(target, output["path"])
        git(target, "clean", "-fdx", "--", literal)
    if status(target):
        raise ValueError("Worktree changed or Git retained local data")
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
    allow_links = generated_reason(repo, relative, Path(worktrees(repo)[0]["worktree"]).resolve())
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
        link = entry.is_symlink()
        if link and not allow_links:
            raise ValueError("Symlinks are allowed only inside recognized generated outputs")
        if not link and not (entry.is_dir() or entry.is_file()):
            raise ValueError("Special files inside artifacts are protected")
        contents = hashlib.sha256()
        if link:
            contents.update(os.fsencode(os.readlink(entry)))
        elif entry.is_file():
            count += 1
            with entry.open("rb") as source:
                for chunk in iter(lambda: source.read(1024 * 1024), b""):
                    contents.update(chunk)
        metadata = [entry.relative_to(path.parent).as_posix(),
                    "symlink" if link else "file" if entry.is_file() else "directory",
                    entry.lstat().st_mode, contents.hexdigest()]
        digest.update(json.dumps(metadata, ensure_ascii=True).encode() + b"\n")
    return path, relative, digest.hexdigest(), count


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    scan = commands.add_parser("inspect")
    scan.add_argument("repo")
    scan.add_argument("base")
    scan.add_argument("--generated-output", action="append", default=[])
    for name in ("branch", "worktree"):
        delete = commands.add_parser(f"remove-{name}")
        delete.add_argument("repo")
        delete.add_argument("base")
        delete.add_argument("target")
        delete.add_argument("--expect-base", required=True)
        delete.add_argument("--expect-tip", required=True)
        if name == "worktree":
            delete.add_argument("--generated-output", action="append", default=[])
    for name in ("preview-artifact", "remove-artifact"):
        item = commands.add_parser(name)
        item.add_argument("repo")
        item.add_argument("target")
        if name == "remove-artifact":
            item.add_argument("--expect-sha", required=True)
    args = parser.parse_args()
    repo = root(args.repo)
    if args.command == "inspect":
        output = inspect(repo, args.base, args.generated_output)
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
