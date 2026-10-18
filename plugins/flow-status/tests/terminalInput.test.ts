import { expect, test } from "bun:test";
import { PassThrough } from "node:stream";
import { emitKeypressEvents } from "node:readline";
import { createTerminalInput } from "../src/terminalInput";

test("split and coalesced SGR packets never become keyboard hotkeys", async () => {
  const keyboard = new PassThrough();
  emitKeypressEvents(keyboard);
  const keys: string[] = [];
  const wheel: string[] = [];
  keyboard.on("keypress", (_text, key: { name?: string }) => {
    keys.push(key.name ?? "");
  });
  const input = createTerminalInput(
    (key) => {
      wheel.push(key);
    },
    (text) => {
      keyboard.write(text);
    },
  );
  try {
    input.write("\x1b[<64;1;2Mr\x1b[<");
    await Bun.sleep(40);
    input.write("93;4;5M\x1b[<0;1;2M\x1b[<65;1;2m\x1b[A\x1b[6~q");
    expect(wheel).toEqual(["scrollup", "scrolldown"]);
    expect(keys).toEqual(["r", "up", "pagedown", "q"]);
  } finally {
    input.close();
    keyboard.destroy();
  }
});

test("malformed and oversized mouse frames are discarded; ordinary escape keys survive", async () => {
  const text: string[] = [];
  const wheel: string[] = [];
  const input = createTerminalInput(
    (key) => {
      wheel.push(key);
    },
    (chunk) => {
      text.push(chunk);
    },
  );
  input.write(`\x1b[<broken;rMq\x1b[<${"9".repeat(100)};1;1Mj\x1b[A`);
  expect(text.join("")).toBe("qj\x1b[A");
  expect(wheel).toEqual([]);
  input.write("\x1b[<64;\x1b[Aq");
  expect(text.join("")).toEndWith("\x1b[Aq");
  input.write("\x1b");
  await Bun.sleep(40);
  expect(text.join("")).toEndWith("\x1b");
  input.write("\x1b[");
  input.close();
  await Bun.sleep(40);
  input.write("q");
  expect(text.join("")).not.toEndWith("\x1b[");
});

test("truncated mouse frames expire and never hold immediate quit or Ctrl-C", async () => {
  for (const partial of ["\x1b[<64;1;", `\x1b[<${"9".repeat(100)}`]) {
    const text: string[] = [];
    const wheel: string[] = [];
    const input = createTerminalInput(
      (key) => {
        wheel.push(key);
      },
      (chunk) => {
        text.push(chunk);
      },
    );
    input.write(partial);
    await Bun.sleep(100);
    input.write("q\x03");
    expect(text.join("")).toBe("q\x03");
    expect(wheel).toEqual([]);
    input.close();
  }
  const text: string[] = [];
  const input = createTerminalInput(
    () => undefined,
    (chunk) => {
      text.push(chunk);
    },
  );
  input.write("\x1b[<64;1;");
  await Bun.sleep(10);
  input.write("q");
  expect(text).toEqual(["q"]);
  input.write("\x1b[<64;1;\x03");
  expect(text).toEqual(["q", "\x03"]);
  input.write("\x1b[<65;");
  input.close();
  await Bun.sleep(100);
  expect(text).toEqual(["q", "\x03"]);
});
