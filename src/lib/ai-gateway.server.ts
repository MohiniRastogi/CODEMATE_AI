import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

export function createGateway() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI service configuration unavailable");
  return createOpenAICompatible({
    name: "lovable",
    baseURL: GATEWAY_URL,
    headers: {
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export const DEFAULT_MODEL = "google/gemini-3.6-flash";

export class AiGatewayError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AiGatewayError";
  }
}

type ResponsesApiPayload = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

/** Calls Lovable's managed Responses API from the server only. */
export async function runCodeReviewWithGateway(
  instructions: string,
  prompt: string,
  jsonSchema: Record<string, unknown>,
) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiGatewayError("AI review service is not configured for this project.", 401);

  const response = await fetch(`${GATEWAY_URL}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "responses-api",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.6-sol",
      instructions,
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "code_review",
          strict: true,
          schema: jsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string }; message?: string }
      | null;
    const gatewayMessage = payload?.error?.message ?? payload?.message;
    const message =
      response.status === 401
        ? "AI review service is not configured correctly."
        : response.status === 429
          ? "AI review is busy right now. Please wait a moment and try again."
          : response.status >= 500
            ? "AI review service is temporarily unavailable. Please try again shortly."
            : gatewayMessage || "AI review could not be completed.";
    throw new AiGatewayError(message, response.status);
  }

  const payload = (await response.json()) as ResponsesApiPayload;
  const text =
    payload.output_text ??
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text" || typeof item.text === "string")?.text;

  if (!text) throw new AiGatewayError("AI review returned an empty response. Please try again.", 502);
  return text;
}
