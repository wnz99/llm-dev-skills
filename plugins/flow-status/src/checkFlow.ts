import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { validateFlow } from "./flowCore";

const USAGE_EXIT = 2;
const SUCCESS_LABEL = "OK";
const DRAFT_ARGUMENT_INDEX = 2;

const check = (dir: string): string | null => {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(join(dir, "FLOW.json"), "utf8"));
  } catch (error) {
    return `FLOW.json unreadable: ${error instanceof Error ? error.message : String(error)}`;
  }
  const result = validateFlow(raw);
  return result.ok ? null : result.errors.join("; ");
};

const main = (draftsDir: string | undefined): number => {
  if (draftsDir === undefined) {
    process.stderr.write("usage: bun checkFlow.ts <draftsDir>\n");
    return USAGE_EXIT;
  }
  let folders: string[];
  try {
    folders = readdirSync(draftsDir)
      .filter((name) => statSync(join(draftsDir, name)).isDirectory())
      .sort();
  } catch {
    process.stderr.write("drafts directory unreadable\n");
    return 1;
  }
  let failures = 0;
  for (const name of folders) {
    const problem = check(join(draftsDir, name));
    if (problem !== null) failures += 1;
    process.stdout.write(`${name}: ${problem ?? SUCCESS_LABEL}\n`);
  }
  if (failures === 0) process.stdout.write(`OK ${String(folders.length)} tickets\n`);
  return failures === 0 ? 0 : 1;
};

process.exit(main(process.argv[DRAFT_ARGUMENT_INDEX]));
