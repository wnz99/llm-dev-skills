import { emitKeypressEvents } from "node:readline";
import { PassThrough } from "node:stream";
import { createTerminalInput } from "./terminalInput";
import { fetchLinear, fetchPr, loadDraftSnapshot } from "./sources";
import {
  clampScroll,
  createState,
  handleKey,
  reloadState,
  renderDashboard,
  visibleEntries,
} from "./dashboardView";
export { createState, handleKey, reloadState, renderDashboard } from "./dashboardView";

const LOCAL_RELOAD_MS = 30_000;
const INTERRUPT_SIGNAL = "SIGINT";
const TERMINATE_SIGNAL = "SIGTERM";
const isRawEnabled = true;
const HIDE_CURSOR = "\x1b[?25l";
const SHOW_CURSOR = "\x1b[?25h";
const REPAINT = "\x1b[H\x1b[2J";
const ENTER_SCREEN = "\x1b[?1049h";
const LEAVE_SCREEN = "\x1b[?1049l";
const ENABLE_MOUSE = "\x1b[?1000h\x1b[?1006h";
const DISABLE_MOUSE = "\x1b[?1006l\x1b[?1000l";

class DashboardSession {
  private state = createState(process.stdout.columns, process.stdout.rows);
  private closed = false;
  private local: AbortController | undefined;
  private localVersion = 0;
  private readonly pending = new Map<string, AbortController>();
  private readonly originalRaw = process.stdin.isRaw;
  private timer: ReturnType<typeof setInterval> | undefined;
  private readonly keyboard = new PassThrough();
  private readonly input = createTerminalInput(
    (name) => {
      this.onKey("", { name });
    },
    (text) => {
      this.keyboard.write(text);
    },
  );
  private readonly onData = (chunk: Buffer | string): void => {
    this.input.write(String(chunk));
  };

  constructor(
    private readonly cwd: string,
    mode: "live" | "offline",
    private readonly resolve: () => void,
    private readonly reject: (error: Error) => void,
  ) {
    this.state.offline = mode === "offline";
    this.state.color = process.env.NO_COLOR === undefined;
  }

  private restoreTerminal(): boolean {
    let failed = false;
    try {
      process.stdin.setRawMode(this.originalRaw);
    } catch {
      failed = true;
    }
    try {
      process.stdin.pause();
    } catch {
      failed = true;
    }
    try {
      process.stdout.write(DISABLE_MOUSE + SHOW_CURSOR + LEAVE_SCREEN);
    } catch {
      failed = true;
    }
    return failed;
  }

  private readonly finish = (error?: unknown): void => {
    if (this.closed) return;
    this.closed = true;
    clearInterval(this.timer);
    this.local?.abort();
    for (const controller of this.pending.values()) controller.abort();
    this.pending.clear();
    process.stdin.off("data", this.onData);
    this.keyboard.off("keypress", this.onKey);
    this.input.close();
    this.keyboard.destroy();
    process.stdin.off("error", this.finish);
    process.stdout.off("error", this.finish);
    process.stdout.off("resize", this.onResize);
    process.off(INTERRUPT_SIGNAL, this.onSignal);
    process.off(TERMINATE_SIGNAL, this.onSignal);
    const failed = this.restoreTerminal();
    if (failed || error !== undefined) this.reject(new Error("flow-status terminal failed"));
    else this.resolve();
  };

  private repaint(): void {
    if (this.closed) return;
    try {
      process.stdout.write(
        HIDE_CURSOR +
          REPAINT +
          renderDashboard(this.state, this.state.columns, this.state.rows).join("\r\n"),
      );
    } catch (error) {
      this.finish(error);
    }
  }

  private liveTargets(): { ids: Set<string>; numbers: Set<number> } {
    const valid = visibleEntries(this.state).flatMap((entry) =>
      "flow" in entry ? [entry.flow] : [],
    );
    return {
      ids: new Set(valid.flatMap((flow) => (flow.linear_id === null ? [] : [flow.linear_id]))),
      numbers: new Set(valid.flatMap((flow) => flow.prs)),
    };
  }

  private reconcile(): void {
    const { ids, numbers } = this.liveTargets();
    for (const [key, controller] of this.pending) {
      const wanted = key.startsWith("linear:")
        ? ids.has(key.slice("linear:".length))
        : [...numbers].some((number) => key === `pr:${this.state.root ?? ""}:${String(number)}`);
      if (!wanted) {
        controller.abort();
        this.pending.delete(key);
      }
    }
    this.state.linear = Object.fromEntries(
      Object.entries(this.state.linear).filter(([id]) => ids.has(id)),
    );
    this.state.prs = Object.fromEntries(
      Object.entries(this.state.prs).filter(([number]) => numbers.has(Number(number))),
    );
  }

  private request<T>(
    key: string,
    fetcher: (signal: AbortSignal) => Promise<T>,
    apply: (value: T | { error: string }) => void,
  ): void {
    if (this.pending.has(key)) return;
    const controller = new AbortController();
    this.pending.set(key, controller);
    void fetcher(controller.signal)
      .catch(() => ({ error: "Live source unavailable" }))
      .then((value) => {
        if (this.closed || this.pending.get(key) !== controller) return;
        apply(value);
        this.pending.delete(key);
        this.repaint();
      });
  }

  private refreshLinear(ids: Set<string>): void {
    for (const id of ids) {
      const key = `linear:${id}`;
      if (!this.pending.has(key)) this.state.linear[id] = "loading";
      this.request(
        key,
        (signal) => fetchLinear(id, signal),
        (value) => {
          this.state.linear[id] = value;
        },
      );
    }
  }

  private refreshPrs(numbers: Set<number>): void {
    const root = this.state.root;
    if (root === null) return;
    for (const number of numbers) {
      const key = `pr:${root}:${String(number)}`;
      if (!this.pending.has(key)) this.state.prs[String(number)] = "loading";
      this.request(
        key,
        (signal) => fetchPr(root, number, signal),
        (value) => {
          this.state.prs[String(number)] = value;
        },
      );
    }
  }

  private refreshLive(): void {
    if (this.closed || this.state.offline) return;
    const { ids, numbers } = this.liveTargets();
    this.refreshLinear(ids);
    this.refreshPrs(numbers);
    this.repaint();
  }

  private reload(requestLive: "live" | "local"): void {
    if (this.closed) return;
    this.local?.abort();
    this.local = new AbortController();
    const version = ++this.localVersion;
    void loadDraftSnapshot(this.cwd, this.local.signal)
      .then((snapshot) => {
        if (this.closed || version !== this.localVersion) return;
        this.state = reloadState(this.state, snapshot);
        this.reconcile();
        this.repaint();
        if (requestLive === "live") this.refreshLive();
      })
      .catch(() => {
        if (this.closed || version !== this.localVersion) return;
        this.state.error = "Local drafts unavailable";
        this.repaint();
      });
  }

  private readonly onKey = (_text: string, key: { name?: string; ctrl?: boolean }): void => {
    this.state = handleKey(
      this.state,
      key.ctrl === true ? `ctrl-${key.name ?? ""}` : (key.name ?? ""),
    );
    if (this.state.quit) {
      this.finish();
      return;
    }
    if (key.name === "r") this.reload("live");
    if (key.name === "d") this.reconcile();
    this.repaint();
  };

  private readonly onResize = (): void => {
    this.state = clampScroll({
      ...this.state,
      columns: process.stdout.columns,
      rows: process.stdout.rows,
    });
    this.repaint();
  };

  private readonly onSignal = (): void => {
    this.finish();
  };

  start(): void {
    this.timer = setInterval(() => {
      this.reload("local");
    }, LOCAL_RELOAD_MS);
    try {
      emitKeypressEvents(this.keyboard);
      this.keyboard.on("keypress", this.onKey);
      process.stdin.on("data", this.onData);
      process.stdin.on("error", this.finish);
      process.stdout.on("error", this.finish);
      process.stdout.on("resize", this.onResize);
      process.on(INTERRUPT_SIGNAL, this.onSignal);
      process.on(TERMINATE_SIGNAL, this.onSignal);
      process.stdin.setRawMode(isRawEnabled);
      process.stdin.resume();
      process.stdout.write(ENTER_SCREEN + ENABLE_MOUSE);
      this.repaint();
      this.reload("live");
    } catch (error) {
      this.finish(error);
    }
  }
}

export const runDashboard = (cwd: string, mode: "live" | "offline" = "live"): Promise<void> => {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    return Promise.reject(
      new Error("flow-status requires a TTY; open it in a Herdr terminal pane."),
    );
  return new Promise<void>((resolve, reject) => {
    new DashboardSession(cwd, mode, resolve, reject).start();
  });
};
