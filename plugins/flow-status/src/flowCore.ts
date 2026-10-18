import * as z from "zod/v4";

export const FLOW_STEPS = [
  "scope agreed",
  "plan drafted",
  "simplicity review",
  "plan review",
  "simplicity re-check",
  "annotation",
  "user plan approval",
  "GSD registration",
  "execution",
  "content approval",
  "final review + PR + merge",
  "paid/live runs",
  "GSD state update",
] as const;

const LAST_STEP = FLOW_STEPS.length;
const PLAN_REVIEW_STEP = 4;

const STEP_STATES = ["done", "skipped", "n/a"] as const;
const SEVERITIES = ["High", "Medium", "Low"] as const;
const VERDICTS = ["APPROVED", "REVISE", "CLARIFICATION_REQUIRED", "CLEAN", "FINDINGS"] as const;
const REVIEW_KINDS = ["plan", "task", "content", "final", "pr"] as const;
const TASK_STATES = ["pending", "in_progress", "done"] as const;
const FLOW_STATUSES = ["active", "paused", "done"] as const;

const positiveInt = z.number().int().positive();
const findingSchema = z.strictObject({
  severity: z.enum(SEVERITIES),
  summary: z.string(),
  disposition: z.string(),
});
const reviewSchema = z.strictObject({
  kind: z.enum(REVIEW_KINDS),
  cycle: positiveInt,
  round: positiveInt,
  task: z.string().optional(),
  plan_revision: positiveInt.optional(),
  verdict: z.enum(VERDICTS),
  reviewer_model: z.string(),
  findings: z.array(findingSchema),
});
const approvalFields = { at: z.iso.date(), evidence: z.string() };
const flowSchema = z
  .strictObject({
    schema: z.literal(1),
    ticket: z.string().min(1),
    linear_id: z.string().nullable().default(null),
    title: z.string(),
    status: z.enum(FLOW_STATUSES),
    step: z.number().int().min(1).max(LAST_STEP),
    updated_at: z.iso.datetime({ offset: true }),
    branches: z.array(z.string()),
    prs: z.array(positiveInt),
    gsd_quick: z.string().nullable(),
    plan_revision: positiveInt.nullable(),
    steps: z.record(
      z.string().refine((key) => FLOW_STEPS.some((_, i) => key === String(i + 1)), "unknown step"),
      z.strictObject({ state: z.enum(STEP_STATES), evidence: z.string() }),
    ),
    approvals: z.strictObject({
      plan: z.strictObject({ ...approvalFields, revision: positiveInt }).nullable(),
      content: z.strictObject({ ...approvalFields, summary: z.string() }).nullable(),
    }),
    simplicity: z.array(
      z.strictObject({ plan_revision: positiveInt, removed: z.array(z.string()) }),
    ),
    reviews: z.array(reviewSchema),
    tasks: z.record(z.string(), z.enum(TASK_STATES)),
    baseline: z.string().nullable(),
    next: z.string(),
  })
  .superRefine((flow, context) => {
    if (flow.status === "done" && flow.step !== LAST_STEP)
      context.addIssue({
        code: "custom",
        path: ["status"],
        message: `done requires step ${String(LAST_STEP)}`,
      });
  });
export type Flow = z.infer<typeof flowSchema>;
export type FlowEntry = { dir: string; flow: Flow } | { dir: string; errors: string[] };
type ValidateResult = { ok: true; flow: Flow } | { ok: false; errors: string[] };
export const validateFlow = (raw: unknown): ValidateResult => {
  const result = flowSchema.safeParse(raw);
  return result.success
    ? { ok: true, flow: result.data }
    : {
        ok: false,
        errors: result.error.issues.map(
          (issue) => `${issue.path.join(".") || "FLOW.json"}: ${issue.message}`,
        ),
      };
};

export const stepLabel = (flow: Flow): string => {
  if (flow.status === "done") return "done";
  const base = `${String(flow.step)}/${String(LAST_STEP)} ${FLOW_STEPS[flow.step - 1] ?? ""}`;
  if (flow.step !== PLAN_REVIEW_STEP) return base;
  const latest = flow.reviews.filter((r) => r.kind === "plan").at(-1);
  if (latest === undefined) return base;
  const round = `R${String(latest.round)}`;
  return `${base} ${latest.cycle > 1 ? `C${String(latest.cycle)}` : ""}${round}`;
};

export const selectCurrentTicket = (
  entries: FlowEntry[],
  branch: string | null,
): FlowEntry | null => {
  const live = entries.filter(
    (e): e is { dir: string; flow: Flow } => "flow" in e && e.flow.status !== "done",
  );
  const onBranch = branch === null ? undefined : live.find((e) => e.flow.branches.includes(branch));
  if (onBranch !== undefined) return onBranch;
  const byRecency = [...live].sort(
    (a, b) => Date.parse(b.flow.updated_at) - Date.parse(a.flow.updated_at),
  );
  return byRecency[0] ?? null;
};

const FAILING = [
  "FAILURE",
  "ERROR",
  "TIMED_OUT",
  "CANCELLED",
  "ACTION_REQUIRED",
  "STARTUP_FAILURE",
];
const PENDING = "pending";
const PASSING = ["SUCCESS", "NEUTRAL", "SKIPPED"];

export const summarizeChecks = (rollup: unknown): "pass" | "fail" | "pending" | "none" => {
  if (!Array.isArray(rollup) || rollup.length === 0) return "none";
  const outcomes = rollup.map((c) => {
    const parsed = z.record(z.string(), z.unknown()).safeParse(c);
    const check = parsed.success ? parsed.data : {};
    const value = check.conclusion ?? check.state;
    if (typeof value === "string" && FAILING.includes(value)) return "fail";
    return typeof value === "string" && PASSING.includes(value) ? "pass" : PENDING;
  });
  if (outcomes.includes("fail")) return "fail";
  return outcomes.includes(PENDING) ? PENDING : "pass";
};
