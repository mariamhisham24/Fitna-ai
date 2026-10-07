import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AboutClient } from "./AboutClient";
import { type Language } from "@/lib/i18n";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "عن منصة فِطْنَة | About Fitna AI",
  description: "أول فصل افتراضي يتكلم بلهجتك — تدرّب على إدارة الصف قبل ما تدخله.",
};

export default async function AboutPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value === "en" ? "en" : "ar") as Language;

  const supabase = await createClient();
  let isAuthenticated = false;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {}

  return <AboutClient initialLang={lang} isAuthenticated={isAuthenticated} />;
}
