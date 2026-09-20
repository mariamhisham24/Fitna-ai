import Groq from "groq-sdk";

/**
 * Server-only Groq client. GROQ_API_KEY must never be exposed to the
 * browser — this file is only ever imported from Server Components,
 * Route Handlers, or Server Actions.
 */
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 15000,
  maxRetries: 2,
});

export const CHAT_MODEL = "qwen/qwen3.8-27b";
export const WHISPER_MODEL = "whisper-large-v3-turbo";

type NonStreamChatCompletion = Extract<
  Awaited<ReturnType<typeof groq.chat.completions.create>>,
  { choices: unknown[] }
>;

export async function callGroqWithFallback(
  params: Parameters<typeof groq.chat.completions.create>[0]
): Promise<NonStreamChatCompletion> {
  const models = [
    CHAT_MODEL,
    "groq/compound-mini",
    "allam-2-7b",
  ];

  let lastError: unknown = null;
  for (const model of models) {
    try {
      return (await groq.chat.completions.create({
        ...params,
        model,
      })) as NonStreamChatCompletion;
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const msg = String((err as { message?: string })?.message ?? "");
      console.warn(`Groq model ${model} failed (${status}: ${msg}), trying next fallback model...`);
      continue;
    }
  }
  throw lastError;
}
