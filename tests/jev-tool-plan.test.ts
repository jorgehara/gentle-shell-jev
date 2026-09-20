import test from "node:test";
import assert from "node:assert/strict";
import { executeToolPlan, localToolPlan, validateToolPlan } from "../lib/jev-tool-plan.ts";

test("rejects mutating tools and bounds plans to three steps", () => {
  const plan = validateToolPlan({ confidence: 2, steps: [
    { name: "symbol_search", args: { query: "auth" } },
    { name: "read_symbol", args: {} },
    { name: "grep", args: {} },
    { name: "write", args: {} },
    { name: "bash", args: {} },
  ] });
  assert.equal(plan.steps.length, 3);
  assert.deepEqual(plan.steps.map((step) => step.name), ["symbol_search", "read_symbol", "grep"]);
  assert.equal(plan.confidence, 1);
});

test("executes independent reads in parallel and dependent reads in order", async () => {
  const events: string[] = [];
  const plan = validateToolPlan({ steps: [
    { name: "symbol_search", parallel: true },
    { name: "codegraph", parallel: true },
    { name: "read_symbol" },
  ] });
  const results = await executeToolPlan(plan, async (step) => {
    events.push(`start:${step.name}`);
    await new Promise((resolve) => setTimeout(resolve, step.name === "symbol_search" ? 5 : 1));
    events.push(`end:${step.name}`);
    return step.name;
  });
  assert.deepEqual(results, ["symbol_search", "codegraph", "read_symbol"]);
  assert.ok(events.indexOf("start:read_symbol") > events.indexOf("end:codegraph"));
});

test("local plan uses indexed read-only tools", () => {
  const plan = localToolPlan("find authentication middleware");
  assert.equal(plan.source, "local");
  assert.ok(plan.steps.every((step) => ["symbol_search", "codegraph"].includes(step.name)));
});
