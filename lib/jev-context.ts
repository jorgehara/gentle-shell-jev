import { readFile } from "node:fs/promises";

export type AnticipationState = {
  intent: string;
  cwd: string;
  revision?: string;
  files?: string[];
  skills?: string[];
  model?: string;
  effort?: string;
};

export type AnticipationRecommendation = {
  route: "codex" | "free" | "local";
  skill: string;
  effort: "low" | "medium" | "high";
  confidence: number;
  reason: string;
  source: "typesafe" | "local";
};

export type TypeSafeAnswer = {
  answers: {
    route?: { choice?: string; confidence?: number };
    effort?: { choice?: string; score?: number; confidence?: number };
    context?: { noul?: boolean; confidence?: number };
  };
  model?: string;
  usage?: { inputTokens?: number; outputTokens?: number };
};

export type TypeSafeClientLike = {
  systemOne(request: unknown, options?: unknown): Promise<TypeSafeAnswer>;
  choice?: (instructions: string, criteria: Record<string, string | null>) => unknown;
  noul?: (instructions: string) => unknown;
};

const SECRET = /(api[_-]?key|token|secret|password|authorization|cookie|credential)/i;
const MAX_INTENT = 500;
const MAX_FILES = 30;
const MAX_SKILLS = 12;

export function redactState(state: AnticipationState): AnticipationState {
  const clean = (value: string) => value.slice(0, MAX_INTENT).replace(/(sk-[A-Za-z0-9_-]+|ghp_[A-Za-z0-9]+|Bearer\s+\S+)/gi, "[REDACTED]");
  return {
    intent: clean(state.intent),
    cwd: state.cwd.replace(/[\\/]\.env[^\\/]*$/i, "/[REDACTED]"),
    revision: state.revision?.slice(0, 80),
    files: (state.files ?? []).filter((file) => !SECRET.test(file)).slice(0, MAX_FILES),
    skills: (state.skills ?? []).filter((skill) => !SECRET.test(skill)).slice(0, MAX_SKILLS),
    model: state.model,
    effort: state.effort,
  };
}

export function localRecommendation(state: AnticipationState): AnticipationRecommendation {
  const text = `${state.intent} ${(state.files ?? []).join(" ")}`.toLowerCase();
  const complex = /architect|refactor|security|migration|review|multi|backend|deploy/.test(text);
  return {
    route: complex ? "codex" : "free",
    skill: /test|bug|fail/.test(text) ? "gentle-ai" : "gentle-project-context",
    effort: complex ? "high" : "low",
    confidence: 0.55,
    reason: "Deterministic local routing; TypeSafe unavailable or low confidence.",
    source: "local",
  };
}

export function recommendationFromResponse(response: TypeSafeAnswer, fallback: AnticipationRecommendation): AnticipationRecommendation {
  const route = response.answers.route?.choice;
  const effort = response.answers.effort?.choice;
  const confidence = Math.min(1, Math.max(0, response.answers.route?.confidence ?? response.answers.effort?.confidence ?? 0));
  if ((route !== "codex" && route !== "free") || (effort !== "low" && effort !== "medium" && effort !== "high") || confidence < 0.75) return fallback;
  return { route, effort, skill: fallback.skill, confidence, reason: "High-confidence typed TypeSafe recommendation.", source: "typesafe" };
}

export async function loadTypeSafeKey(path = process.env.TYPESAFE_ENV_PATH ?? ""): Promise<string | undefined> {
  if (!path) return process.env.TYPESAFE_API_KEY?.trim() || undefined;
  const text = await readFile(path, "utf8");
  const match = text.match(/^\s*TYPESAFE_API_KEY\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))/m);
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

export async function anticipateContext(state: AnticipationState, client?: TypeSafeClientLike): Promise<AnticipationRecommendation> {
  const fallback = localRecommendation(state);
  if (!client) return fallback;
  try {
    const response = await client.systemOne({
      state: redactState(state),
      questions: {
        route: client.choice?.("Choose the safest model route.", { codex: "Paid Codex for complex work", free: "Free CLIProxy/Gemini for simple work" }) ?? { kind: "choice", criteria: { codex: null, free: null } },
        effort: client.choice?.("Choose effort.", { low: "Small/read-only", medium: "Normal implementation", high: "Complex/high-risk" }) ?? { kind: "choice", criteria: { low: null, medium: null, high: null } },
        context: client.noul?.("Does the project need more context before implementation?") ?? { kind: "noul" },
      },
    });
    return recommendationFromResponse(response, fallback);
  } catch {
    return fallback;
  }
}
