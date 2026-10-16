/* eslint-disable clean-code/no-business-policy-literals, clean-code/no-boolean-flag-arguments -- Independent expected fixtures and Bun assertions, not runtime policy. */
import { afterEach, expect, spyOn, test } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  fetchLinear,
  fetchPr,
  ghPrArgv,
  loadDraftSnapshot,
  prViewFromRun,
  rootFromWorktreeList,
} from "../src/sources";

const temps: string[] = [];
const originalKey = process.env.LINEAR_API_KEY;
const originalPath = process.env.PATH;
afterEach(async () => {
  if (originalKey === undefined) delete process.env.LINEAR_API_KEY;
  else process.env.LINEAR_API_KEY = originalKey;
  process.env.PATH = originalPath;
  await Promise.all(temps.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});
const temporary = async (): Promise<string> => {
  const path = await realpath(await mkdtemp(join(tmpdir(), "flow-sources-")));
  temps.push(path);
  return path;
};
const git = async (cwd: string, ...args: string[]): Promise<void> => {
  const child = Bun.spawn(["git", "-c", "commit.gpgsign=false", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const error = await new Response(child.stderr).text();
  expect(await child.exited, error).toBe(0);
};

test("linked worktree reads main drafts and detached branch falls back to null", async () => {
  const root = await temporary();
  await git(root, "init", "-b", "develop");
  await git(
    root,
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.invalid",
    "commit",
    "--allow-empty",
    "-m",
    "test: init",
  );
  const linked = join(root, "linked");
  await git(root, "worktree", "add", "-b", "feature/test", linked);
  const draft = join(root, ".planning/drafts/broken");
  await mkdir(draft, { recursive: true });
  await writeFile(join(draft, "FLOW.json"), "{");
  await mkdir(join(root, ".planning/drafts/missing"));
  const snapshot = await loadDraftSnapshot(linked);
  expect(snapshot.root).toBe(root);
  expect(snapshot.branch).toBe("feature/test");
  expect(snapshot.error).toBeNull();
  expect(snapshot.entries).toEqual([
    { dir: "broken", errors: ["FLOW.json is not valid JSON"] },
    { dir: "missing", errors: ["FLOW.json missing"] },
  ]);
  await git(linked, "checkout", "--detach");
  expect((await loadDraftSnapshot(linked)).branch).toBeNull();
});

test("outside repository and absent drafts provide useful empty/error state", async () => {
  const root = await temporary();
  expect(await loadDraftSnapshot(root)).toMatchObject({
    root: null,
    entries: [],
    error: expect.any(String) as unknown,
  });
  await git(root, "init");
  expect(await loadDraftSnapshot(root)).toMatchObject({
    root,
    entries: [],
    error: expect.any(String) as unknown,
  });
  expect(rootFromWorktreeList("worktree /repo\0HEAD deadbeef\0")).toBe("/repo");
  expect(ghPrArgv(55)).toEqual([
    "gh",
    "pr",
    "view",
    "55",
    "--json",
    "number,state,statusCheckRollup",
  ]);
});

test("PR status validates output and summarizes pass/fail/pending/none", () => {
  for (const [rollup, checks] of [
    [[], "none"],
    [[{ conclusion: "SUCCESS" }], "pass"],
    [[{ state: "FAILURE" }], "fail"],
    [[{ status: "IN_PROGRESS" }], "pending"],
  ] as const) {
    expect(
      prViewFromRun({
        exitCode: 0,
        stderr: "",
        stdout: JSON.stringify({ state: "OPEN", statusCheckRollup: rollup }),
      }),
    ).toEqual({ state: "OPEN", checks });
  }
  for (const stdout of ["{", "{}", '{"state":"OPEN"}', '{"state":"OPEN","statusCheckRollup":{}}']) {
    expect(prViewFromRun({ exitCode: 0, stdout, stderr: "" })).toHaveProperty("error");
  }
  expect(prViewFromRun({ exitCode: 1, stdout: "", stderr: "secret" })).toEqual({
    error: "gh failed",
  });
});

test("Linear skips missing credential and validates GraphQL/HTTP/unknown responses without leaking secrets", async () => {
  const fetchSpy = spyOn(globalThis, "fetch");
  try {
    delete process.env.LINEAR_API_KEY;
    expect(await fetchLinear("MAM-1")).toHaveProperty("error");
    expect(fetchSpy).not.toHaveBeenCalled();
    process.env.LINEAR_API_KEY = "test-secret";
    fetchSpy.mockImplementation(((_url, init) => {
      expect(init?.headers).toEqual({
        Authorization: "test-secret",
        "Content-Type": "application/json",
      });
      expect(JSON.parse(typeof init?.body === "string" ? init.body : "")).toMatchObject({
        variables: { id: "MAM-1" },
      });
      return Promise.resolve(
        Response.json({ data: { issue: { state: { name: "In Progress" } } } }),
      );
    }) as typeof fetch);
    expect(await fetchLinear("MAM-1")).toEqual({ status: "In Progress" });
    for (const response of [
      Response.json({ errors: [{ message: "test-secret" }] }),
      Response.json({ data: {} }),
      new Response("test-secret", { status: 401 }),
      new Response("bad"),
    ]) {
      fetchSpy.mockResolvedValue(response);
      const result = await fetchLinear("MAM-1");
      expect(result).toHaveProperty("error");
      expect(JSON.stringify(result)).not.toContain("test-secret");
    }
    fetchSpy.mockRejectedValue(new Error("test-secret"));
    expect(await fetchLinear("MAM-1")).toEqual({ error: "Linear request failed" });
  } finally {
    fetchSpy.mockRestore();
  }
});

test("Linear cancellation reaches native fetch", async () => {
  process.env.LINEAR_API_KEY = "test-secret";
  const fetchSpy = spyOn(globalThis, "fetch").mockImplementation((async (_url, init) => {
    await new Promise<void>((_resolve, reject) =>
      init?.signal?.addEventListener(
        "abort",
        () => {
          reject(new Error("aborted"));
        },
        { once: true },
      ),
    );
    return Response.json({});
  }) as typeof fetch);
  try {
    const controller = new AbortController();
    const request = fetchLinear("MAM-1", controller.signal);
    controller.abort();
    expect(await request).toEqual({ error: "Linear request cancelled" });
  } finally {
    fetchSpy.mockRestore();
  }
});

test("gh timeout kills child and cancellation ends live work", async () => {
  const root = await temporary();
  const executable = join(root, "gh");
  const pidFile = join(root, "pid");
  const descendantFile = join(root, "child-pid");
  await writeFile(
    executable,
    `#!/bin/sh\necho $$ > '${pidFile}'\n/bin/sleep 60 &\necho $! > '${descendantFile}'\nwait\n`,
    {
      mode: 0o755,
    },
  );
  process.env.PATH = `${root}:${originalPath ?? ""}`;
  const started = Date.now();
  expect(await fetchPr(root, 55)).toEqual({ error: "gh timed out" });
  expect(Date.now() - started).toBeLessThan(16_000);
  const pid = Number(await Bun.file(pidFile).text());
  const descendant = Number(await Bun.file(descendantFile).text());
  for (const processId of [pid, descendant]) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        process.kill(processId, 0);
      } catch {
        break;
      }
      await Bun.sleep(10);
    }
    expect(() => process.kill(processId, 0)).toThrow();
  }
  const controller = new AbortController();
  const request = fetchPr(root, 55, controller.signal);
  controller.abort();
  expect(await request).toEqual({ error: "gh cancelled" });
}, 20_000);

test("Linear uses 15-second native timeout and reports expiration without response leaks", async () => {
  process.env.LINEAR_API_KEY = "test-secret";
  const expired = AbortSignal.abort(new DOMException("Timeout", "TimeoutError"));
  const timeoutSpy = spyOn(AbortSignal, "timeout").mockReturnValue(expired);
  const fetchSpy = spyOn(globalThis, "fetch").mockRejectedValue(new Error("test-secret"));
  try {
    expect(await fetchLinear("MAM-1")).toEqual({ error: "Linear request timed out" });
    expect(timeoutSpy).toHaveBeenCalledWith(15_000);
  } finally {
    timeoutSpy.mockRestore();
    fetchSpy.mockRestore();
  }
});

test("gh cancellation closes inherited pipes and kills owned descendant processes", async () => {
  const root = await temporary();
  const pidFile = join(root, "descendant-pid");
  await writeFile(join(root, "gh"), `#!/bin/sh\n/bin/sleep 60 &\necho $! > '${pidFile}'\nwait\n`, {
    mode: 0o755,
  });
  process.env.PATH = `${root}:${originalPath ?? ""}`;
  const controller = new AbortController();
  const request = fetchPr(root, 55, controller.signal);
  let descendant = 0;
  try {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (await Bun.file(pidFile).exists()) {
        descendant = Number(await Bun.file(pidFile).text());
        break;
      }
      await Bun.sleep(10);
    }
    expect(descendant).toBeGreaterThan(0);
    const started = Date.now();
    controller.abort();
    const result = await Promise.race([
      request,
      Bun.sleep(500).then(() => ({ error: "still pending" })),
    ]);
    expect(result).toEqual({ error: "gh cancelled" });
    expect(Date.now() - started).toBeLessThan(500);
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        process.kill(descendant, 0);
      } catch {
        descendant = 0;
        break;
      }
      await Bun.sleep(10);
    }
    expect(descendant).toBe(0);
  } finally {
    if (descendant > 0) {
      try {
        process.kill(descendant, "SIGKILL");
      } catch {
        /* Child already exited. */
      }
    }
    await request;
  }
}, 5_000);

test("separate Git metadata and submodules read drafts from their own checkout", async () => {
  const parent = await temporary();
  const root = join(parent, "project with spaces");
  await mkdir(root);
  await git(root, "init", "--separate-git-dir", join(parent, "metadata"));
  await git(
    root,
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.invalid",
    "commit",
    "--allow-empty",
    "-m",
    "init",
  );
  await mkdir(join(root, ".planning/drafts"), { recursive: true });
  expect(await loadDraftSnapshot(root)).toMatchObject({ root, entries: [], error: null });
  const superproject = join(parent, "super");
  await mkdir(superproject);
  await git(superproject, "init");
  await git(superproject, "-c", "protocol.file.allow=always", "submodule", "add", root, "module");
  const module = join(superproject, "module");
  await mkdir(join(module, ".planning/drafts"), { recursive: true });
  expect(await loadDraftSnapshot(module)).toMatchObject({ root: module, entries: [], error: null });
});
