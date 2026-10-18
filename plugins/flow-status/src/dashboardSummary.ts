import { FLOW_STEPS, type Flow, type FlowEntry, stepLabel } from "./flowCore";
import type { DashboardState } from "./dashboardView";
import type { fetchLinear, PrView } from "./sources";

type LinearView = Awaited<ReturnType<typeof fetchLinear>> | "loading";
type DashboardPrView = PrView | "loading";

// Tone is assigned by the code that builds a row, never inferred from external text.
type Tone = "plain" | "strong" | "dim" | "focus" | "ok" | "warn" | "error";
export interface Row {
  text: string;
  tone: Tone;
}

const PREVIEW_COUNT = 3;
const NEXT_ROWS = 2;
const COMPACT_ROWS = 26;
const INDENT = 2;
const NEXT_HEADING = "NEXT";
const PENDING = "pending";
const NO_PENDING = "TODO  No pending tasks recorded";
const NO_ACTIVE = "No active flows.";
const SEPARATOR = " · ";
const ACTIVE = "active";
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const TONE_SGR: Record<Exclude<Tone, "plain">, string> = {
  strong: "1",
  dim: "2",
  focus: "1;36",
  ok: "1;32",
  warn: "1;33",
  error: "1;31",
};

// Split owned lines first; external text never contributes terminal control sequences.
export const safeText = (text: string): string =>
  // eslint-disable-next-line no-control-regex -- Terminal C0/C1 controls are the characters this sanitizer removes.
  Bun.stripANSI(text).replace(/[\u0000-\u001f\u007f-\u009f]/g, "");

const wrapLine = (text: string, columns: number): string[] => {
  const lines: string[] = [];
  let current = "";
  let width = 0;
  for (const { segment } of graphemes.segment(safeText(text))) {
    const cells = Bun.stringWidth(segment);
    const piece = cells > columns ? "?" : segment;
    const pieceWidth = cells > columns ? 1 : cells;
    if (width + pieceWidth > columns) {
      lines.push(current);
      current = "";
      width = 0;
    }
    current += piece;
    width += pieceWidth;
  }
  lines.push(current);
  return lines;
};

export const clip = (line: string, columns: number): string => {
  const parts = wrapLine(line.replaceAll("\n", " "), columns);
  if (parts.length === 1) return parts[0] ?? "";
  return `${wrapLine(parts[0] ?? "", Math.max(1, columns - 1))[0] ?? ""}…`.slice(
    columns === 1 ? -1 : 0,
  );
};

export const styleRow = ({ text, tone }: Row, color: boolean): string =>
  !color || text === "" || tone === "plain" ? text : `\x1b[${TONE_SGR[tone]}m${text}\x1b[0m`;

const row = (text: string, tone: Tone = "plain"): Row => ({ text, tone });
const detail = (text: string): Row => row(`${" ".repeat(INDENT)}${text}`);
const plural = (count: number, noun: string): string =>
  `${String(count)} ${noun}${count === 1 ? "" : "s"}`;

const liveText = (view: LinearView | DashboardPrView | undefined, offline: boolean): string => {
  if (view === undefined) return offline ? "offline" : "not refreshed";
  if (view === "loading") return view;
  if ("error" in view) return view.error;
  return "status" in view ? view.status : `${view.state}/${view.checks}`;
};

const idPreview = (ids: string[]): string =>
  [
    ...ids.slice(0, PREVIEW_COUNT),
    ...(ids.length > PREVIEW_COUNT ? [`+${String(ids.length - PREVIEW_COUNT)} more`] : []),
  ].join(SEPARATOR);

// Whole words per row; only a single token wider than the row is split by grapheme.
const wrapWords = (text: string, columns: number): string[] => {
  const lines: string[] = [];
  let current = "";
  for (const word of safeText(text).split(/\s+/).filter(Boolean)) {
    const joined = current === "" ? word : `${current} ${word}`;
    if (Bun.stringWidth(joined) <= columns) {
      current = joined;
      continue;
    }
    if (current !== "") lines.push(current);
    const pieces = wrapLine(word, columns);
    current = pieces.pop() ?? "";
    lines.push(...pieces);
  }
  return [...lines, current];
};

const nextRows = (flow: Flow, columns: number): Row[] => {
  const next =
    flow.next
      .split(/\r?\n/)
      .map(safeText)
      .find((line) => line.trim() !== "")
      ?.trim() ?? "No next action recorded";
  const width = Math.max(1, columns - INDENT);
  const all = wrapWords(next, width);
  const rows = all.slice(0, NEXT_ROWS);
  if (all.length > NEXT_ROWS) rows[NEXT_ROWS - 1] = clip(`${rows[NEXT_ROWS - 1] ?? ""}…`, width);
  return [row(NEXT_HEADING, "strong"), ...rows.map(detail)];
};

const taskIds = (flow: Flow, status: string): string[] =>
  Object.entries(flow.tasks)
    .filter(([, value]) => value === status)
    .map(([id]) => safeText(id));

const nowRows = (flow: Flow): Row[] => {
  const tone: Tone = flow.status === "paused" ? "warn" : flow.status === "done" ? "ok" : "focus";
  const working = taskIds(flow, "in_progress");
  const recorded = working.length > 0;
  const fallback =
    flow.status === ACTIVE
      ? flow.steps[String(flow.step)] === undefined
        ? "Current stage; no task status recorded"
        : "No tasks recorded in progress"
      : "";
  const lead =
    flow.status === ACTIVE
      ? "In progress"
      : `${flow.status === "paused" ? "Paused" : "Flow marked done"}${recorded ? "; tasks recorded in progress" : ""}`;
  return [
    row(`NOW  ${flow.status} · ${stepLabel(flow)}`, tone),
    detail(recorded ? `${lead}: ${idPreview(working)}` : fallback || lead),
  ];
};

const doneRows = (flow: Flow): Row[] => {
  const stages = FLOW_STEPS.filter((_, index) => flow.steps[String(index + 1)]?.state === "done");
  const tasks = taskIds(flow, "done");
  const counts = [
    `${String(stages.length)}/${String(FLOW_STEPS.length)} stages`,
    ...(tasks.length > 0 ? [plural(tasks.length, "task")] : []),
  ].join(SEPARATOR);
  return [
    row(`DONE  ${counts}`, "ok"),
    ...(stages.length > 0 ? [detail(`Stages: ${idPreview(stages.slice(-PREVIEW_COUNT))}`)] : []),
    ...(tasks.length > 0 ? [detail(`Tasks: ${idPreview(tasks)}`)] : []),
  ];
};

const todoRows = (flow: Flow): Row[] => {
  const pending = taskIds(flow, PENDING);
  const upcoming =
    flow.status === "done"
      ? undefined
      : FLOW_STEPS.find(
          (_, index) => index + 1 > flow.step && flow.steps[String(index + 1)] === undefined,
        );
  return [
    row(
      pending.length > 0 ? `TODO  ${plural(pending.length, `${PENDING} task`)}` : NO_PENDING,
      "warn",
    ),
    ...(pending.length > 0 ? [detail(`Tasks: ${idPreview(pending)}`)] : []),
    ...(upcoming === undefined ? [] : [detail(`Upcoming stage; not recorded: ${upcoming}`)]),
  ];
};

const blockerRows = (flow: Flow, state: DashboardState): Row[] => [
  ...(flow.status === "paused" ? [row("Blockers  Flow paused; reason not recorded", "error")] : []),
  ...flow.prs
    .filter((n) => {
      const view = state.prs[String(n)];
      return typeof view === "object" && "checks" in view && view.checks === "fail";
    })
    .slice(0, 1)
    .map((n) => row(`Blockers  PR #${String(n)} checks failing`, "error")),
];

const metadataRows = (flow: Flow, state: DashboardState): Row[] => {
  const states = Object.values(flow.steps).map((step) => step.state);
  const other = [
    [states.filter((s) => s === "skipped").length, "skipped"],
    [states.filter((s) => s === "n/a").length, "n/a"],
    [FLOW_STEPS.length - states.length, "not recorded"],
  ]
    .filter(([count]) => count !== 0)
    .map(([count, label]) => `${String(count)} ${String(label)}`);
  const pr = flow.prs
    .slice(0, 1)
    .map((n) => `PR #${String(n)}: ${liveText(state.prs[String(n)], state.offline)}`);
  return [
    ...(other.length > 0 ? [row(`Stages  ${other.join(SEPARATOR)}`, "dim")] : []),
    row(
      flow.linear_id === null
        ? "Linear: not linked"
        : `Linear: ${liveText(state.linear[flow.linear_id], state.offline)}`,
      "dim",
    ),
    row(
      pr.length === 0
        ? "PRs: none"
        : `${pr[0] ?? ""}${flow.prs.length > 1 ? ` · +${String(flow.prs.length - 1)} PRs` : ""}`,
      "dim",
    ),
    row(`Updated ${flow.updated_at}`, "dim"),
  ];
};

const invalidRows = (entry: Extract<FlowEntry, { errors: string[] }>): Row[] => [
  row(`${entry.dir}: invalid FLOW.json`, "error"),
  ...entry.errors.slice(0, PREVIEW_COUNT).map((error) => row(error, "error")),
  ...(entry.errors.length > PREVIEW_COUNT
    ? [row(`+${String(entry.errors.length - PREVIEW_COUNT)} errors`, "error")]
    : []),
];

const loadRows = (state: DashboardState, columns: number): Row[] => {
  if (state.error === null) return [];
  const message = wrapLine(`Load error: ${state.error}`, columns).slice(0, NEXT_ROWS);
  return [
    ...message.map((text) => row(text, "error")),
    ...(state.entries.length > 0 ? [row("Showing last loaded records", "warn")] : []),
  ];
};

const emptyRows = (state: DashboardState): Row[] => {
  const hidden = state.entries.length;
  if (hidden === 0) return [row("No flows found.", "dim")];
  return [
    row(NO_ACTIVE, "dim"),
    row(`${plural(hidden, "completed flow")} hidden · d to show`, "dim"),
  ];
};

export const summaryRows = (
  state: DashboardState,
  entry: FlowEntry | undefined,
  columns: number,
): Row[] => {
  const errors = loadRows(state, columns);
  if (entry === undefined)
    return [
      ...errors,
      ...(state.error === null || state.entries.length > 0 ? emptyRows(state) : []),
    ];
  if ("errors" in entry) return [...errors, ...invalidRows(entry)];
  const flow = entry.flow;
  const gap = state.rows > COMPACT_ROWS ? [row("")] : [];
  return [
    ...errors,
    row(flow.title, "strong"),
    ...nowRows(flow),
    ...blockerRows(flow, state),
    ...gap,
    ...nextRows(flow, columns),
    ...gap,
    ...doneRows(flow),
    ...gap,
    ...todoRows(flow),
    ...gap,
    ...metadataRows(flow, state),
  ];
};
