import { groq, CHAT_MODEL } from "@/lib/ai/groq";
import type { Database } from "@/lib/supabase/types";
import { cleanPedagogicalText } from "@/lib/utils/pedagogy";

type SessionEvent = Database["public"]["Tables"]["session_events"]["Row"];

export type FrameworkScores = {
  danielson: {
    questioningDiscussion: { score: number; label: string; feedback: string };
    studentEngagement: { score: number; label: string; feedback: string };
    managingBehavior: { score: number; label: string; feedback: string };
  };
  classFramework: {
    instructionalSupport: { score: number; label: string; feedback: string };
    classroomOrganization: { score: number; label: string; feedback: string };
    emotionalSupport: { score: number; label: string; feedback: string };
  };
};

export type GeneratedReport = {
  summaryAr: string;
  sessionSignalAr: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  evidenceMoments: { eventId: string; label: string; timestampMs: number }[];
  frameworkScores: FrameworkScores | null;
};

/**
 * Real LLM call: reads the session's ACTUAL transcript (session_events)
 * and the real computed metrics, and writes a genuine, session-specific
 * analysis — spec §Stage 7: "ملخص الأداء" و"إشارة الجلسة" لازم تتولد
 * فعليًا بواسطة LLM بيقرا الـ transcript كامل، plus pedagogical framework
 * scoring (Danielson & CLASS) for professional evaluation.
 */
export async function generateSessionReport(params: {
  events: SessionEvent[];
  personaNameById: Map<string, string>;
  metrics: {
    overallScore: number;
    teacherTalkRatio: number;
    socraticQuestionRate: number;
    inclusivityIndex: number;
    classroomPattern: string;
  };
  lessonContext: string | null;
}): Promise<GeneratedReport> {
  const { events, personaNameById, metrics, lessonContext } = params;

  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    if (timeA !== timeB) return timeA - timeB;
    if (a.occurred_at_ms !== b.occurred_at_ms && Math.abs(a.occurred_at_ms - b.occurred_at_ms) > 5) {
      return a.occurred_at_ms - b.occurred_at_ms;
    }
    if (a.event_type === "teacher_utterance" && b.event_type !== "teacher_utterance") return -1;
    if (b.event_type === "teacher_utterance" && a.event_type !== "teacher_utterance") return 1;
    return 0;
  });

  const transcriptLines = sortedEvents
    .filter((e) => e.event_type === "teacher_utterance" || e.event_type === "student_response")
    .map((e) => {
      const speaker = e.actor === "teacher" ? "المعلم" : personaNameById.get(e.actor) ?? e.actor;
      return `[${e.id}] (${e.occurred_at_ms}ms) ${speaker}: ${e.content}`;
    })
    .join("\n");

  if (!transcriptLines) {
    return {
      summaryAr: "الجلسة دي انتهت من غير أي حوار مسجّل بين المعلم والطلاب.",
      sessionSignalAr: "لسه محتاج تتكلم فعليًا مع الطلاب عشان نقدر نحلل أداءك.",
      strengths: [],
      weaknesses: [],
      recommendations: ["ابدأ جلسة جديدة واستخدم المايك عشان تتكلم مع الطلاب فعليًا."],
      evidenceMoments: [],
      frameworkScores: null,
    };
  }

  const prompt = `انت خبير تدريب معلمين ومقيم تربوي معتمد بتحلل أداء معلم في محاكاة فصل دراسي مصري وفقًا لأطر التقييم التربوي العالمية (Danielson Framework & CLASS Framework). اقرا النص الكامل للجلسة اللي حصلت فعليًا وحلله.

${lessonContext ? `محتوى الدرس: "${lessonContext.slice(0, 500)}"\n` : ""}
الأرقام المحسوبة فعليًا من الجلسة دي:
- الدرجة الكلية: ${metrics.overallScore}/100
- نسبة حديث المعلم (TTT): ${metrics.teacherTalkRatio}% (المعيار المستهدف: 20-35%، وأقصى حد مقبول 50%)
- نسبة الأسئلة السقراطية المفتوحة: ${metrics.socraticQuestionRate}%
- مؤشر الشمولية وعدالة المشاركة: ${metrics.inclusivityIndex}%
- نمط الفصل: ${metrics.classroomPattern}

قواعد الاتساق البيداغوجي الإلزامية (Strict Metric Consistency):
1. وقت حديث المعلم (${metrics.teacherTalkRatio}%):
${
  metrics.teacherTalkRatio > 50
    ? `   [تحذير حرج]: نسبة حديث المعلم مرتفعة (${metrics.teacherTalkRatio}%). المعلم تجاوز الحد المقبول (20-35%، حد أقصى 50%) وقلل فرص الطلاب!
   - ممنوع منعاً باتاً الثناء الأعمى أو استخدام كلمات مثل "ممتاز" أو "أداء استثنائي" في summary_ar أو session_signal_ar دون نقد صريح لاستحواذه على الحديث.
   - إلزامي في summary_ar و session_signal_ar: التأكيد على أن وقت حديث المعلم مرتفع (${metrics.teacherTalkRatio}%) ويحتاج لتقليص لمنح الطلاب وقتاً للإجابة والمناقشة.
   - إلزامي في weaknesses: ذكر ارتفاع نسبة حديث المعلم (${metrics.teacherTalkRatio}%) وهيمنته على الحصة وغياب فترات التفكير.
   - إلزامي في recommendations: التوصية بمنح الطلاب وقفة تفكير (Wait Time) لمدة 3-5 ثوانٍ بعد كل سؤال.`
    : `   - نسبة حديث المعلم متوازنة (${metrics.teacherTalkRatio}%).`
}
2. الأسئلة السقراطية (${metrics.socraticQuestionRate}%):
${
  metrics.socraticQuestionRate < 50
    ? `   - نسبة الأسئلة السقراطية منخفضة (${metrics.socraticQuestionRate}%). نبه المعلم إلى كثرة الأسئلة المباشرة المغلقة، واقترح أسئلة تحفيزية تبدأ بـ "ليه" و"ماذا لو".`
    : `   - نسبة الأسئلة السقراطية جيدة (${metrics.socraticQuestionRate}%). يجب التأكيد على منح الطلاب وقتاً لشرح استنتاجاتهم.`
}
3. الشمولية (${metrics.inclusivityIndex}%):
${
  metrics.inclusivityIndex < 70
    ? `   - مؤشر الشمولية منخفض (${metrics.inclusivityIndex}%). أشر إلى اقتصار المشاركة على طالب أو اثنين وتجاهل باقي الفصل.`
    : `   - مؤشر الشمولية جيد (${metrics.inclusivityIndex}%).`
}

نص الجلسة الكامل (كل سطر معاه [event_id] بالظبط):
"""
${transcriptLines}
"""

اكتب تحليل حقيقي ومبني على النص ده بالتحديد والأرقام أعلاه بدقة (مش نصائح عامة)، ورجّع JSON بالشكل ده بالظبط:
{
  "summary_ar": "ملخص أداء المعلم في الجلسة دي في 2-4 جمل، مبني على الأرقام الحقيقية واللي حصل فعليًا في النص",
  "session_signal_ar": "جملة واحدة قصيرة وقوية تلخص أهم نقطة تحتاج تحسين أو ميزة رئيسية في الجلسة دي متسقة مع الأرقام",
  "strengths": ["نقطة قوة 1 محددة بأمثلة من النص", "نقطة قوة 2"],
  "weaknesses": ["نقطة تحتاج تحسين 1 محددة بأمثلة من النص", "نقطة تحتاج تحسين 2"],
  "recommendations": ["توصية 1 محددة وقابلة للتطبيق في الجلسة الجاية", "توصية 2", "توصية 3"],
  "evidence_moments": [
    {"event_id": "استخدم event_id بالظبط من النص فوق", "label": "وصف قصير ليه اللحظة دي مهمة"}
  ],
  "framework_scores": {
    "danielson": {
      "questioning_discussion": {"score": 3, "label": "كفء", "feedback": "ملاحظة محددة حول تقنيات طرح الأسئلة والنقاش"},
      "student_engagement": {"score": 3, "label": "كفء", "feedback": "ملاحظة حول إشراك الطلاب وتحفيزهم"},
      "managing_behavior": {"score": 3, "label": "كفء", "feedback": "ملاحظة حول إدارة الفصل وإعادة التوجيه"}
    },
    "class_framework": {
      "instructional_support": {"score": 5, "label": "متوسط-مرتفع", "feedback": "ملاحظة حول جودة الدعم التعليمي وتطوير المفاهيم"},
      "classroom_organization": {"score": 5, "label": "متوسط-مرتفع", "feedback": "ملاحظة حول تنظيم الوقت وإدارة الفصل"},
      "emotional_support": {"score": 6, "label": "مرتفع", "feedback": "ملاحظة حول المناخ الإيجابي والتشجيع"}
    }
  }
}

ملاحظات وقواعد هامة جداً:
- ممنوع منعاً باتاً كتابة أو ذكر كلمة "event_id" أو معرّفات UUID نهائياً داخل نصوص "summary_ar" أو "session_signal_ar" أو "strengths" أو "weaknesses" أو "recommendations" أو "feedback".
- حقل "event_id" مخصص حصرياً كقيمة تقنية داخل مصفوفة "evidence_moments".
- اذكر الأمثلة بأسلوب لغوي تربوي طبيعي (مثال: "عند شرح قانون الجاذبية" أو "عند سؤال سارة عن...") بدون وضع أي event_id.
- معيار Danielson يقيم من 1 إلى 4 (1: غير مرضٍ، 2: أساسي، 3: كفء، 4: متميز).
- معيار CLASS يقيم من 1 إلى 7 (1-2: منخفض، 3-5: متوسط، 6-7: مرتفع).
- اختار 3 إلى 5 لحظات فعلية من النص (evidence_moments) باستخدام event_id الحقيقي بالظبط.
- اكتب 2-3 نقاط في strengths و2-3 نقاط في weaknesses، كل نقطة جملة واحدة قصيرة ومحددة.
رد بـ JSON بس من غير أي نص زيادة.`;

  const completion = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 1,
    reasoning_effort: "low",
    max_completion_tokens: 3500,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  let parsed: {
    summary_ar?: string;
    session_signal_ar?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    evidence_moments?: { event_id?: string; label?: string }[];
    framework_scores?: {
      danielson?: {
        questioning_discussion?: { score?: number; label?: string; feedback?: string };
        student_engagement?: { score?: number; label?: string; feedback?: string };
        managing_behavior?: { score?: number; label?: string; feedback?: string };
      };
      class_framework?: {
        instructional_support?: { score?: number; label?: string; feedback?: string };
        classroom_organization?: { score?: number; label?: string; feedback?: string };
        emotional_support?: { score?: number; label?: string; feedback?: string };
      };
    };
  };
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse report JSON:", raw, err);
    parsed = {};
  }

  // Ground evidence moments against the REAL event list
  const eventById = new Map(events.map((e) => [e.id, e]));
  const evidenceMoments = (parsed.evidence_moments ?? [])
    .map((m) => {
      const event = m.event_id ? eventById.get(m.event_id) : undefined;
      if (!event || !m.label) return null;
      return { eventId: event.id, label: cleanPedagogicalText(m.label), timestampMs: event.occurred_at_ms };
    })
    .filter((m): m is { eventId: string; label: string; timestampMs: number } => m !== null);

  const rawFramework = parsed.framework_scores;
  const frameworkScores: FrameworkScores | null = rawFramework
    ? {
        danielson: {
          questioningDiscussion: {
            score: rawFramework.danielson?.questioning_discussion?.score ?? 3,
            label: rawFramework.danielson?.questioning_discussion?.label ?? "كفء",
            feedback: cleanPedagogicalText(rawFramework.danielson?.questioning_discussion?.feedback ?? ""),
          },
          studentEngagement: {
            score: rawFramework.danielson?.student_engagement?.score ?? 3,
            label: rawFramework.danielson?.student_engagement?.label ?? "كفء",
            feedback: cleanPedagogicalText(rawFramework.danielson?.student_engagement?.feedback ?? ""),
          },
          managingBehavior: {
            score: rawFramework.danielson?.managing_behavior?.score ?? 3,
            label: rawFramework.danielson?.managing_behavior?.label ?? "كفء",
            feedback: cleanPedagogicalText(rawFramework.danielson?.managing_behavior?.feedback ?? ""),
          },
        },
        classFramework: {
          instructionalSupport: {
            score: rawFramework.class_framework?.instructional_support?.score ?? 5,
            label: rawFramework.class_framework?.instructional_support?.label ?? "متوسط",
            feedback: cleanPedagogicalText(rawFramework.class_framework?.instructional_support?.feedback ?? ""),
          },
          classroomOrganization: {
            score: rawFramework.class_framework?.classroom_organization?.score ?? 5,
            label: rawFramework.class_framework?.classroom_organization?.label ?? "متوسط",
            feedback: cleanPedagogicalText(rawFramework.class_framework?.classroom_organization?.feedback ?? ""),
          },
          emotionalSupport: {
            score: rawFramework.class_framework?.emotional_support?.score ?? 6,
            label: rawFramework.class_framework?.emotional_support?.label ?? "مرتفع",
            feedback: cleanPedagogicalText(rawFramework.class_framework?.emotional_support?.feedback ?? ""),
          },
        },
      }
    : null;

  let summaryAr = cleanPedagogicalText(parsed.summary_ar || "معرفناش نولّد ملخص للجلسة دي، جرب تاني.");
  let sessionSignalAr = cleanPedagogicalText(parsed.session_signal_ar || "");
  let strengths = Array.isArray(parsed.strengths)
    ? parsed.strengths.filter(Boolean).map(cleanPedagogicalText).filter(Boolean)
    : [];
  let weaknesses = Array.isArray(parsed.weaknesses)
    ? parsed.weaknesses.filter(Boolean).map(cleanPedagogicalText).filter(Boolean)
    : [];
  let recommendations = Array.isArray(parsed.recommendations)
    ? parsed.recommendations.filter(Boolean).map(cleanPedagogicalText).filter(Boolean)
    : [];

  // Deterministic Safeguard: When TTT > 50%, ensure sessionSignal, weaknesses, and recommendations strictly reflect high TTT
  if (metrics.teacherTalkRatio > 50) {
    if (!sessionSignalAr || /ممتاز|أداء\s*استثنائي|رائع\s*جداً/i.test(sessionSignalAr)) {
      sessionSignalAr = `وقت حديث المعلم مرتفع (${metrics.teacherTalkRatio}%) مقارنة بالمستهدف (20-35%)؛ ركّز على منح الطلاب مساحة أطول للتفكير والإجابة.`;
    }
    const hasTttWeakness = weaknesses.some((w) => /حديث\s*المعلم|وقت|الكلام|monologue|ttt/i.test(w));
    if (!hasTttWeakness) {
      weaknesses.unshift(`ارتفاع نسبة حديث المعلم (${metrics.teacherTalkRatio}%) عن النطاق المتوازن (20-35%)، مما حدّ من فرص الطلاب في التعبير والشرح.`);
    }
    const hasWaitTimeRec = recommendations.some((r) => /انتظار|وقفة|ثوان|wait/i.test(r));
    if (!hasWaitTimeRec) {
      recommendations.unshift("امنح الطلاب وقفة تفكير (Wait Time) لمدة 3-5 ثوانٍ بعد طرح السؤال قبل التدخل أو إعادة الشرح.");
    }
  }

  return {
    summaryAr,
    sessionSignalAr,
    strengths,
    weaknesses,
    recommendations,
    evidenceMoments,
    frameworkScores,
  };
}
