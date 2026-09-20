import test from "node:test";
import assert from "node:assert/strict";
import { executeToolPlan, validateToolPlan, type ToolPlanStep } from "../lib/jev-tool-plan.ts";

test("e2e: JEV selects bounded tools, Gentle executes, model receives summaries", async () => {
  const selected = validateToolPlan({ source: "typesafe", confidence: 0.94, stopWhen: "middleware symbol identified", steps: [
    { name: "symbol_search", args: { query: "authentication middleware" }, reason: "Find the entry symbol.", parallel: true },
    { name: "codegraph", args: { operation: "explore", query: "authentication middleware", limit: 5 }, reason: "Find callers.", parallel: true },
  ] });
  const executed: string[] = [];
  const results = await executeToolPlan(selected, async (step: ToolPlanStep) => {
    executed.push(step.name);
    return { tool: step.name, summary: `${step.name} found bounded evidence` };
  });
  const modelInput = results.map((result) => (result as { summary: string }).summary).join("\n");
  assert.deepEqual(executed.sort(), ["codegraph", "symbol_search"]);
  assert.match(modelInput, /bounded evidence/);
  assert.equal(modelInput.includes("apiKey"), false);
});
