"use client";

import { useState, useEffect } from "react";
import { UserRound, UsersRound, Sparkles, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { completeOnboardingAction } from "./actions";
import { trackEvent } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/context";

const onboardingTexts = {
  eg: {
    dir: "rtl",
    welcomeBadge: "مرحباً بك في فِطْنة",
    greeting: (name: string) => name ? `أهلاً بيك، ${name}` : "أهلاً بيك في فِطنة",
    subtitle: "خطوة أخيرة عشان نجهّزلك مساحة التدريب ونخصصلك المعمل الصفي المناسب.",
    step1Title: "١. كيف ستستخدم المنصة؟",
    roleTeacherTitle: "معلم (تدريب فردي)",
    roleTeacherDesc: "تدريب تفاعلي ومحاكاة لمواقف الفصل لتنمية ردود أفعالك المهنية.",
    roleAdminTitle: "مشرف تربوي / مؤسسة",
    roleAdminDesc: "متابعة واختبار المعلمين والحصول على تقارير تفصيلية بمستوياتهم.",
    step2Title: "٢. اختر اللهجة والبيئة المدرسية:",
    marketEgTitle: "التجربة المصرية",
    marketEgDesc: "لهجة وفصول مصرية",
    marketSaTitle: "التجربة السعودية",
    marketSaDesc: "لغة فصحى وبيئة سعودية",
    marketEnTitle: "English Classroom",
    marketEnDesc: "American English",
    loadingBtn: "جارٍ تجهيز مساحة التدريب...",
    submitBtn: "ابدأ التدريب الآن",
  },
  sa: {
    dir: "rtl",
    welcomeBadge: "مرحباً بك في فِطْنة",
    greeting: (name: string) => name ? `أهلاً بك، ${name}` : "أهلاً بك في فِطنة",
    subtitle: "خطوة أخيرة لنجهز لك مساحة التدريب ونخصص لك البيئة الصفية المناسبة.",
    step1Title: "١. كيف ستستخدم المنصة؟",
    roleTeacherTitle: "معلم / معلمة (تدريب فردي)",
    roleTeacherDesc: "تدريب تفاعلي ومحاكاة لمواقف الصف لتنمية استجاباتك المهنية الرصينة.",
    roleAdminTitle: "مشرف تربوي / مؤسسة تعليمية",
    roleAdminDesc: "متابعة وتدريب فريق المعلمين والحصول على تقارير كفاءة تفصيلية.",
    step2Title: "٢. اختر البيئة واللهجة الصفية:",
    marketEgTitle: "التجربة المصرية",
    marketEgDesc: "لهجة وفصول مصرية",
    marketSaTitle: "التجربة السعودية",
    marketSaDesc: "لغة عربية فصحى وبيئة سعودية",
    marketEnTitle: "English Classroom",
    marketEnDesc: "American English",
    loadingBtn: "جارٍ إعداد مساحة التدريب...",
    submitBtn: "ابدأ التدريب الآن",
  },
  en: {
    dir: "ltr",
    welcomeBadge: "Welcome to Fitna AI",
    greeting: (name: string) => name ? `Welcome, ${name}` : "Welcome to Fitna AI",
    subtitle: "One last step to set up your training space and prepare your classroom simulator.",
    step1Title: "1. How will you use the platform?",
    roleTeacherTitle: "Teacher (Individual)",
    roleTeacherDesc: "Interactive simulation of classroom situations to sharpen pedagogical reactions.",
    roleAdminTitle: "Supervisor / Institution",
    roleAdminDesc: "Monitor and assess teacher cohorts with deep performance analytics.",
    step2Title: "2. Choose your classroom dialect & environment:",
    marketEgTitle: "Egyptian Classroom",
    marketEgDesc: "Egyptian dialect & schools",
    marketSaTitle: "Saudi Classroom",
    marketSaDesc: "Modern Standard Arabic (Saudi)",
    marketEnTitle: "English Classroom",
    marketEnDesc: "American English",
    loadingBtn: "Setting up your classroom...",
    submitBtn: "Start Training Now",
  },
};

export default function OnboardingPage() {
  const { setMarket: setCtxMarket, setLanguage: setCtxLanguage } = useTranslation();
  const [role, setRole] = useState<"teacher" | "institution_admin">("teacher");
  const [market, setMarketState] = useState<"eg" | "sa" | "en">("eg");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  const t = onboardingTexts[market] || onboardingTexts.eg;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || "";
        setUserName(name);
      }
    });
  }, []);

  const handleSelectMarket = (selectedMarket: "eg" | "sa" | "en") => {
    setMarketState(selectedMarket);
    setCtxMarket(selectedMarket);
    
    // Auto switch interface language based on market selection
    const targetLang = selectedMarket === "en" ? "en" : "ar";
    setCtxLanguage(targetLang);

    // Save cookies and storage immediately
    document.cookie = `fitna_market=${selectedMarket}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `language=${targetLang}; path=/; max-age=31536000; SameSite=Lax`;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("fitna_market", selectedMarket);
      localStorage.setItem("language", targetLang);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      trackEvent(
        "user_signed_up",
        { role, nationality: market, signup_method: "google" },
        { send_instantly: true, transport: "sendBeacon" }
      );
      
      const targetLang = market === "en" ? "en" : "ar";
      document.cookie = `fitna_market=${market}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `language=${targetLang}; path=/; max-age=31536000; SameSite=Lax`;
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("fitna_market", market);
        localStorage.setItem("language", targetLang);
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
    <div className="min-h-screen w-full bg-[#030d1a] text-slate-100 flex items-center justify-center p-4 sm:p-6" dir={t.dir}>
      <div className="max-w-xl w-full bg-[#07172b]/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold mb-4">
            <Sparkles size={14} className="text-teal-400" />
            <span>{t.welcomeBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            {t.greeting(userName)}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            {t.subtitle}
          </p>
        </div>

        <div className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-3">
              {t.step1Title}
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
                    <span className="font-bold text-sm text-white">{t.roleTeacherTitle}</span>
                  </div>
                  {role === "teacher" && <Check size={16} className="text-teal-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t.roleTeacherDesc}
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
                    <span className="font-bold text-sm text-white">{t.roleAdminTitle}</span>
                  </div>
                  {role === "institution_admin" && <Check size={16} className="text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t.roleAdminDesc}
                </p>
              </button>
            </div>
          </div>

          {/* Market Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-3">
              {t.step2Title}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSelectMarket("eg")}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  market === "eg"
                    ? "border-teal-400 bg-teal-500/15 ring-2 ring-teal-400/20"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🇪🇬</span>
                  <div className="text-start">
                    <div className="font-bold text-sm text-white">{t.marketEgTitle}</div>
                    <div className="text-[10px] text-slate-400">{t.marketEgDesc}</div>
                  </div>
                </div>
                {market === "eg" && <Check size={16} className="text-teal-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectMarket("sa")}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  market === "sa"
                    ? "border-teal-400 bg-teal-500/15 ring-2 ring-teal-400/20"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🇸🇦</span>
                  <div className="text-start">
                    <div className="font-bold text-sm text-white">{t.marketSaTitle}</div>
                    <div className="text-[10px] text-slate-400">{t.marketSaDesc}</div>
                  </div>
                </div>
                {market === "sa" && <Check size={16} className="text-teal-400" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectMarket("en")}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  market === "en"
                    ? "border-teal-400 bg-teal-500/15 ring-2 ring-teal-400/20"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🇬🇧</span>
                  <div className="text-start">
                    <div className="font-bold text-sm text-white">{t.marketEnTitle}</div>
                    <div className="text-[10px] text-slate-400">{t.marketEnDesc}</div>
                  </div>
                </div>
                {market === "en" && <Check size={16} className="text-teal-400" />}
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
              <span>{t.loadingBtn}</span>
            ) : (
              <>
                <span>{t.submitBtn}</span>
                {t.dir === "rtl" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

