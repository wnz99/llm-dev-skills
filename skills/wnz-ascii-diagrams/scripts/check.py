#!/usr/bin/env python3
"""Check raw diagram portability and width, not geometry or semantics."""

import argparse
import sys


def check(text, width):
    """Return diagnostics without echoing potentially unsafe input characters."""
    if width < 1:
        raise ValueError("width must be positive")
    issues = []
    if not text.strip():
        issues.append("empty diagram")
    # Split only on LF so tabs, CR, ESC and Unicode separators stay visible
    # to validation. Normalize CRLF, a supported text-file line ending.
    for row, line in enumerate(text.replace("\r\n", "\n").split("\n"), 1):
        if len(line) > width:
            issues.append(f"line {row}: {len(line)} columns exceeds {width}")
        for column, character in enumerate(line, 1):
            if not 32 <= ord(character) <= 126:
                issues.append(
                    f"line {row}, column {column}: disallowed U+{ord(character):04X}"
                )
    return issues


def positive_width(value):
    width = int(value)
    if width < 1:
        raise argparse.ArgumentTypeError("width must be positive")
    return width


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--width", type=positive_width, default=80)
    args = parser.parse_args()
    try:
        # Read bytes to avoid universal-newline conversion hiding bare CR.
        text = sys.stdin.buffer.read().decode("utf-8")
    except UnicodeDecodeError:
        print("FAIL: input must be UTF-8 text", file=sys.stderr)
        return 1
    issues = check(text, args.width)
    if issues:
        print("\n".join(f"FAIL: {issue}" for issue in issues), file=sys.stderr)
        return 1
    print("PASS: ASCII and width only; inspect geometry and meaning separately.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
