/* eslint-disable clean-code/no-business-policy-literals -- Independent diagnostic expectation. */
import { expect, test } from "bun:test";

const main = new URL("../src/main.ts", import.meta.url).pathname;
test("non-TTY invocation reports useful diagnostic without terminal escapes", async () => {
  const child = Bun.spawn(["bun", main, "--offline", "--cwd", "/tmp"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  expect(code).toBe(1);
  expect(stderr).toContain("TTY");
  expect(stdout).toBe("");
  expect(stderr).not.toContain("\x1b");
});
