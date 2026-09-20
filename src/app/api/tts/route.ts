import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { normalizeEgyptianSpeech } from "@/lib/ai/egyptianSpeechNormalizer";

export const runtime = "nodejs";

export type StudentVoiceProfile = {
  voice: string;
  pitch: string;
  rate: string;
};

/**
 * Distinct student acoustic profiles for Egyptian classroom personas.
 * Tuned with slight, natural pitch and rate offsets to reflect real 9-11 year old students
 * without distortion or unnatural artifacting.
 */
const STUDENT_PROFILES: Record<string, StudentVoiceProfile> = {
  // عمر (Omar - 10 yrs): energetic, curious boy, boyish pitch & active tempo
  "عمر": { voice: "ar-EG-ShakirNeural", pitch: "+24Hz", rate: "+8%" },
  "omar": { voice: "ar-EG-ShakirNeural", pitch: "+24Hz", rate: "+8%" },

  // سارة (Sara - 11 yrs): diligent, attentive schoolgirl, clear Cairo Egyptian articulation
  "سارة": { voice: "ar-EG-SalmaNeural", pitch: "+20Hz", rate: "+4%" },
  "sara": { voice: "ar-EG-SalmaNeural", pitch: "+20Hz", rate: "+4%" },
  "sarah": { voice: "ar-EG-SalmaNeural", pitch: "+20Hz", rate: "+4%" },

  // ياسين (Yassin - 9 yrs): playful, spontaneous, younger boy tone, brisk tempo
  "ياسين": { voice: "ar-EG-ShakirNeural", pitch: "+30Hz", rate: "+12%" },
  "yassin": { voice: "ar-EG-ShakirNeural", pitch: "+30Hz", rate: "+12%" },
  "yasin": { voice: "ar-EG-ShakirNeural", pitch: "+30Hz", rate: "+12%" },

  // نور (Nour - 10 yrs): quiet, introverted, soft-spoken girl, gentle & thoughtful pacing
  "نور": { voice: "ar-EG-SalmaNeural", pitch: "+24Hz", rate: "-2%" },
  "nour": { voice: "ar-EG-SalmaNeural", pitch: "+24Hz", rate: "-2%" },
};

const DEFAULT_FEMALE_PROFILE: StudentVoiceProfile = {
  voice: "ar-EG-SalmaNeural",
  pitch: "+16Hz",
  rate: "+2%",
};

const DEFAULT_MALE_PROFILE: StudentVoiceProfile = {
  voice: "ar-EG-ShakirNeural",
  pitch: "+20Hz",
  rate: "+6%",
};

const FEMALE_NAMES = new Set(["سارة", "نور", "فاطمة", "مريم", "سلمى", "sara", "sarah", "nour", "fatima", "maryam"]);

function resolveVoiceProfile(personaName?: string, voiceOverride?: string): StudentVoiceProfile {
  if (voiceOverride) {
    return { voice: voiceOverride, pitch: "+0Hz", rate: "+0%" };
  }

  const normalizedName = (personaName ?? "").trim().toLowerCase();
  if (STUDENT_PROFILES[normalizedName]) {
    return STUDENT_PROFILES[normalizedName];
  }

  return FEMALE_NAMES.has(normalizedName) ? DEFAULT_FEMALE_PROFILE : DEFAULT_MALE_PROFILE;
}

// Fish Audio Egyptian voice models for classroom personas
const FISH_AUDIO_VOICES: Record<string, string> = {
  // عمر (Omar - 10 yrs): energetic, playful, Egyptian boy
  "عمر": "467b35bab13841858d89523da3e6102c",
  "omar": "467b35bab13841858d89523da3e6102c",

  // سارة (Sara - 11 yrs): clear, bright Egyptian schoolgirl
  "سارة": "c75d63900b55446aaa2d07593cc6bb2d",
  "sara": "c75d63900b55446aaa2d07593cc6bb2d",
  "sarah": "c75d63900b55446aaa2d07593cc6bb2d",

  // ياسين (Yassin - 9 yrs): spontaneous, animated young boy
  "ياسين": "cbe855302eaa45dda57867e1188b0228",
  "yassin": "cbe855302eaa45dda57867e1188b0228",
  "yasin": "cbe855302eaa45dda57867e1188b0228",

  // نور (Nour - 10 yrs): gentle, calm Arabic speaker
  "نور": "fb77d7877e404c0fb2427e7aec55b247",
  "nour": "fb77d7877e404c0fb2427e7aec55b247",
};

async function callFishAudioAPI(voiceId: string, text: string, apiKey: string): Promise<Buffer | null> {
  try {
    const res = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        reference_id: voiceId,
        format: "mp3",
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`Fish Audio returned status ${res.status}: ${errText}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.warn("Fish Audio request exception:", err);
    return null;
  }
}

async function synthesizeFishAudio(text: string, personaName?: string): Promise<Buffer | null> {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) return null;

  const normalizedName = (personaName ?? "").trim().toLowerCase();
  const voiceId =
    FISH_AUDIO_VOICES[normalizedName] ||
    (FEMALE_NAMES.has(normalizedName)
      ? "c75d63900b55446aaa2d07593cc6bb2d"
      : "467b35bab13841858d89523da3e6102c");

  return await callFishAudioAPI(voiceId, text, apiKey);
}

// User-configured custom voice IDs
const CUSTOM_ELEVENLABS_VOICES: Record<string, string> = {
  "عمر": "5REPlS2Ja1VZ7zNA0ykn",
  "omar": "5REPlS2Ja1VZ7zNA0ykn",

  "سارة": "vWDp3PLsTWjIhBxxUKh9",
  "sara": "vWDp3PLsTWjIhBxxUKh9",
  "sarah": "vWDp3PLsTWjIhBxxUKh9",

  "ياسين": "ckGEQg6YnSVooU5uDRsF",
  "yassin": "ckGEQg6YnSVooU5uDRsF",
  "yasin": "ckGEQg6YnSVooU5uDRsF",

  "نور": "xPcC3nehhziQaOrIeAwv",
  "nour": "xPcC3nehhziQaOrIeAwv",
};

// Young student pre-made voices (allowed on ElevenLabs Free Tier without library restrictions)
const YOUNG_PREMADE_VOICES: Record<string, string> = {
  "عمر": "TX3LPaxmHKxFdv7VOQHJ", // Liam (young male)
  "omar": "TX3LPaxmHKxFdv7VOQHJ",

  "سارة": "pFZP5JQG7iQjIQuC4Bku", // Lily (polite, gentle tone)
  "sara": "pFZP5JQG7iQjIQuC4Bku",
  "sarah": "pFZP5JQG7iQjIQuC4Bku",

  "ياسين": "IKne3meq5aSn9XLyUdCD", // Charlie (casual young male)
  "yassin": "IKne3meq5aSn9XLyUdCD",
  "yasin": "IKne3meq5aSn9XLyUdCD",

  "نور": "cgSgspJ2msm6clMCkdW9", // Jessica (young female)
  "nour": "cgSgspJ2msm6clMCkdW9",
};

async function callElevenLabsAPI(voiceId: string, text: string, apiKey: string): Promise<Buffer | null> {
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`ElevenLabs voice ${voiceId} returned status ${res.status}: ${errText}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.warn("ElevenLabs request exception:", err);
    return null;
  }
}

function getElevenLabsKeys(): string[] {
  const primary = (process.env.ELEVENLABS_API_KEY ?? "").trim();
  const backups = (process.env.ELEVENLABS_BACKUP_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return [...new Set([primary, ...backups].filter(Boolean))];
}

async function synthesizeElevenLabs(text: string, personaName?: string): Promise<Buffer | null> {
  const keys = getElevenLabsKeys();
  if (keys.length === 0) return null;

  const normalizedName = (personaName ?? "").trim().toLowerCase();

  const voiceId =
    YOUNG_PREMADE_VOICES[normalizedName] ||
    (FEMALE_NAMES.has(normalizedName) ? "pFZP5JQG7iQjIQuC4Bku" : "TX3LPaxmHKxFdv7VOQHJ");

  for (const apiKey of keys) {
    const audioBuf = await callElevenLabsAPI(voiceId, text, apiKey);
    if (audioBuf) {
      return audioBuf;
    }
  }

  return null;
}

// -------------------------------------------------------------
// NAMAA Egyptian Dialect TTS (Chatterbox fine-tuned on Egyptian)
// -------------------------------------------------------------
interface NamaaProfile {
  seed: number;
  exaggeration: number;
  temperature: number;
  cfgWeight: number;
}

const NAMAA_STUDENT_PROFILES: Record<string, NamaaProfile> = {
  // عمر: 10 yrs, energetic boy
  "عمر": { seed: 42, exaggeration: 0.6, temperature: 0.7, cfgWeight: 0.6 },
  "omar": { seed: 42, exaggeration: 0.6, temperature: 0.7, cfgWeight: 0.6 },
  // سارة: 11 yrs, bright diligent schoolgirl
  "سارة": { seed: 101, exaggeration: 0.5, temperature: 0.6, cfgWeight: 0.5 },
  "sara": { seed: 101, exaggeration: 0.5, temperature: 0.6, cfgWeight: 0.5 },
  "sarah": { seed: 101, exaggeration: 0.5, temperature: 0.6, cfgWeight: 0.5 },
  // ياسين: 9 yrs, playful, animated young boy
  "ياسين": { seed: 77, exaggeration: 0.7, temperature: 0.85, cfgWeight: 0.5 },
  "yassin": { seed: 77, exaggeration: 0.7, temperature: 0.85, cfgWeight: 0.5 },
  "yasin": { seed: 77, exaggeration: 0.7, temperature: 0.85, cfgWeight: 0.5 },
  // نور: 10 yrs, gentle, calm, introverted girl
  "نور": { seed: 303, exaggeration: 0.4, temperature: 0.55, cfgWeight: 0.6 },
  "nour": { seed: 303, exaggeration: 0.4, temperature: 0.55, cfgWeight: 0.6 },
};

async function synthesizeNamaaEgyptianTTS(
  text: string,
  personaName?: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const token = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  if (!token) return null;

  const normalizedName = (personaName ?? "").trim().toLowerCase();
  const profile = NAMAA_STUDENT_PROFILES[normalizedName] || {
    seed: FEMALE_NAMES.has(normalizedName) ? 101 : 42,
    exaggeration: 0.5,
    temperature: 0.7,
    cfgWeight: 0.5,
  };

  try {
    const postUrl = "https://omarelshehy-namaa-egyptian-voice.hf.space/gradio_api/call/generate_tts_audio";
    const postRes = await fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: [
          text.slice(0, 300),
          null,
          profile.exaggeration,
          profile.temperature,
          profile.seed,
          profile.cfgWeight,
        ],
      }),
    });

    if (!postRes.ok) return null;
    const postJson = (await postRes.json()) as { event_id?: string };
    if (!postJson.event_id) return null;

    const streamUrl = `https://omarelshehy-namaa-egyptian-voice.hf.space/gradio_api/call/generate_tts_audio/${postJson.event_id}`;
    const streamRes = await fetch(streamUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!streamRes.ok) return null;
    const streamText = await streamRes.text();
    const match = streamText.match(/"url":\s*"([^"]+)"/);
    if (!match || !match[1]) return null;

    const audioUrl = match[1];
    const audioRes = await fetch(audioUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!audioRes.ok) return null;

    const audioBuf = Buffer.from(await audioRes.arrayBuffer());
    return { buffer: audioBuf, contentType: "audio/wav" };
  } catch (err) {
    console.warn("NAMAA Egyptian TTS request exception:", err);
    return null;
  }
}

// -------------------------------------------------------------
// Custom Fitna AI ZeroGPU Voice Space (Custom XTTS v2 with user voices)
// -------------------------------------------------------------
async function synthesizeCustomHFSpace(
  text: string,
  personaName?: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const spaceUrl = process.env.HF_CUSTOM_SPACE_URL || process.env.LOCAL_TTS_URL;
  if (!spaceUrl) return null;

  const token = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  const baseUrl = spaceUrl.replace(/\/+$/, "");
  const normalizedName = (personaName ?? "عمر").trim();

  try {
    // 1. First try direct fast REST endpoint (e.g. Local Voice Server at http://127.0.0.1:8008/tts)
    try {
      const directRes = await fetch(`${baseUrl}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 400), personaName: normalizedName }),
        signal: AbortSignal.timeout(35000),
      });
      if (directRes.ok) {
        const cType = directRes.headers.get("content-type") || "audio/wav";
        if (cType.includes("audio")) {
          const audioBuf = Buffer.from(await directRes.arrayBuffer());
          return { buffer: audioBuf, contentType: "audio/wav" };
        }
      }
    } catch {
      // Direct /tts not available or timed out, fall back to Gradio API
    }

    // 2. Fall back to Gradio API endpoint (for HF Space)
    const postUrl = `${baseUrl}/gradio_api/call/generate`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const postRes = await fetch(postUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: [text.slice(0, 300), normalizedName],
      }),
    });

    if (!postRes.ok) return null;
    const postJson = (await postRes.json()) as { event_id?: string };
    if (!postJson.event_id) return null;

    const streamUrl = `${baseUrl}/gradio_api/call/generate/${postJson.event_id}`;
    const streamRes = await fetch(streamUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!streamRes.ok) return null;
    const streamText = await streamRes.text();
    const match = streamText.match(/"url":\s*"([^"]+)"/);
    if (!match || !match[1]) return null;

    const audioUrl = match[1].startsWith("http") ? match[1] : `${baseUrl}${match[1]}`;
    const audioRes = await fetch(audioUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!audioRes.ok) return null;

    const audioBuf = Buffer.from(await audioRes.arrayBuffer());
    return { buffer: audioBuf, contentType: "audio/wav" };
  } catch (err) {
    console.warn("Custom HF Space TTS exception:", err);
    return null;
  }
}

// Gemini Persona Voice and Prompt mapping
const GEMINI_STUDENT_CONFIGS: Record<string, { voice: string; promptPrefix: string }> = {
  "عمر": {
    voice: "Puck",
    promptPrefix:
      "Speak as Omar, an authentic 10-year-old Egyptian schoolboy. Accent & Phrasing: Egyptian Arabic with natural energetic Cairo boy inflection. Tone: enthusiastic, active, curious.",
  },
  "omar": {
    voice: "Puck",
    promptPrefix:
      "Speak as Omar, an authentic 10-year-old Egyptian schoolboy. Accent & Phrasing: Egyptian Arabic with natural energetic Cairo boy inflection. Tone: enthusiastic, active, curious.",
  },
  "سارة": {
    voice: "Kore",
    promptPrefix:
      "Speak as Sara, an authentic 11-year-old Egyptian schoolgirl. Accent & Phrasing: Egyptian Arabic with natural clear Cairo inflection. Tone: diligent, polite, cheerful, articulate.",
  },
  "sara": {
    voice: "Kore",
    promptPrefix:
      "Speak as Sara, an authentic 11-year-old Egyptian schoolgirl. Accent & Phrasing: Egyptian Arabic with natural clear Cairo inflection. Tone: diligent, polite, cheerful, articulate.",
  },
  "sarah": {
    voice: "Kore",
    promptPrefix:
      "Speak as Sara, an authentic 11-year-old Egyptian schoolgirl. Accent & Phrasing: Egyptian Arabic with natural clear Cairo inflection. Tone: diligent, polite, cheerful, articulate.",
  },
  "ياسين": {
    voice: "Zephyr",
    promptPrefix:
      "Speak as Yassin, an authentic 9-year-old Egyptian boy. Accent & Phrasing: Egyptian Arabic with lively, spontaneous Cairo boy inflection. Tone: playful, witty, mischievous, fun-loving.",
  },
  "yassin": {
    voice: "Zephyr",
    promptPrefix:
      "Speak as Yassin, an authentic 9-year-old Egyptian boy. Accent & Phrasing: Egyptian Arabic with lively, spontaneous Cairo boy inflection. Tone: playful, witty, mischievous, fun-loving.",
  },
  "yasin": {
    voice: "Zephyr",
    promptPrefix:
      "Speak as Yassin, an authentic 9-year-old Egyptian boy. Accent & Phrasing: Egyptian Arabic with lively, spontaneous Cairo boy inflection. Tone: playful, witty, mischievous, fun-loving.",
  },
  "نور": {
    voice: "Aoede",
    promptPrefix:
      "Speak as Nour, an authentic 10-year-old Egyptian girl. Accent & Phrasing: Egyptian Arabic with natural gentle Cairo inflection. Educational delivery style: softly, curiously and inquisitively on the topic.",
  },
  "nour": {
    voice: "Aoede",
    promptPrefix:
      "Speak as Nour, an authentic 10-year-old Egyptian girl. Accent & Phrasing: Egyptian Arabic with natural gentle Cairo inflection. Educational delivery style: softly, curiously and inquisitively on the topic.",
  },
};

/**
 * Prepend standard 44-byte RIFF/WAVE header to raw 16-bit linear PCM audio.
 */
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16): Buffer {
  const header = Buffer.alloc(44);
  const dataSize = pcmBuffer.length;
  const fileSize = dataSize + 36;
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(fileSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

function getGeminiKeys(): string[] {
  const primary = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  const backups = (process.env.GEMINI_BACKUP_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return [...new Set([primary, ...backups].filter(Boolean))];
}

/**
 * Synthesize speech via Google Gemini TTS (gemini-3.1-flash-tts-preview).
 */
async function synthesizeGeminiTTS(text: string, personaName?: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const keys = getGeminiKeys();
  if (keys.length === 0) return null;

  const normalizedName = (personaName ?? "").trim().toLowerCase();
  const config =
    GEMINI_STUDENT_CONFIGS[normalizedName] || {
      voice: FEMALE_NAMES.has(normalizedName) ? "Kore" : "Puck",
      promptPrefix: "Speak as an authentic Egyptian student with natural Cairo inflection.",
    };

  const fullPrompt = `${config.promptPrefix} Deliver the following text: ${text}`;

  const modelsToTry = [
    "gemini-2.5-flash-preview-tts",
    "gemini-3.1-flash-tts-preview",
  ];

  for (const apiKey of keys) {
    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: config.voice,
                  },
                },
              },
            },
          }),
        });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.warn(`Gemini TTS (${model}) returned status ${res.status}: ${errText.slice(0, 160)}`);
        continue;
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioPart = candidate?.content?.parts?.find((p: any) => p.inlineData);
      if (!audioPart?.inlineData?.data) {
        continue;
      }

      const pcmBuffer = Buffer.from(audioPart.inlineData.data, "base64");
      const wavBuffer = pcmToWav(pcmBuffer, 24000);
      return { buffer: wavBuffer, contentType: "audio/wav" };
      } catch (err) {
        console.warn(`Gemini TTS exception on ${model}:`, err);
      }
    }
  }

  return null;
}

/**
 * Synthesize speech via Google Cloud Text-to-Speech REST API (if enabled on the Google project).
 */
async function synthesizeGoogleCloudTTS(text: string, personaName?: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const normalizedName = (personaName ?? "").trim().toLowerCase();
  const isFemale = FEMALE_NAMES.has(normalizedName);
  const voiceName = isFemale ? "ar-XA-Wavenet-A" : "ar-XA-Wavenet-B";

  try {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: "ar-XA",
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 1.05,
        },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.audioContent) {
      return { buffer: Buffer.from(data.audioContent, "base64"), contentType: "audio/mpeg" };
    }
    return null;
  } catch {
    return null;
  }
}

function getKieKeys(): string[] {
  const primary = (process.env.KIE_AI_API_KEY || "").trim();
  const backups = (process.env.KIE_AI_BACKUP_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return [...new Set([primary, ...backups].filter(Boolean))];
}

/**
 * Synthesize speech via Kie.ai Google Gemini 3.1 Flash TTS
 * Persona mapping:
 * - عمر (Omar): Puck (Enthusiastic boy)
 * - سارة (Sara): Kore (Diligent schoolgirl)
 * - ياسين (Yassin): Zephyr (Playful boy)
 * - نور (Nour): Aoede (Gentle girl)
 */
async function synthesizeKieGeminiTTS(
  text: string,
  personaName?: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const keys = getKieKeys();
  if (keys.length === 0) return null;

  const normalizedName = (personaName ?? "عمر").trim().toLowerCase();
  let voiceName = "Puck";
  let profile = "10-year-old Egyptian schoolboy";

  if (normalizedName === "سارة" || normalizedName === "sara" || normalizedName === "sarah") {
    voiceName = "Kore";
    profile = "11-year-old Egyptian schoolgirl";
  } else if (normalizedName === "ياسين" || normalizedName === "yassin" || normalizedName === "yasin") {
    voiceName = "Zephyr";
    profile = "9-year-old Egyptian schoolboy";
  } else if (normalizedName === "نور" || normalizedName === "nour") {
    voiceName = "Aoede";
    profile = "10-year-old Egyptian schoolgirl";
  }

  for (const apiKey of keys) {
    try {
      const createRes = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-1-flash-tts",
          input: {
            speakers: [
              {
                speaker_id: "Speaker 1",
                voice_name: voiceName,
                audio_profile: profile,
                accent: "American (Gen)",
                style: "Empathetic",
                pace: "Natural",
              },
            ],
            dialogue_turns: [
              {
                speaker_id: "Speaker 1",
                text: text.slice(0, 350),
              },
            ],
          },
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!createRes.ok) {
        console.warn(`Kie.ai key ${apiKey.slice(0, 8)}... returned HTTP ${createRes.status}, switching to backup key...`);
        continue;
      }
      const createData = (await createRes.json()) as { code?: number; msg?: string; data?: { taskId?: string } };
      const taskId = createData.data?.taskId;
      if (!taskId || createData.code !== 200) {
        console.warn(`Kie.ai key ${apiKey.slice(0, 8)}... failed (${createData.msg || "no taskId"}), switching to backup key...`);
        continue;
      }

      // Poll for task completion (up to ~18 seconds)
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        const pollRes = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(8000),
        });
        if (!pollRes.ok) continue;

        const pollData = (await pollRes.json()) as {
          data?: { state?: string; resultJson?: string };
        };
        if (pollData.data?.state === "success" && pollData.data.resultJson) {
          const result = JSON.parse(pollData.data.resultJson) as { resultUrls?: string[] };
          const audioUrl = result.resultUrls?.[0];
          if (!audioUrl) break;

          const audioRes = await fetch(audioUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            signal: AbortSignal.timeout(10000),
          });
          if (!audioRes.ok) break;

          const audioBuf = Buffer.from(await audioRes.arrayBuffer());
          return { buffer: audioBuf, contentType: "audio/wav" };
        } else if (pollData.data?.state === "fail") {
          console.warn(`Kie.ai task ${taskId} failed on key ${apiKey.slice(0, 8)}..., switching to backup key...`);
          break;
        }
      }
    } catch (err) {
      console.warn(`Kie.ai Gemini TTS exception on key ${apiKey.slice(0, 8)}...:`, err);
    }
  }

  return null;
}

// In-memory cache to avoid re-synthesizing the exact same normalized text and voice parameters
type CachedAudio = {
  buffer: Buffer;
  contentType: string;
};
const audioCache = new Map<string, CachedAudio>();

export async function synthesizeStudentSpeech(
  text: string,
  personaName?: string,
  voiceOverride?: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!text || !text.trim()) return null;

  const profile = resolveVoiceProfile(personaName, voiceOverride);
  const normalizedText = normalizeEgyptianSpeech(text.trim());
  if (!normalizedText) return null;

  const cacheKey = `v4::${profile.voice}::${profile.pitch}::${profile.rate}:::${normalizedText}`;

  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  let resultAudio: { buffer: Buffer; contentType: string } | null = null;

  // 1. Priority 1: Google AI Studio Gemini Direct TTS (Pool of 9 keys with daily auto-refresh)
  if (!resultAudio && !voiceOverride && (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_BACKUP_KEYS)) {
    try {
      resultAudio = await synthesizeGeminiTTS(normalizedText, personaName);
    } catch (e) {
      console.warn("Google AI Studio Gemini TTS synthesis error:", e);
    }
  }

  // 2. Priority 2: Kie.ai Gemini Flash TTS (Pool of 3 keys ~238 credits fallback)
  if (!resultAudio && !voiceOverride && (process.env.KIE_AI_API_KEY || process.env.KIE_AI_BACKUP_KEYS)) {
    try {
      resultAudio = await synthesizeKieGeminiTTS(normalizedText, personaName);
    } catch (e) {
      console.warn("Kie.ai Gemini TTS synthesis error:", e);
    }
  }

  // 3. Priority 3: ElevenLabs Fast Turbo v2.5 (~500ms realistic youth voices)
  if (!resultAudio && !voiceOverride && (process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_BACKUP_KEYS)) {
    try {
      const elevenBuf = await synthesizeElevenLabs(normalizedText, personaName);
      if (elevenBuf) {
        resultAudio = { buffer: elevenBuf, contentType: "audio/mpeg" };
      }
    } catch (e) {
      console.warn("ElevenLabs synthesis error:", e);
    }
  }

  // 4. Priority 4: Microsoft Edge Neural TTS (ar-EG-ShakirNeural / ar-EG-SalmaNeural) (100% Free & Unlimited Egyptian voices)
  if (!resultAudio) {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(profile.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(normalizedText, {
        pitch: profile.pitch,
        rate: profile.rate,
      });

      const chunks: Buffer[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk as Buffer);
      }
      resultAudio = { buffer: Buffer.concat(chunks), contentType: "audio/mpeg" };
    } catch (err) {
      console.warn("EdgeTTS synthesis error:", err);
    }
  }

  // 5. Final Fallback: Fish Audio
  if (!resultAudio && !voiceOverride && process.env.FISH_AUDIO_API_KEY) {
    const fishBuf = await synthesizeFishAudio(normalizedText, personaName);
    if (fishBuf) {
      resultAudio = { buffer: fishBuf, contentType: "audio/mpeg" };
    }
  }

  if (resultAudio) {
    if (audioCache.size >= 100) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, resultAudio);
  }

  return resultAudio;
}

export async function POST(request: NextRequest) {
  try {
    const { text, personaName, voiceOverride } = (await request.json()) as {
      text?: string;
      personaName?: string;
      voiceOverride?: string;
    };

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided for audio synthesis" }, { status: 400 });
    }

    const resultAudio = await synthesizeStudentSpeech(text, personaName, voiceOverride);

    if (!resultAudio) {
      return NextResponse.json({ error: "Failed to synthesize audio" }, { status: 500 });
    }

    return new NextResponse(new Uint8Array(resultAudio.buffer), {
      headers: {
        "Content-Type": resultAudio.contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("TTS generation failed:", err);
    return NextResponse.json({ error: "Failed to synthesize audio" }, { status: 500 });
  }
}
