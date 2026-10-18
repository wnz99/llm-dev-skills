import { FLOW_STEPS, type Flow, type FlowEntry, stepLabel } from "./flowCore";
import type { DashboardState } from "./dashboardView";
import type { fetchLinear, PrView } from "./sources";

type LinearView = Awaited<ReturnType<typeof fetchLinear>> | "loading";
type DashboardPrView = PrView | "loading";
const PREVIEW_COUNT = 3;
const NEXT_ROWS = 2;
const COMPACT_ROWS = 26;
const BAR_WIDTH = 10;
const ACTIVE = "active";
const PENDING = "pending";
const COMPLETED_HEADING = "COMPLETED";
const PENDING_HEADING = "PENDING";
const PENDING_EMPTY = "No pending tasks recorded";
const PENDING_RECORDED = "Recorded pending";
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

// Split owned lines first; external text never contributes terminal control sequences.
const safeText = (text: string): string =>
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

const liveText = (view: LinearView | DashboardPrView | undefined, offline: boolean): string => {
  if (view === undefined) return offline ? "offline" : "not refreshed";
  if (view === "loading") return view;
  if ("error" in view) return view.error;
  return "status" in view ? view.status : `${view.state}/${view.checks}`;
};

const nextLines = (flow: Flow, columns: number): string[] => {
  const next =
    flow.next
      .split(/\r?\n/)
      .map(safeText)
      .find((line) => line.trim() !== "")
      ?.trim() ?? "No next action recorded";
  const all = wrapLine(next, columns);
  const rows = all.slice(0, NEXT_ROWS);
  if (all.length > NEXT_ROWS) rows[1] = clip(`${rows[1] ?? ""}…`, columns);
  return rows;
};

export const summaryLines = (
  state: DashboardState,
  entry: FlowEntry | undefined,
  columns: number,
): string[] => {
  if (entry === undefined) return ["No flows."];
  if ("errors" in entry)
    return [
      `${clip(entry.dir, columns)}: invalid FLOW.json`,
      ...entry.errors.slice(0, PREVIEW_COUNT),
    ]
      .map((line) => clip(line, columns))
      .concat(
        entry.errors.length > PREVIEW_COUNT
          ? [`+${String(entry.errors.length - PREVIEW_COUNT)} errors`]
          : [],
      );
  const flow = entry.flow;
  const groups = taskGroups(flow);
  const preview = groups.flatMap(([heading, ids, fallback]) => [
    heading,
    `  ${fallback}${ids.length > PREVIEW_COUNT ? ` · +${String(ids.length - PREVIEW_COUNT)} more` : ""}${ids.length > 0 ? ` · ${ids.slice(0, PREVIEW_COUNT).join(" · ")}` : ""}`,
    ...(state.rows > COMPACT_ROWS ? [""] : []),
  ]);
  return [
    clip(flow.title, columns),
    clip(`Current focus  ${flow.status} · ${stepLabel(flow)}`, columns),
    clip(`Updated ${flow.updated_at}`, columns),
    ...recordedProgress(flow),
    "",
    ...preview,
    ...upcomingLines(flow),
    ...blockerLines(flow, state),
    "NEXT",
    ...nextLines(flow, columns),
    "",
    ...sourceLines(flow, state).map((line) => clip(line, columns)),
  ];
};

const taskGroups = (flow: Flow): [string, string[], string][] => {
  const ids = (status: string) =>
    Object.entries(flow.tasks)
      .filter(([, value]) => value === status)
      .map(([id]) => safeText(id));
  const done = ids("done");
  const completed = done.slice(-PREVIEW_COUNT).concat(done.slice(0, -PREVIEW_COUNT));
  const stages = FLOW_STEPS.filter(
    (_, index) => flow.steps[String(index + 1)]?.state === "done",
  ).slice(-PREVIEW_COUNT);
  const active =
    flow.status === ACTIVE && flow.steps[String(flow.step)] === undefined
      ? "Current stage; no task status recorded"
      : "No tasks recorded in progress";
  const recorded = ids("in_progress").length > 0;
  const status = flow.status === "paused" ? "Paused" : "Flow marked done";
  return [
    [
      "IN PROGRESS",
      ids("in_progress"),
      flow.status === ACTIVE
        ? recorded
          ? "Recorded in progress"
          : active
        : `${status}${recorded ? "; tasks recorded in progress" : ""}`,
    ],
    [
      COMPLETED_HEADING,
      completed,
      stages.join(" · ") || (done.length > 0 ? "Tasks recorded done" : "None recorded"),
    ],
    [PENDING_HEADING, ids(PENDING), ids(PENDING).length > 0 ? PENDING_RECORDED : PENDING_EMPTY],
  ];
};
const upcomingLines = (flow: Flow): string[] => {
  if (flow.status === "done") return [];
  const upcoming = FLOW_STEPS.find(
    (_, index) => index + 1 > flow.step && flow.steps[String(index + 1)] === undefined,
  );
  return upcoming === undefined ? [] : [`  Upcoming stage; not recorded: ${upcoming}`];
};
const recordedProgress = (flow: Flow): string[] => {
  const steps = Object.values(flow.steps);
  const count = (status: string) => steps.filter((step) => step.state === status).length;
  const done = count("done");
  const filled = Math.floor((done / FLOW_STEPS.length) * BAR_WIDTH);
  return [
    `[${"#".repeat(filled)}${"-".repeat(BAR_WIDTH - filled)}] ${String(done)}/13 steps recorded done`,
    `${String(count("skipped"))} skipped · ${String(count("n/a"))} n/a · ${String(13 - steps.length)} not recorded`,
    `Tasks  ${String(Object.values(flow.tasks).filter((s) => s === "done").length)} done · ${String(Object.values(flow.tasks).filter((s) => s === "in_progress").length)} in progress · ${String(Object.values(flow.tasks).filter((s) => s === PENDING).length)} pending`,
  ];
};
const blockerLines = (flow: Flow, state: DashboardState): string[] => [
  ...(flow.status === "paused" ? ["Blockers  Flow paused; reason not recorded"] : []),
  ...flow.prs
    .filter((n) => {
      const view = state.prs[String(n)];
      return typeof view === "object" && "checks" in view && view.checks === "fail";
    })
    .slice(0, 1)
    .map((n) => `Blockers  PR #${String(n)} checks failing`),
];
const sourceLines = (flow: Flow, state: DashboardState): string[] => [
  flow.linear_id === null
    ? "Linear: not linked"
    : `Linear: ${liveText(state.linear[flow.linear_id], state.offline)}`,
  flow.prs.length === 0
    ? "PRs: none"
    : flow.prs
        .slice(0, 1)
        .map((n) => `PR #${String(n)}: ${liveText(state.prs[String(n)], state.offline)}`)
        .join(" · ") + (flow.prs.length > 1 ? ` · +${String(flow.prs.length - 1)} PRs` : ""),
];

const LINE_STYLES: [RegExp, string][] = [
  [/^Blockers|\[invalid\]|invalid FLOW\.json/, "1;31"],
  [/\[paused\]|^Current focus {2}paused/, "1;33"],
  [/^(>|Current focus|IN PROGRESS)/, "1;36"],
  [/^COMPLETED/, "1;32"],
  [/^PENDING/, "1;33"],
  [/^(Updated|Linear:|PR|Summary|wheel)/, "2"],
  [/^(FLOW STATUS|NEXT)/, "1"],
];
export const styleLine = (line: string, color: boolean): string => {
  if (!color || line === "") return line;
  const style = LINE_STYLES.find(([pattern]) => pattern.test(line))?.[1];
  return style === undefined ? line : `\x1b[${style}m${line}\x1b[0m`;
};
