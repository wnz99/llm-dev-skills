import { type FlowEntry, selectCurrentTicket } from "./flowCore";
import { clip, styleLine, summaryLines } from "./dashboardSummary";
import type { fetchLinear, loadDraftSnapshot, PrView } from "./sources";

type Snapshot = Awaited<ReturnType<typeof loadDraftSnapshot>>;
type LinearView = Awaited<ReturnType<typeof fetchLinear>> | "loading";
type DashboardPrView = PrView | "loading";
const DEFAULT_COLUMNS = 80;
const DEFAULT_ROWS = 24;
const MIN_BODY_ROWS = 3;
const LIST_FRACTION = 4;
const MAX_LIST_ROWS = 3;
const HALF_PAGE = 2;
const HELP = "wheel/PgUp/Dn Ctrl-U/D Home/End scroll · j/k flows · d done · r · q";
const COMPACT_HELP = "wheel/PgUp/Dn scroll · j/k flows · d · r · q";

export interface DashboardState extends Snapshot {
  selectedDir: string | null;
  showDone: boolean;
  scroll: number;
  columns: number;
  rows: number;
  quit: boolean;
  offline: boolean;
  color: boolean;
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
  color: false,
  linear: {},
  prs: {},
});

export const visibleEntries = (state: DashboardState): FlowEntry[] =>
  state.entries.filter(
    (entry) => !("flow" in entry) || state.showDone || entry.flow.status !== "done",
  );

const selectedEntry = (state: DashboardState): FlowEntry | undefined =>
  visibleEntries(state).find((entry) => entry.dir === state.selectedDir);

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
        summaryLines(state, selectedEntry(state), Math.max(1, state.columns)).length -
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
  const delta = {
    scrollup: -3,
    scrolldown: 3,
    "ctrl-u": -Math.ceil(page / HALF_PAGE),
    "ctrl-d": Math.ceil(page / HALF_PAGE),
    home: -Infinity,
    end: Infinity,
  }[key];
  if (delta !== undefined) return clampScroll({ ...state, scroll: state.scroll + delta });
  return state;
};

const dashboardHeader = (state: DashboardState): string => {
  return `FLOW STATUS · ${state.branch ?? "detached"}${state.offline ? " · offline" : ""}${state.error === null ? "" : ` · ${state.error}`}`;
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
        `${entry.dir === state.selectedDir ? ">" : " "} ${"flow" in entry ? `${entry.flow.ticket}${entry.dir === entry.flow.ticket ? "" : ` (${entry.dir})`} [${entry.flow.status}]` : `${entry.dir} [invalid]`}`,
        columns,
      ),
    );
  const details = summaryLines({ ...state, rows }, selectedEntry(state), columns).map((line) =>
    clip(line, columns),
  );
  const available = detailHeight(state, rows);
  const scroll = Math.max(0, Math.min(state.scroll, details.length - available));
  const separator = clip(
    `Summary ${String(scroll + 1)}–${String(Math.min(scroll + available, details.length))}/${String(details.length)} · done ${state.showDone ? "shown" : "hidden"}`,
    columns,
  );
  const output = [clip(header, columns), ...list];
  if (rows > 2) output.push(separator, ...details.slice(scroll, scroll + available));
  while (output.length < rows - 1) output.push("");
  return [
    ...output.slice(0, rows - 1),
    clip(columns < Bun.stringWidth(HELP) ? COMPACT_HELP : HELP, columns),
  ].map((line) => styleLine(line, state.color));
};
