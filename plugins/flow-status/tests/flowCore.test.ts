/* eslint-disable clean-code/no-business-policy-literals, clean-code/no-boolean-flag-arguments -- Independent expected fixtures and Bun assertions, not runtime policy. */
import { expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  type Flow,
  type FlowEntry,
  selectCurrentTicket,
  stepLabel,
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
  expect(validateFlow(baseRaw()).ok).toBe(true);
});

test("rejects bad input with named errors and never throws", () => {
  const cases: [string, unknown, string][] = [
    ["unknown key", { ...baseRaw(), extra: 1 }, "extra"],
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

test("stepLabel names the step, review round and cycle", () => {
  expect(stepLabel(validFlow({ reviews: [planReview(1, 1), planReview(1, 2)] }))).toBe(
    "4/13 plan review R2",
  );
  expect(stepLabel(validFlow({ reviews: [planReview(2, 1)] }))).toBe("4/13 plan review C2R1");
  expect(stepLabel(validFlow({ step: 2 }))).toBe("2/13 plan drafted");
  expect(stepLabel(validFlow({ status: "done", step: 13 }))).toBe("done");
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

test("CLI accepts schema-1 flow through real subprocess", async () => {
  const root = await mkdtemp(join(tmpdir(), "flow-valid-"));
  try {
    await mkdir(join(root, "ticket"));
    await writeFile(join(root, "ticket/FLOW.json"), JSON.stringify(baseRaw()));
    const child = Bun.spawn(
      [process.execPath, join(import.meta.dir, "../src/checkFlow.ts"), root],
      {
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [code, out] = await Promise.all([child.exited, new Response(child.stdout).text()]);
    expect(code).toBe(0);
    expect(out).toBe("ticket: OK\nOK 1 tickets\n");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
