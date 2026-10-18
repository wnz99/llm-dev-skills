import { FLOW_STEPS, type Flow, reviewRound, type Task, taskStatus } from "./flowCore";
import type { DashboardState } from "./dashboardView";
import { clip, row, type Row, safeText, type Span, type Tone } from "./terminalText";

const SEPARATOR = " · ";
const EXECUTION_STEP = FLOW_STEPS.indexOf("execution") + 1;
const PLAN_REVIEW_STEP = FLOW_STEPS.indexOf("plan review") + 1;
const FINAL_REVIEW_STEP = FLOW_STEPS.indexOf("PR + review loop + merge") + 1;
const ELAPSED = "elapsed";
const FINISHED = "finished";
const COLUMN_GAP = 2;
const MIN_FINISHED_COLUMNS = 52;
const MIN_ELAPSED_COLUMNS = 34;
const TASK_INDENT = 5;
const NUMBER_WIDTH = 2;
const TITLE = "PHASES";
const OPEN_STEP = "active";

type Cell = [text: string, tone: Tone];
interface Layout {
  columns: number;
  widths: number[];
}

type ItemState = "done" | "open" | "pending" | "skipped" | "n/a" | "unrecorded";
interface Item {
  indent: number;
  state: ItemState;
  label: string;
  started_at?: string | undefined;
  completed_at?: string | undefined;
}

// Glyphs are East Asian width N or ASCII, so every terminal gives them one cell.
const GLYPHS: Record<ItemState, string> = {
  done: "✓",
  open: "▸",
  pending: "◦",
  skipped: "-",
  "n/a": "-",
  unrecorded: "?",
};
const QUIET: Partial<Record<ItemState, Tone>> = { pending: "muted", skipped: "dim", "n/a": "dim" };
const TASK_ITEM_STATES = { done: "done", in_progress: "open", pending: "pending" } as const;
const MINUTE = 60;
const HOUR = 3600;
const DAY = 86_400;
const MS = 1000;
const pad2 = (value: number): string => String(value).padStart(NUMBER_WIDTH, "0");

const formatElapsed = (milliseconds: number): string => {
  const seconds = Math.max(0, Math.floor(milliseconds / MS));
  if (seconds < MINUTE) return `${String(seconds)}s`;
  if (seconds < HOUR) return `${String(Math.floor(seconds / MINUTE))}m`;
  if (seconds < DAY)
    return `${String(Math.floor(seconds / HOUR))}h${pad2(Math.floor((seconds % HOUR) / MINUTE))}m`;
  return `${String(Math.floor(seconds / DAY))}d${pad2(Math.floor((seconds % DAY) / HOUR))}h`;
};

// Local time; the date is shown only when it differs from today's.
const formatFinished = (instant: string, now: number): string => {
  const at = new Date(instant);
  const time = `${pad2(at.getHours())}:${pad2(at.getMinutes())}`;
  return at.toDateString() === new Date(now).toDateString()
    ? time
    : `${pad2(at.getMonth() + 1)}-${pad2(at.getDate())} ${time}`;
};

// A step without a record is current, skipped over without a record, or still ahead.
const unrecordedState = (step: number, current: number): ItemState => {
  if (step === current) return "open";
  return step < current ? "unrecorded" : TASK_ITEM_STATES.pending;
};

const sentence = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

const stepItems = (flow: Flow): Item[] =>
  FLOW_STEPS.map((name, index) => {
    const number = index + 1;
    const record = flow.steps[String(number)];
    const round =
      number === PLAN_REVIEW_STEP
        ? reviewRound(flow, "plan")
        : number === FINAL_REVIEW_STEP
          ? reviewRound(flow, "final")
          : null;
    const label = `${String(number).padStart(NUMBER_WIDTH)} ${sentence(name)}${round === null ? "" : `${SEPARATOR}${round}`}`;
    if (record !== undefined)
      return {
        indent: 0,
        state: record.state === OPEN_STEP ? "open" : record.state,
        label,
        started_at: record.started_at,
        completed_at: record.completed_at,
      };
    return { indent: 0, state: unrecordedState(number, flow.step), label };
  });

const taskItem = (id: string, task: Task): Item => {
  const summary = typeof task === "string" ? undefined : task.summary;
  return {
    indent: TASK_INDENT,
    state: TASK_ITEM_STATES[taskStatus(task)],
    label: summary === undefined ? id : `${id} ${summary}`,
    ...(typeof task === "string"
      ? {}
      : { started_at: task.started_at, completed_at: task.completed_at }),
  };
};

// Only open items depend on the flow status; closed items show what their own record says.
const openText = (item: Item, flow: Flow, now: number): Cell => {
  if (flow.status === "done") return ["not closed", "warn"];
  const verb = flow.status === "paused" ? "paused" : "running";
  const since =
    item.started_at === undefined ? "" : ` ${formatElapsed(now - Date.parse(item.started_at))}`;
  return [`${verb}${since}`, flow.status === "paused" ? "warn" : "focus"];
};

const elapsedText = (item: Item, flow: Flow, now: number): Cell => {
  const quiet = QUIET[item.state] ?? "plain";
  if (item.state === "open") return openText(item, flow, now);
  if (item.state === "unrecorded") return ["not recorded", "warn"];
  if (item.state === "skipped" || item.state === "n/a") return [item.state, quiet];
  if (item.started_at === undefined || item.completed_at === undefined)
    return item.state === "done" ? ["no timing", "dim"] : ["", quiet];
  return [formatElapsed(Date.parse(item.completed_at) - Date.parse(item.started_at)), quiet];
};

const fill = (text: string, width: number): string =>
  " ".repeat(Math.max(0, width - Bun.stringWidth(text)));
const padStart = (text: string, width: number): string => `${fill(text, width)}${text}`;
const padEnd = (text: string, width: number): string => `${text}${fill(text, width)}`;
const column = (text: string, width: number): string =>
  `${" ".repeat(COLUMN_GAP)}${padStart(text, width)}`;

const trimTrailing = (parts: Span[]): Span[] => {
  const kept = [...parts];
  while (kept.length > 0 && (kept.at(-1)?.text.trim() ?? "") === "") kept.pop();
  const last = kept.at(-1);
  return last === undefined ? kept : [...kept.slice(0, -1), { ...last, text: last.text.trimEnd() }];
};

const itemRow = (item: Item, accent: Tone, right: Cell[], { columns, widths }: Layout): Row => {
  const glyphTone: Tone =
    item.state === "done"
      ? "ok"
      : item.state === "unrecorded"
        ? "warn"
        : (QUIET[item.state] ?? accent);
  const textTone = QUIET[item.state] ?? "plain";
  // Every column keeps its position; only trailing blanks after the last value are trimmed.
  const tail = right.map(([text, tone], index): Span => ({
    text: column(text, widths[index] ?? 0),
    tone,
  }));
  const shown = right.some(([text]) => text !== "");
  const lead = `${" ".repeat(item.indent)}${GLYPHS[item.state]} `;
  const room = Math.max(
    1,
    columns -
      Bun.stringWidth(lead) -
      tail.reduce((sum, part) => sum + Bun.stringWidth(part.text), 0),
  );
  const label = clip(item.label, room);
  const parts = trimTrailing([
    { text: lead, tone: glyphTone },
    { text: shown ? padEnd(label, room) : label, tone: textTone },
    ...(shown ? tail : []),
  ]);
  return { text: parts.map((part) => part.text).join(""), tone: textTone, parts };
};

export const listRows = (flow: Flow, state: DashboardState, columns: number): Row[] => {
  const steps = stepItems(flow);
  const tasks = Object.entries(flow.tasks).map(([id, task]) => taskItem(safeText(id), task));
  const items = [...steps.slice(0, EXECUTION_STEP), ...tasks, ...steps.slice(EXECUTION_STEP)];
  const showFinished = columns >= MIN_FINISHED_COLUMNS;
  const elapsedCells = items.map((item) => elapsedText(item, flow, state.now));
  const cells = items.map((item, index): Cell[] => {
    const elapsed = elapsedCells[index] ?? ["", "plain"];
    const finished: Cell = [
      item.completed_at === undefined ? "" : formatFinished(item.completed_at, state.now),
      QUIET[item.state] ?? "plain",
    ];
    if (columns < MIN_ELAPSED_COLUMNS) return [];
    return showFinished ? [elapsed, finished] : [elapsed];
  });
  const headings =
    columns < MIN_ELAPSED_COLUMNS ? [] : showFinished ? [ELAPSED, FINISHED] : [ELAPSED];
  const widths = headings.map((heading, index) =>
    Math.max(
      Bun.stringWidth(heading),
      ...cells.map((cell) => Bun.stringWidth(cell[index]?.[0] ?? "")),
    ),
  );
  const headingTail = headings
    .map((heading, index) => column(heading, widths[index] ?? 0))
    .join("");
  const heading =
    headingTail === ""
      ? TITLE
      : `${padEnd(TITLE, columns - Bun.stringWidth(headingTail))}${headingTail}`;
  const layout = { columns, widths };
  return [
    row(heading, "strong"),
    ...items.map((item, index) =>
      itemRow(item, elapsedCells[index]?.[1] ?? "plain", cells[index] ?? [], layout),
    ),
  ];
};
