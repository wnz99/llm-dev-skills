import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { validateFlow } from "../src/flowCore";

test("bundled setup record is valid and contains no fabricated approval or completed step", async () => {
  const raw: unknown = JSON.parse(
    await readFile(new URL("../setup/FLOW.example.json", import.meta.url), "utf8"),
  );
  const result = validateFlow(raw);
  expect(result).toMatchObject({ ok: true });
  if (!result.ok) throw new Error(result.errors.join("; "));
  expect(result.flow.approvals).toEqual({ plan: null, content: null });
  expect(result.flow.steps).toEqual({});
  expect(result.flow.prs).toEqual([]);
  expect(result.flow.gsd_quick).toBeNull();
});
