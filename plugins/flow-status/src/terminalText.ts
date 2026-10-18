/* Owned terminal typography: sanitizing, grapheme-aware width and the SGR tone allowlist. */

// Tone is assigned by the code that builds a row, never inferred from external text.
export type Tone = "plain" | "strong" | "dim" | "muted" | "focus" | "ok" | "warn" | "error";
export interface Span {
  text: string;
  tone: Tone;
}
// Optional parts split the row text into separately styled spans.
export interface Row extends Span {
  parts?: Span[];
}

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const TONE_SGR: Record<Exclude<Tone, "plain">, string> = {
  strong: "1",
  dim: "2",
  muted: "38;5;248",
  focus: "1;36",
  ok: "1;32",
  warn: "1;33",
  error: "1;31",
};

// Split owned lines first; external text never contributes terminal control sequences.
export const safeText = (text: string): string =>
  // eslint-disable-next-line no-control-regex -- Terminal C0/C1 controls are the characters this sanitizer removes.
  Bun.stripANSI(text).replace(/[\u0000-\u001f\u007f-\u009f]/g, "");

export const wrapLine = (text: string, columns: number): string[] => {
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

const styleSpan = ({ text, tone }: Span): string =>
  text === "" || tone === "plain" ? text : `\x1b[${TONE_SGR[tone]}m${text}\x1b[0m`;

export const styleRow = (line: Row, color: boolean): string => {
  if (!color) return line.text;
  return line.parts === undefined ? styleSpan(line) : line.parts.map(styleSpan).join("");
};

export const row = (text: string, tone: Tone = "plain"): Row => ({ text, tone });
