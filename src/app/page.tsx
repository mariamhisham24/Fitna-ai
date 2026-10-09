import { cookies } from "next/headers";
import { HomeClient } from "./HomeClient";
import { type Market } from "@/lib/i18n/types";

export default async function Home() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value === "en" ? "en" : "ar") as "ar" | "en";
  const marketCookie = cookieStore.get("fitna_market")?.value;
  const market = (marketCookie === "sa" || marketCookie === "eg" || marketCookie === "en") ? (marketCookie as Market) : null;

  return <HomeClient initialLang={lang} initialMarket={market} />;
}
