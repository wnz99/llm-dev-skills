import { listRows } from "./dashboardList";
import type { Flow, FlowEntry } from "./flowCore";
import type { DashboardState } from "./dashboardView";
import type { fetchLinear, PrView } from "./sources";
import { clip, row, type Row, safeText, wrapLine } from "./terminalText";

type LinearView = Awaited<ReturnType<typeof fetchLinear>> | "loading";
type DashboardPrView = PrView | "loading";

const PREVIEW_COUNT = 3;
const NEXT_ROWS = 2;
const COMPACT_ROWS = 26;
const INDENT = 2;
const NEXT_HEADING = "NEXT";
const NO_ACTIVE = "No active flows.";
const detail = (text: string): Row => row(`${" ".repeat(INDENT)}${text}`);
const plural = (count: number, noun: string): string =>
  `${String(count)} ${noun}${count === 1 ? "" : "s"}`;

const liveText = (view: LinearView | DashboardPrView | undefined, offline: boolean): string => {
  if (view === undefined) return offline ? "offline" : "not refreshed";
  if (view === "loading") return view;
  if ("error" in view) return view.error;
  return "status" in view ? view.status : `${view.state}/${view.checks}`;
};

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
  const pr = flow.prs
    .slice(0, 1)
    .map((n) => `PR #${String(n)}: ${liveText(state.prs[String(n)], state.offline)}`);
  return [
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
    ...blockerRows(flow, state),
    ...gap,
    ...nextRows(flow, columns),
    ...gap,
    ...listRows(flow, state, columns),
    ...gap,
    ...metadataRows(flow, state),
  ];
};
