import { parseArgs } from "node:util";
import { runDashboard } from "./dashboard";

try {
  const { values } = parseArgs({
    options: {
      cwd: { type: "string", default: process.cwd() },
      offline: { type: "boolean", default: false },
    },
  });
  await runDashboard(values.cwd, values.offline ? "offline" : "live");
} catch {
  const message =
    !process.stdin.isTTY || !process.stdout.isTTY
      ? "flow-status requires a TTY; open it in a Herdr terminal pane."
      : "flow-status failed; use --cwd <project-directory> [--offline].";
  console.error(message);
  process.exitCode = 1;
}
