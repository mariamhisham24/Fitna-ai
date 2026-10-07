import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Creates a real `sessions` row (spec Stage 5: "بدء محاكاة الفصل").
 * teacher_id/institution_id are taken from the authenticated user's own
 * server-verified session — never trusted from the request body — so
 * this can't be used to create a session under someone else's name.
 */
export async function POST(request: NextRequest) {
  try {
    return await handleCreate(request);
  } catch (err) {
    console.error("Session creation crashed:", err);
    return NextResponse.json({ error: "حصل خطأ أثناء إنشاء الجلسة. جرب تاني." }, { status: 500 });
  }
}

import { cookies } from "next/headers";

async function handleCreate(request: NextRequest) {
  const supabase = await createClient();
  let user: any = null;
  try {
    const userRes = await supabase.auth.getUser();
    user = userRes?.data?.user ?? null;
  } catch {}

  if (!user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const db = createAdminClient();
  const { data: profile } = await db
    .from("users")
    .select("role, institution_id")
    .eq("id", user.id)
    .maybeSingle();

  const isTeacher = profile?.role === "teacher";
  const institutionId = profile?.institution_id ?? null;
  const effectiveUserId = user.id;

  // Spec §2.1: institution_admin must not be able to start a simulation
  // from their admin account — enforced server-side, not just hidden UI.
  if (!isTeacher) {
    return NextResponse.json(
      { error: "الحساب ده مش حساب معلم. لازم تعمل حساب معلم منفصل عشان تبدأ محاكاة." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const {
    topicId,
    durationMinutes,
    classroomStyle,
    trainingObjective,
    lessonContext,
    teacherTitle,
    teacherName,
    market: requestedMarket,
  } = body as {
    topicId?: string;
    durationMinutes: number;
    classroomStyle?: "balanced" | "disruptive" | "disengaged";
    trainingObjective?: "socratic_focus" | "talk_time_reduction" | "inclusive_engagement" | "behavior_redirection";
    lessonContext?: string;
    teacherTitle?: "يا مستر" | "يا ميس" | "يا أستاذ" | "يا أستاذة";
    teacherName?: string;
    market?: "eg" | "sa";
  };

  const cookieStore = await cookies();
  const cookieMarket = cookieStore.get("fitna_market")?.value;
  const rawMarket = requestedMarket || cookieMarket;
  const market: "eg" | "sa" = rawMarket === "sa" ? "sa" : "eg";

  if (!durationMinutes || durationMinutes < 10 || durationMinutes > 30) {
    return NextResponse.json({ error: "مدة الجلسة لازم تكون بين 10 و30 دقيقة" }, { status: 400 });
  }

  // Ensure topicId really exists in lesson_topics to prevent FK constraint violations
  let validTopicId: string | null = null;
  if (topicId) {
    try {
      const { data: topicRow } = await supabase
        .from("lesson_topics")
        .select("id")
        .eq("id", topicId)
        .maybeSingle();
      if (topicRow?.id) validTopicId = topicRow.id;
    } catch {}
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      teacher_id: effectiveUserId,
      institution_id: institutionId,
      topic_id: validTopicId,
      lesson_context: lessonContext || null,
      duration_minutes: durationMinutes,
      classroom_style: classroomStyle || "balanced",
      training_objective: trainingObjective || "socratic_focus",
      status: "in_progress",
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    console.error("Session creation failed:", sessionError);
    return NextResponse.json({ error: "حصل خطأ أثناء إنشاء الجلسة" }, { status: 500 });
  }

  // Lock teacher title in session_events at ms 0 so students address the teacher accurately from turn 1
  let cleanName = teacherName ? teacherName.trim() : "";
  // Strip duplicate title if teacher typed "ميس مريم" or "مستر أحمد" or "أستاذة مريم" or "أستاذ أحمد"
  cleanName = cleanName.replace(/^(?:يا\s*)?(?:ميس|مس|مستر|استاذ|أستاذ|أستاذة|استاذة|أبلة|ابلة)\s+/i, "").trim();

  // If the teacher has a female name (e.g. مريم / Mariam), strictly enforce female title!
  const isFemaleTeacher =
    teacherTitle === "يا أستاذة" ||
    teacherTitle === "يا ميس" ||
    /(?:مريم|سارة|فاطمة|نور|منى|هدى|رنا|ياسمين|اية|آية|اماني|أماني|ايمان|إيمان|سلمى|ندى|ريم|شهد|حنين|ملك|ملاك|هاجر|إسراء|اسراء|دعاء|سمر|وفاء|زينب|عائشة|خديجة|maryam|mariam|sara|sarah|fatima|nour)/i.test(cleanName);

  let cleanTitle: string;
  if (market === "sa") {
    cleanTitle = isFemaleTeacher ? "يا أستاذة" : "يا أستاذ";
  } else {
    cleanTitle = isFemaleTeacher ? "يا ميس" : "يا مستر";
  }
  const fullTitle = cleanName ? `${cleanTitle} ${cleanName}` : cleanTitle;

  await supabase.from("session_events").insert({
    session_id: session.id,
    event_type: "session_config",
    actor: "system",
    content: `Teacher title locked: ${fullTitle}`,
    metadata: {
      teacher_title: cleanTitle,
      teacher_name: cleanName,
      full_teacher_title: fullTitle,
      is_female: isFemaleTeacher,
      market,
    },
    occurred_at_ms: 0,
  });

  // Attach the 4 matching student personas (Egyptian or Saudi) to this session with their
  // real base_attention adjusted for the chosen classroom style —
  // this is what the live room (Milestone 3) will animate in real time
  // based on teacher behavior.
  const targetDialect = market === "sa" ? "saudi_arabic" : "egyptian_arabic";
  let { data: personas } = await supabase
    .from("student_personas")
    .select("id, name, base_attention, dialect")
    .eq("dialect", targetDialect);

  if (!personas || personas.length === 0) {
    const { data: fallbackPersonas } = await supabase
      .from("student_personas")
      .select("id, name, base_attention, dialect")
      .limit(4);
    personas = fallbackPersonas;
  }

  if (personas && personas.length > 0) {
    const preferredOrder = market === "sa"
      ? ["ريم", "سلطان", "فهد", "جوري"]
      : ["سارة", "ياسين", "عمر", "نور"];

    personas.sort((a, b) => {
      const ia = preferredOrder.findIndex((n) => (a.name || "").includes(n));
      const ib = preferredOrder.findIndex((n) => (b.name || "").includes(n));
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    const attentionModifier =
      classroomStyle === "disruptive" ? -15 : classroomStyle === "disengaged" ? -20 : 0;

    const rows = personas.map((p) => ({
      session_id: session.id,
      persona_id: p.id,
      final_attention: Math.max(20, Math.min(100, p.base_attention + attentionModifier)),
      times_spoken: 0,
    }));
    const { error: studentsError } = await supabase.from("session_students").insert(rows);
    if (studentsError) {
      console.error("session_students insert failed:", studentsError);
      // Non-fatal: the session exists, but flag it for visibility.
    }
  }

  return NextResponse.json({ sessionId: session.id });
}
