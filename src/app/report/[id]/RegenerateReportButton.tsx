"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

export function RegenerateReportButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { market } = useTranslation();
  const isSa = market === "sa";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/report/regenerate`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error || (isSa ? "حدث خطأ أثناء إنشاء التقرير" : "حصل خطأ أثناء توليد التقرير"));
      }
    } catch {
      setError(isSa ? "حدث خطأ في الاتصال" : "حصل خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 text-center space-y-3">
      <p className="text-sm text-[#071B3A]/60">
        {isSa
          ? "التحليل النصي لهذه الجلسة لم يتم إنشاؤه بعد (قد يكون حدث خطأ مؤقت أثناء إنهاء الجلسة)."
          : "التحليل النصي للجلسة دي لسه مش متولّد (ممكن يكون حصل خطأ مؤقت وقت إنهاء الجلسة)."}
      </p>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <button
        onClick={handleRegenerate}
        disabled={loading}
        className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-[#071B3A] font-semibold rounded-lg px-5 py-2.5"
      >
        {loading
          ? (isSa ? "جاري الإنشاء..." : "جاري التوليد...")
          : (isSa ? "إنشاء التحليل الآن" : "ولّد التحليل دلوقتي")}
      </button>
    </div>
  );
}
