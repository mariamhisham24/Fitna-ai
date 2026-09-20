import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type Language } from "@/lib/i18n";
import { TeacherDashboardClient } from "./TeacherDashboardClient";

async function withTimeout<T>(promise: PromiseLike<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]).catch(() => fallback);
}

export default async function TeacherDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value === "en" ? "en" : "ar") as Language;

  const isDemo = user.id === "e948bbf0-0a93-46dd-9b01-b85f229477dd";

  const profileRes = isDemo
    ? { data: null }
    : await withTimeout(
        supabase
          .from("users")
          .select("full_name, email, teaching_experience, teaching_level, subject, preferred_theme, preferred_language, role")
          .eq("id", user.id)
          .single(),
        2000,
        { data: null, error: null }
      );

  const finalProfile = profileRes.data ?? {
    full_name: "معلم تجريبي (Demo Teacher)",
    email: "demo@fitna.ai",
    teaching_experience: "5-10",
    teaching_level: "المرحلة الإعدادية",
    subject: "العلوم واللغة الإنجليزية",
    preferred_theme: "dark",
    preferred_language: "ar",
    role: "teacher" as const,
  };

  const sessionsRes = await withTimeout(
    supabase
      .from("sessions")
      .select("id, overall_score, teacher_talk_ratio, socratic_question_rate, inclusivity_index, classroom_pattern, started_at, status, topic_id")
      .eq("teacher_id", user.id)
      .eq("status", "completed")
      .order("started_at", { ascending: false })
      .limit(5),
    2000,
    { data: [], error: null }
  );

  const completed = (sessionsRes.data ?? []) as any[];
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum: number, s: any) => sum + (s.overall_score ?? 0), 0) / completed.length
        )
      : null;

  // Fetch topics for display names
  const topicIds = [...new Set(completed.map((s: any) => s.topic_id).filter(Boolean))] as string[];
  const topicsRes = topicIds.length
    ? await withTimeout(
        supabase.from("lesson_topics").select("id, title_ar, title_en").in("id", topicIds),
        2000,
        { data: [] as { id: string; title_ar: string; title_en: string | null }[], error: null }
      )
    : { data: [] as { id: string; title_ar: string; title_en: string | null }[], error: null };

  const topicTitleObj: Record<string, string> = {};
  for (const item of topicsRes.data ?? []) {
    topicTitleObj[item.id] = lang === "en" && item.title_en ? item.title_en : item.title_ar;
  }

  return (
    <TeacherDashboardClient
      profile={finalProfile as any}
      completed={completed}
      avgScore={avgScore}
      topicTitleObj={topicTitleObj}
      lang={lang}
    />
  );
}
