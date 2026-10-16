/* eslint-disable clean-code/no-business-policy-literals, clean-code/no-boolean-flag-arguments -- Independent expected fixtures and Bun assertions, not runtime policy. */
import { expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = async (...args: string[]): Promise<{ code: number; out: string; err: string }> => {
  const child = Bun.spawn(
    [process.execPath, join(import.meta.dir, "../src/checkFlow.ts"), ...args],
    {
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  const [code, out, err] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { code, out, err };
};
test("CLI usage, missing directory, empty drafts and sorted invalid folders have controlled exit codes", async () => {
  const root = await mkdtemp(join(tmpdir(), "flow-cli-"));
  try {
    expect(await run()).toMatchObject({
      code: 2,
      err: expect.stringContaining("usage:") as unknown,
    });
    expect(await run(join(root, "missing"))).toMatchObject({
      code: 1,
      err: expect.stringContaining("unreadable") as unknown,
    });
    expect(await run(root)).toEqual({ code: 0, out: "OK 0 tickets\n", err: "" });
    await mkdir(join(root, "z"));
    await mkdir(join(root, "a"));
    await writeFile(join(root, "a/FLOW.json"), "{}");
    const result = await run(root);
    expect(result.code).toBe(1);
    expect(result.out.split("\n")[0]).toStartWith("a:");
    expect(result.out).toContain("z: FLOW.json unreadable:");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
