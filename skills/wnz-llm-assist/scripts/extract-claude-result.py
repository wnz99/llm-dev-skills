#!/usr/bin/env python3
"""Extract Claude's complete final message from stream JSON."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
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
    args = parser.parse_args()
    if args.stream.resolve() == args.output.resolve():
        parser.error("stream and output paths must be different")
    _write_atomic(args.output, _final_result(args.stream))


if __name__ == "__main__":
    main()
