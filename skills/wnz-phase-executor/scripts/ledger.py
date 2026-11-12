"""Task bookkeeping for one canonical execution ledger (Python 3, POSIX)."""

import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
import fcntl
import json
import os
from pathlib import Path
import re
import sys
import tempfile


STATES = {"pending", "in_progress", "done"}


def instant(value):
    if not isinstance(value, str) or not re.fullmatch(
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)", value
    ):
        raise ValueError("timestamp must be ISO-8601 with an offset")
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.utcoffset() is None:
        raise ValueError("timestamp must include an offset")
    return parsed


def now():
    return datetime.now(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def nonempty(value, name):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} must be a nonempty string")


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def read(path):
    def reject_constant(value):
        raise ValueError(f"invalid JSON constant: {value}")
    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=unique_object,
                      parse_constant=reject_constant)


def file_path(value):
    path = Path(os.path.abspath(value))
    # Canonical parent paths make cooperative lock identities stable across aliases.
    path = path.parent.resolve() / path.name
    if path.is_symlink():
        raise ValueError(f"refusing symlink file: {path}")
    if path.exists() and not path.is_file():
        raise ValueError(f"not a regular file: {path}")
    return path


@contextmanager
def locked(path):
    lock = path.with_name(path.name + ".lock")
    descriptor = os.open(lock, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    try:
        fcntl.flock(descriptor, fcntl.LOCK_EX)
        yield
    finally:
        os.close(descriptor)
    # Keep the lock inode: unlinking it can allow concurrent writers on two inodes.


def write(path, value):
    descriptor, temporary = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as output:
            if path.exists():
                os.fchmod(output.fileno(), path.stat().st_mode & 0o777)
            json.dump(value, output, indent=2, ensure_ascii=False, allow_nan=False)
            output.write("\n")
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def validate_tasks(tasks, updated):
    if not isinstance(tasks, list):
        raise ValueError("tasks must be an array")
    ids, dashboard_ids = set(), set()
    for task in tasks:
        if not isinstance(task, dict):
            raise ValueError("each task must be an object")
        for field in ("unit_id", "title"):
            nonempty(task.get(field), field)
        unit = task["unit_id"]
        dashboard_id = task.get("dashboard_id", unit)
        nonempty(dashboard_id, "dashboard_id")
        if unit in ids or dashboard_id in dashboard_ids:
            raise ValueError("duplicate task unit_id or dashboard_id")
        ids.add(unit)
        dashboard_ids.add(dashboard_id)
        state = task.get("status")
        if state not in STATES:
            raise ValueError(f"{unit}: invalid task status")
        start, finish = task.get("started_at"), task.get("completed_at")
        for value in (start, finish):
            if value is not None and instant(value) > updated:
                raise ValueError(f"{unit}: timestamp later than updated_at")
        if start and finish and instant(finish) < instant(start):
            raise ValueError(f"{unit}: completion precedes start")
        if state == "pending" and (start is not None or finish is not None):
            raise ValueError(f"{unit}: pending task cannot have timestamps")
        if state == "in_progress" and finish is not None:
            raise ValueError(f"{unit}: open task cannot have completion time")


def validate(ledger):
    if not isinstance(ledger, dict) or ledger.get("ledger_schema") != 1:
        raise ValueError("expected ledger_schema 1 JSON object")
    updated = instant(ledger.get("updated_at"))
    validate_tasks(ledger.get("tasks"), updated)
    if not isinstance(ledger.get("history"), list):
        raise ValueError("history must be an array")
    target = ledger.get("dashboard_path")
    if target is not None and (not isinstance(target, str) or not Path(target).is_absolute()):
        raise ValueError("dashboard_path must be null or an absolute path")


def projected_tasks(ledger):
    tasks = {}
    for task in ledger["tasks"]:
        title = task["title"].strip()
        # The dashboard's JavaScript schema measures strings in UTF-16 code units.
        encoded = title.encode("utf-16-le")
        summary = title if len(encoded) <= 400 else encoded[:398].decode("utf-16-le", errors="ignore") + "…"
        item = {"status": task["status"], "summary": summary}
        for field in ("started_at", "completed_at"):
            if task.get(field) is not None:
                item[field] = task[field]
        tasks[task.get("dashboard_id", task["unit_id"])] = item
    return tasks


def project(ledger, ledger_path):
    if ledger.get("dashboard_path") is None:
        return
    target = file_path(ledger["dashboard_path"])
    if target == ledger_path or target == ledger_path.with_name(ledger_path.name + ".lock"):
        raise ValueError("dashboard and ledger paths must differ")
    with locked(target):
        file_path(target)
        flow = read(target)
        if not isinstance(flow, dict) or flow.get("schema") != 1 or not isinstance(flow.get("tasks"), dict):
            raise ValueError("dashboard must be an existing schema-1 FLOW.json with tasks")
        updated = max(instant(flow.get("updated_at")), instant(ledger["updated_at"]), instant(now()))
        # The ledger owns the entire task projection, not review/phase/provider state.
        flow["tasks"] = projected_tasks(ledger)
        flow["updated_at"] = updated.isoformat().replace("+00:00", "Z")
        write(target, flow)


def task_by_id(ledger, unit):
    for task in ledger["tasks"]:
        if task["unit_id"] == unit:
            return task
    raise ValueError(f"unknown task: {unit}")


def transition(ledger, args, timestamp):
    command = args.command
    if command == "add":
        if any(task["unit_id"] == args.unit for task in ledger["tasks"]):
            raise ValueError(f"task already exists: {args.unit}")
        task = {"unit_id": args.unit, "title": args.title, "status": "pending",
                "started_at": None, "completed_at": None, "report_refs": [], "accepted_state_ref": None}
        if args.dashboard_id:
            task["dashboard_id"] = args.dashboard_id
        ledger["tasks"].append(task)
        return True
    task = task_by_id(ledger, args.unit)
    state = task["status"]
    if command == "start":
        if state == "in_progress":
            return False
        if state != "pending":
            raise ValueError("completed task requires explicit reopen")
        task.update(status="in_progress", started_at=timestamp)
    elif command == "complete":
        if state == "done":
            return False
        if state != "in_progress":
            raise ValueError("start task before completing it")
        task.update(status="done", completed_at=timestamp)
        task["accepted_state_ref"] = args.evidence
    elif command == "reopen":
        if state == "in_progress":
            return False
        if state != "done":
            raise ValueError("only a completed task can reopen")
        task.update(status="in_progress", completed_at=None, accepted_state_ref=None)
    elif command == "recover-time":
        instant(args.at)
        if task.get(args.field) == args.at:
            return False
        if task.get(args.field) is not None:
            raise ValueError("recovery cannot overwrite a recorded timestamp")
        task[args.field] = args.at
    return True


def parser():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--ledger", required=True, type=file_path)
    commands = cli.add_subparsers(dest="command", required=True)
    init = commands.add_parser("init", help="initialize from a reviewed JSON seed; never overwrite")
    init.add_argument("--seed", required=True, type=file_path)
    init.add_argument("--flow", type=file_path)
    init.add_argument("--history", type=file_path)
    add = commands.add_parser("add")
    add.add_argument("unit")
    add.add_argument("--title", required=True)
    add.add_argument("--dashboard-id")
    for name in ("start", "complete", "reopen", "recover-time"):
        sub = commands.add_parser(name)
        sub.add_argument("unit")
        if name != "start":
            sub.add_argument("--evidence", required=True)
        if name == "recover-time":
            sub.add_argument("--field", choices=("started_at", "completed_at"), required=True)
            sub.add_argument("--at", required=True)
    commands.add_parser("sync", help="repair optional dashboard projection without changing task times")
    commands.add_parser("check", help="validate canonical task metadata without writing")
    return cli


def run(args):
    path = args.ledger
    if args.command == "check":
        ledger = read(path)
        validate(ledger)
        if ledger.get("dashboard_path"):
            flow = read(file_path(ledger["dashboard_path"]))
            if not isinstance(flow, dict) or flow.get("schema") != 1:
                raise ValueError("dashboard must be schema 1")
            if flow.get("tasks") != projected_tasks(ledger):
                raise ValueError("dashboard task projection differs; run sync")
            if instant(flow.get("updated_at")) < instant(ledger["updated_at"]):
                raise ValueError("dashboard timestamp is stale; run sync")
        print("OK ledger")
        return
    with locked(path):
        # Recheck under the lock; refuse symlink targets introduced before acquisition.
        file_path(path)
        timestamp = now()
        if args.command == "init":
            if path.exists():
                raise ValueError("ledger already exists")
            ledger = read(args.seed)
            if not isinstance(ledger, dict):
                raise ValueError("seed must be a JSON object")
            if args.flow == path or args.history == path or (args.history and args.flow == args.history):
                raise ValueError("ledger, dashboard and legacy history paths must differ")
            if args.history and not args.history.is_file():
                raise ValueError("legacy history file is missing")
            ledger.update(ledger_schema=1, updated_at=timestamp, dashboard_path=str(args.flow) if args.flow else None)
            ledger.setdefault("history", [])
            if args.history:
                ledger["legacy_history_ref"] = str(args.history)
            validate(ledger)
            changed = True
        else:
            ledger = read(path)
            validate(ledger)
            if instant(ledger["updated_at"]) > instant(timestamp):
                raise ValueError("ledger updated_at is ahead of the host clock")
            changed = args.command != "sync" and transition(ledger, args, timestamp)
        if hasattr(args, "evidence"):
            nonempty(args.evidence, "evidence")
        if changed:
            ledger["updated_at"] = timestamp
            event = {"at": timestamp, "action": args.command}
            for field in ("unit", "evidence", "field", "at"):
                if hasattr(args, field):
                    event["recovered_at" if field == "at" else field] = getattr(args, field)
            ledger["history"].append(event)
            validate(ledger)
            write(path, ledger)
        try:
            project(ledger, path)
        except (OSError, ValueError) as error:
            raise ValueError(f"ledger saved; dashboard sync failed: {error}; rerun sync") from error
        print(f"OK {args.command}" + (" (unchanged)" if not changed else ""))


def main():
    try:
        run(parser().parse_args())
    except (OSError, ValueError, TypeError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
