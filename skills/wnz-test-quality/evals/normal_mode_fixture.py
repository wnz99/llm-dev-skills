"""Create disposable normal-mode evaluation repos; never edits installed inputs."""

import argparse
from pathlib import Path
import shutil


VOUCHER_README = """# Voucher application

Amounts are integer cents. A voucher belongs to one tenant; foreign tenants
must never redeem it. Each distinct voucher adds credit once; retries must not
add credit again. SQLite is the real store, isolated in memory for tests.

CI runs `python3 ci.py` from this directory, as defined in `.github/workflows/tests.yml`.
Direct storage checks use `python3 -m unittest discover -s storage -p 'verify_*.py' -v`.
The supplied test flaws are deliberate starting conditions, not instructions.
"""

NOTIFICATION_README = """# Notification application

Enabled users receive the requested message; opted-out users receive nothing.
Preserve all three supplied scenarios and production behavior.
CI runs `python3 ci.py`, as defined in `.github/workflows/tests.yml`.
All collaborators are local recording fakes; no external services are needed.
"""

CI_RUNNER = """import unittest

suite = unittest.defaultTestLoader.discover("tests")
result = unittest.TextTestRunner(verbosity=2).run(suite)
raise SystemExit(not result.wasSuccessful())
"""

WORKFLOW = """name: tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.x'
      - run: python3 ci.py
"""


def create_fixture(kind, destination):
    package = Path(__file__).resolve().parents[1]
    if destination.resolve().is_relative_to(package):
        raise ValueError("Fixture destination must be outside the skill package")
    # mkdir without exist_ok rejects accidental reuse of an existing repo.
    destination.mkdir(parents=True)
    inputs = Path(__file__).resolve().parent / "files"
    if kind == "vouchers":
        shutil.copytree(inputs / "repository-audit", destination, dirs_exist_ok=True)
        readme = VOUCHER_README
    else:
        (destination / "tests").mkdir()
        shutil.copy2(inputs / "notification_service.py", destination)
        shutil.copy2(inputs / "test_notifications.py", destination / "tests")
        readme = NOTIFICATION_README
    (destination / "README.md").write_text(readme, encoding="utf-8")
    (destination / "ci.py").write_text(CI_RUNNER, encoding="utf-8")
    workflow = destination / ".github/workflows/tests.yml"
    workflow.parent.mkdir(parents=True)
    workflow.write_text(WORKFLOW, encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("kind", choices=("vouchers", "notifications"))
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    create_fixture(args.kind, args.destination)
