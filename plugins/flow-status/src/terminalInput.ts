const MOUSE_PREFIX = "\x1b[<";
const MAX_PACKET = 64;
const ESCAPE_WAIT_MS = 30;
const MOUSE_WAIT_MS = 75;
const MODIFIER_BITS = 28;
const WHEEL_UP = 64;
const WHEEL_DOWN = 65;
const EXIT_KEYS = new Set(["q", "\x03"]);
const wheelKey = (value: string): "scrollup" | "scrolldown" | undefined => {
  // eslint-disable-next-line no-control-regex -- SGR mouse wire protocol starts with ESC.
  const match = /^\x1b\[<(\d+);\d+;\d+M$/.exec(value);
  if (match === null) return undefined;
  const button = Number(match[1]) & ~MODIFIER_BITS;
  if (button === WHEEL_UP) return "scrollup";
  return button === WHEEL_DOWN ? "scrolldown" : undefined;
};

/** Frame SGR mouse before readline, which otherwise emits mouse digits as keys. */
class TerminalInput {
  private pending = "";
  private discarding = false;
  private closed = false;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly onWheel: (key: "scrollup" | "scrolldown") => void,
    private readonly onKeyboard: (text: string) => void,
  ) {}

  private discard(value: string): void {
    if (/[Mm]/.test(value)) this.discarding = false;
    else if (value === "\x1b") {
      this.discarding = false;
      this.pending = value;
    }
  }

  private character(value: string): void {
    // Exit keys cannot occur in an SGR body and must survive incomplete or malformed packets.
    if (EXIT_KEYS.has(value)) {
      this.pending = "";
      this.discarding = false;
      this.onKeyboard(value);
      return;
    }
    if (this.discarding) {
      this.discard(value);
      return;
    }
    if (value === "\x1b" && this.pending.startsWith(MOUSE_PREFIX)) this.pending = "";
    this.pending += value;
    if (MOUSE_PREFIX.startsWith(this.pending)) return;
    if (this.pending.startsWith(MOUSE_PREFIX)) {
      if (/[Mm]$/.test(this.pending)) {
        const key = wheelKey(this.pending);
        this.pending = "";
        if (key !== undefined) this.onWheel(key);
      } else if (this.pending.length > MAX_PACKET) {
        this.pending = "";
        this.discarding = true;
      }
      return;
    }
    const text = this.pending;
    this.pending = "";
    this.onKeyboard(text);
  }

  private expire(): void {
    const text = this.pending;
    const keyboard = !this.discarding && text.length < MOUSE_PREFIX.length;
    this.pending = "";
    this.discarding = false;
    if (keyboard) this.onKeyboard(text);
  }

  write(chunk: string): void {
    if (this.closed) return;
    clearTimeout(this.timer);
    for (const value of chunk) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- onKeyboard can synchronously close the decoder (q followed by more bytes).
      if (this.closed) break;
      this.character(value);
    }
    if (this.pending !== "" || this.discarding)
      this.timer = setTimeout(
        () => {
          this.expire();
        },
        this.discarding || this.pending.startsWith(MOUSE_PREFIX) ? MOUSE_WAIT_MS : ESCAPE_WAIT_MS,
      );
  }

  close(): void {
    this.closed = true;
    clearTimeout(this.timer);
    this.pending = "";
  }
}

export const createTerminalInput = (
  onWheel: (key: "scrollup" | "scrolldown") => void,
  onKeyboard: (text: string) => void,
) => new TerminalInput(onWheel, onKeyboard);
