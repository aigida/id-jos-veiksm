import { createOpenAI } from "@ai-sdk/openai";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";
export const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const ANALYSIS_MODEL = "openai/gpt-6-astra";

function createRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  return {
    getRunId: () => runId,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      const response = await fetch(input, { ...init, headers });
      runId ??= response.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
      return response;
    },
  };
}

/** Creates a request-scoped Responses provider pointed at Lovable AI Gateway. */
export function createGatewayModel(apiKey: string) {
  const runIdFetch = createRunIdFetch();
  const provider = createOpenAI({
    baseURL: AI_GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return provider.responses(ANALYSIS_MODEL);
}

export const RESPONSES_OPTIONS = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "medium",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

/** Finds an HTTP status code anywhere in an AI SDK error chain. */
function findStatus(error: unknown): number | undefined {
  let current: unknown = error;
  for (let i = 0; i < 6 && current && typeof current === "object"; i++) {
    const c = current as { statusCode?: unknown; status?: unknown; cause?: unknown; lastError?: unknown };
    if (typeof c.statusCode === "number") return c.statusCode;
    if (typeof c.status === "number") return c.status;
    current = c.lastError ?? c.cause;
  }
  return undefined;
}

/** Turns gateway / SDK failures into a short Lithuanian message for the UI. */
export function describeAiError(error: unknown): string {
  const status = findStatus(error);
  if (status === 402)
    return "Baigėsi DI analizės kreditai. Projekto savininkas turi papildyti kreditus, kad analizė vėl veiktų.";
  if (status === 429) return "Per daug užklausų vienu metu. Palaukite minutę ir bandykite dar kartą.";
  if (status === 403) return "DI analizė šiuo metu neleidžiama šiam projektui (prieigos apribojimas).";
  if (status === 401) return "DI paslauga nesukonfigūruota. Kreipkitės į projekto savininką.";
  if (status === 400) return "DI paslauga atmetė užklausą. Pabandykite sutrumpinti tekstą.";
  if (status && status >= 500) return "DI paslauga laikinai nepasiekiama. Bandykite po kelių minučių.";
  if (error && typeof error === "object" && (error as { name?: string }).name === "AbortError")
    return "Analizė nutraukta.";
  return "Analizės atlikti nepavyko. Bandykite dar kartą.";
}
