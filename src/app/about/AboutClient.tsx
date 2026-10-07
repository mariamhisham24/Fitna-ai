"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UserGuideButton } from "@/components/UserGuideButton";
import { TelegramIcon } from "@/components/TelegramIcon";
import { type Language } from "@/lib/i18n";
import {
  Mic,
  Brain,
  BarChart3,
  Users,
  Languages,
  Dices,
  ShieldCheck,
  Headphones,
  BookOpen,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface AboutClientProps {
  initialLang?: Language;
  isAuthenticated?: boolean;
}

export function AboutClient({
  initialLang = "ar",
  isAuthenticated = false,
}: AboutClientProps) {
  const [lang, setLang] = useState<Language>(initialLang);
  const isRtl = lang === "ar";

  // How it works steps
  const howItWorks = [
    {
      num: isRtl ? "١" : "1",
      title: isRtl ? "١. اتكلم زي ما انت بتكلم في فصل حقيقي" : "1. Speak just like you would in a real classroom",
      desc: isRtl
        ? "اضغط زر المايك وابدأ الشرح أو الأسئلة أو التوبيخ — النظام بيحول صوتك لنص لحظيًا ويحلل نبرتك (ثقة، سرعة، حماس، توتر، دفء)."
        : "Click the mic button and start teaching, questioning, or redirecting — the system transcribes your speech instantly and analyzes vocal tone (confidence, pacing, enthusiasm, tension, warmth).",
      icon: Mic,
    },
    {
      num: isRtl ? "٢" : "2",
      title: isRtl ? "٢. الطلاب بيفكروا ويردوا لحظيًا" : "2. Students think and respond in real time",
      desc: isRtl
        ? "كل طالب له عقل محاكٍ: نسبة استيعاب، ثقة، انتباه، وأخطاء مفاهيم حقيقية. بيختاروا يتكلموا أو يسكتوا أو يرفعوا إيدهم — وبيجاوبوا بلهجة أطفال حقيقية."
        : "Each student has a simulated mind: comprehension level, confidence, attention span, and genuine misconceptions. They decide to speak, stay quiet, or raise hands — responding in authentic child voice dialects.",
      icon: Brain,
    },
    {
      num: isRtl ? "٣" : "3",
      title: isRtl ? "٣. تقرير تقييم كامل في الآخر" : "3. Complete evaluation report at the end",
      desc: isRtl
        ? "ستة محاور بيداغوجية (إدارة الفصل، التواصل، الأسئلة، الشمول، النبرة، التوقيت) بمعايير دانيالسون وCLASS، مع نقاط قوة وخطط تطوير عملية مبنية على حوارك فعليًا."
        : "Six pedagogical dimensions (Classroom Management, Communication, Questioning, Inclusion, Tone, Timing) aligned with Danielson and CLASS, featuring strengths and actionable growth plans derived directly from your dialogue.",
      icon: BarChart3,
    },
  ];

  // Features grid (what makes it real)
  const features = [
    {
      title: isRtl ? "شخصيات طلاب ثابتة" : "Persistent Student Personas",
      desc: isRtl
        ? "٤ شخصيات لكل لهجة بذكريات وأخطاء مفاهيم — ريم الفنانة، فهد الرياضي، سلطان المرح، وجوري القارئة."
        : "4 distinct personas per dialect with persistent memory and nuances — Reem the artist, Fahd the athlete, Sultan the lively, and Jouri the reader.",
      icon: Users,
    },
    {
      title: isRtl ? "لهجتين حقيقيتين" : "Two Authentic Dialects",
      desc: isRtl
        ? "مصري وسعودي بتفاصيلهما — مش فصحى جامدة. كل برومبت مضبوط على اللهجة واللقب (يا مستر / يا أستاذ)."
        : "Egyptian and Saudi dialects in full authenticity — not rigid formal prose. System prompts and titles are fine-tuned for cultural resonance.",
      icon: Languages,
    },
    {
      title: isRtl ? "أحداث صف عشوائية" : "Dynamic Classroom Events",
      desc: isRtl
        ? "كل ٣٠–٦٠ ثانية ممكن يحصل حدث حقيقي: همس جانبي، سؤال خارج الموضوع، تشتت موبايل، رفع إيد مفاجئ."
        : "Every 30–60 seconds, authentic disruptions may emerge: side murmuring, off-topic inquiries, phone distraction, or sudden hand raises.",
      icon: Dices,
    },
    {
      title: isRtl ? "خصوصية بالكامل" : "Total Privacy & Security",
      desc: isRtl
        ? "صوتك بيتعالج داخل الجلسة لإنتاج التقرير، ومفيش تخزين أو استخدام خارجي. بياناتك مشفّرة."
        : "Your audio is processed exclusively to synthesize session reports without external usage or retention. All data is encrypted.",
      icon: ShieldCheck,
    },
    {
      title: isRtl ? "مقاطعة ذكية" : "Intelligent Barge-In",
      desc: isRtl
        ? "اتكلم وأي طالب بيتكلم — يوقف فورًا ويسمع لك، زي فصل حقيقي بالظبط. دي مهارة إدارة صف جوهرية تتدرب عليها."
        : "Speak while any student is talking — they pause instantly to yield to you, just like in a live class. A core management skill to master.",
      icon: Headphones,
    },
  ];

  return (
    <div
      className="bg-[#F8FAFC] dark:bg-[#071328] text-[#071B3A] dark:text-white font-readex antialiased min-h-screen flex flex-col selection:bg-[#12B8C4]/20 selection:text-[#071B3A] transition-colors"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top Navbar matching screenshots */}
      <nav className="bg-white/80 dark:bg-[#071B3A]/90 backdrop-blur-md border-b border-[#071B3A]/10 dark:border-white/10 sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo variant="dark" height={32} className="dark:hidden transition-transform duration-200 group-hover:scale-105" />
              <Logo variant="light" height={32} className="hidden dark:block transition-transform duration-200 group-hover:scale-105" />
            </Link>
            <span className="text-[#071B3A]/30 dark:text-white/30 text-sm">/</span>
            <span className="text-sm font-bold text-[#071B3A] dark:text-white">
              {isRtl ? "عن المنصة" : "About Platform"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 text-xs">
            <ThemeToggle />
            <LanguageSwitcher />

            {/* Pinned User Guide Button */}
            <UserGuideButton />

            {/* Telegram Support Button */}
            <a
              href="https://t.me/fitnaai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#229ED9] hover:text-[#229ED9]/80 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-150 hover:scale-110 active:scale-95 inline-flex items-center justify-center cursor-pointer"
              title={isRtl ? "الدعم عبر تيليجرام" : "Telegram Support"}
              aria-label="Telegram Support"
            >
              <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
            </a>

            {/* Primary Action / Auth button */}
            <Link
              href={isAuthenticated ? "/dashboard/teacher" : "/login"}
              className="px-4 py-1.5 rounded-xl bg-[#12B8C4] hover:bg-[#0ea5b1] text-white font-bold text-xs shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isAuthenticated
                ? isRtl ? "لوحة التحكم" : "Dashboard"
                : isRtl ? "تسجيل الدخول" : "Sign In"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-grow space-y-12 w-full">
        {/* Header Hero Section */}
        <section className="text-center space-y-3 pt-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#071B3A] dark:text-white tracking-tight">
            {isRtl ? "عن منصة فِطْنَة" : "About Fitna AI"}
          </h1>
          <p className="text-sm sm:text-base font-semibold text-[#12B8C4]">
            {isRtl
              ? "أول فصل افتراضي بيتكلم بلهجتك — تدرّب على إدارة الصف قبل ما تدخله."
              : "The first virtual classroom speaking your dialect — rehearse classroom management before stepping into the room."}
          </p>
        </section>

        {/* Section 1: What is Fitna? Card */}
        <section className="bg-white dark:bg-[#0A1A33] border border-[#071B3A]/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm transition-all">
          <h2 className="text-lg sm:text-xl font-black text-[#071B3A] dark:text-white mb-3">
            {isRtl ? "إيه هي فِطْنة؟" : "What is Fitna AI?"}
          </h2>
          <p className="text-xs sm:text-sm text-[#071B3A]/80 dark:text-white/80 leading-relaxed font-normal">
            {isRtl
              ? "فِطْنة منصة تدريب للمعلمين بتحاكي فصل ابتدائي حقيقي بالذكاء الاصطناعي: ٤ طلاب لكل واحد شخصيته ومستواه وأسلوبه الخاص، بيسمعوا كلامك بصوتك، بيردوا عليك بالصوت ولهجة حقيقية (مصرية أو سعودية)، وبيتأثروا بطريقتك في الشرح والأسئلة والإدارة. الهدف: تجرّب مواقف الصف الصعبة — الطالب المشاغب، السؤال المفاجئ، الفقدان المفاجئ للانتباه — في مكان آمن قبل أول حصة حقيقية."
              : "Fitna AI is a dedicated teacher training platform that simulates a living elementary classroom through agentic intelligence: 4 students, each with their own distinct persona, skill level, and temperament. They hear your voice naturally, respond aloud in authentic local dialects (Egyptian or Saudi), and react organically to your instruction, questions, and redirection. The goal: rehearse challenging classroom dynamics — disruptive students, sudden curveball questions, drops in attention — in a safe space before day one."}
          </p>
        </section>

        {/* Section 2: How Does the Platform Work? */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-black text-[#071B3A] dark:text-white px-1">
            {isRtl ? "المنصة بتشتغل إزاي؟" : "How does the platform work?"}
          </h2>

          <div className="space-y-3.5">
            {howItWorks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#0A1A33] border border-[#071B3A]/10 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm flex items-start justify-between gap-4 transition-all hover:border-[#12B8C4]/40"
                >
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-[#071B3A] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#071B3A]/70 dark:text-white/70 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-[#12B8C4]/10 dark:bg-[#12B8C4]/20 flex items-center justify-center shrink-0 border border-[#12B8C4]/20">
                    <Icon className="w-5 h-5 text-[#12B8C4]" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: What Makes the Experience Real? (Grid of Cards) */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-black text-[#071B3A] dark:text-white px-1">
            {isRtl ? "اللي بيخلي التجربة حقيقية" : "What makes the experience feel real"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.slice(0, 4).map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#0A1A33] border border-[#071B3A]/10 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-2 hover:border-[#12B8C4]/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-[#12B8C4]/10 dark:bg-[#12B8C4]/20 flex items-center justify-center border border-[#12B8C4]/20">
                      <Icon className="w-4 h-4 text-[#12B8C4]" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#071B3A] dark:text-white">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#071B3A]/70 dark:text-white/70 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}

            {/* 5th Card: Intelligent Barge-In (full width on md) */}
            <div className="bg-white dark:bg-[#0A1A33] border border-[#071B3A]/10 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-2 hover:border-[#12B8C4]/40 transition-all md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#12B8C4]/10 dark:bg-[#12B8C4]/20 flex items-center justify-center border border-[#12B8C4]/20">
                  <Headphones className="w-4 h-4 text-[#12B8C4]" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#071B3A] dark:text-white">
                  {features[4].title}
                </h3>
              </div>
              <p className="text-xs text-[#071B3A]/70 dark:text-white/70 leading-relaxed">
                {features[4].desc}
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Who Is It For? Bottom Callout Card */}
        <section className="bg-[#E6F8F9] dark:bg-[#082436] border border-[#12B8C4]/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-black text-[#071B3A] dark:text-white">
              {isRtl ? "لمين؟" : "Who is this for?"}
            </h3>
            <p className="text-xs sm:text-sm text-[#071B3A]/75 dark:text-white/75 max-w-2xl mx-auto leading-relaxed">
              {isRtl
                ? "للمعلم الجديد قبل أول حصة، للمعلم المخضرم اللي عايز يجرّب استراتيجيات جديدة، وللمؤسسات تدريب المعلمين اللي عايزة قياس تطور فريقها عبر لوحة نمو واضحة."
                : "For novice teachers preparing for day one, experienced educators testing novel teaching techniques, and educator development institutions seeking quantified growth insights."}
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <h4 className="text-base sm:text-lg font-black text-[#12B8C4]">
              {isRtl ? "جاهز تدخل أول فصل افتراضي في حياتك؟" : "Ready to enter your first virtual classroom?"}
            </h4>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={isAuthenticated ? "/session/setup" : "/login"}
                className="px-6 py-2.5 rounded-xl bg-[#12B8C4] hover:bg-[#0ea5b1] text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{isRtl ? "ابدأ التدريب" : "Start Simulation"}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>

              <Link
                href="/guide"
                className="px-5 py-2.5 rounded-xl border border-[#12B8C4]/40 bg-white dark:bg-white/5 hover:bg-[#12B8C4]/10 text-[#12B8C4] font-bold text-xs sm:text-sm transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isRtl ? "دليل الاستخدام" : "User Guide"}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#071B3A]/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs text-[#071B3A]/50 dark:text-white/50 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>
            {isRtl
              ? "جميع الحقوق محفوظة © 2026 نظام فطنة للذكاء الاصطناعي التربوي"
              : "All rights reserved © 2026 Fitna AI Pedagogical System"}
          </span>
          <div className="flex items-center gap-6">
            <Link href="/guide" className="hover:text-[#12B8C4] transition">
              {isRtl ? "دليل الاستخدام" : "User Guide"}
            </Link>
            <a
              href="https://t.me/fitnaai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#229ED9] hover:underline inline-flex items-center gap-1"
            >
              <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
              <span>{isRtl ? "الدعم عبر تيليجرام" : "Telegram"}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
