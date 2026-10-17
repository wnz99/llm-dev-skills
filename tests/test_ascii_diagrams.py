"""User-facing portability checks; geometry and meaning require separate review."""

from pathlib import Path
import subprocess
import sys
import unittest


CHECKER = (Path(__file__).resolve().parents[1] / "skills" /
           "wnz-ascii-diagrams" / "scripts" / "check.py")


class DiagramCheckerTests(unittest.TestCase):
    def run_checker(self, content, *args):
        return subprocess.run(
            [sys.executable, str(CHECKER), *args], input=content,
            capture_output=True, check=False,
        )

    def test_exact_width_and_unequal_rows_are_valid(self):
        result = self.run_checker(b"[ A ] --> [ B ]\n   |\n   v\n", "--width", "15")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn(b"ASCII and width only", result.stdout)

    def test_overflow_is_rejected_without_truncation(self):
        result = self.run_checker(b"[ Long label ]\n", "--width", "8")
        self.assertEqual(result.returncode, 1)
        self.assertIn(b"line 1: 14 columns exceeds 8", result.stderr)
        self.assertEqual(result.stdout, b"")

    def test_control_and_non_ascii_characters_are_rejected_safely(self):
        for character in ("\t", "\x1b", "\x00", "\x7f", "\r", "界", "─", "\u2028"):
            with self.subTest(character=repr(character)):
                result = self.run_checker(f"A{character}B\n".encode())
                self.assertEqual(result.returncode, 1)
                self.assertIn(f"column 2: disallowed U+{ord(character):04X}".encode(),
                              result.stderr)
                self.assertNotIn(character.encode(), result.stderr)

    def test_crlf_files_are_supported(self):
        result = self.run_checker(b"[ A ]\r\n  |\r\n  v\r\n[ B ]\r\n")
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_empty_and_invalid_utf8_are_rejected(self):
        for content, diagnostic in ((b" \n", b"empty diagram"),
                                    (b"\xff", b"input must be UTF-8")):
            with self.subTest(content=content):
                result = self.run_checker(content)
                self.assertEqual(result.returncode, 1)
                self.assertIn(diagnostic, result.stderr)

    def test_invalid_width_is_a_usage_error(self):
        for width in ("0", "-1", "word"):
            with self.subTest(width=width):
                result = self.run_checker(b"A", "--width", width)
                self.assertEqual(result.returncode, 2)


if __name__ == "__main__":
    unittest.main()
