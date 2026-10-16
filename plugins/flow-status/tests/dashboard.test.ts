/* eslint-disable clean-code/no-business-policy-literals, clean-code/no-boolean-flag-arguments -- Independent dashboard fixtures and expected behavior. */
import { expect, test, spyOn } from "bun:test";
import {
  createState,
  handleKey,
  reloadState,
  renderDashboard,
  runDashboard,
} from "../src/dashboard";
import { type Flow, type FlowEntry } from "../src/flowCore";
import * as sources from "../src/sources";

const flow = (patch: Partial<Flow> = {}): Flow => ({
  schema: 1,
  ticket: "MAM-1",
  linear_id: "MAM-1",
  title: "Dashboard",
  status: "active",
  step: 9,
  updated_at: "2026-10-09T12:00:00Z",
  branches: ["feature/current"],
  prs: [42],
  gsd_quick: "quick/3",
  plan_revision: 3,
  baseline: "abc123",
  next: "review next",
  steps: { "1": { state: "done", evidence: "scope evidence\nsecond line" } },
  tasks: { A: "done" },
  approvals: {
    plan: { at: "2026-10-09", revision: 3, evidence: "plan consent" },
    content: { at: "2026-10-09", summary: "bank frozen", evidence: "content consent" },
  },
  simplicity: [{ plan_revision: 3, removed: ["unused wrapper"] }],
  reviews: [
    {
      kind: "task",
      task: "A",
      cycle: 1,
      round: 2,
      plan_revision: 3,
      verdict: "CLEAN",
      reviewer_model: "reviewer",
      findings: [
        { severity: "Low", summary: "long review ".repeat(30), disposition: "accepted residual" },
      ],
    },
  ],
  ...patch,
});
const snapshot = (entries: FlowEntry[], branch: string | null = "feature/current") => ({
  root: "/tmp/project",
  branch,
  entries,
  error: null,
});

test("branch selection, done toggle, arrows and directory preservation on reload", () => {
  const entries: FlowEntry[] = [
    { dir: "bad", errors: ["FLOW missing"] },
    { dir: "active", flow: flow() },
    { dir: "done", flow: flow({ status: "done", step: 13 }) },
  ];
  let state = reloadState(createState(), snapshot(entries));
  expect(state.selectedDir).toBe("active");
  expect(renderDashboard(state, 80, 20).join("\n")).not.toContain("> done");
  state = handleKey(state, "down");
  expect(state.selectedDir).toBe("active");
  state = handleKey(state, "d");
  state = handleKey(state, "j");
  expect(state.selectedDir).toBe("done");
  state = reloadState(state, snapshot([...entries].reverse()));
  expect(state.selectedDir).toBe("done");
  state = handleKey(state, "d");
  expect(state.selectedDir).toBe("active");
  expect(
    reloadState(createState(), snapshot([{ dir: "bad", errors: ["invalid"] }], null)).selectedDir,
  ).toBe("bad");
});

test("all stored details and missing steps reachable through paging at 40 columns", () => {
  let state = reloadState(createState(40, 8), snapshot([{ dir: "active", flow: flow() }]));
  const pages: string[] = [];
  for (let i = 0; i < 80; i += 1) {
    const lines = renderDashboard(state, 40, 8);
    expect(lines.length).toBeLessThanOrEqual(8);
    expect(lines.every((line) => Bun.stringWidth(line) <= 40)).toBe(true);
    pages.push(lines.join("\n"));
    state = handleKey(state, "pagedown");
  }
  const output = pages.join("\n");
  for (const text of [
    "scope evidence",
    "second line",
    "13.",
    "missing",
    "review next",
    "quick/3",
    "abc123",
    "plan consent",
    "content consent",
    "bank frozen",
    "unused wrapper",
    "accepted residual",
    "A: done",
    "reviewer",
    "C1 R2",
  ])
    expect(output).toContain(text);
  const resized = renderDashboard(state, 20, 5);
  expect(resized.every((line) => Bun.stringWidth(line) <= 20)).toBe(true);
  state = reloadState(state, snapshot([{ dir: "active", flow: flow({ reviews: [] }) }]));
  expect(state.scroll).toBeLessThan(200);
  expect(handleKey(handleKey(state, "pageup"), "q").quit).toBe(true);
});

test("draft, validation and live text cannot inject terminal controls; Unicode fits", () => {
  const malicious = "\x1b[2J\x1b]0;owned\x07界👩‍💻é\r\x08\x9bBAD";
  let state = reloadState(
    createState(40, 12),
    snapshot(
      [
        { dir: malicious, errors: [malicious] },
        { dir: "active", flow: flow({ title: malicious, next: malicious }) },
      ],
      malicious,
    ),
  );
  state.linear["MAM-1"] = { status: malicious };
  state.prs["42"] = { error: malicious };
  for (const columns of [1, 2, 20, 40]) {
    const output = renderDashboard(state, columns, 12);
    expect(output.every((line) => Bun.stringWidth(line) <= columns)).toBe(true);
    // eslint-disable-next-line no-control-regex -- Assert no terminal controls remain in rendered external text.
    expect(output.join("\n")).not.toMatch(/[\x00-\x09\x0b-\x1f\x7f-\x9f]/);
  }
  const pages: string[] = [];
  for (let i = 0; i < 60; i += 1) {
    pages.push(...renderDashboard(state, 40, 12));
    state = handleKey(state, "pagedown");
  }
  pages.push(...renderDashboard(handleKey(state, "k"), 40, 12));
  expect(pages.join("\n")).toContain("界👩‍💻é");
  // eslint-disable-next-line no-control-regex -- Check paged network data and invalid-entry errors too.
  expect(pages.join("\n")).not.toMatch(/[\x00-\x09\x0b-\x1f\x7f-\x9f]/);
});

const terminalFixture = () => {
  const properties = [process.stdin, process.stdout].map((stream) =>
    Object.getOwnPropertyDescriptors(stream),
  );
  const writes: string[] = [];
  const raw: boolean[] = [];
  Object.defineProperties(process.stdin, {
    isTTY: { value: true, configurable: true },
    isRaw: { value: true, configurable: true },
    setRawMode: {
      value: (value: boolean) => {
        raw.push(value);
        return process.stdin;
      },
      configurable: true,
    },
  });
  Object.defineProperties(process.stdout, {
    isTTY: { value: true, configurable: true },
    columns: { value: 40, configurable: true },
    rows: { value: 12, configurable: true },
  });
  const output = spyOn(process.stdout, "write").mockImplementation((chunk) => {
    writes.push(String(chunk));
    return true;
  });
  const resume = spyOn(process.stdin, "resume").mockReturnValue(process.stdin);
  const pause = spyOn(process.stdin, "pause").mockReturnValue(process.stdin);
  return {
    writes,
    raw,
    output,
    restore: () => {
      for (const mock of [output, resume, pause]) mock.mockRestore();
      for (const [index, stream] of [process.stdin, process.stdout].entries()) {
        const original = properties[index];
        for (const key of ["isTTY", "isRaw", "setRawMode", "columns", "rows"]) {
          const descriptor = original?.[key];
          if (descriptor) Object.defineProperty(stream, key, descriptor);
          else Reflect.deleteProperty(stream, key);
        }
      }
    },
  };
};

test("native lifecycle keeps local tick and keys responsive during hanging live requests and cleans up", async () => {
  const terminal = terminalFixture();
  const { writes, raw } = terminal;
  const before = process.listenerCount("SIGTERM");
  const initial = snapshot([
    { dir: "active", flow: flow() },
    { dir: "duplicate", flow: flow() },
  ]);
  const load = spyOn(sources, "loadDraftSnapshot").mockResolvedValue(initial);
  const signals: AbortSignal[] = [];
  const linear = spyOn(sources, "fetchLinear").mockImplementation((_id, signal) => {
    if (signal) signals.push(signal);
    return new Promise(() => undefined);
  });
  const pr = spyOn(sources, "fetchPr").mockResolvedValue({ state: "OPEN", checks: "none" });
  let tick: (() => void) | undefined;
  const interval = spyOn(globalThis, "setInterval").mockImplementation(((callback: () => void) => {
    tick = callback;
    return 123;
  }) as unknown as typeof setInterval);
  const clear = spyOn(globalThis, "clearInterval").mockImplementation(() => undefined);
  try {
    const running = runDashboard("/tmp/project");
    await Bun.sleep(10);
    expect(linear).toHaveBeenCalledTimes(1);
    const [firstInterval] = interval.mock.calls;
    expect(firstInterval?.[1]).toBe(30_000);
    expect(pr).toHaveBeenCalledTimes(1);
    expect(writes.join("")).toContain("OPEN/none");
    load.mockResolvedValue(snapshot([{ dir: "active", flow: flow({ title: "updated locally" }) }]));
    tick?.();
    await Bun.sleep(10);
    expect(writes.join("")).toContain("updated locally");
    expect(linear).toHaveBeenCalledTimes(1);
    process.stdin.emit("keypress", "r", { name: "r" });
    await Bun.sleep(10);
    expect(linear).toHaveBeenCalledTimes(1);
    process.stdin.emit("keypress", "q", { name: "q" });
    await running;
    expect(raw).toEqual([true, true]);
    expect(signals.every((signal) => signal.aborted)).toBe(true);
    expect(clear).toHaveBeenCalled();
    expect(process.listenerCount("SIGTERM")).toBe(before);
    expect(writes.join("")).toContain("\x1b[?25h");
  } finally {
    for (const mock of [load, linear, pr, interval, clear]) mock.mockRestore();
    terminal.restore();
  }
});

test("removed live target cancels work and late result cannot replace reintroduced target", async () => {
  const terminal = terminalFixture();
  const load = spyOn(sources, "loadDraftSnapshot").mockResolvedValue(
    snapshot([{ dir: "active", flow: flow() }]),
  );
  let obsolete: ((value: { status: string }) => void) | undefined;
  const signals: AbortSignal[] = [];
  const linear = spyOn(sources, "fetchLinear").mockImplementation((_id, signal) => {
    if (signal) signals.push(signal);
    return new Promise((resolve) => {
      obsolete = resolve;
    });
  });
  const pr = spyOn(sources, "fetchPr").mockRejectedValue(new Error("provider-private-detail"));
  try {
    const running = runDashboard("/tmp/project");
    await Bun.sleep(10);
    const oldResult = obsolete;
    load.mockResolvedValue(snapshot([{ dir: "bad", errors: ["invalid"] }]));
    process.stdin.emit("keypress", "r", { name: "r" });
    await Bun.sleep(10);
    expect(signals[0]?.aborted).toBe(true);
    linear.mockResolvedValue({ status: "fresh state" });
    load.mockResolvedValue(snapshot([{ dir: "active", flow: flow() }]));
    process.stdin.emit("keypress", "r", { name: "r" });
    await Bun.sleep(10);
    oldResult?.({ status: "obsolete state" });
    await Bun.sleep(10);
    expect(terminal.writes.join("")).toContain("fresh state");
    expect(terminal.writes.join("")).not.toContain("obsolete state");
    expect(terminal.writes.join("")).not.toContain("provider-private-detail");
    process.emit("SIGTERM");
    await running;
    expect(terminal.raw).toEqual([true, true]);
  } finally {
    process.stdin.emit("keypress", "q", { name: "q" });
    for (const mock of [load, linear, pr]) mock.mockRestore();
    terminal.restore();
  }
});

test("offline resize and SIGINT restore original raw state without remote calls; terminal failure also cleans up", async () => {
  const terminal = terminalFixture();
  Object.defineProperty(process.stdin, "isRaw", { value: false, configurable: true });
  const load = spyOn(sources, "loadDraftSnapshot").mockResolvedValue(
    snapshot([{ dir: "active", flow: flow() }]),
  );
  const linear = spyOn(sources, "fetchLinear");
  const pr = spyOn(sources, "fetchPr");
  const before = process.listenerCount("SIGINT");
  try {
    const running = runDashboard("/tmp/project", "offline");
    await Bun.sleep(10);
    for (let i = 0; i < 20; i += 1) process.stdin.emit("keypress", "", { name: "pagedown" });
    Object.defineProperties(process.stdout, {
      columns: { value: 20, configurable: true },
      rows: { value: 5, configurable: true },
    });
    process.stdout.emit("resize");
    const frame = Bun.stripANSI(terminal.writes.at(-1) ?? "").split("\r\n");
    expect(frame.length).toBeLessThanOrEqual(5);
    expect(frame.every((line) => Bun.stringWidth(line) <= 20)).toBe(true);
    process.emit("SIGINT");
    await running;
    expect(terminal.raw).toEqual([true, false]);
    expect(linear).not.toHaveBeenCalled();
    expect(pr).not.toHaveBeenCalled();
    expect(process.listenerCount("SIGINT")).toBe(before);
    const failing = runDashboard("/tmp/project", "offline");
    process.stdout.emit("error", new Error("private terminal failure"));
    expect(failing).rejects.toThrow("terminal failed");
    expect(terminal.raw).toEqual([true, false, true, false]);
    expect(process.listenerCount("SIGINT")).toBe(before);
  } finally {
    process.stdin.emit("keypress", "q", { name: "q" });
    for (const mock of [load, linear, pr]) mock.mockRestore();
    terminal.restore();
  }
});
