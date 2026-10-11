import { callGroqWithFallback, CHAT_MODEL } from "@/lib/ai/groq";
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
  market?: "eg" | "sa" | "en";
}): Promise<GeneratedReport> {
  const { events, personaNameById, metrics, lessonContext, market = "eg" } = params;

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

  const isEn = market === "en";
  const isSa = market === "sa";

  const transcriptLines = sortedEvents
    .filter((e) => e.event_type === "teacher_utterance" || e.event_type === "student_response")
    .map((e) => {
      const speaker = e.actor === "teacher" ? (isEn ? "Teacher" : "المعلم") : personaNameById.get(e.actor) ?? e.actor;
      return `[${e.id}] (${e.occurred_at_ms}ms) ${speaker}: ${e.content}`;
    })
    .join("\n");

  if (!transcriptLines) {
    if (isEn) {
      return {
        summaryAr: "This session ended without recorded dialogue between the teacher and students.",
        sessionSignalAr: "Please speak with students through your microphone so the system can evaluate your teaching performance.",
        strengths: [],
        weaknesses: [],
        recommendations: ["Start a new session and use the microphone to interact with students via live voice."],
        evidenceMoments: [],
        frameworkScores: null,
      };
    }
    if (isSa) {
      return {
        summaryAr: "انتهت هذه الجلسة دون تسجيل أي حوار بين المعلم والطلاب.",
        sessionSignalAr: "يُرجى التحدث مع الطلاب عبر الميكروفون ليتمكن النظام من تحليل أدائك التدريسي.",
        strengths: [],
        weaknesses: [],
        recommendations: ["ابدأ جلسة جديدة واستخدم الميكروفون للتفاعل الصوتي المباشر مع الطلاب."],
        evidenceMoments: [],
        frameworkScores: null,
      };
    }
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

  const systemIntro = isEn
    ? `You are an expert instructional coach and certified master pedagogical evaluator analyzing a teacher's performance in a classroom simulation according to international frameworks (Danielson Framework & CLASS Framework). Analyze the complete transcript and performance metrics with pedagogical rigor in clear, professional American English.`
    : isSa
    ? `أنت خبير تدريب معلمين ومُقيّم تربوي معتمد تحلل أداء معلم في محاكاة فصل دراسي في المملكة العربية السعودية وفقًا لأطر التقييم التربوي العالمية (Danielson Framework & CLASS Framework). اقرأ النص الكامل للجلسة التي تمت فعليًا وحلله تحليلاً بيداغوجياً دقيقاً باللغة العربية الفصحى المهنية الرصينة.`
    : `انت خبير تدريب معلمين ومقيم تربوي معتمد بتحلل أداء معلم في محاكاة فصل دراسي مصري وفقًا لأطر التقييم التربوي العالمية (Danielson Framework & CLASS Framework). اقرا النص الكامل للجلسة اللي حصلت فعليًا وحلله.`;

  const calculatedNumbersIntro = isEn
    ? `Real calculated metrics for this session:
- Overall Score: ${metrics.overallScore}/100
- Teacher Talk Time (TTT): ${metrics.teacherTalkRatio}% (Target: 20-35%, max acceptable 50%)
- Socratic Questioning Rate: ${metrics.socraticQuestionRate}%
- Inclusivity Index: ${metrics.inclusivityIndex}%
- Classroom Dynamic Pattern: ${metrics.classroomPattern}`
    : isSa
    ? `البيانات والمؤشرات المحسوبة فعليًا لهذه الجلسة:
- الدرجة الكلية: ${metrics.overallScore}/100
- نسبة حديث المعلم (TTT): ${metrics.teacherTalkRatio}% (المعيار المستهدف: 20-35%، وأقصى حد مقبول 50%)
- نسبة الأسئلة السقراطية المفتوحة: ${metrics.socraticQuestionRate}%
- مؤشر الشمولية وعدالة المشاركة: ${metrics.inclusivityIndex}%
- نمط الفصل: ${metrics.classroomPattern}`
    : `الأرقام المحسوبة فعليًا من الجلسة دي:
- الدرجة الكلية: ${metrics.overallScore}/100
- نسبة حديث المعلم (TTT): ${metrics.teacherTalkRatio}% (المعيار المستهدف: 20-35%، وأقصى حد مقبول 50%)
- نسبة الأسئلة السقراطية المفتوحة: ${metrics.socraticQuestionRate}%
- مؤشر الشمولية وعدالة المشاركة: ${metrics.inclusivityIndex}%
- نمط الفصل: ${metrics.classroomPattern}`;

  const rulesConsistencyIntro = isEn
    ? `Strict Metric Consistency Rules:
1. Teacher Talk Time (${metrics.teacherTalkRatio}%):
${
  metrics.teacherTalkRatio > 50
    ? `   [CRITICAL WARNING]: High Teacher Talk Time (${metrics.teacherTalkRatio}%). The teacher exceeded the 50% threshold and dominated class dialogue! You MUST explicitly criticize high talk time in summary_ar and session_signal_ar, list high teacher monologue in weaknesses, and recommend Wait Time (3-5 seconds) in recommendations.`
    : `   - Balanced Teacher Talk Time (${metrics.teacherTalkRatio}%).`
}
2. Socratic Questions (${metrics.socraticQuestionRate}%):
${
  metrics.socraticQuestionRate < 50
    ? `   - Socratic questioning rate is low (${metrics.socraticQuestionRate}%). Advise the teacher to replace rapid direct questions with higher-order inquiry ("why", "how do you explain", "what if").`
    : `   - Socratic questioning rate is good (${metrics.socraticQuestionRate}%).`
}
3. Inclusivity (${metrics.inclusivityIndex}%):
${
  metrics.inclusivityIndex < 70
    ? `   - Inclusivity index is low (${metrics.inclusivityIndex}%). Highlight that participation was clustered on one or two students while others were passive.`
    : `   - Inclusivity index is solid (${metrics.inclusivityIndex}%).`
}`
    : isSa
    ? `قواعد الاتساق البيداغوجي الإلزامية (Strict Metric Consistency):
1. وقت حديث المعلم (${metrics.teacherTalkRatio}%):
${
  metrics.teacherTalkRatio > 50
    ? `   [تحذير حرج]: نسبة حديث المعلم مرتفعة (${metrics.teacherTalkRatio}%). المعلم تجاوز الحد المقبول (20-35%، حد أقصى 50%) وقلل فرص استنتاج وتعبير الطلاب!
   - يُمنع منعاً باتاً الثناء غير المبرر أو استخدام كلمات مثل "ممتاز" أو "أداء استثنائي" في summary_ar أو session_signal_ar دون نقد صريح لاستحواذه على وقت الحصة.
   - إلزامي في summary_ar و session_signal_ar: التأكيد على أن وقت حديث المعلم مرتفع (${metrics.teacherTalkRatio}%) ويحتاج لتقليص لمنح الطلاب وقتاً كافياً للإجابة والمناقشة.
   - إلزامي في weaknesses: ذكر ارتفاع نسبة حديث المعلم (${metrics.teacherTalkRatio}%) وهيمنته على الحصة وغياب فترات التفكير.
   - إلزامي في recommendations: التوصية بمنح الطلاب وقفة تفكير (Wait Time) لمدة 3-5 ثوانٍ بعد طرح السؤال.`
    : `   - نسبة حديث المعلم متوازنة (${metrics.teacherTalkRatio}%).`
}
2. الأسئلة السقراطية (${metrics.socraticQuestionRate}%):
${
  metrics.socraticQuestionRate < 50
    ? `   - نسبة الأسئلة السقراطية منخفضة (${metrics.socraticQuestionRate}%). نبّه المعلم إلى كثرة الأسئلة المباشرة المغلقة، واقترح أسئلة تحفيزية تبدأ بـ "لماذا" و"ماذا لو".`
    : `   - نسبة الأسئلة السقراطية جيدة (${metrics.socraticQuestionRate}%). يجب التأكيد على منح الطلاب وقتاً لشرح استنتاجاتهم.`
}
3. الشمولية (${metrics.inclusivityIndex}%):
${
  metrics.inclusivityIndex < 70
    ? `   - مؤشر الشمولية منخفض (${metrics.inclusivityIndex}%). أشر إلى اقتصار المشاركة على طالب أو اثنين وتجاهل باقي الفصل.`
    : `   - مؤشر الشمولية جيد (${metrics.inclusivityIndex}%).`
}`
    : `قواعد الاتساق البيداغوجي الإلزامية (Strict Metric Consistency):
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
}`;

  const jsonInstructions = isEn
    ? `Write a genuine pedagogical assessment strictly in American English, and return valid JSON with this exact schema:
{
  "summary_ar": "Concise 2-4 sentence diagnostic summary of the teacher's classroom performance in professional English, tightly grounded in actual metrics and dialogue",
  "session_signal_ar": "One impactful, single-sentence diagnostic headline in English summarizing the primary growth area or core strength aligned with the metrics",
  "strengths": ["Specific strength 1 with evidence from dialogue in English", "Specific strength 2 in English"],
  "weaknesses": ["Specific area for growth 1 with evidence from dialogue in English", "Specific area for growth 2 in English"],
  "recommendations": ["Actionable recommendation 1 for next session in English", "Recommendation 2 in English", "Recommendation 3 in English"],
  "evidence_moments": [
    {"event_id": "exact event_id from transcript above", "label": "Short description in English of why this moment matters"}
  ],
  "framework_scores": {
    "danielson": {
      "questioning_discussion": {"score": 3, "label": "Proficient", "feedback": "Specific feedback in English"},
      "student_engagement": {"score": 3, "label": "Proficient", "feedback": "Specific feedback in English"},
      "managing_behavior": {"score": 3, "label": "Proficient", "feedback": "Specific feedback in English"}
    },
    "class_framework": {
      "instructional_support": {"score": 5, "label": "Mid-High", "feedback": "Specific feedback in English"},
      "classroom_organization": {"score": 5, "label": "Mid-High", "feedback": "Specific feedback in English"},
      "emotional_support": {"score": 6, "label": "High", "feedback": "Specific feedback in English"}
    }
  }
}

CRITICAL RULES:
- Write ALL text values in clear, professional American English.
- NEVER write 'event_id' or UUID strings inside summary, signal, strengths, weaknesses, recommendations, or feedback.
- Danielson scales 1 to 4 (1: Unsatisfactory, 2: Basic, 3: Proficient, 4: Distinguished).
- CLASS scales 1 to 7 (1-2: Low, 3-5: Mid, 6-7: High).
- Return ONLY the raw JSON object without markdown fences.`
    : isSa
    ? `اكتب تحليلاً حقيقياً ومبنياً على هذا النص تحديداً والأرقام أعلاه بدقة تامة باللغة العربية الفصحى الرصينة (دون أي عامية)، ورجّع JSON بالشكل التالي تحديداً:
{
  "summary_ar": "ملخص أداء المعلم في هذه الجلسة في 2-4 جمل فصحى رصينة، مبني على الأرقام الحقيقية وما جرى فعلياً في النص",
  "session_signal_ar": "جملة واحدة قصيرة وقوية بالفصحى تلخص أهم نقطة تحتاج تحسيناً أو ميزة رئيسية في هذه الجلسة متسقة مع الأرقام",
  "strengths": ["نقطة قوة 1 محددة بأمثلة من النص بالفصحى", "نقطة قوة 2 بالفصحى"],
  "weaknesses": ["نقطة تحتاج تحسيناً 1 محددة بأمثلة من النص بالفصحى", "نقطة تحتاج تحسيناً 2 بالفصحى"],
  "recommendations": ["توصية 1 محددة وقابلة للتطبيق في الجلسة القادمة بالفصحى", "توصية 2", "توصية 3"],
  "evidence_moments": [
    {"event_id": "استخدم event_id بالظبط من النص أعلاه", "label": "وصف قصير بالفصحى لأهمية هذه اللحظة"}
  ],
  "framework_scores": {
    "danielson": {
      "questioning_discussion": {"score": 3, "label": "كفء", "feedback": "ملاحظة محددة بالفصحى حول تقنيات طرح الأسئلة والنقاش"},
      "student_engagement": {"score": 3, "label": "كفء", "feedback": "ملاحظة بالفصحى حول إشراك الطلاب وتحفيزهم"},
      "managing_behavior": {"score": 3, "label": "كفء", "feedback": "ملاحظة بالفصحى حول إدارة الفصل وإعادة التوجيه"}
    },
    "class_framework": {
      "instructional_support": {"score": 5, "label": "متوسط-مرتفع", "feedback": "ملاحظة بالفصحى حول جودة الدعم التعليمي وتطوير المفاهيم"},
      "classroom_organization": {"score": 5, "label": "متوسط-مرتفع", "feedback": "ملاحظة بالفصحى حول تنظيم الوقت وإدارة الفصل"},
      "emotional_support": {"score": 6, "label": "مرتفع", "feedback": "ملاحظة بالفصحى حول المناخ الإيجابي والتشجيع"}
    }
  }
}

ملاحظات وقواعد هامة جداً:
- يجب كتابة كل النصوص باللغة العربية الفصحى المهنية السليمة.
- ممنوع منعاً باتاً كتابة أو ذكر كلمة "event_id" أو معرّفات UUID نهائياً داخل نصوص "summary_ar" أو "session_signal_ar" أو "strengths" أو "weaknesses" أو "recommendations" أو "feedback".
- حقل "event_id" مخصص حصرياً كقيمة تقنية داخل مصفوفة "evidence_moments".
- اذكر الأمثلة بأسلوب لغوي تربوي طبيعي (مثال: "عند شرح قانون الجاذبية" أو "عند سؤال سارة عن...") بدون وضع أي event_id.
- معيار Danielson يقيم من 1 إلى 4 (1: غير مرضٍ، 2: أساسي، 3: كفء، 4: متميز).
- معيار CLASS يقيم من 1 إلى 7 (1-2: منخفض، 3-5: متوسط، 6-7: مرتفع).
- اختار 3 إلى 5 لحظات فعلية من النص (evidence_moments) باستخدام event_id الحقيقي بالظبط.
- اكتب 2-3 نقاط في strengths و2-3 نقاط في weaknesses، كل نقطة جملة واحدة قصيرة ومحددة.
رد بـ JSON فقط دون أي نص إضافي.`
    : `اكتب تحليل حقيقي ومبني على النص ده بالتحديد والأرقام أعلاه بدقة (مش نصائح عامة)، ورجّع JSON بالشكل ده بالظبط:
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

  const prompt = `${systemIntro}

${lessonContext ? `محتوى الدرس: "${lessonContext.slice(0, 500)}"\n` : ""}${calculatedNumbersIntro}

${rulesConsistencyIntro}

نص الجلسة الكامل (كل سطر معاه [event_id] بالظبط):
"""
${transcriptLines}
"""

${jsonInstructions}`;

  let raw = "{}";
  try {
    const completion = await callGroqWithFallback({
      model: CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 3500,
      response_format: { type: "json_object" },
    });
    raw = completion.choices[0]?.message?.content ?? "{}";
  } catch (llmErr) {
    console.error("All LLM providers failed for session report, constructing robust analytical report:", llmErr);
  }

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
  let evidenceMoments = (parsed.evidence_moments ?? [])
    .map((m) => {
      const event = m.event_id ? eventById.get(m.event_id) : undefined;
      if (!event || !m.label) return null;
      return { eventId: event.id, label: cleanPedagogicalText(m.label), timestampMs: event.occurred_at_ms };
    })
    .filter((m): m is { eventId: string; label: string; timestampMs: number } => m !== null);

  if (evidenceMoments.length === 0 && events.length > 0) {
    const dialogEvents = events.filter((e) => e.event_type === "teacher_utterance" || e.event_type === "student_response").slice(0, 4);
    evidenceMoments = dialogEvents.map((ev) => ({
      eventId: ev.id,
      label: ev.event_type === "teacher_utterance" ? "سؤال / توجيه بيداغوجي من المعلم" : "مشاركة واستجابة طالب",
      timestampMs: ev.occurred_at_ms || 0,
    }));
  }

  const rawFramework = parsed.framework_scores;
  const isHighTtt = metrics.teacherTalkRatio > 50;
  const isLowSocratic = metrics.socraticQuestionRate < 50;

  // Compute robust framework scores if LLM didn't return them
  const defaultDanielsonQScore = Math.max(1, Math.min(4, Math.round((metrics.socraticQuestionRate / 100) * 3 + 1)));
  const defaultDanielsonEScore = Math.max(1, Math.min(4, Math.round((metrics.inclusivityIndex / 100) * 3 + 1)));
  const defaultDanielsonBScore = Math.max(1, Math.min(4, Math.round((100 - Math.min(100, Math.abs(metrics.teacherTalkRatio - 35) * 1.5)) / 25)));

  const defaultClassIScore = Math.max(1, Math.min(7, Math.round((metrics.socraticQuestionRate / 100) * 6 + 1)));
  const defaultClassOScore = Math.max(1, Math.min(7, Math.round((metrics.inclusivityIndex / 100) * 6 + 1)));
  const defaultClassEScore = Math.max(1, Math.min(7, Math.round((metrics.overallScore / 100) * 6 + 1)));

  const getDanielsonLabel = (s: number) =>
    isEn
      ? (s >= 4 ? "Distinguished" : s >= 3 ? "Proficient" : s >= 2 ? "Basic" : "Unsatisfactory")
      : (s >= 4 ? "متميز" : s >= 3 ? "كفء" : s >= 2 ? "أساسي" : "غير مرضٍ");

  const getClassLabel = (s: number) =>
    isEn
      ? (s >= 6 ? "High" : s >= 3 ? "Mid" : "Low")
      : (s >= 6 ? "مرتفع" : s >= 3 ? "متوسط" : "منخفض");

  const frameworkScores: FrameworkScores = {
    danielson: {
      questioningDiscussion: {
        score: rawFramework?.danielson?.questioning_discussion?.score ?? defaultDanielsonQScore,
        label: rawFramework?.danielson?.questioning_discussion?.label ?? getDanielsonLabel(defaultDanielsonQScore),
        feedback: cleanPedagogicalText(rawFramework?.danielson?.questioning_discussion?.feedback ?? (
          isEn
            ? (isLowSocratic
                ? `Socratic questioning rate (${metrics.socraticQuestionRate}%) requires greater emphasis on higher-order thinking inquiry.`
                : `Balanced questioning techniques with a ${metrics.socraticQuestionRate}% Socratic questioning rate.`)
            : (isLowSocratic
                ? `نسبة الأسئلة السقراطية (${metrics.socraticQuestionRate}%) تتطلب تركيزاً أكبر على أسئلة التفكير العليا.`
                : `طرح متوازن للأسئلة مع نسبة سقراطية بلغت ${metrics.socraticQuestionRate}%.`)
        )),
      },
      studentEngagement: {
        score: rawFramework?.danielson?.student_engagement?.score ?? defaultDanielsonEScore,
        label: rawFramework?.danielson?.student_engagement?.label ?? getDanielsonLabel(defaultDanielsonEScore),
        feedback: cleanPedagogicalText(rawFramework?.danielson?.student_engagement?.feedback ?? (
          isEn
            ? `Inclusivity index of ${metrics.inclusivityIndex}% reflects student engagement and active participation level.`
            : `مؤشر شمولية بمعدل ${metrics.inclusivityIndex}% يعكس مستوى مشاركة الطلاب وتفاعلهم.`
        )),
      },
      managingBehavior: {
        score: rawFramework?.danielson?.managing_behavior?.score ?? defaultDanielsonBScore,
        label: rawFramework?.danielson?.managing_behavior?.label ?? getDanielsonLabel(defaultDanielsonBScore),
        feedback: cleanPedagogicalText(rawFramework?.danielson?.managing_behavior?.feedback ?? (
          isEn
            ? `Classroom management handled with a ${metrics.classroomPattern} pattern and active facilitation.`
            : `إدارة الفصل والسلوك بنمط ${metrics.classroomPattern} وتوزيع الأدوار.`
        )),
      },
    },
    classFramework: {
      instructionalSupport: {
        score: rawFramework?.class_framework?.instructional_support?.score ?? defaultClassIScore,
        label: rawFramework?.class_framework?.instructional_support?.label ?? getClassLabel(defaultClassIScore),
        feedback: cleanPedagogicalText(rawFramework?.class_framework?.instructional_support?.feedback ?? (
          isEn
            ? `Instructional support and concept scaffolding correlated with a Teacher Talk Time of ${metrics.teacherTalkRatio}%.`
            : `الدعم التعليمي وبناء المفاهيم ارتبط بنسبة حديث بلغت ${metrics.teacherTalkRatio}%.`
        )),
      },
      classroomOrganization: {
        score: rawFramework?.class_framework?.classroom_organization?.score ?? defaultClassOScore,
        label: rawFramework?.class_framework?.classroom_organization?.label ?? getClassLabel(defaultClassOScore),
        feedback: cleanPedagogicalText(rawFramework?.class_framework?.classroom_organization?.feedback ?? (
          isEn
            ? `Learning environment structure and equal participation opportunities achieved an inclusivity score of ${metrics.inclusivityIndex}%.`
            : `تنظيم بيئة التعلم وإتاحة الفرص بالتساوي بين الطلاب بمؤشر شمولية ${metrics.inclusivityIndex}%.`
        )),
      },
      emotionalSupport: {
        score: rawFramework?.class_framework?.emotional_support?.score ?? defaultClassEScore,
        label: rawFramework?.class_framework?.emotional_support?.label ?? getClassLabel(defaultClassEScore),
        feedback: cleanPedagogicalText(rawFramework?.class_framework?.emotional_support?.feedback ?? (
          isEn
            ? "Positive classroom climate and responsive verbal connection maintained with students."
            : "المناخ الصفي الإيجابي والتواصل الفعّال مع الطلاب."
        )),
      },
    },
  };

  let summaryAr = cleanPedagogicalText(
    parsed.summary_ar ||
      (isEn
        ? `This session demonstrated classroom instruction with an inclusivity index of ${metrics.inclusivityIndex}%, Teacher Talk Time of ${metrics.teacherTalkRatio}%, and a Socratic questioning rate of ${metrics.socraticQuestionRate}%. ${
            isHighTtt
              ? "The teacher dominated talk time for most of the lesson, limiting students' inquiry and reasoning opportunities."
              : "The session maintained a balanced instructional exchange across students."
          }`
        : `شهدت هذه الجلسة تفاعلاً تعليمياً بمؤشر شمولية بلغ ${metrics.inclusivityIndex}%، ونسبة حديث معلّم ${metrics.teacherTalkRatio}% مع نسبة أسئلة سقراطية ${metrics.socraticQuestionRate}%. ${
            isHighTtt
              ? "يُلاحظ استحواذ المعلم على مساحة الحديث معظم وقت الحصة مما قلل من فرص استنتاج الطلاب."
              : "أظهرت الحصة توازناً جيداً في توزيع الأدوار والمشاركات الصفية."
          }`)
  );

  let sessionSignalAr = cleanPedagogicalText(
    parsed.session_signal_ar ||
      (isEn
        ? (isHighTtt
            ? `High Teacher Talk Time (${metrics.teacherTalkRatio}%) exceeded the benchmark (20-35%); focus on giving students sufficient wait time to formulate answers independently.`
            : isLowSocratic
            ? `Increase higher-order Socratic questioning (current rate: ${metrics.socraticQuestionRate}%) to promote analytical reasoning.`
            : "Balanced pedagogical management and consistent student engagement across the classroom.")
        : isHighTtt
        ? `وقت حديث المعلم مرتفع (${metrics.teacherTalkRatio}%) مقارنة بالمستهدف (20-35%)؛ ركّز على منح الطلاب وقتاً أطول للتفكير والإجابة بشكل مستقل.`
        : isLowSocratic
        ? `احرص على زيادة وتيرة الأسئلة السقراطية الاستنتاجية (المعدل الحالي: ${metrics.socraticQuestionRate}%) لتحفيز التفكير التحليلي.`
        : "أداء متوازن ومميز في إدارة التفاعل الصفي والشمولية بين الطلاب.")
  );

  let strengths = Array.isArray(parsed.strengths) && parsed.strengths.length > 0
    ? parsed.strengths.filter(Boolean).map(cleanPedagogicalText).filter(Boolean)
    : isEn
    ? [
        `Achieved a classroom inclusivity index of ${metrics.inclusivityIndex}% with equitable participation.`,
        "Maintained positive classroom momentum and direct communication throughout the session.",
      ]
    : [
        `تحقيق مؤشر شمولية صفية ومشاركة عادلة بنسبة ${metrics.inclusivityIndex}% بين الطلاب.`,
        "الحفاظ على وتيرة التفاعل والتواصل المباشر مع أفراد الفصل طوال الجلسة.",
      ];

  let weaknesses = Array.isArray(parsed.weaknesses) && parsed.weaknesses.length > 0
    ? parsed.weaknesses.filter(Boolean).map(cleanPedagogicalText).filter(Boolean)
    : isEn
    ? (isHighTtt
        ? [
            `Teacher Talk Time (${metrics.teacherTalkRatio}%) exceeded balanced target benchmark (20-35%).`,
            "Limited wait time provided for students before teacher intervention or answers.",
          ]
        : [
            "Incorporate more varied, open-ended questions to deepen student inquiry.",
          ])
    : isHighTtt
    ? [
        `ارتفاع نسبة حديث المعلم (${metrics.teacherTalkRatio}%) عن النطاق المتوازن (20-35%).`,
        "قلة فترات الانتظار والتفكير الممنوحة للطلاب قبل تقديم الإجابة أو التدخل.",
      ]
    : [
        "الحاجة إلى تنويع أنماط الأسئلة لتشمل أسئلة استنتاجية أكثر عمقاً.",
      ];

  let recommendations = Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
    ? parsed.recommendations.filter(Boolean).map(cleanPedagogicalText).filter(Boolean)
    : isEn
    ? [
        "Pose an open-ended inquiry question starting with 'Why' or 'How' and pause for 3-5 seconds (Wait Time).",
        "Encourage students to build upon each other's responses to foster a collaborative discourse.",
      ]
    : [
        "اطرح سؤالاً استنتاجياً يبدأ بـ 'ماذا لو' أو 'كيف تفسر' وانتظر 3-5 ثوانٍ قبل التحدث.",
        "شجع الطلاب على البناء على إجابات بعضهم البعض لخلق حوار صفي تشاركي.",
      ];

  // Deterministic Safeguard: When TTT > 50%, ensure sessionSignal, weaknesses, and recommendations strictly reflect high TTT
  if (isHighTtt) {
    if (!sessionSignalAr || /ممتاز|أداء\s*استثنائي|رائع\s*جداً|excellent|outstanding/i.test(sessionSignalAr)) {
      sessionSignalAr = isEn
        ? `High Teacher Talk Time (${metrics.teacherTalkRatio}%) exceeded the benchmark (20-35%); prioritize giving students more room to think and respond.`
        : `وقت حديث المعلم مرتفع (${metrics.teacherTalkRatio}%) مقارنة بالمستهدف (20-35%)؛ ركّز على منح الطلاب مساحة أطول للتفكير والإجابة.`;
    }
    const hasTttWeakness = weaknesses.some((w) => /حديث\s*المعلم|وقت|الكلام|monologue|talk time|ttt/i.test(w));
    if (!hasTttWeakness) {
      weaknesses.unshift(
        isEn
          ? `High Teacher Talk Time (${metrics.teacherTalkRatio}%) exceeded target range (20-35%), reducing student explanation time.`
          : `ارتفاع نسبة حديث المعلم (${metrics.teacherTalkRatio}%) عن النطاق المتوازن (20-35%)، مما حدّ من فرص الطلاب في التعبير والشرح.`
      );
    }
    const hasWaitTimeRec = recommendations.some((r) => /انتظار|وقفة|ثوان|wait/i.test(r));
    if (!hasWaitTimeRec) {
      recommendations.unshift(
        isEn
          ? "Provide 3-5 seconds of deliberate Wait Time after asking questions before intervening."
          : "امنح الطلاب وقفة تفكير (Wait Time) لمدة 3-5 ثوانٍ بعد طرح السؤال قبل التدخل أو إعادة الشرح."
      );
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
