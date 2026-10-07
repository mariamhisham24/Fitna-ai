import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { GuideClient } from "./GuideClient";
import { type Language } from "@/lib/i18n";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "دليل استخدام فِطْنَة | Fitna AI User Guide",
  description: "دليل شامل ومفصل يشرح كل خطوة للتدريب على محاكي فِطنة الذكي للفصول الدراسية.",
};

export default async function GuidePage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value === "en" ? "en" : "ar") as Language;

  const supabase = await createClient();
  let isAuthenticated = false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {}

  return <GuideClient initialLang={lang} isAuthenticated={isAuthenticated} />;
}
