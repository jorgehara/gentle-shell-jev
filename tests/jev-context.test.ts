import test from "node:test";
import assert from "node:assert/strict";
import { anticipateContext, localRecommendation, redactState, recommendationFromResponse } from "../lib/jev-context.ts";

test("redacts secrets and bounds project state", () => {
  const state = redactState({ intent: "fix sk-abc123 and Bearer secret", cwd: "C:/repo", files: ["src/app.ts", "api-key.env", ...Array(40).fill("x.ts")] });
  assert.equal(state.intent.includes("sk-abc123"), false);
  assert.equal(state.files?.length, 30);
  assert.equal(state.files?.includes("api-key.env"), false);
});

test("low confidence response falls back locally", () => {
  const fallback = localRecommendation({ intent: "fix test", cwd: "C:/repo" });
  const result = recommendationFromResponse({ answers: { route: { choice: "codex", confidence: 0.4 }, effort: { choice: "high" } } }, fallback);
  assert.equal(result.source, "local");
});

test("typed high-confidence response is accepted", () => {
  const result = recommendationFromResponse({ answers: { route: { choice: "codex", confidence: 0.9 }, effort: { choice: "high" } } }, localRecommendation({ intent: "simple", cwd: "C:/repo" }));
  assert.deepEqual({ route: result.route, effort: result.effort, source: result.source }, { route: "codex", effort: "high", source: "typesafe" });
});

test("unavailable Jev returns local recommendation quickly", async () => {
  const started = performance.now();
  const result = await anticipateContext({ intent: "read project", cwd: "C:/repo" });
  assert.equal(result.source, "local");
  assert.ok(performance.now() - started < 100);
});

test("workflow benchmark keeps local path bounded", async () => {
  const samples: number[] = [];
  for (let i = 0; i < 100; i++) {
    const started = performance.now();
    await anticipateContext({ intent: i % 2 ? "fix failing test" : "read project", cwd: "C:/repo", files: ["src/app.ts", "tests/app.test.ts"] });
    samples.push(performance.now() - started);
  }
  samples.sort((a, b) => a - b);
  const p95 = samples[Math.floor(samples.length * 0.95)];
  assert.ok(p95 < 25, `local anticipation p95 was ${p95.toFixed(2)}ms`);
});
