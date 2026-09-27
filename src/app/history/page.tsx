import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type Language } from "@/lib/i18n";
import { HistoryClient } from "./HistoryClient";

const PAGE_SIZE = 10;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value === "en" ? "en" : "ar") as Language;
  const isEn = lang === "en";

  const supabase = await createClient();
  let user: any = null;
  try {
    const userRes = await supabase.auth.getUser();
    user = userRes?.data?.user ?? null;
  } catch {}

  if (!user) redirect("/login");

  const db = createAdminClient();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data: sessions,
    count,
  } = await Promise.race([
    db
      .from("sessions")
      .select(
        "id, started_at, duration_minutes, overall_score, teacher_talk_ratio, socratic_question_rate, inclusivity_index, classroom_pattern, topic_id",
        { count: "exact" }
      )
      .eq("teacher_id", user.id)
      .eq("status", "completed")
      .order("started_at", { ascending: false })
      .range(from, to),
    new Promise<{ data: any[]; count: number }>((resolve) =>
      setTimeout(() => resolve({ data: [], count: 0 }), 10000)
    ),
  ]).catch(() => ({ data: [], count: 0 }));

  const topicIds = [...new Set((sessions ?? []).map((s) => s.topic_id).filter(Boolean))] as string[];
  const { data: topics } = topicIds.length
    ? await db.from("lesson_topics").select("id, title_ar, title_en").in("id", topicIds)
    : { data: [] as { id: string; title_ar: string; title_en: string | null }[] };

  const mappedSessions = (sessions ?? []).map((s) => {
    const topic = topics?.find((t) => t.id === s.topic_id);
    const title = topic
      ? lang === "en" && topic.title_en
        ? topic.title_en
        : topic.title_ar
      : null;
    return {
      ...s,
      topic_title: title,
    };
  });

  return (
    <HistoryClient
      sessions={mappedSessions}
      totalCount={count ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      lang={lang}
    />
  );
}
