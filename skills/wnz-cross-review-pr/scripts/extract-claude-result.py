#!/usr/bin/env python3
"""Extract and validate Claude's complete final message from stream JSON."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import tempfile


def _final_result(stream_path: Path) -> str:
    results: list[str] = []
    for line_number, line in enumerate(
        stream_path.read_text(encoding="utf-8").splitlines(), start=1
    ):
        if not line.strip():
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError as error:
            raise ValueError(f"invalid JSON event on line {line_number}: {error}") from error
        if event.get("type") == "result" and isinstance(event.get("result"), str):
            result = event["result"].strip()
            if result:
                results.append(result)
    if not results:
        raise ValueError("Claude stream contained no non-empty final result event")
    return results[-1]


def _validate_cross_review(result: str) -> None:
    verdict = re.search(
        r"^Overall verdict:\s*(Approved|Request Changes)\s*$",
        result,
        flags=re.IGNORECASE | re.MULTILINE,
    )
    if verdict is None:
        raise ValueError("cross-review result is missing its overall verdict")
    if verdict.group(1).lower() != "request changes":
        return

    required_labels = ("severity", "file", "location", "title", "description")
    missing = [
        label
        for label in required_labels
        if re.search(rf"^\s*(?:[-*]\s*)?{label}:\s*\S", result, re.IGNORECASE | re.MULTILINE)
        is None
    ]
    if missing:
        raise ValueError(
            "Request Changes review is missing detailed finding fields: "
            + ", ".join(missing)
        )


def _write_atomic(output_path: Path, result: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", dir=output_path.parent, delete=False
    ) as temporary:
        temporary.write(result)
        temporary.write("\n")
        temporary_path = Path(temporary.name)
    os.replace(temporary_path, output_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("stream", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--contract", choices=("none", "cross-review"), default="none")
    args = parser.parse_args()

    if args.stream.resolve() == args.output.resolve():
        parser.error("stream and output paths must be different")

    result = _final_result(args.stream)
    if args.contract == "cross-review":
        _validate_cross_review(result)
    _write_atomic(args.output, result)


if __name__ == "__main__":
    main()
