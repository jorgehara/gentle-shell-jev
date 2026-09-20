import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { anticipateContext, type AnticipationState, type TypeSafeClientLike } from "../lib/jev-context.js";

const SDK_MODULE = "@typesafe-ai/sdk";

async function optionalClient(): Promise<TypeSafeClientLike | undefined> {
  if (!process.env.TYPESAFE_API_KEY && !process.env.TYPESAFE_ENV_PATH) return undefined;
  try {
    const sdk = await import(SDK_MODULE) as any;
    const client = new sdk.TypeSafeClient({ apiKey: process.env.TYPESAFE_API_KEY });
    return { systemOne: client.systemOne.bind(client), choice: sdk.choice, noul: sdk.noul };
  } catch { return undefined; }
}

export default function jevContext(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "anticipate_context",
    label: "Anticipate project context",
    description: "Read-only typed routing recommendation using TypeSafe/Jev when configured, with deterministic local fallback.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        intent: { type: "string", minLength: 1, maxLength: 500 },
        files: { type: "array", items: { type: "string", maxLength: 240 }, maxItems: 30 },
        skills: { type: "array", items: { type: "string", maxLength: 120 }, maxItems: 12 },
        revision: { type: "string", maxLength: 80 },
      },
      required: ["intent"],
    },
    async execute(_toolCallId, params) {
      const state = params as AnticipationState;
      const recommendation = await anticipateContext(state, await optionalClient());
      return { content: [{ type: "text", text: JSON.stringify(recommendation, null, 2) }], details: recommendation };
    },
  });
}
