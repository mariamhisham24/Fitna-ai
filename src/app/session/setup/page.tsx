import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DEMO_USER_ID } from "@/lib/auth/demo";
import { SessionSetupForm } from "./SessionSetupForm";

const FALLBACK_TOPICS = [
  { id: "f7a3f81e-1111-4000-8000-000000000001", title_ar: "تغير المناخ والاحتباس الحراري (Climate Change)", title_en: "Climate Change & Global Warming" },
  { id: "f7a3f81e-2222-4000-8000-000000000002", title_ar: "الكسور والأعداد ومقارنتها", title_en: "Fractions & Number Comparison" },
  { id: "f7a3f81e-3333-4000-8000-000000000003", title_ar: "إدارة الصف والتفاعل الصفي", title_en: "Classroom Management & Dynamics" },
  { id: "f7a3f81e-4444-4000-8000-000000000004", title_ar: "العلوم والتجربة والاستنتاج", title_en: "Science & Scientific Inquiry" },
];

const FALLBACK_PERSONAS = [
  { id: "p-sara", name: "سارة", age: 10, base_attention: 88, strengths: ["متفوقة ومنظمة"], weaknesses: ["حساسة للمقاطعة"] },
  { id: "p-yassin", name: "ياسين", age: 10, base_attention: 75, strengths: ["مجتهد وعملي"], weaknesses: ["مفاهيم ملتبسة أحياناً"] },
  { id: "p-omar", name: "عمر", age: 10, base_attention: 65, strengths: ["نشيط ومتحمس"], weaknesses: ["تشتت الانتباه بسرعة"] },
  { id: "p-nour", name: "نور", age: 9, base_attention: 50, strengths: ["هادئة وتفكر بعمق"], weaknesses: ["خجولة وتحتاج تشجيع"] },
];

async function withTimeout<T>(promise: PromiseLike<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]).catch(() => fallback);
}

export default async function SessionSetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isDemo = user.id === DEMO_USER_ID;

  let role = isDemo ? "teacher" : null;
  if (!role) {
    const profileRes = await withTimeout(
      supabase.from("users").select("role").eq("id", user.id).single(),
      2000,
      { data: null, error: null }
    );
    role = profileRes.data?.role ?? null;
  }

  // Defense in depth: the middleware already blocks non-teachers from
  // /session/*, but this page also refuses to render for them directly.
  if (role !== "teacher") redirect("/unauthorized");

  const topicsRes = await withTimeout(
    supabase.from("lesson_topics").select("id, title_ar, title_en").order("title_ar"),
    2000,
    { data: null, error: null }
  );

  const personasRes = await withTimeout(
    supabase.from("student_personas").select("id, name, age, base_attention, strengths, weaknesses").order("name"),
    2000,
    { data: null, error: null }
  );

  const topics = topicsRes.data && topicsRes.data.length > 0 ? topicsRes.data : FALLBACK_TOPICS;
  const personas = personasRes.data && personasRes.data.length > 0 ? personasRes.data : FALLBACK_PERSONAS;

  return (
    <SessionSetupForm
      topics={topics}
      personas={personas}
    />
  );
}
