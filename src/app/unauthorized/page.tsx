import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary, type Language } from "@/lib/i18n";
import { ShieldAlert } from "lucide-react";

export default async function UnauthorizedPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value === "en" ? "en" : "ar") as Language;
  const isEn = lang === "en";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F1E8] dark:bg-[#071B3A] p-6 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-1">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-[#071B3A] dark:text-white">
        {isEn ? "Access Unauthorized" : "غير مصرّح لك بالوصول"}
      </h1>
      <p className="text-xs text-[#071B3A]/60 dark:text-white/60 max-w-sm">
        {isEn
          ? "You do not have permission to access this page with your current account role."
          : "مفيش صلاحية عندك تدخل الصفحة دي بحسابك الحالي."}
      </p>
      <Link href="/" className="text-teal-600 dark:text-teal-400 font-bold text-xs hover:underline mt-2">
        {isEn ? "← Return to Home" : "← العودة إلى الصفحة الرئيسية"}
      </Link>
    </div>
  );
}
