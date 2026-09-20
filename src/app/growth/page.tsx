import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type Language } from "@/lib/i18n";
import { GrowthClient } from "./GrowthClient";

export default async function GrowthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value === "en" ? "en" : "ar") as Language;
  const isEn = lang === "en";

  const isDemo = user.id === "e948bbf0-0a93-46dd-9b01-b85f229477dd";

  const profileRes = isDemo
    ? { data: null }
    : await Promise.race([
        supabase.from("users").select("full_name, email").eq("id", user.id).single(),
        new Promise<any>((resolve) => setTimeout(() => resolve({ data: null }), 2000))
      ]).catch(() => ({ data: null }));

  const profile = profileRes.data ?? {
    full_name: "معلم تجريبي (Demo Teacher)",
    email: "demo@fitna.ai",
  };

  const sessionsRes = await Promise.race([
    supabase
      .from("sessions")
      .select("id, started_at, overall_score, teacher_talk_ratio, socratic_question_rate, inclusivity_index, topic_id")
      .eq("teacher_id", user.id)
      .eq("status", "completed")
      .order("started_at", { ascending: true })
      .limit(30),
    new Promise<any>((resolve) => setTimeout(() => resolve({ data: [] }), 2000))
  ]).catch(() => ({ data: [] }));

  const rawSessions = sessionsRes.data ?? [];

  const topicIds = [...new Set((rawSessions ?? []).map((s) => s.topic_id).filter(Boolean))] as string[];
  const topicsRes = topicIds.length
    ? await Promise.race([
        supabase.from("lesson_topics").select("id, title_ar, title_en").in("id", topicIds),
        new Promise<any>((resolve) => setTimeout(() => resolve({ data: [] }), 2000))
      ]).catch(() => ({ data: [] }))
    : { data: [] as { id: string; title_ar: string; title_en: string | null }[] };

  const topics = topicsRes.data ?? [];

  const topicTitleObj: Record<string, string> = {};
  for (const item of topics ?? []) {
    topicTitleObj[item.id] = isEn && item.title_en ? item.title_en : item.title_ar;
  }

  const sessions = (rawSessions ?? []).map((s) => {
    const d = new Date(s.started_at);
    const dateStr = d.toLocaleDateString(isEn ? "en-US" : "ar-EG", { month: "short", day: "numeric", year: "numeric" });
    const fullDateStr = d.toISOString().split("T")[0];
    const topic = (s.topic_id && topicTitleObj[s.topic_id]) || (isEn ? "Classroom Simulation" : "جلسة تدريس تفاعلية");

    return {
      id: s.id,
      startedAt: s.started_at,
      date: dateStr,
      fullDate: fullDateStr,
      overallScore: s.overall_score,
      teacherTalkRatio: s.teacher_talk_ratio,
      socraticQuestionRate: s.socratic_question_rate,
      inclusivityIndex: s.inclusivity_index,
      topicTitle: topic,
    };
  });

  const badgesRes = await Promise.race([
    supabase
      .from("badges")
      .select("badge_key, unlocked_at")
      .eq("user_id", user.id)
      .order("unlocked_at", { ascending: false }),
    new Promise<any>((resolve) => setTimeout(() => resolve({ data: [] }), 2000))
  ]).catch(() => ({ data: [] }));

  const badges = (badgesRes.data ?? []).map((b: any) => ({
    key: b.badge_key,
    unlockedAt: b.unlocked_at,
  }));

  return (
    <GrowthClient
      sessions={sessions}
      profile={profile}
      badges={badges}
      lang={lang}
    />
  );
}
