"use client";

import { useState, useEffect } from "react";
import { UserRound, UsersRound, Sparkles, ArrowLeft, Check } from "lucide-react";
import { completeOnboardingAction } from "./actions";
import { trackEvent } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const [role, setRole] = useState<"teacher" | "institution_admin">("teacher");
  const [market, setMarket] = useState<"eg" | "sa">("eg");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || "";
        setUserName(name);
      }
    });
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      trackEvent(
        "user_signed_up",
        { role, nationality: market, signup_method: "google" },
        { send_instantly: true, transport: "sendBeacon" }
      );
      document.cookie = `fitna_market=${market}; path=/; max-age=31536000; SameSite=Lax`;
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("fitna_market", market);
      }

      const res = await completeOnboardingAction(role, market);
      if (res.error) {
        alert(res.error);
        setLoading(false);
      } else if (res.redirectTo) {
        window.location.href = res.redirectTo;
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030d1a] text-slate-100 flex items-center justify-center p-4 sm:p-6" dir="rtl">
      <div className="max-w-xl w-full bg-[#07172b]/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold mb-4">
            <Sparkles size={14} className="text-teal-400" />
            <span>مرحباً بك في فِطْنة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            {userName ? `أهلاً بك، ${userName}` : "أهلاً بك في فِطنة"}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            خطوة أخيرة لنجهز لك مساحة التدريب ونخصص لك المعمل الصفي المناسب
          </p>
        </div>

        <div className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-3">
              1. كيف ستستخدم المنصة؟
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                  role === "teacher"
                    ? "border-teal-400 bg-teal-500/15 shadow-lg shadow-teal-900/20"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserRound size={18} className={role === "teacher" ? "text-teal-400" : "text-slate-400"} />
                    <span className="font-bold text-sm text-white">معلم (تدريب فردي)</span>
                  </div>
                  {role === "teacher" && <Check size={16} className="text-teal-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  تدريب تفاعلي ومحاكاة لمواقف الفصل لتنمية ردود أفعالك المهنية.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("institution_admin")}
                className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                  role === "institution_admin"
                    ? "border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-900/20"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UsersRound size={18} className={role === "institution_admin" ? "text-amber-400" : "text-slate-400"} />
                    <span className="font-bold text-sm text-white">مشرف تربوي / مؤسسة</span>
                  </div>
                  {role === "institution_admin" && <Check size={16} className="text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  متابعة واختبار المعلمين والحصول على تقارير تفصيلية بمستوياتهم.
                </p>
              </button>
            </div>
          </div>

          {/* Market Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-3">
              2. اختر اللهجة والبيئة المدرسية:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMarket("eg")}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  market === "eg"
                    ? "border-teal-400 bg-teal-500/15"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🇪🇬</span>
                  <div className="text-start">
                    <div className="font-bold text-sm text-white">التجربة المصرية</div>
                    <div className="text-[10px] text-slate-400">لهجة وفصول مصرية</div>
                  </div>
                </div>
                {market === "eg" && <Check size={16} className="text-teal-400" />}
              </button>

              <button
                type="button"
                onClick={() => setMarket("sa")}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  market === "sa"
                    ? "border-teal-400 bg-teal-500/15"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🇸🇦</span>
                  <div className="text-start">
                    <div className="font-bold text-sm text-white">التجربة السعودية</div>
                    <div className="text-[10px] text-slate-400">لهجة وفصول سعودية</div>
                  </div>
                </div>
                {market === "sa" && <Check size={16} className="text-teal-400" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span>جارٍ تجهيز مساحة التدريب...</span>
            ) : (
              <>
                <span>ابدأ التدريب الآن</span>
                <ArrowLeft size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

