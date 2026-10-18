/* eslint-disable clean-code/no-business-policy-literals, clean-code/no-boolean-flag-arguments -- Independent expected fixtures and Bun assertions, not runtime policy. */
import { expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  type Flow,
  type FlowEntry,
  reviewRound,
  selectCurrentTicket,
  summarizeChecks,
  validateFlow,
} from "../src/flowCore";

const baseRaw = (): Record<string, unknown> => ({
  schema: 1,
  ticket: "MAM-191",
  linear_id: "MAM-191",
  title: "Support evaluation",
  status: "active",
  step: 4,
  updated_at: "2026-10-08T10:00:00Z",
  branches: ["feature/mam-191"],
  prs: [55],
  gsd_quick: null,
  plan_revision: 1,
  steps: { "1": { state: "done", evidence: "PLAN.md" } },
  approvals: { plan: null, content: null },
  simplicity: [],
  reviews: [],
  tasks: { B1: "pending" },
  baseline: null,
  next: "run plan review",
});

const validFlow = (patch: Record<string, unknown> = {}): Flow => {
  const result = validateFlow({ ...baseRaw(), ...patch });
  if (!result.ok) throw new Error(result.errors.join("; "));
  return result.flow;
};

const planReview = (cycle: number, round: number): Record<string, unknown> => ({
  kind: "plan",
  cycle,
  round,
  verdict: "REVISE",
  reviewer_model: "opus",
  findings: [{ severity: "Low", summary: "s", disposition: "fixed" }],
});

test("accepts a valid minimal flow", () => {
  expect(validateFlow(baseRaw())).toMatchObject({ ok: true, flow: { linear_id: "MAM-191" } });
});

test("local flow IDs accept null or omitted Linear association and normalize to null", () => {
  const omitted: Record<string, unknown> = { ...baseRaw(), ticket: "cache-cleanup" };
  delete omitted.linear_id;
  for (const raw of [omitted, { ...omitted, linear_id: null }]) {
    expect(validateFlow(raw)).toMatchObject({
      ok: true,
      flow: { ticket: "cache-cleanup", linear_id: null },
    });
  }
});

test("rejects bad input with named errors and never throws", () => {
  const cases: [string, unknown, string][] = [
    ["unknown key", { ...baseRaw(), extra: 1 }, "extra"],
    ["missing local ID", { ...baseRaw(), ticket: undefined }, "ticket"],
    ["empty local ID", { ...baseRaw(), ticket: "" }, "ticket"],
    ["step 14", { ...baseRaw(), step: 14 }, "step"],
    ["done at step 9", { ...baseRaw(), status: "done", step: 9 }, "status"],
    ["non-array prs", { ...baseRaw(), prs: "x" }, "prs"],
    ["null input", null, "object"],
    ["bad steps key", { ...baseRaw(), steps: { "14": { state: "done", evidence: "x" } } }, "steps"],
    ["bad date", { ...baseRaw(), updated_at: "nope" }, "updated_at"],
    ["non-positive pr", { ...baseRaw(), prs: [0] }, "prs"],
    ["bad review", { ...baseRaw(), reviews: [{ kind: "plan" }] }, "reviews"],
  ];
  for (const [, raw, fragment] of cases) {
    const result = validateFlow(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toContain(fragment);
  }
});

test("rejects unknown keys at every nesting level", () => {
  const review = {
    ...planReview(1, 1),
    findings: [{ severity: "Low", summary: "s", disposition: "d", scope: "x" }],
  };
  const cases: [string, Record<string, unknown>, string][] = [
    ["finding", { reviews: [review] }, "scope"],
    ["step entry", { steps: { "1": { state: "done", evidence: "x", extra: 1 } } }, "extra"],
    ["simplicity entry", { simplicity: [{ plan_revision: 1, removed: [], junk: 1 }] }, "junk"],
    [
      "approval",
      {
        approvals: { plan: { at: "2026-10-01", evidence: "e", revision: 1, z: 1 }, content: null },
      },
      "z",
    ],
  ];
  for (const [, patch, key] of cases) {
    const result = validateFlow({ ...baseRaw(), ...patch });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toContain(key);
  }
});

test("rejects non-ISO updated_at and malformed approval dates", () => {
  expect(validateFlow({ ...baseRaw(), updated_at: "1" }).ok).toBe(false);
  const badDay = { plan: { at: "10/01/2026", evidence: "e", revision: 1 }, content: null };
  expect(validateFlow({ ...baseRaw(), approvals: badDay }).ok).toBe(false);
});

test("reviewRound reports the latest plan review; cycle 1 is implied", () => {
  expect(reviewRound(validFlow({ reviews: [planReview(1, 1), planReview(1, 2)] }), "plan")).toBe(
    "R2",
  );
  expect(reviewRound(validFlow({ reviews: [planReview(2, 1)] }), "plan")).toBe("C2 R1");
  expect(reviewRound(validFlow(), "plan")).toBeNull();
});

const T0 = "2026-10-08T08:00:00Z";
const T1 = "2026-10-08T09:00:00+01:00"; // same instant as 08:00Z: offsets compare as instants
const T2 = "2026-10-08T09:30:00Z";

test("timed task objects, active current step and legacy strings validate together", () => {
  const result = validateFlow({
    ...baseRaw(),
    steps: {
      "1": { state: "done", evidence: "e", started_at: T0, completed_at: T1 },
      "4": { state: "active", evidence: "", started_at: T2 },
    },
    tasks: {
      A: "done",
      B: { status: "done", summary: "  Add export schema  ", started_at: T0, completed_at: T2 },
      C: { status: "in_progress", summary: "Mapping API", started_at: T2 },
      D: { status: "pending", summary: "Docs" },
      E: { status: "pending" },
    },
  });
  expect(result).toMatchObject({
    ok: true,
    flow: { tasks: { B: { summary: "Add export schema" } } },
  });
});

test("timing and state invariants are rejected with named paths", () => {
  const errors = (patch: Record<string, unknown>): string[] => {
    const result = validateFlow({ ...baseRaw(), ...patch });
    return result.ok ? [] : result.errors;
  };
  const step = (fields: Record<string, unknown>) => ({ state: "done", evidence: "", ...fields });
  const task = (fields: Record<string, unknown>) => ({ tasks: { X: fields } });
  const cases: [Record<string, unknown>, string][] = [
    [
      { steps: { "2": { state: "active", evidence: "" } } },
      "steps.2.state: active only on current step",
    ],
    [
      { status: "done", step: 13, steps: { "13": { state: "active", evidence: "" } } },
      "steps.13.state: active step in done flow",
    ],
    [
      { steps: { "4": { state: "active", evidence: "", completed_at: T0 } } },
      "steps.4.completed_at: active step cannot be completed",
    ],
    [
      { steps: { "1": step({ started_at: T2, completed_at: T0 }) } },
      "steps.1.completed_at: completed_at precedes started_at",
    ],
    [
      { steps: { "1": step({ completed_at: "2026-10-09T00:00:00Z" }) } },
      "steps.1.completed_at: later than updated_at",
    ],
    [task({ status: "pending", started_at: T0 }), "tasks.X: pending task cannot have times"],
    [
      task({ status: "in_progress", started_at: T0, completed_at: T2 }),
      "tasks.X.completed_at: in_progress task cannot be completed",
    ],
    [
      task({ status: "done", started_at: "2026-10-09T00:00:00Z" }),
      "tasks.X.started_at: later than updated_at",
    ],
  ];
  for (const [patch, message] of cases) expect(errors(patch)).toContain(message);
  expect(errors(task({ state: "done" })).join()).toContain("expected pending, in_progress, done");
  for (const bad of [
    task({ status: "done", summary: " " }),
    task({ status: "done", summary: "x".repeat(201) }),
    task({ status: "done", started_at: "2026-10-08T08:00:00" }),
    task({ status: "done", owner: "me" }),
    { steps: { "1": step({ started: T0 }) } },
  ])
    expect(errors(bad).length).toBeGreaterThan(0);
});

test("reopened task and re-entered step keep the first start without completion", () => {
  expect(
    validateFlow({
      ...baseRaw(),
      steps: { "4": { state: "active", evidence: "cycle 2", started_at: T0 } },
      tasks: { A: { status: "in_progress", summary: "Reopened", started_at: T0 } },
    }).ok,
  ).toBe(true);
});

const entry = (dir: string, patch: Record<string, unknown>): FlowEntry => ({
  dir,
  flow: validFlow(patch),
});

test("selectCurrentTicket prefers branch match, skips done and invalid", () => {
  const older = entry("a", { branches: ["feature/a"], updated_at: "2026-10-01T00:00:00Z" });
  const newer = entry("b", { branches: ["feature/b"], updated_at: "2026-10-09T00:00:00Z" });
  const done = entry("c", { status: "done", step: 13, updated_at: "2026-10-10T00:00:00Z" });
  const invalid: FlowEntry = { dir: "d", errors: ["bad"] };
  expect(selectCurrentTicket([newer, older, done, invalid], "feature/a")).toBe(older);
  expect(selectCurrentTicket([older, newer, done, invalid], null)).toBe(newer);
  expect(selectCurrentTicket([done, invalid], null)).toBeNull();
});

test("summarizeChecks reduces a status rollup", () => {
  expect(summarizeChecks([])).toBe("none");
  expect(summarizeChecks(null)).toBe("none");
  expect(summarizeChecks([{ conclusion: "SUCCESS" }, { state: "SUCCESS" }])).toBe("pass");
  expect(summarizeChecks([{ conclusion: "SUCCESS" }, { conclusion: "FAILURE" }])).toBe("fail");
  expect(summarizeChecks([{ conclusion: "SUCCESS" }, { status: "IN_PROGRESS" }])).toBe("pending");
});

test("CLI accepts local and linked schema-1 flows through real subprocess", async () => {
  const root = await mkdtemp(join(tmpdir(), "flow-valid-"));
  try {
    await mkdir(join(root, "ticket"));
    await writeFile(join(root, "ticket/FLOW.json"), JSON.stringify(baseRaw()));
    const local: Record<string, unknown> = { ...baseRaw(), ticket: "cache-cleanup", prs: [] };
    delete local.linear_id;
    await mkdir(join(root, "cache-cleanup"));
    await writeFile(join(root, "cache-cleanup/FLOW.json"), JSON.stringify(local));
    const child = Bun.spawn(
      [process.execPath, join(import.meta.dir, "../src/checkFlow.ts"), root],
      {
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [code, out] = await Promise.all([child.exited, new Response(child.stdout).text()]);
    expect(code).toBe(0);
    expect(out).toBe("cache-cleanup: OK\nticket: OK\nOK 2 flows\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
