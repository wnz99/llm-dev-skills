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

const STEP_STATES = ["active", "done", "skipped", "n/a"] as const;
const SEVERITIES = ["High", "Medium", "Low"] as const;
const VERDICTS = ["APPROVED", "REVISE", "CLARIFICATION_REQUIRED", "CLEAN", "FINDINGS"] as const;
const REVIEW_KINDS = ["plan", "task", "content", "final", "pr"] as const;
const TASK_STATES = ["pending", "in_progress", "done"] as const;
type TaskState = (typeof TASK_STATES)[number];
const FLOW_STATUSES = ["active", "paused", "done"] as const;

const positiveInt = z.number().int().positive();
const SUMMARY_MAX = 200;
const instant = z.iso.datetime({ offset: true });
const timed = { started_at: instant.optional(), completed_at: instant.optional() };
const taskSchema = z.union(
  [
    z.enum(TASK_STATES),
    z.strictObject({
      status: z.enum(TASK_STATES),
      summary: z.string().trim().min(1).max(SUMMARY_MAX).optional(),
      ...timed,
    }),
  ],
  {
    error: "expected pending, in_progress, done or {status, summary?, started_at?, completed_at?}",
  },
);
const stepSchema = z.strictObject({ state: z.enum(STEP_STATES), evidence: z.string(), ...timed });
type Issue = (path: string[], message: string) => void;
interface Times {
  started_at?: string | undefined;
  completed_at?: string | undefined;
}
const DONE = "done";
const PENDING_TASK: TaskState = "pending";
const ACTIVE = "active";
const STARTED = "started_at";
const COMPLETED = "completed_at";
const RULES = {
  order: "completed_at precedes started_at",
  future: "later than updated_at",
  activeElsewhere: "active only on current step",
  activeDone: "active step in done flow",
  activeCompleted: "active step cannot be completed",
  pendingTimed: "pending task cannot have times",
  openCompleted: "in_progress task cannot be completed",
} as const;

// Instants are compared, not strings: records may use different offsets.
const checkTimes = (issue: Issue, path: string[], times: Times, updated: number): void => {
  const instants = [
    [STARTED, times.started_at],
    [COMPLETED, times.completed_at],
  ] as const;
  for (const [key, value] of instants)
    if (value !== undefined && Date.parse(value) > updated) issue([...path, key], RULES.future);
  if (
    times.started_at !== undefined &&
    times.completed_at !== undefined &&
    Date.parse(times.completed_at) < Date.parse(times.started_at)
  )
    issue([...path, COMPLETED], RULES.order);
};

const checkActiveStep = (
  issue: Issue,
  key: string,
  step: Times & { state: string },
  flow: { step: number; status: string },
): void => {
  if (step.state !== ACTIVE) return;
  const path = ["steps", key];
  if (key !== String(flow.step)) issue([...path, "state"], RULES.activeElsewhere);
  if (flow.status === DONE) issue([...path, "state"], RULES.activeDone);
  if (step.completed_at !== undefined) issue([...path, COMPLETED], RULES.activeCompleted);
};

const checkTaskTimes = (issue: Issue, id: string, task: Times & { status: TaskState }): void => {
  if (task.status === PENDING_TASK && (task.started_at ?? task.completed_at) !== undefined)
    issue(["tasks", id], RULES.pendingTimed);
  if (task.status === "in_progress" && task.completed_at !== undefined)
    issue(["tasks", id, COMPLETED], RULES.openCompleted);
};

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
      stepSchema,
    ),
    approvals: z.strictObject({
      plan: z.strictObject({ ...approvalFields, revision: positiveInt }).nullable(),
      content: z.strictObject({ ...approvalFields, summary: z.string() }).nullable(),
    }),
    simplicity: z.array(
      z.strictObject({ plan_revision: positiveInt, removed: z.array(z.string()) }),
    ),
    reviews: z.array(reviewSchema),
    tasks: z.record(z.string(), taskSchema),
    baseline: z.string().nullable(),
    next: z.string(),
  })
  .superRefine((flow, context) => {
    const issue: Issue = (path, message) => {
      context.addIssue({ code: "custom", path, message });
    };
    if (flow.status === DONE && flow.step !== LAST_STEP)
      issue(["status"], `done requires step ${String(LAST_STEP)}`);
    const updated = Date.parse(flow.updated_at);
    for (const [key, step] of Object.entries(flow.steps)) {
      checkTimes(issue, ["steps", key], step, updated);
      checkActiveStep(issue, key, step, flow);
    }
    for (const [id, task] of Object.entries(flow.tasks))
      if (typeof task !== "string") {
        checkTimes(issue, ["tasks", id], task, updated);
        checkTaskTimes(issue, id, task);
      }
  });
export type Flow = z.infer<typeof flowSchema>;
export type Task = Flow["tasks"][string];
export const taskStatus = (task: Task): TaskState =>
  typeof task === "string" ? task : task.status;

/** Latest plan-review cycle/round, e.g. "C2 R1"; cycle 1 is implied. */
export const planReviewRound = (flow: Flow): string | null => {
  const latest = flow.reviews.filter((r) => r.kind === "plan").at(-1);
  if (latest === undefined) return null;
  const round = `R${String(latest.round)}`;
  return latest.cycle > 1 ? `C${String(latest.cycle)} ${round}` : round;
};
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
