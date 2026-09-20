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
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value === "en" ? "en" : "ar") as Language;
  const isDemoCookie = cookieStore.get("fitna_demo")?.value === "true";

  const finalProfile = {
    full_name: "معلم تجريبي (Demo Teacher)",
    email: "demo@fitna.ai",
    teaching_experience: "5-10",
    teaching_level: "المرحلة الإعدادية",
    subject: "العلوم واللغة الإنجليزية",
    preferred_theme: "dark",
    preferred_language: "ar",
    role: "teacher" as const,
  };

  try {
    const supabase = await createClient();
    let user: any = null;
    try {
      const userRes = await supabase.auth.getUser();
      user = userRes?.data?.user ?? null;
    } catch {}

    // Treat as demo if cookie is set or if unauthenticated
    const isDemo = isDemoCookie || !user;
    const userId = user?.id || "e948bbf0-0a93-46dd-9b01-b85f229477dd";

    let userProfile = finalProfile;
    if (!isDemo && user) {
      try {
        const profileRes = await withTimeout(
          supabase
            .from("users")
            .select("full_name, email, teaching_experience, teaching_level, subject, preferred_theme, preferred_language, role")
            .eq("id", userId)
            .single(),
          2000,
          { data: null, error: null }
        );
        if (profileRes?.data) {
          userProfile = profileRes.data;
        }
      } catch {}
    }

    let completed: any[] = [];
    try {
      const sessionsRes = await withTimeout(
        supabase
          .from("sessions")
          .select("id, overall_score, teacher_talk_ratio, socratic_question_rate, inclusivity_index, classroom_pattern, started_at, status, topic_id")
          .eq("teacher_id", userId)
          .eq("status", "completed")
          .order("started_at", { ascending: false })
          .limit(5),
        2000,
        { data: [], error: null }
      );
      completed = (sessionsRes?.data ?? []) as any[];
    } catch {}

    const avgScore =
      completed.length > 0
        ? Math.round(
            completed.reduce((sum: number, s: any) => sum + (s.overall_score ?? 0), 0) / completed.length
          )
        : null;

    // Fetch topics for display names
    const topicTitleObj: Record<string, string> = {};
    try {
      const topicIds = [...new Set(completed.map((s: any) => s.topic_id).filter(Boolean))] as string[];
      if (topicIds.length) {
        const topicsRes = await withTimeout(
          supabase.from("lesson_topics").select("id, title_ar, title_en").in("id", topicIds),
          2000,
          { data: [] as { id: string; title_ar: string; title_en: string | null }[], error: null }
        );
        for (const item of topicsRes?.data ?? []) {
          topicTitleObj[item.id] = lang === "en" && item.title_en ? item.title_en : item.title_ar;
        }
      }
    } catch {}

    return (
      <TeacherDashboardClient
        profile={userProfile as any}
        completed={completed}
        avgScore={avgScore}
        topicTitleObj={topicTitleObj}
        lang={lang}
      />
    );
  } catch (err) {
    console.error("TeacherDashboardPage render error:", err);
    return (
      <TeacherDashboardClient
        profile={finalProfile as any}
        completed={[]}
        avgScore={null}
        topicTitleObj={{}}
        lang={lang}
      />
    );
  }
}
