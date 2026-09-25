import Groq from "groq-sdk";

/**
 * Server-only Groq client. GROQ_API_KEY must never be exposed to the
 * browser — this file is only ever imported from Server Components,
 * Route Handlers, or Server Actions.
 */
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 8000,
  maxRetries: 1,
});

export const CHAT_MODEL = "qwen/qwen3.8-27b";
export const WHISPER_MODEL = "whisper-large-v3-turbo";

type NonStreamChatCompletion = Extract<
  Awaited<ReturnType<typeof groq.chat.completions.create>>,
  { choices: unknown[] }
>;

async function callGeminiFallback(
  messages: Array<{ role: string; content: string }>
): Promise<NonStreamChatCompletion | null> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiKey) return null;

  try {
    const systemMsg = messages.find((m) => m.role === "system")?.content || "";
    const userMsg = messages.filter((m) => m.role !== "system").map((m) => m.content).join("\n\n");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: systemMsg ? { parts: [{ text: systemMsg }] } : undefined,
          contents: [{ parts: [{ text: userMsg }] }],
          generationConfig: {
            temperature: 0.65,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(6000),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return {
        id: `gemini-${Date.now()}`,
        choices: [{ message: { role: "assistant", content: text } }],
      } as unknown as NonStreamChatCompletion;
    }
  } catch (err) {
    console.warn("Gemini chat fallback error:", err);
  }
  return null;
}

export async function callGroqWithFallback(
  params: Parameters<typeof groq.chat.completions.create>[0]
): Promise<NonStreamChatCompletion> {
  const models = [
    CHAT_MODEL,
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
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
      lastError = err;
      const status = (err as { status?: number })?.status;
      const msg = String((err as { message?: string })?.message ?? "");
      console.warn(`Groq model ${model} failed (${status}: ${msg}), trying next fallback model...`);
      continue;
    }
  }

  // If all Groq models failed, attempt Google Gemini fallback seamlessly
  if (Array.isArray(params.messages)) {
    const geminiRes = await callGeminiFallback(
      params.messages.map((m) => ({ role: m.role, content: String(m.content || "") }))
    );
    if (geminiRes) return geminiRes;
  }

  throw lastError;
}
