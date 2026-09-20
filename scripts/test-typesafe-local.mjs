import { TypeSafeClient, choice, noul } from "@typesafe-ai/sdk";

if (!process.env.TYPESAFE_API_KEY) {
  console.error("TYPESAFE_API_KEY is not set in this process.");
  process.exitCode = 2;
} else {
  const client = new TypeSafeClient();
  const started = performance.now();
  try {
    const response = await client.systemOne({
      state: {
        intent: "find authentication middleware",
        files: ["src/auth.ts", "tests/auth.test.ts"],
        revision: "local",
      },
      questions: {
        tool: choice("Choose the first read-only tool", {
          symbol_search: "Find symbols",
          codegraph: "Explore indexed references",
          read_symbol: "Read a known symbol",
        }),
        more: noul("Is more context needed?"),
      },
    });
    console.log(JSON.stringify({
      ok: true,
      elapsedMs: Number((performance.now() - started).toFixed(1)),
      answers: response.answers,
      model: response.model,
      usage: response.usage,
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      ok: false,
      elapsedMs: Number((performance.now() - started).toFixed(1)),
      name: error?.name,
      status: error?.status,
      message: error?.message,
    }, null, 2));
    process.exitCode = 1;
  }
}
