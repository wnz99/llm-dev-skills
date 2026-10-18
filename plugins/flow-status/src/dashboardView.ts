import { type FlowEntry, selectCurrentTicket } from "./flowCore";
import { summaryRows } from "./dashboardSummary";
import { clip, type Row, safeText, styleRow } from "./terminalText";
import type { fetchLinear, loadDraftSnapshot, PrView } from "./sources";

type Snapshot = Awaited<ReturnType<typeof loadDraftSnapshot>>;
type LinearView = Awaited<ReturnType<typeof fetchLinear>> | "loading";
type DashboardPrView = PrView | "loading";
const DEFAULT_COLUMNS = 80;
const DEFAULT_ROWS = 24;
const MIN_BODY_ROWS = 2;
const LIST_FRACTION = 4;
const MAX_LIST_ROWS = 3;
const HALF_PAGE = 2;
const MIN_SELECTOR_FLOWS = 2;
const TITLE = "FLOW";
const SEPARATOR = " · ";

export interface DashboardState extends Snapshot {
  selectedDir: string | null;
  showDone: boolean;
  scroll: number;
  columns: number;
  rows: number;
  quit: boolean;
  offline: boolean;
  color: boolean;
  now: number;
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
  now: Date.now(),
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
  rows <= MIN_BODY_ROWS || visibleEntries(state).length < MIN_SELECTOR_FLOWS
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
        summaryRows(state, selectedEntry(state), Math.max(1, state.columns)).length -
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

const entryLabel = (entry: FlowEntry): string =>
  "flow" in entry
    ? `${entry.flow.ticket}${entry.dir === entry.flow.ticket ? "" : ` (${entry.dir})`}`
    : entry.dir;

// Header parts keep display order; a lower rank survives narrower widths. Rank 0 is always kept.
const RANK = { always: 0, status: 1, offline: 2, index: 3, branch: 4, directory: 5 } as const;
interface HeaderPart {
  text: string;
  rank: number;
}

const headerPart = (text: string, rank: number, lead = SEPARATOR): HeaderPart => ({
  text: `${lead}${safeText(text.replaceAll("\n", " "))}`,
  rank,
});

const fitHeader = (parts: HeaderPart[], columns: number): string => {
  const kept = parts.filter((part) => part.rank === RANK.always);
  for (const part of parts.filter((p) => p.rank > RANK.always).sort((a, b) => a.rank - b.rank)) {
    const text = parts
      .filter((p) => p === part || kept.includes(p))
      .map((p) => p.text)
      .join("");
    if (Bun.stringWidth(text) <= columns) kept.push(part);
  }
  return parts
    .filter((part) => kept.includes(part))
    .map((part) => part.text)
    .join("");
};

const dashboardHeader = (state: DashboardState, entries: FlowEntry[], columns: number): string => {
  const entry = selectedEntry(state);
  const branch = state.branch ?? "detached";
  const title = { text: TITLE, rank: RANK.always };
  const offline = state.offline ? [headerPart("offline", RANK.offline)] : [];
  if (entries.length === 1 && entry !== undefined) {
    const status = "flow" in entry ? entry.flow.status : "invalid";
    const id = "flow" in entry ? entry.flow.ticket : entry.dir;
    // The flow ID yields to the status, never the reverse.
    const idWidth = columns - Bun.stringWidth(`${TITLE}${SEPARATOR}${SEPARATOR}${status}`);
    return fitHeader(
      [
        title,
        { text: `${SEPARATOR}${clip(id.trim(), Math.max(1, idWidth))}`, rank: RANK.always },
        ...(entry.dir === id ? [] : [headerPart(`(${entry.dir})`, RANK.directory, " ")]),
        headerPart(branch, RANK.branch),
        headerPart(status, RANK.status),
        ...offline,
      ],
      columns,
    );
  }
  const index =
    entries.length > 1 && entry !== undefined
      ? [headerPart(`${String(entries.indexOf(entry) + 1)}/${String(entries.length)}`, RANK.index)]
      : [];
  return fitHeader([title, headerPart(branch, RANK.branch), ...index, ...offline], columns);
};

const hasCompleted = (state: DashboardState): boolean =>
  state.entries.some((entry) => "flow" in entry && entry.flow.status === "done");

const footerItems = (state: DashboardState, range: string | null): string[] => [
  "q quit",
  ...(range === null ? [] : ["wheel/PgUpDn", range]),
  "r refresh",
  ...(visibleEntries(state).length >= MIN_SELECTOR_FLOWS ? ["j/k flows"] : []),
  ...(hasCompleted(state) ? [state.showDone ? "d hide done" : "d show done"] : []),
  ...(range === null ? [] : ["Ctrl-U/D half page", "Home/End"]),
];

// Whole items only, in priority order: an item that does not fit is dropped, never cut.
const footer = (state: DashboardState, columns: number, range: string | null): string => {
  const items = footerItems(state, range);
  let line = "";
  for (const item of items) {
    const next = line === "" ? item : `${line}${SEPARATOR}${item}`;
    if (Bun.stringWidth(next) <= columns) line = next;
  }
  return line === "" ? clip(items[0] ?? "", columns) : line;
};

const selectorRows = (
  state: DashboardState,
  entries: FlowEntry[],
  height: number,
  columns: number,
): Row[] => {
  const index = entries.findIndex((entry) => entry.dir === state.selectedDir);
  const start = Math.max(0, Math.min(index, entries.length - height));
  return entries.slice(start, start + height).map((entry) => ({
    text: clip(
      `${entry.dir === state.selectedDir ? ">" : " "} ${entryLabel(entry)} [${"flow" in entry ? entry.flow.status : "invalid"}]`,
      columns,
    ),
    tone: "flow" in entry ? (entry.dir === state.selectedDir ? "focus" : "plain") : "error",
  }));
};

export const renderDashboard = (state: DashboardState, columns: number, rows: number): string[] => {
  if (rows <= 0 || columns <= 0) return [];
  const entries = visibleEntries(state);
  const header: Row = {
    text: clip(dashboardHeader(state, entries, columns), columns),
    tone: "strong",
  };
  if (rows === 1) return [styleRow(header, state.color)];
  const details = summaryRows({ ...state, rows }, selectedEntry(state), columns).map((line) => {
    const text = clip(line.text, columns);
    // Clipping invalidates span boundaries; the row then falls back to its single tone.
    return text === line.text ? line : { text, tone: line.tone };
  });
  const available = detailHeight(state, rows);
  const scroll = Math.max(0, Math.min(state.scroll, details.length - available));
  const range =
    available > 0 && details.length > available
      ? `${String(scroll + 1)}–${String(Math.min(scroll + available, details.length))}/${String(details.length)}`
      : null;
  const body = rows > MIN_BODY_ROWS ? details.slice(scroll, scroll + available) : [];
  const lines = [header, ...selectorRows(state, entries, listHeight(state, rows), columns), ...body]
    .slice(0, rows - 1)
    .map((line) => styleRow(line, state.color));
  while (lines.length < rows - 1) lines.push("");
  return [...lines, styleRow({ text: footer(state, columns, range), tone: "dim" }, state.color)];
};
