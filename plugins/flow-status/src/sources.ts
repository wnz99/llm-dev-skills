import * as z from "zod/v4";
import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { type FlowEntry, summarizeChecks, validateFlow } from "./flowCore";

export type PrView =
  { state: string; checks: ReturnType<typeof summarizeChecks> } | { error: string };

const PR_STATES = ["OPEN", "CLOSED", "MERGED"] as const;
const DRAFTS_DIR = ".planning/drafts";
const KILL_SIGNAL = "SIGKILL";
const CANCELLED = "cancelled";
const POST_METHOD = "POST";
const TIMEOUT_MS = 15_000;
const statusCheckSchema = z
  .looseObject({
    conclusion: z.string().nullish(),
    state: z.string().nullish(),
    status: z.string().nullish(),
  })
  .refine((check) =>
    [check.conclusion, check.state, check.status].some((value) => typeof value === "string"),
  );
const prSchema = z.looseObject({
  state: z.enum(PR_STATES),
  statusCheckRollup: z.array(statusCheckSchema).nullable(),
});
const linearEnvelopeSchema = z.looseObject({
  errors: z.unknown().optional(),
  data: z.unknown().optional(),
});
const linearDataSchema = z.looseObject({
  issue: z.looseObject({ state: z.looseObject({ name: z.string() }) }),
});

/** Git metadata may be outside the checkout; the worktree registry owns checkout paths. */
export const rootFromWorktreeList = (stdout: string): string | null => {
  const first = stdout.split("\0")[0] ?? "";
  if (!first.startsWith("worktree ")) return null;
  const root = first.slice("worktree ".length);
  return isAbsolute(root) ? root : null;
};

const flowEntryFromText = (dir: string, text: string | null): FlowEntry => {
  if (text === null) return { dir, errors: ["FLOW.json missing"] };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { dir, errors: ["FLOW.json is not valid JSON"] };
  }
  const result = validateFlow(raw);
  return result.ok ? { dir, flow: result.flow } : { dir, errors: result.errors };
};

interface ProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}
const killProcessGroup = (child: ReturnType<typeof spawn>): void => {
  if (child.pid === undefined) return;
  try {
    process.kill(-child.pid, KILL_SIGNAL);
  } catch {
    child.kill(KILL_SIGNAL);
  }
};

const spawnProcess = (argv: string[], cwd: string) => {
  // An isolated POSIX process group lets cancellation reach descendants holding output pipes.
  return spawn(argv[0] ?? "", argv.slice(1), {
    cwd,
    env: { ...process.env },
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
};

const runProcess = (argv: string[], cwd: string, signal?: AbortSignal): Promise<ProcessResult> =>
  new Promise((resolve, reject) => {
    const child = spawnProcess(argv, cwd);
    let stdout = "";
    let stderr = "";
    let settled = false;
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (text: unknown) => {
      if (typeof text === "string") stdout += text;
    });
    child.stderr.on("data", (text: unknown) => {
      if (typeof text === "string") stderr += text;
    });
    const cleanup = (): void => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    };
    const stop = (reason: "cancelled" | "timed out"): void => {
      if (settled) return;
      settled = true;
      cleanup();
      killProcessGroup(child);
      child.stdout.destroy();
      child.stderr.destroy();
      reject(new Error(reason));
    };
    const abort = (): void => {
      stop(CANCELLED);
    };
    const timer = setTimeout(() => {
      stop("timed out");
    }, TIMEOUT_MS);
    child.once("error", (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    });
    child.once("close", (exitCode) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ exitCode: exitCode ?? 1, stdout, stderr });
    });
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted === true) abort();
  });

const checkoutRoot = async (cwd: string, signal?: AbortSignal): Promise<string | null> => {
  const worktrees = await runProcess(["git", "worktree", "list", "--porcelain", "-z"], cwd, signal);
  if (worktrees.exitCode !== 0) return null;
  const candidate = rootFromWorktreeList(worktrees.stdout);
  if (candidate === null) return null;
  const inside = await runProcess(["git", "rev-parse", "--is-inside-work-tree"], candidate, signal);
  if (inside.exitCode === 0 && inside.stdout.trim() === "true") return candidate;
  // Separate metadata can be reported as the main worktree even though it is not a checkout.
  const dirs = await runProcess(
    ["git", "rev-parse", "--path-format=absolute", "--git-dir", "--git-common-dir"],
    cwd,
    signal,
  );
  const [gitDir, commonDir] = dirs.stdout.trimEnd().split("\n");
  if (dirs.exitCode !== 0 || gitDir !== commonDir) return null;
  const current = await runProcess(["git", "rev-parse", "--show-toplevel"], cwd, signal);
  return current.exitCode === 0 ? current.stdout.trimEnd() : null;
};

export const loadDraftSnapshot = async (
  cwd: string,
  signal?: AbortSignal,
): Promise<{
  root: string | null;
  branch: string | null;
  entries: FlowEntry[];
  error: string | null;
}> => {
  let root: string | null = null;
  let branch: string | null = null;
  try {
    root = await checkoutRoot(cwd, signal);
    if (root === null) return { root, branch, entries: [], error: "Git repository unavailable" };
    const current = await runProcess(["git", "branch", "--show-current"], cwd, signal);
    branch = current.exitCode === 0 ? current.stdout.trim() || null : null;
  } catch {
    return { root, branch, entries: [], error: "Git repository unavailable" };
  }
  try {
    const drafts = join(root, DRAFTS_DIR);
    const folders = (await readdir(drafts, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    const entries = await Promise.all(
      folders.map(async (dir) => {
        try {
          return flowEntryFromText(dir, await readFile(join(drafts, dir, "FLOW.json"), "utf8"));
        } catch {
          return flowEntryFromText(dir, null);
        }
      }),
    );
    return { root, branch, entries, error: null };
  } catch {
    return { root, branch, entries: [], error: "Drafts directory unavailable or unreadable" };
  }
};

export const ghPrArgv = (number: number): string[] => [
  "gh",
  "pr",
  "view",
  String(number),
  "--json",
  "number,state,statusCheckRollup",
];

export const prViewFromRun = (run: ProcessResult): PrView => {
  if (run.exitCode !== 0) return { error: "gh failed" };
  let parsed: unknown;
  try {
    parsed = JSON.parse(run.stdout);
  } catch {
    return { error: "gh: output is not JSON" };
  }
  const result = prSchema.safeParse(parsed);
  if (!result.success) return { error: "gh: unexpected output" };
  return { state: result.data.state, checks: summarizeChecks(result.data.statusCheckRollup) };
};

export const fetchPr = async (
  root: string,
  number: number,
  signal?: AbortSignal,
): Promise<PrView> => {
  try {
    return prViewFromRun(await runProcess(ghPrArgv(number), root, signal));
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    return {
      error: reason === "cancelled" || reason === "timed out" ? `gh ${reason}` : "gh unavailable",
    };
  }
};

export const fetchLinear = async (
  id: string,
  signal?: AbortSignal,
): Promise<{ status: string } | { error: string }> => {
  const key = process.env.LINEAR_API_KEY;
  if (!key) return { error: "Linear unavailable: missing credential" };
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const combined = signal === undefined ? timeout : AbortSignal.any([signal, timeout]);
  try {
    const response = await fetch("https://api.linear.app/graphql", {
      method: POST_METHOD,
      headers: { Authorization: key, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "query IssueStatus($id: String!) { issue(id: $id) { state { name } } }",
        variables: { id },
      }),
      signal: combined,
    });
    if (!response.ok) return { error: `Linear HTTP ${String(response.status)}` };
    const raw: unknown = await response.json();
    return linearViewFromResponse(raw);
  } catch {
    if (signal?.aborted === true) return { error: "Linear request cancelled" };
    return { error: timeout.aborted ? "Linear request timed out" : "Linear request failed" };
  }
};

const linearStatus = (data: z.infer<typeof linearDataSchema>): string => data.issue.state.name;

const linearViewFromResponse = (raw: unknown): { status: string } | { error: string } => {
  const envelope = linearEnvelopeSchema.safeParse(raw);
  if (!envelope.success) return { error: "Linear: unexpected response" };
  const errors = envelope.data.errors;
  if (errors !== undefined && (!Array.isArray(errors) || errors.length > 0))
    return { error: "Linear GraphQL error" };
  const data = linearDataSchema.safeParse(envelope.data.data);
  return data.success
    ? { status: linearStatus(data.data) }
    : { error: "Linear: unexpected response" };
};
