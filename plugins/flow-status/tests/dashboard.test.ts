/* eslint-disable clean-code/no-business-policy-literals, clean-code/no-boolean-flag-arguments -- Independent dashboard fixtures and expected behavior. */
import { expect, test, spyOn } from "bun:test";
import {
  createState,
  handleKey,
  reloadState,
  renderDashboard,
  runDashboard,
} from "../src/dashboard";
import { FLOW_STEPS, type Flow, type FlowEntry, validateFlow } from "../src/flowCore";
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
// eslint-disable-next-line no-control-regex -- The renderer's explicit SGR allowlist, stripped before checking other controls.
const OWNED_SGR = /\x1b\[(?:0|1|2|1;3[1236]|38;5;248)m/g;
const snapshot = (entries: FlowEntry[], branch: string | null = "feature/current") => ({
  root: "/tmp/project",
  branch,
  entries,
  error: null,
});

test("branch selection, done toggle, arrows and directory preservation on reload", () => {
  const entries: FlowEntry[] = [
    { dir: "bad", errors: ["FLOW missing"] },
    { dir: "active", flow: flow({ ticket: "cache-cleanup", linear_id: null, prs: [] }) },
    { dir: "linked", flow: flow({ branches: ["feature/other"] }) },
    { dir: "done", flow: flow({ status: "done", step: 13 }) },
  ];
  let state = reloadState(createState(), snapshot(entries));
  expect(state.selectedDir).toBe("active");
  expect(renderDashboard(state, 80, 20).join("\n")).not.toContain("> done");
  for (const offline of [false, true]) {
    const output = renderDashboard({ ...state, offline }, 89, 51).join("\n");
    expect(output).toContain("Linear: not linked");
    expect(output).not.toContain("not refreshed");
    expect(output).not.toContain("credential");
  }
  state = handleKey(state, "down");
  expect(state.selectedDir).toBe("linked");
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

test("summary stays concise and never exposes evidence or history through paging", () => {
  const ordinary = reloadState(createState(), snapshot([{ dir: "active", flow: flow() }]));
  for (const [columns, rows] of [
    [80, 24],
    [89, 51],
  ]) {
    const initial = renderDashboard(ordinary, columns ?? 80, rows ?? 24).join("\n");
    for (const heading of ["NEXT", "PHASES", "elapsed"]) expect(initial).toContain(heading);
    expect(initial).toContain("✓  1 Scope agreed");
  }
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
    "quick/3",
    "abc123",
    "plan consent",
    "content consent",
    "bank frozen",
    "unused wrapper",
    "accepted residual",
    "reviewer",
    "C1 R2",
  ])
    expect(output).not.toContain(text);
  expect(output).toContain("review next");
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
        { dir: "active", flow: flow({ ticket: malicious, title: malicious, next: malicious }) },
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

test("every row reflects its own record; open items follow the flow status", () => {
  const outputFor = (status: "active" | "paused" | "done") => {
    const value = flow({
      status,
      step: status === "done" ? 13 : 9,
      tasks: { T1: "done", T2: "in_progress", T3: "pending" },
      steps: {
        "1": { state: "done", evidence: "HIDDEN".repeat(20_000) },
        "2": { state: "skipped", evidence: "HIDDEN" },
        "3": { state: "n/a", evidence: "HIDDEN" },
      },
    });
    const state = reloadState(
      { ...createState(89, 51), showDone: true },
      snapshot([{ dir: "active", flow: value }]),
    );
    return renderDashboard(state, 89, 51);
  };
  const line = (lines: string[], label: string): string =>
    lines.find((text) => text.includes(label)) ?? "";
  for (const status of ["active", "paused", "done"] as const) {
    const lines = outputFor(status);
    const output = lines.join("\n");
    expect(output).not.toContain("HIDDEN");
    expect(line(lines, "Scope agreed")).toStartWith("✓");
    expect(line(lines, "Plan drafted")).toMatch(/^- .*skipped$/);
    expect(line(lines, "Simplicity review")).toMatch(/^- .*n\/a$/);
    expect(line(lines, "Plan review")).toMatch(/^\? .*not recorded$/);
    expect(line(lines, " T1")).toMatch(/^ {5}✓ T1 .*no timing$/);
    expect(line(lines, " T3")).toMatch(/^ {5}◦ T3$/);
    const open = { active: "running", paused: "paused", done: "not closed" }[status];
    expect(line(lines, " T2")).toMatch(new RegExp(`^ {5}▸ T2 .*${open}$`));
  }
  // A done flow's closed but untimed legacy rows carry no warning; only open items do.
  expect(outputFor("done").filter((text) => text.includes("not closed"))).toHaveLength(2);
  expect(line(outputFor("active"), "Content approval")).toMatch(/^◦ 10 Content approval$/);
  const empty = reloadState(
    createState(),
    snapshot([{ dir: "active", flow: flow({ tasks: {}, steps: {}, next: " \n\t" }) }]),
  );
  const output = renderDashboard(empty, 80, 24);
  expect(output.join("\n")).toContain("No next action recorded");
  expect(line(output, "Execution")).toMatch(/^▸ {2}9 Execution .*running$/);
});

test("NEXT leads the list at 40x12 and tiny sizes stay bounded", () => {
  const state = reloadState(createState(40, 12), snapshot([{ dir: "active", flow: flow() }]));
  const lines = renderDashboard(state, 40, 12);
  expect(lines[2]).toStartWith("NEXT");
  expect(lines.slice(0, 7).join("\n")).toContain("PHASES");
  expect(lines.slice(0, 7).join("\n")).toContain("NEXT");
  expect(lines.slice(0, 7).join("\n")).toContain("review next");
  for (const [columns, rows] of [
    [1, 1],
    [2, 2],
    [20, 5],
    [40, 1],
    [40, 2],
    [40, 5],
  ] as const) {
    const out = renderDashboard(state, columns, rows);
    expect(out.length).toBeLessThanOrEqual(rows);
    expect(out.every((line) => Bun.stringWidth(line) <= columns)).toBe(true);
  }
});

test("external text cannot acquire semantic styling from its leading words", () => {
  const value = flow({
    title: "Blockers [invalid] invalid FLOW.json",
    ticket: "NEXT",
    next: "PR #9 [paused] Blockers",
    tasks: { "Blockers-1": "pending", "NEXT-2": "pending" },
  });
  const state = reloadState(
    { ...createState(89, 30), color: true },
    snapshot([{ dir: "NEXT", flow: value }]),
  );
  const lines = renderDashboard(state, 89, 30);
  const find = (text: string) => lines.find((line) => Bun.stripANSI(line).includes(text)) ?? "";
  expect(find("Blockers [invalid]")).toBe(
    "\x1b[1m" + "Blockers [invalid] invalid FLOW.json\x1b[0m",
  );
  expect(find("PR #9 [paused]")).not.toContain("\x1b[");
  expect(find("Tasks: Blockers-1")).not.toContain("\x1b[");
  expect(lines.some((line) => line.includes("\x1b[1;31m"))).toBe(false);
});

test("hidden-done-only differs from genuinely empty; load errors are visible and stale is explicit", () => {
  const done = { dir: "old", flow: flow({ status: "done", step: 13 }) };
  const hidden = renderDashboard(reloadState(createState(), snapshot([done])), 80, 24).join("\n");
  expect(hidden).toContain("No active flows.");
  expect(hidden).toContain("1 completed flow hidden · d to show");
  expect(hidden).toContain("d show done");
  expect(hidden).not.toContain("No flows found.");
  const empty = renderDashboard(reloadState(createState(), snapshot([])), 80, 24).join("\n");
  expect(empty).toContain("No flows found.");
  expect(empty).not.toContain("d show done");
  const failed = reloadState(createState(), {
    ...snapshot([]),
    error: "Drafts directory unavailable or unreadable",
  });
  const failure = renderDashboard(failed, 80, 24);
  expect(failure.join("\n")).toContain("Load error: Drafts directory unavailable");
  expect(failure.join("\n")).not.toContain("Showing last loaded");
  const stale = reloadState(failed, { ...snapshot([{ dir: "active", flow: flow() }]) });
  const kept = { ...stale, error: "Local drafts unavailable" };
  const output = renderDashboard(kept, 80, 24).join("\n");
  expect(output).toContain("Load error: Local drafts unavailable");
  expect(output).toContain("Showing last loaded records");
  expect(output).toContain("PHASES");
});

test("footer shows whole conditional items and scroll help only with overflow", () => {
  const roomy = reloadState(createState(89, 51), snapshot([{ dir: "active", flow: flow() }]));
  const single = renderDashboard(roomy, 89, 51).at(-1) ?? "";
  expect(single).toBe("q quit · c copy · r refresh");
  const many = reloadState(
    createState(80, 40),
    snapshot([
      { dir: "a", flow: flow() },
      { dir: "b", flow: flow() },
      { dir: "c", flow: flow({ status: "done", step: 13 }) },
    ]),
  );
  expect(renderDashboard(many, 80, 40).at(-1)).toBe(
    "q quit · c copy · r refresh · j/k flows · d show done",
  );
  const tall = reloadState(createState(40, 6), snapshot([{ dir: "a", flow: flow() }]));
  const full = renderDashboard(tall, 90, 6).at(-1) ?? "";
  expect(full).toBe(
    "q quit · c copy · wheel/PgUpDn · 1–4/21 · r refresh · Ctrl-U/D half page · Home/End",
  );
  const items = ["q quit", "c copy", "r refresh", "wheel/PgUpDn", "Ctrl-U/D half page", "Home/End"];
  for (let columns = 6; columns <= 90; columns += 1) {
    const footer = renderDashboard(tall, columns, 6).at(-1) ?? "";
    expect(Bun.stringWidth(footer)).toBeLessThanOrEqual(columns);
    for (const part of footer.split(" · "))
      expect(items.includes(part) || /^\d+–\d+\/\d+$/.test(part)).toBe(true);
  }
  expect(renderDashboard(tall, 80, 6).at(-1)).toContain("1–4/21");
  expect(renderDashboard(tall, 40, 6).at(-1)).toBe("q quit · c copy · wheel/PgUpDn · 1–4/21");
  expect(renderDashboard(tall, 43, 6).at(-1)).toBe("q quit · c copy · wheel/PgUpDn · 1–4/21");
  expect(renderDashboard(tall, 30, 6).at(-1)).toBe("q quit · c copy · wheel/PgUpDn");
  expect(renderDashboard(tall, 14, 6).at(-1)).toBe("q quit");
  const scrolled = handleKey(tall, "end");
  expect(renderDashboard(scrolled, 80, 6).at(-1)).toContain("18–21/21");
});

test("colored geometry matches plain rendering and external controls never survive owned styles", () => {
  const hostile = "\x1b[31m\x1b]0;owned\x07界👩‍💻é\x9b\r\x08";
  const value = flow({
    title: hostile.repeat(40),
    ticket: hostile.repeat(40),
    next: `${hostile.repeat(100)}\nSECOND-LINE-SECRET`,
    tasks: { [hostile.repeat(100)]: "pending" },
  });
  const state = reloadState(createState(), snapshot([{ dir: "active", flow: value }], hostile));
  state.linear["MAM-1"] = { status: hostile };
  state.prs["42"] = { error: hostile };
  for (const [columns, rows] of [
    [89, 51],
    [80, 24],
    [40, 8],
    [20, 5],
    [1, 1],
    [0, 0],
  ] as const) {
    const plain = renderDashboard(state, columns, rows);
    const colored = renderDashboard({ ...state, color: true }, columns, rows);
    expect(colored.map((line) => Bun.stripANSI(line))).toEqual(plain);
    expect(plain.length).toBeLessThanOrEqual(rows);
    expect(plain.every((line) => Bun.stringWidth(line) <= columns)).toBe(true);
    const controlsRemoved = colored.join("\n").replaceAll(OWNED_SGR, "");
    // eslint-disable-next-line no-control-regex -- Only owned SGR may survive external text sanitization.
    expect(controlsRemoved).not.toMatch(/[\x00-\x09\x0b-\x1f\x7f-\x9f]/);
    expect(controlsRemoved).not.toContain("SECOND-LINE-SECRET");
  }
});

test("summary navigation clamps, preserves selection, and bounds source and validation details", () => {
  const tasks = Object.fromEntries(
    Array.from({ length: 100 }, (_, i) => [`T${String(i)}`, "pending" as const]),
  );
  let state = reloadState(
    createState(80, 24),
    snapshot([
      { dir: "active", flow: flow({ tasks }) },
      { dir: "second", flow: flow() },
      { dir: "third", flow: flow() },
    ]),
  );
  for (const heading of ["PHASES", "NEXT"])
    expect(renderDashboard(state, 80, 24).join("\n")).toContain(heading);
  expect(renderDashboard(state, 80, 24).join("\n")).toContain("◦ T5");
  state = { ...state, columns: 40, rows: 8 };
  for (const key of ["scrolldown", "ctrl-d", "pagedown", "end"]) {
    const next = handleKey(state, key);
    expect(next.scroll).toBeGreaterThan(state.scroll);
    expect(next.selectedDir).toBe("active");
    state = next;
  }
  expect(handleKey(state, "scrolldown").scroll).toBe(state.scroll);
  expect(renderDashboard(state, 40, 8).join("\n")).toContain("PR #42");
  expect(renderDashboard(state, 40, 8).join("\n")).toContain("Updated");
  for (const key of ["scrollup", "ctrl-u", "pageup", "home"]) state = handleKey(state, key);
  expect(state.scroll).toBe(0);
  expect(handleKey(handleKey(state, "end"), "j").scroll).toBe(0);
  state = reloadState(handleKey(state, "end"), snapshot([{ dir: "active", flow: flow() }]));
  expect(state.scroll).toBeLessThan(20);
  const invalid = reloadState(
    createState(),
    snapshot([{ dir: "bad", errors: ["one", "two", "three", "HIDDEN", "HIDDEN"] }]),
  );
  expect(renderDashboard(invalid, 80, 24).join("\n")).toContain("+2 errors");
  expect(renderDashboard(invalid, 80, 24).join("\n")).not.toContain("HIDDEN");
  for (const view of [
    undefined,
    "loading",
    { error: "unavailable" },
    { state: "OPEN", checks: "fail" },
    { state: "OPEN", checks: "pending" },
    { state: "OPEN", checks: "none" },
  ] as const) {
    const live = { ...state, rows: 51, prs: view === undefined ? {} : { "42": view } };
    const output = renderDashboard(live, 89, 51).join("\n");
    expect(output.includes("checks failing")).toBe(
      typeof view === "object" && "checks" in view && view.checks === "fail",
    );
    expect(output).not.toContain("approved");
  }
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
    columns: { value: 89, configurable: true },
    rows: { value: 51, configurable: true },
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

test("copy mode releases mouse capture and freezes output until resumed, while quit still restores terminal", async () => {
  const terminal = terminalFixture();
  const load = spyOn(sources, "loadDraftSnapshot").mockResolvedValue(
    snapshot([{ dir: "active", flow: flow() }]),
  );
  let tick: (() => void) | undefined;
  const interval = spyOn(globalThis, "setInterval").mockImplementation(((callback: () => void) => {
    tick = callback;
    return 123;
  }) as unknown as typeof setInterval);
  const clear = spyOn(globalThis, "clearInterval").mockImplementation(() => undefined);
  try {
    const running = runDashboard("/tmp/project", "offline");
    await Bun.sleep(10);
    expect(terminal.writes.join("")).toContain("c copy");
    process.stdin.emit("data", "c");
    expect(terminal.writes.at(-2)).toBe("\x1b[?1006l\x1b[?1000l");
    expect(terminal.writes.at(-1)).toContain("c resume");
    expect(terminal.writes.at(-1)).toContain("Select text; use terminal Copy");
    const frozenWrites = terminal.writes.length;
    load.mockResolvedValue(snapshot([{ dir: "active", flow: flow({ title: "New title" }) }]));
    tick?.();
    await Bun.sleep(10);
    process.stdin.emit("data", "rj\x1b[6~\x1b[<65;2;3M");
    process.stdout.emit("resize");
    expect(terminal.writes).toHaveLength(frozenWrites);
    expect(load).toHaveBeenCalledTimes(2);
    process.stdin.emit("data", "c");
    expect(terminal.writes.at(-2)).toBe("\x1b[?1000h\x1b[?1006h");
    expect(terminal.writes.at(-1)).toContain("New title");
    expect(terminal.writes.at(-1)).toContain("c copy");
    process.stdin.emit("data", "c\x03");
    await running;
    expect(terminal.writes.at(-1)).toBe("\x1b[?1006l\x1b[?1000l\x1b[?25h\x1b[?1049l");
  } finally {
    process.stdin.emit("data", "q");
    for (const mock of [load, interval, clear]) mock.mockRestore();
    terminal.restore();
  }
});

test("live local flows make no provider calls on open or refresh; mixed flows use explicit links only", async () => {
  const terminal = terminalFixture();
  const raw: Record<string, unknown> = { ...flow(), ticket: "MAM-999", prs: [] };
  delete raw.linear_id;
  const result = validateFlow(raw);
  if (!result.ok) throw new Error(result.errors.join("; "));
  const local = result.flow;
  const load = spyOn(sources, "loadDraftSnapshot").mockResolvedValue(
    snapshot([{ dir: "local", flow: local }]),
  );
  const linear = spyOn(sources, "fetchLinear").mockResolvedValue({ status: "Started" });
  const pr = spyOn(sources, "fetchPr").mockResolvedValue({ state: "OPEN", checks: "none" });
  try {
    const running = runDashboard("/tmp/project");
    await Bun.sleep(10);
    expect(linear).not.toHaveBeenCalled();
    expect(pr).not.toHaveBeenCalled();
    process.stdin.emit("data", "r");
    await Bun.sleep(10);
    expect(linear).not.toHaveBeenCalled();
    expect(pr).not.toHaveBeenCalled();
    expect(terminal.writes.join("")).toContain("Linear: not linked");
    load.mockResolvedValue(
      snapshot([
        { dir: "local", flow: { ...local, prs: [43] } },
        { dir: "linked", flow: flow() },
      ]),
    );
    process.stdin.emit("data", "r");
    await Bun.sleep(10);
    expect(linear.mock.calls.map(([id]) => id)).toEqual(["MAM-1"]);
    expect(pr.mock.calls.map(([, number]) => number)).toEqual([43, 42]);
    process.stdin.emit("data", "q");
    await running;
  } finally {
    process.stdin.emit("data", "q");
    for (const mock of [load, linear, pr]) mock.mockRestore();
    terminal.restore();
  }
});

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
    process.stdin.emit("data", "r");
    await Bun.sleep(10);
    expect(linear).toHaveBeenCalledTimes(1);
    process.stdin.emit("data", "q");
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
    load.mockResolvedValue(
      snapshot([
        { dir: "active", flow: flow({ ticket: "cache-cleanup", linear_id: null, prs: [] }) },
      ]),
    );
    process.stdin.emit("data", "r");
    await Bun.sleep(10);
    expect(signals[0]?.aborted).toBe(true);
    linear.mockResolvedValue({ status: "fresh state" });
    load.mockResolvedValue(snapshot([{ dir: "active", flow: flow() }]));
    process.stdin.emit("data", "r");
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
    process.stdin.emit("data", "q");
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
    for (let i = 0; i < 20; i += 1) process.stdin.emit("data", "\x1b[6~");
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
    process.stdin.emit("data", "q");
    for (const mock of [load, linear, pr]) mock.mockRestore();
    terminal.restore();
  }
});

test("Ctrl-C, stdin error and startup failure remove input listeners and restore terminal", async () => {
  for (const mode of ["ctrl-c", "stdin-error", "startup-error"]) {
    const terminal = terminalFixture();
    const dataListeners = process.stdin.listenerCount("data");
    const signals: AbortSignal[] = [];
    const load = spyOn(sources, "loadDraftSnapshot").mockImplementation((_cwd, signal) => {
      if (signal !== undefined) signals.push(signal);
      return new Promise(() => undefined);
    });
    if (mode === "startup-error")
      terminal.output.mockImplementationOnce(() => {
        throw new Error("startup failed");
      });
    try {
      const running = runDashboard("/tmp/project", "offline");
      if (mode === "ctrl-c") process.stdin.emit("data", "\x1b[<64;1;\x03q");
      if (mode === "stdin-error") process.stdin.emit("error", new Error("stdin failed"));
      if (mode === "ctrl-c") await running;
      else
        expect(
          await running.then(
            () => "resolved",
            () => "rejected",
          ),
        ).toBe("rejected");
      expect(process.stdin.listenerCount("data")).toBe(dataListeners);
      expect(signals.every((signal) => signal.aborted)).toBe(true);
      expect(terminal.writes.join("")).toContain("\x1b[?1006l\x1b[?1000l\x1b[?25h\x1b[?1049l");
      const writes = terminal.writes.length;
      process.stdin.emit("data", "\x1b[<65;1;1Mr");
      expect(terminal.writes.length).toBe(writes);
    } finally {
      load.mockRestore();
      terminal.restore();
    }
  }
});

test("NEXT wraps on word boundaries, splits only oversized tokens and truncates with an ellipsis", () => {
  const render = (next: string, columns: number, color = false) =>
    renderDashboard(
      reloadState(
        { ...createState(columns, 30), color },
        snapshot([{ dir: "a", flow: flow({ next }) }]),
      ),
      columns,
      30,
    );
  const nextRows = (lines: string[]) => {
    const start = lines.findIndex((line) => Bun.stripANSI(line) === "NEXT");
    return lines.slice(start + 1, start + 3).map((line) => Bun.stripANSI(line));
  };
  const ordinary = nextRows(render("Finish task review, then verify terminal behavior.", 40));
  expect(ordinary).toEqual(["  Finish task review, then verify", "  terminal behavior."]);
  const token = "界👩‍💻".repeat(12);
  const oversized = render(`go ${token} end`, 20);
  const rows = nextRows(oversized);
  expect(rows[0]).toBe("  go");
  expect(rows.join("")).toContain("👩‍💻");
  const truncated = nextRows(render("alpha beta gamma delta epsilon zeta eta theta iota", 20));
  expect(truncated[1]?.endsWith("…")).toBe(true);
  for (const columns of [8, 20, 40]) {
    const plain = render(`${token} one two\nSECOND\x1b]0;x\x07`, columns);
    const colored = render(`${token} one two\nSECOND\x1b]0;x\x07`, columns, true);
    expect(plain.join("\n")).not.toContain("SECOND");
    expect(plain.every((line) => Bun.stringWidth(line) <= columns)).toBe(true);
    expect(colored.map((line) => Bun.stripANSI(line))).toEqual(plain);
  }
});

test("flow ID and status outrank branch and directory in the header", () => {
  const longDir = "very-long-directory-name-for-sam-ui-redesign";
  const header = (entry: FlowEntry, columns: number, offline = false) =>
    renderDashboard(
      reloadState({ ...createState(columns, 12), offline }, snapshot([entry], "develop")),
      columns,
      12,
    )[0] ?? "";
  for (const status of ["active", "paused"] as const) {
    const line = header({ dir: longDir, flow: flow({ ticket: "sam-ui-redesign", status }) }, 40);
    expect(line).toBe(`FLOW · sam-ui-redesign · ${status}`);
  }
  expect(header({ dir: "short", flow: flow({ ticket: "sam-ui-redesign" }) }, 80)).toBe(
    "FLOW · sam-ui-redesign (short) · develop · active",
  );
  expect(header({ dir: longDir, errors: ["bad"] }, 40)).toBe(
    `FLOW · ${longDir.slice(0, 22)}… · invalid`,
  );
  expect(header({ dir: longDir, errors: ["bad"] }, 40, true)).toContain("invalid");
  const hostile = header(
    { dir: "d", flow: flow({ ticket: "t\x1b]0;x\x07\n", status: "paused" }) },
    40,
  );
  expect(hostile).toBe("FLOW · t (d) · develop · paused");
  for (let columns = 1; columns <= 60; columns += 1)
    expect(
      Bun.stringWidth(header({ dir: longDir, flow: flow({ ticket: "sam-ui-redesign" }) }, columns)),
    ).toBeLessThanOrEqual(columns);
  const many = renderDashboard(
    reloadState(
      createState(40, 12),
      snapshot([
        { dir: "a", flow: flow() },
        { dir: "b", flow: flow() },
      ]),
    ),
    40,
    12,
  );
  expect(many[0]).toBe("FLOW · feature/current · 1/2");
  expect(many[1]).toStartWith(">");
});

const timedFlow = (patch: Partial<Flow> = {}): Flow =>
  flow({
    step: 9,
    updated_at: "2026-10-09T15:28:00Z",
    steps: {
      "1": {
        state: "done",
        evidence: "",
        started_at: "2026-10-09T09:02:00Z",
        completed_at: "2026-10-09T09:20:00Z",
      },
      "4": {
        state: "done",
        evidence: "",
        started_at: "2026-10-08T10:22:00Z",
        completed_at: "2026-10-08T11:40:00Z",
      },
      "5": { state: "skipped", evidence: "", completed_at: "2026-10-09T11:41:00Z" },
      "9": { state: "active", evidence: "", started_at: "2026-10-09T12:18:00Z" },
    },
    tasks: {
      T1: {
        status: "done",
        summary: "Add export schema and CSV writer",
        started_at: "2026-10-09T12:20:00Z",
        completed_at: "2026-10-09T13:05:00Z",
      },
      T4: {
        status: "in_progress",
        summary: "Admin export dialog",
        started_at: "2026-10-09T14:40:00Z",
      },
      T5: { status: "pending", summary: "Docs and migration note" },
    },
    reviews: [
      {
        kind: "plan",
        cycle: 2,
        round: 1,
        verdict: "APPROVED",
        reviewer_model: "r",
        findings: [],
      },
    ],
    ...patch,
  });

const timedState = (value: Flow, columns: number, rows: number, color = false) => {
  process.env.TZ = "UTC";
  return {
    ...reloadState(
      { ...createState(columns, rows), color },
      snapshot([{ dir: "active", flow: value }]),
    ),
    now: Date.parse("2026-10-09T15:30:00Z"),
  };
};
const rowOf = (lines: string[], label: string): string =>
  lines
    .find((text) => text.includes(label))
    ?.replace(/\s+/g, " ")
    .trim() ?? "";

test("all phases render recorded timing, and incomplete legacy timing stays explicit", () => {
  const value = flow({
    step: 13,
    tasks: {},
    reviews: [],
    steps: Object.fromEntries(
      FLOW_STEPS.map((_, index) => [
        String(index + 1),
        {
          state: "done",
          evidence: "",
          started_at: "2026-10-09T09:02:00Z",
          completed_at: "2026-10-09T09:20:00Z",
        },
      ]),
    ),
  });
  const lines = renderDashboard(timedState(value, 100, 40), 100, 40);
  for (const [index, name] of FLOW_STEPS.entries()) {
    const label = `${String(index + 1)} ${name.charAt(0).toUpperCase()}${name.slice(1)}`;
    expect(rowOf(lines, label)).toBe(`✓ ${label} 18m 09:20`);
  }
  value.steps = {
    "1": { state: "done", evidence: "" },
    "2": { state: "done", evidence: "", completed_at: "2026-10-09T09:20:00Z" },
    "3": { state: "done", evidence: "", started_at: "2026-10-09T09:02:00Z" },
  };
  const legacy = renderDashboard(timedState(value, 100, 40), 100, 40);
  expect(rowOf(legacy, "Scope agreed")).toBe("✓ 1 Scope agreed no timing");
  expect(rowOf(legacy, "Plan drafted")).toBe("✓ 2 Plan drafted no timing 09:20");
  expect(rowOf(legacy, "Simplicity review")).toBe("✓ 3 Simplicity review no timing");
});

test("PR phase exposes its review loop and latest final or PR round without task review leakage", () => {
  const review = {
    cycle: 1,
    round: 1,
    verdict: "CLEAN",
    reviewer_model: "r",
    findings: [],
  } as const;
  const value = flow({
    step: 11,
    reviews: [
      { ...review, findings: [], kind: "plan", cycle: 2, round: 3 },
      { ...review, findings: [], kind: "final" },
      { ...review, findings: [], kind: "pr", cycle: 2, round: 2 },
      { ...review, findings: [], kind: "task", round: 5 },
    ],
  });
  const render = () => renderDashboard(timedState(value, 100, 40), 100, 40);
  expect(rowOf(render(), "11 PR")).toBe("▸ 11 PR + review loop + merge · C2 R2 running");
  expect(rowOf(render(), "4 Plan review")).toBe("? 4 Plan review · C2 R3 not recorded");
  value.reviews = [{ ...review, findings: [], kind: "final" }];
  expect(rowOf(render(), "11 PR")).toBe("▸ 11 PR + review loop + merge · R1 running");
  value.reviews = [];
  expect(rowOf(render(), "11 PR")).toBe("▸ 11 PR + review loop + merge running");
});

test("recorded times render as elapsed and finished columns that drop by width", () => {
  const wide = renderDashboard(timedState(timedFlow(), 89, 40), 89, 40);
  expect(rowOf(wide, "PHASES")).toBe("PHASES elapsed finished");
  expect(rowOf(wide, "Scope agreed")).toBe("✓ 1 Scope agreed 18m 09:20");
  expect(rowOf(wide, "Plan review")).toBe("✓ 4 Plan review · C2 R1 1h18m 10-08 11:40");
  expect(rowOf(wide, "re-check")).toBe("- 5 Simplicity re-check skipped 11:41");
  expect(rowOf(wide, "Execution")).toBe("▸ 9 Execution running 3h12m");
  expect(rowOf(wide, "T1 ")).toBe("✓ T1 Add export schema and CSV writer 45m 13:05");
  expect(rowOf(wide, "T4 ")).toBe("▸ T4 Admin export dialog running 50m");
  expect(rowOf(wide, "T5 ")).toBe("◦ T5 Docs and migration note");
  const paused = renderDashboard(timedState(timedFlow({ status: "paused" }), 89, 40), 89, 40);
  expect(rowOf(paused, "T4 ")).toBe("▸ T4 Admin export dialog paused 50m");
  const narrow = renderDashboard(timedState(timedFlow(), 40, 40), 40, 40);
  expect(rowOf(narrow, "PHASES")).toBe("PHASES elapsed");
  expect(rowOf(narrow, "T1 ")).toBe("✓ T1 Add export sch… 45m");
  const tiny = renderDashboard(timedState(timedFlow(), 30, 40), 30, 40);
  expect(rowOf(tiny, "PHASES")).toBe("PHASES");
  expect(rowOf(tiny, "Execution")).toBe("▸ 9 Execution");
  for (const columns of [24, 30, 40, 52, 80, 89])
    expect(
      renderDashboard(timedState(timedFlow(), columns, 40), columns, 40).every(
        (line) => Bun.stringWidth(line) <= columns,
      ),
    ).toBe(true);
});

test("row spans keep plain geometry, own every style and separate pending from skipped", () => {
  const hostile = "\u001b[31mRED\u001b[0m 界👩‍💻é\u0007\nX".repeat(20);
  const value = timedFlow({
    tasks: { "T\u001b[2J9": { status: "pending", summary: hostile } },
  });
  for (const columns of [40, 89]) {
    const plain = renderDashboard(timedState(value, columns, 40), columns, 40);
    const colored = renderDashboard(timedState(value, columns, 40, true), columns, 40);
    // eslint-disable-next-line no-control-regex -- Remove owned SGR to compare geometry.
    const stripped = colored.map((line) => line.replaceAll(/\x1b\[[0-9;]*m/g, ""));
    expect(stripped).toEqual(plain);
    const owned = colored.join("\n").replaceAll(OWNED_SGR, "");
    // eslint-disable-next-line no-control-regex -- Only owned SGR may survive.
    expect(owned).not.toMatch(/[\x00-\x09\x0b-\x1f\x7f-\x9f]/);
  }
  const colored = renderDashboard(timedState(value, 89, 40, true), 89, 40);
  expect(colored.find((line) => line.includes("T9"))).toStartWith("\u001b[38;5;248m     ◦ ");
  expect(colored.find((line) => line.includes("re-check"))).toStartWith("\u001b[2m- ");
  expect(colored.find((line) => line.includes("9 Execution"))).toContain(
    "\u001b[1;36m  running 3h12m\u001b[0m",
  );
});

test("values keep their column positions and rows carry no trailing padding", () => {
  const lines = renderDashboard(timedState(timedFlow(), 80, 40), 80, 40);
  const end = (label: string): number => (lines.find((text) => text.includes(label)) ?? "").length;
  const heading = lines.find((text) => text.startsWith("PHASES")) ?? "";
  const elapsedEnd = heading.indexOf("elapsed") + "elapsed".length;
  expect(heading.length).toBe(80);
  for (const label of ["Scope agreed", "re-check", "T1 "]) expect(end(label)).toBe(80);
  // Rows without a finished value end at the elapsed column, not under "finished".
  for (const label of ["9 Execution", "T4 ", "6 Annotation", "3 Simplicity review"])
    expect(end(label)).toBe(elapsedEnd);
  expect(lines.every((text) => text === text.trimEnd())).toBe(true);
});

test("backward step moves and mixed offsets render only what is recorded", () => {
  const value = timedFlow({
    step: 4,
    steps: {
      "1": {
        state: "done",
        evidence: "",
        started_at: "2026-10-09T10:00:00+02:00",
        completed_at: "2026-10-09T08:30:00Z",
      },
      "4": { state: "active", evidence: "cycle 2", started_at: "2026-10-09T13:30:00Z" },
    },
  });
  const lines = renderDashboard(timedState(value, 89, 40), 89, 40);
  expect(rowOf(lines, "Scope agreed")).toBe("✓ 1 Scope agreed 30m 08:30");
  expect(rowOf(lines, "Plan review")).toBe("▸ 4 Plan review · C2 R1 running 2h00m");
  expect(rowOf(lines, "Execution")).toBe("◦ 9 Execution");
  expect(rowOf(lines, "T1 ")).toBe("✓ T1 Add export schema and CSV writer 45m 13:05");
});
