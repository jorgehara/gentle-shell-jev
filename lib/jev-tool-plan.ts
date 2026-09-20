export const READ_ONLY_TOOLS = ["symbol_search", "read_symbol", "read_enclosing", "codegraph", "grep", "find", "module_report"] as const;
export type ReadOnlyTool = (typeof READ_ONLY_TOOLS)[number];

export type ToolPlanStep = {
  name: ReadOnlyTool;
  args: Record<string, unknown>;
  reason: string;
  parallel?: boolean;
};

export type ToolPlan = {
  steps: ToolPlanStep[];
  confidence: number;
  stopWhen: string;
  source: "typesafe" | "local";
};

export type ToolExecutor = (step: ToolPlanStep) => Promise<unknown>;

const MAX_STEPS = 3;
const MAX_REASON = 240;

export function validateToolPlan(input: unknown): ToolPlan {
  const candidate = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const rawSteps = Array.isArray(candidate.steps) ? candidate.steps : [];
  const steps: ToolPlanStep[] = [];
  for (const raw of rawSteps.slice(0, MAX_STEPS)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    if (!READ_ONLY_TOOLS.includes(item.name as ReadOnlyTool)) continue;
    steps.push({
      name: item.name as ReadOnlyTool,
      args: item.args && typeof item.args === "object" ? item.args as Record<string, unknown> : {},
      reason: typeof item.reason === "string" ? item.reason.slice(0, MAX_REASON) : "JEV-selected read-only context step.",
      parallel: item.parallel === true,
    });
  }
  const confidence = typeof candidate.confidence === "number" ? Math.max(0, Math.min(1, candidate.confidence)) : 0;
  return {
    steps,
    confidence,
    stopWhen: typeof candidate.stopWhen === "string" ? candidate.stopWhen.slice(0, MAX_REASON) : "Relevant implementation context is identified.",
    source: candidate.source === "typesafe" ? "typesafe" : "local",
  };
}

export function localToolPlan(intent: string): ToolPlan {
  const search: ToolPlanStep = { name: "symbol_search", args: { query: intent, limit: 10 }, reason: "Locate the smallest relevant symbol set." };
  const graph: ToolPlanStep = { name: "codegraph", args: { operation: "explore", query: intent, limit: 10 }, reason: "Use indexed references without reading the whole repository.", parallel: true };
  return { steps: [search, graph], confidence: 0.7, stopWhen: "A relevant file and symbol are identified.", source: "local" };
}

export async function executeToolPlan(plan: ToolPlan, executor: ToolExecutor): Promise<unknown[]> {
  const validated = validateToolPlan(plan);
  const results: unknown[] = [];
  const parallel = validated.steps.filter((step) => step.parallel === true);
  const sequential = validated.steps.filter((step) => step.parallel !== true);
  if (parallel.length) results.push(...await Promise.all(parallel.map(executor)));
  for (const step of sequential) results.push(await executor(step));
  return results;
}
