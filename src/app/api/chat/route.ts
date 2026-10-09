import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // Max 30 messages per minute

async function generateWithGemini(systemPrompt: string, messages: any[]): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiKey) return null;

  try {
    const formattedContents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
          contents: formattedContents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 500,
          },
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      console.warn('Gemini chatbot fallback returned HTTP', res.status);
      return null;
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn('Gemini chatbot fallback failed:', err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();

    // Rate limiting logic
    const userLimit = rateLimit.get(ip);
    if (userLimit && now - userLimit.timestamp < RATE_LIMIT_WINDOW) {
      if (userLimit.count >= MAX_REQUESTS) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
      userLimit.count++;
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }

    const { message, history = [], context = 'visitor' } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemPrompt = `You are the official AI Assistant for the "Fitna AI" platform (فِطنة).
You are an expert on the platform's features, classroom simulation, AI-powered teacher training, and the Danielson & CLASS pedagogical frameworks.

Context of the user asking: ${context}

Information about Fitna AI:
- Fitna AI is an AI-powered classroom simulation and teacher training platform (فِطنة).
- It helps teachers practice classroom management, handle behavioral dynamics, and receive real-time pedagogical diagnostic feedback.
- Features include live voice simulation (Arabic, Egyptian, and Saudi dialects, plus English), real-time HUD indicators (Teacher talk time, Socratic questioning rate, inclusivity index), and diagnostic reports.
- Pricing: $19/month for individual teachers, custom pricing for institutional/school deployments.
- For visitors: Answer questions about features, pricing, and how to get started. Be welcoming and encourage them to try the platform.
- For teachers: Give actionable pedagogical tips, explain report metrics, and suggest teaching strategies based on Danielson/CLASS frameworks. Provide encouragement.

Rules:
- Keep your answers concise, helpful, and friendly.
- DO NOT use markdown headers (like # or ##), just bold text for emphasis.
- You must auto-detect the language from the user's message (Arabic or English) and respond in the SAME language.
- If the user speaks Arabic, respond in natural, friendly Arabic.
- If asked about things outside of education, teaching, or Fitna AI, politely steer the conversation back to how Fitna AI can help them.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg: any) => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const groqApiKey = process.env.CHATBOT_GROQ_API_KEY || process.env.GROQ_API_KEY;

    // 1. Try Groq if key is present
    if (groqApiKey) {
      try {
        const groq = new Groq({ apiKey: groqApiKey, timeout: 8000 });
        const stream = await groq.chat.completions.create({
          messages,
          model: 'llama-3.3-70b-versatile',
          stream: true,
          temperature: 0.5,
          max_tokens: 500,
        });

        const readableStream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
              for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });

        return new Response(readableStream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
          },
        });
      } catch (modelError: any) {
        console.warn('Groq primary model failed, attempting Groq fallback...', modelError);
        try {
          const groq = new Groq({ apiKey: groqApiKey, timeout: 8000 });
          const fallbackStream = await groq.chat.completions.create({
            messages,
            model: 'llama-3.1-8b-instant',
            stream: true,
            temperature: 0.5,
            max_tokens: 500,
          });

          const readableStream = new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder();
              try {
                for await (const chunk of fallbackStream) {
                  const content = chunk.choices[0]?.delta?.content || '';
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                }
                controller.close();
              } catch (error) {
                controller.error(error);
              }
            },
          });

          return new Response(readableStream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-cache, no-transform',
            },
          });
        } catch (groqFallbackErr) {
          console.warn('Groq fallback also failed, will try Gemini...', groqFallbackErr);
        }
      }
    }

    // 2. Try Gemini Fallback
    const geminiReply = await generateWithGemini(systemPrompt, messages);
    if (geminiReply) {
      return new Response(geminiReply, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        },
      });
    }

    // 3. Graceful fallback answer if no LLM responded
    const isArabic = /[\u0600-\u06FF]/.test(message);
    const defaultResponse = isArabic
      ? "أهلاً بك في فِطنة! أنا مساعدك الذكي لمساعدتك في تجربة محاكاة الفصول الافتراضية والتدريب على مهارات إدارة الصف. يمكنك تجربة سيناريو مباشر الآن بالضغط على 'جرّب الآن' أو سؤال أي استفسار حول المنصة."
      : "Welcome to Fitna AI! I'm your interactive assistant to help you with classroom simulations and pedagogical training. You can start a live session or ask me any question about the platform.";

    return new Response(defaultResponse, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
