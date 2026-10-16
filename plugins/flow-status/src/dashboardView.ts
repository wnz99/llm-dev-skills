import { FLOW_STEPS, type Flow, type FlowEntry, selectCurrentTicket, stepLabel } from "./flowCore";
import type { fetchLinear, loadDraftSnapshot, PrView } from "./sources";

type Snapshot = Awaited<ReturnType<typeof loadDraftSnapshot>>;
type LinearView = Awaited<ReturnType<typeof fetchLinear>> | "loading";
type DashboardPrView = PrView | "loading";
const DEFAULT_COLUMNS = 80;
const DEFAULT_ROWS = 24;
const MIN_BODY_ROWS = 3;
const LIST_FRACTION = 4;
const MAX_LIST_ROWS = 6;
const HELP = "j/k ↑↓ d done r refresh PgUp/Dn q quit";
const COMPACT_HELP = "q j/k d r PgUp/Dn";
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export interface DashboardState extends Snapshot {
  selectedDir: string | null;
  showDone: boolean;
  scroll: number;
  columns: number;
  rows: number;
  quit: boolean;
  offline: boolean;
  linear: Record<string, LinearView>;
  prs: Record<string, DashboardPrView>;
}

export const createState = (columns = DEFAULT_COLUMNS, rows = DEFAULT_ROWS): DashboardState => ({
  root: null,
  branch: null,
  entries: [],
  error: null,
  selectedDir: null,
  showDone: false,
  scroll: 0,
  columns,
  rows,
  quit: false,
  offline: false,
  linear: {},
  prs: {},
});

export const visibleEntries = (state: DashboardState): FlowEntry[] =>
  state.entries.filter(
    (entry) => !("flow" in entry) || state.showDone || entry.flow.status !== "done",
  );

const selectedEntry = (state: DashboardState): FlowEntry | undefined =>
  visibleEntries(state).find((entry) => entry.dir === state.selectedDir);

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

const wrappedLines = (lines: string[], columns: number): string[] =>
  lines.flatMap((line) => line.split("\n").flatMap((part) => wrapLine(part, columns)));
const clip = (line: string, columns: number): string =>
  wrapLine(line.replaceAll("\n", " "), columns)[0] ?? "";

const liveText = (view: LinearView | DashboardPrView | undefined, offline: boolean): string => {
  if (view === undefined) return offline ? "offline" : "not refreshed";
  if (view === "loading") return view;
  if ("error" in view) return view.error;
  return "status" in view ? view.status : `${view.state}/${view.checks}`;
};

const detailLines = (state: DashboardState, columns: number): string[] => {
  const entry = selectedEntry(state);
  if (entry === undefined) return ["No tickets."];
  if ("errors" in entry)
    return wrappedLines([`${entry.dir}: invalid FLOW.json`, ...entry.errors], columns);
  const flow = entry.flow;
  const linear = flow.linear_id === null ? undefined : state.linear[flow.linear_id];
  const linearText = liveText(linear, state.offline);
  const lines = [
    `${flow.ticket} · ${flow.title}`,
    `${flow.status} · ${stepLabel(flow)}`,
    `Directory: ${entry.dir}`,
    `Updated: ${flow.updated_at}`,
    `Linear ${flow.linear_id ?? "none"}: ${linearText}`,
    `Branches: ${flow.branches.join(", ") || "none"}`,
    ...flow.prs.map((number) => {
      const view = state.prs[String(number)];
      const status = liveText(view, state.offline);
      return `PR #${String(number)}: ${status}`;
    }),
    ...(flow.prs.length === 0 ? ["PRs: none"] : []),
    `GSD: ${flow.gsd_quick ?? "none"}`,
    `Plan revision: ${String(flow.plan_revision ?? "none")}`,
    `Baseline: ${flow.baseline ?? "none"}`,
    `Next: ${flow.next}`,
    ...progressLines(flow),
    ...reviewLines(flow),
  ];
  return wrappedLines(lines, columns);
};

const progressLines = (flow: Flow): string[] => [
  "Steps:",
  ...FLOW_STEPS.map((label, index) => {
    const number = index + 1;
    const step = flow.steps[String(number)];
    return `${flow.step === number ? ">" : " "} ${String(number)}. ${label} [${step?.state ?? "missing"}]${step === undefined ? "" : `\n  ${step.evidence}`}`;
  }),
  "Tasks:",
  ...Object.entries(flow.tasks).map(([id, status]) => `${id}: ${status}`),
  "Plan approval:",
  flow.approvals.plan === null
    ? "none"
    : `${flow.approvals.plan.at} revision ${String(flow.approvals.plan.revision)}\n${flow.approvals.plan.evidence}`,
  "Content approval:",
  flow.approvals.content === null
    ? "none"
    : `${flow.approvals.content.at}\n${flow.approvals.content.summary}\n${flow.approvals.content.evidence}`,
];

const reviewLines = (flow: Flow): string[] => [
  "Simplicity:",
  ...flow.simplicity.flatMap((review) => [
    `Revision ${String(review.plan_revision)}`,
    ...(review.removed.length === 0 ? ["Nothing removed"] : review.removed),
  ]),
  "Reviews:",
  ...flow.reviews.flatMap((review) => [
    `${review.kind} ${review.task ?? ""} C${String(review.cycle)} R${String(review.round)} revision ${String(review.plan_revision ?? "none")} ${review.verdict} ${review.reviewer_model}`,
    ...review.findings.flatMap((finding) => [
      `${finding.severity}: ${finding.summary}`,
      `Disposition: ${finding.disposition}`,
    ]),
  ]),
];

const listHeight = (state: DashboardState, rows: number): number =>
  rows < MIN_BODY_ROWS
    ? 0
    : Math.min(
        visibleEntries(state).length,
        MAX_LIST_ROWS,
        Math.max(1, Math.floor(rows / LIST_FRACTION)),
      );
const detailHeight = (state: DashboardState, rows: number): number =>
  Math.max(0, rows - listHeight(state, rows) - MIN_BODY_ROWS);
export const clampScroll = (state: DashboardState): DashboardState => ({
  ...state,
  scroll: Math.max(
    0,
    Math.min(
      state.scroll,
      Math.max(
        0,
        detailLines(state, Math.max(1, state.columns)).length -
          Math.max(1, detailHeight(state, state.rows)),
      ),
    ),
  ),
});

export const reloadState = (state: DashboardState, snapshot: Snapshot): DashboardState => {
  const next = {
    ...state,
    root: snapshot.root,
    branch: snapshot.branch,
    entries: snapshot.entries,
    error: snapshot.error,
  };
  if (snapshot.root !== state.root) next.prs = {};
  const visible = visibleEntries(next);
  if (!visible.some((entry) => entry.dir === next.selectedDir)) {
    next.selectedDir =
      selectCurrentTicket(snapshot.entries, snapshot.branch)?.dir ?? visible[0]?.dir ?? null;
    next.scroll = 0;
  }
  return clampScroll(next);
};

const moveSelection = (
  state: DashboardState,
  entries: FlowEntry[],
  index: number,
  key: string,
): DashboardState => {
  const direction = key === "j" || key === "down" ? 1 : -1;
  const selected = entries[Math.max(0, Math.min(entries.length - 1, index + direction))];
  return { ...state, selectedDir: selected?.dir ?? null, scroll: 0 };
};

export const handleKey = (state: DashboardState, key: string): DashboardState => {
  const entries = visibleEntries(state);
  const index = entries.findIndex((entry) => entry.dir === state.selectedDir);
  if (key === "q" || key === "ctrl-c") return { ...state, quit: true };
  if (key === "d") return reloadState({ ...state, showDone: !state.showDone }, state);
  if (["j", "down", "k", "up"].includes(key)) return moveSelection(state, entries, index, key);
  const page = Math.max(1, detailHeight(state, state.rows));
  if (key === "pageup") return clampScroll({ ...state, scroll: state.scroll - page });
  if (key === "pagedown") return clampScroll({ ...state, scroll: state.scroll + page });
  return state;
};

const dashboardHeader = (state: DashboardState): string => {
  const current = selectCurrentTicket(state.entries, state.branch);
  return `Flow · ${state.branch ?? "detached"} · current: ${current !== null && "flow" in current ? `${current.flow.ticket} ${stepLabel(current.flow)}` : "none"}${state.error === null ? "" : ` · ${state.error}`}`;
};

export const renderDashboard = (state: DashboardState, columns: number, rows: number): string[] => {
  if (rows <= 0 || columns <= 0) return [];
  const header = dashboardHeader(state);
  if (rows === 1) return [clip(header, columns)];
  const entries = visibleEntries(state);
  const height = listHeight(state, rows);
  const index = entries.findIndex((entry) => entry.dir === state.selectedDir);
  const start = Math.max(0, Math.min(index, entries.length - height));
  const list = entries
    .slice(start, start + height)
    .map((entry) =>
      clip(
        `${entry.dir === state.selectedDir ? ">" : " "} ${"flow" in entry ? `${entry.flow.ticket} ${entry.flow.title} [${entry.flow.status}]` : `${entry.dir} [invalid]`}`,
        columns,
      ),
    );
  const details = detailLines(state, columns);
  const available = detailHeight(state, rows);
  const scroll = Math.max(0, Math.min(state.scroll, details.length - available));
  const separator = clip(
    `Details ${String(scroll + 1)}/${String(details.length)} · done ${state.showDone ? "shown" : "hidden"}${state.offline ? " · offline" : ""}`,
    columns,
  );
  const output = [clip(header, columns), ...list];
  if (rows > 2) output.push(separator, ...details.slice(scroll, scroll + available));
  while (output.length < rows - 1) output.push("");
  return [
    ...output.slice(0, rows - 1),
    clip(columns < Bun.stringWidth(HELP) ? COMPACT_HELP : HELP, columns),
  ];
};
