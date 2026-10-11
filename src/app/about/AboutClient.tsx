"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserGuideButton } from "@/components/UserGuideButton";
import { TelegramIcon } from "@/components/TelegramIcon";
import { MarketSwitcher } from "@/components/MarketSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation, type Language, type Market } from "@/lib/i18n";
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
  initialMarket?: Market;
  isAuthenticated?: boolean;
}

export function AboutClient({
  initialLang,
  initialMarket,
  isAuthenticated = false,
}: AboutClientProps) {
  const { lang: ctxLang, market: ctxMarket } = useTranslation();
  const lang = ctxLang || initialLang || "ar";
  const market = ctxMarket || initialMarket || "eg";
  const isEn = lang === "en";
  const isRtl = !isEn;
  const isSa = market === "sa";

  // Content dictionary tailored per market and language
  const content = {
    en: {
      breadcrumb: "About Fitna AI",
      heroTitle: "About Fitna AI",
      heroSubtitle:
        "The first AI-powered classroom simulation platform that mirrors your teaching reality — practice classroom management before stepping into the room.",
      whatIsTitle: "What is Fitna AI?",
      whatIsDesc:
        "Fitna AI is an advanced pedagogical training platform for teachers that simulates authentic classroom environments through generative agentic AI. Teachers interact with diverse AI student personas (such as Liam, Emma, Oliver, and Sophia in the American English classroom) — each with distinct learning paces, behavioral triggers, and attention spans. Students listen to your natural voice and respond in real-time vocal turns. The platform provides a safe psychological space to practice high-stakes classroom moments, from disruptions to socratic questioning, before real students arrive.",
      howTitle: "How Does It Work?",
      howSteps: [
        {
          num: "1",
          title: "1. Speak Naturally Just Like in a Real Classroom",
          desc: "Click the microphone once and begin teaching, asking questions, or guiding discussion. The system transcribes your speech with real-time acoustic and tone insights (confidence, pace, enthusiasm, and warmth).",
          icon: Mic,
        },
        {
          num: "2",
          title: "2. Real-Time Student Reasoning & Speech",
          desc: "Each AI student runs an independent cognitive model reflecting comprehension rate, focus, and misconceptions. Students raise hands, ask questions, or interject with authentic voice responses.",
          icon: Brain,
        },
        {
          num: "3",
          title: "3. Comprehensive Pedagogical Assessment",
          desc: "Receive rigorous evaluation across Danielson & CLASS frameworks, featuring Teacher Talk Time balance, Socratic inquiry rate, inclusivity index, and evidence-backed growth recommendations.",
          icon: BarChart3,
        },
      ],
      featuresTitle: "What Makes the Experience Authentic?",
      features: [
        {
          title: "Persistent Student Personas",
          desc: "Four calibrated student profiles per classroom environment with cumulative memory and realistic pedagogical misconceptions (Liam, Emma, Oliver, Sophia).",
          icon: Users,
        },
        {
          title: "Multi-Market Environments",
          desc: "Native support for American English classrooms, Saudi Arabian curriculum, and Egyptian schools with authentic cultural idioms and honorifics.",
          icon: Languages,
        },
        {
          title: "Dynamic Classroom Events",
          desc: "Spontaneous classroom moments: side chatter, off-topic questions, attention drift, and peer interactions that test your real-time composure.",
          icon: Dices,
        },
        {
          title: "Privacy & Data Security",
          desc: "Your audio is processed exclusively for generating your personal diagnostic report, with end-to-end encryption and zero external data sharing.",
          icon: ShieldCheck,
        },
        {
          title: "Real-Time Intelligent Barge-In",
          desc: "Interrupt any student verbally to immediately regain floor control, cultivating instructional assertiveness and natural classroom momentum.",
          icon: Headphones,
        },
      ],
      audienceTitle: "Who is Fitna AI For?",
      audienceDesc:
        "Designed for pre-service teachers before classroom practicums, experienced educators piloting new inquiry strategies, and school leadership academies measuring instructional progress.",
      ctaHeader: "Ready to Start Your First Classroom Simulation?",
      ctaBtn: "Start Simulation Now",
      guideBtn: "User Guide",
      footerCopyright: "All rights reserved © 2026 Fitna AI Pedagogical System",
      telegramBtn: "Telegram Support",
      dashboardBtn: "Dashboard",
      loginBtn: "Sign In",
    },
    sa: {
      breadcrumb: "عن المنصة",
      heroTitle: "عن منصة فِطْنَة",
      heroSubtitle:
        "أول بيئة محاكاة صفية بالذكاء الاصطناعي تحاكي واقعك التدريسي — تدرّب على إدارة الصف قبل دخوله الفعلي.",
      whatIsTitle: "ما هي منصة فِطْنَة؟",
      whatIsDesc:
        "فِطْنَة هي منصة تدريب متطورة للمعلمين تُحاكي بيئة الفصل المدرسي الحقيقي بالذكاء الاصطناعي التوليدي باللغة العربية الفصحى؛ حيث يتفاعل المعلم مع أربعة طلاب افتراضيين (ريم، وفهد، وسلطان، وجوري) لكل منهم سماته النفسية ومستواه الأكاديمي وسلوكه الصفي المتسق مع بيئة المدارس السعودية. يستمع الطلاب لصوتك ويتفاعلون معك بنبرات صوتية طبيعية، وتوفر المنصة مساحة آمنة لتجربة أساليب الشرح، واحتواء التشتت، وتطبيق استراتيجيات التدريس النشط وفق معايير هيئة تقويم التعليم والتدريب.",
      howTitle: "كيف تعمل المنصة؟",
      howSteps: [
        {
          num: "١",
          title: "١. تحدث بطبيعتك كما في الفصل الحقيقي",
          desc: "انقر على زر الميكروفون وابدأ بالشرح أو طرح الأسئلة أو التوجيه — يُحوّل النظام صوتك إلى نص في الوقت الفعلي مع تحليل دقيق لنبرة الصوت (الثقة، السرعة، الحماس، والهدوء).",
          icon: Mic,
        },
        {
          num: "٢",
          title: "٢. تفكير وتفاعل فوري من الطلاب الافتراضيين",
          desc: "يمتلك كل طالب نموذجًا إدراكيًا مستقلاً يشمل: معدل الاستيعاب، الانتباه، والأخطاء المفاهيمية الشائعة. يقرر الطلاب الإجابة أو الاستفسار أو رفع اليدين بأصوات ولهجات واقعية.",
          icon: Brain,
        },
        {
          num: "٣",
          title: "٣. تقرير تقييمي بيداغوجي متكامل",
          desc: "تقييم تربوي مبني على معايير Danielson و CLASS العالمية، متضمنًا توازن زمن حديث المعلم (TTT)، ونسبة الأسئلة السقراطية، ومؤشر الشمولية الصفية، وخطة تطوير إجرائية مخصصة.",
          icon: BarChart3,
        },
      ],
      featuresTitle: "عوامل الواقعية في التجربة",
      features: [
        {
          title: "شخصيات طلابية مستمرة",
          desc: "أربع شخصيات محددة لبيئة المحاكاة السعودية بذاكرة تراكمية وأخطاء مفاهيمية واقعية — ريم، وفهد، وسلطان، وجوري.",
          icon: Users,
        },
        {
          title: "بيئات ولهجات متعددة",
          desc: "دعم متكامل للبيئة السعودية بالفصحى الرصينة، والبيئة المصرية، والفصول الإنجليزية، مع مراعاة الألقاب والأنماط المعتمدة.",
          icon: Languages,
        },
        {
          title: "أحداث ومواقف صفية ديناميكية",
          desc: "مواقف مفاجئة تحاكي الواقع الصفي: مقاطعات جانبية، أسئلة غير متوقعة، تشتت الانتباه، وتفاعل متنوع بين الطلاب.",
          icon: Dices,
        },
        {
          title: "خصوصية وأمان تام للبيانات",
          desc: "تتم معالجة الصوت حصرًا لإنتاج التقييم التربوي الخاص بك دون أي مشاركة أو تخزين خارجي، مع تشفير شامل لجميع البيانات.",
          icon: ShieldCheck,
        },
        {
          title: "مقاطعة ذكية في الوقت الفعلي",
          desc: "تحدث أثناء إجابة أي طالب ليتوقف فورًا وينصت لتوجيهك تمامًا كما في الحصة الفعلية؛ لتنمية مهارة الحزم وإدارة الحوار الصفي.",
          icon: Headphones,
        },
      ],
      audienceTitle: "الفئات المستهدفة",
      audienceDesc:
        "مخصصة للمعلمين الجدد قبل بدء التدريس الفعلي، وللمعلمين ذوي الخبرة الراغبين بتجربة استراتيجيات صفية جديدة، ولمؤسسات إعداد وتأهيل المعلمين الساعية لقياس تقدم كوادرها بدقة.",
      ctaHeader: "هل أنت مستعد لبدء أول جلسة محاكاة صفية؟",
      ctaBtn: "ابدأ التدريب الآن",
      guideBtn: "دليل الاستخدام",
      footerCopyright: "جميع الحقوق محفوظة © 2026 نظام فطنة للذكاء الاصطناعي التربوي",
      telegramBtn: "الدعم عبر تيليجرام",
      dashboardBtn: "لوحة التحكم",
      loginBtn: "تسجيل الدخول",
    },
    eg: {
      breadcrumb: "عن المنصة",
      heroTitle: "عن منصة فِطْنَة",
      heroSubtitle:
        "أول بيئة محاكاة صفية تفاعلية تحاكي واقعك التدريسي — تدرّب على إدارة الصف قبل ما تدخله.",
      whatIsTitle: "ما هي منصة فِطْنَة؟",
      whatIsDesc:
        "فِطْنَة هي منصة تدريب متطورة للمعلمين تُحاكي بيئة الفصل الحقيقي بالذكاء الاصطناعي التوليدي؛ حيث يتفاعل المعلم مع أربعة طلاب افتراضيين (سارة، عمر، يوسف، ونور) لكل منهم سماته النفسية وطريقته في الاستجابة بلهجة وطبيعة الفصول المصرية. يستمع الطلاب لصوتك ويتفاعلون معك بنبرات صوتية طبيعية، وتتيح المنصة مساحة آمنة لاختبار المواقف الصفية الصعبة، مثل التعامل مع المشاغبات، والأسئلة المفاجئة، وضعف التركيز، قبل بدء الحصة الفعلية.",
      howTitle: "كيف تعمل المنصة؟",
      howSteps: [
        {
          num: "١",
          title: "١. تحدث بطبيعتك كما في الفصل الحقيقي",
          desc: "انقر على زر الميكروفون وابدأ بالشرح أو طرح الأسئلة أو التوجيه — يُحوّل النظام صوتك إلى نص في الوقت الفعلي مع تحليل دقيق لنبرة الصوت (الثقة، السرعة، الحماس، والهدوء).",
          icon: Mic,
        },
        {
          num: "٢",
          title: "٢. تفكير وتفاعل فوري من الطلاب الافتراضيين",
          desc: "يمتلك كل طالب نموذجًا إدراكيًا مستقلاً يشمل: معدل الاستيعاب، الانتباه، والأخطاء المفاهيمية الشائعة. يقرر الطلاب الإجابة أو الاستفسار أو رفع اليدين بأصوات ولهجات واقعية.",
          icon: Brain,
        },
        {
          num: "٣",
          title: "٣. تقرير تقييمي بيداغوجي متكامل",
          desc: "تقييم تربوي مبني على ستة محاور تربوية وفق إطاري Danielson و CLASS، متضمنًا نقاط القوة وفرص التطوير وتوازن وقت حديث المعلم.",
          icon: BarChart3,
        },
      ],
      featuresTitle: "عوامل الواقعية في التجربة",
      features: [
        {
          title: "شخصيات طلابية مستمرة",
          desc: "أربع شخصيات محددة للفصول المصرية بذاكرة تراكمية وأخطاء مفاهيمية واقعية — سارة، وعمر، ويوسف، ونور.",
          icon: Users,
        },
        {
          title: "بيئات ولهجات متعددة",
          desc: "دعم مخصص للهجة المصرية، والبيئة السعودية بالفصحى، والفصول الإنجليزية، مع مراعاة الألقاب («يا مستر / يا ميس / يا أستاذ»).",
          icon: Languages,
        },
        {
          title: "أحداث ومواقف صفية ديناميكية",
          desc: "مواقف مفاجئة تحاكي الواقع الصفي: مقاطعات جانبية، أسئلة غير متوقعة، تشتت الانتباه، وتفاعل متنوع بين الطلاب.",
          icon: Dices,
        },
        {
          title: "خصوصية وأمان تام للبيانات",
          desc: "تتم معالجة الصوت حصرًا لإنتاج التقييم التربوي الخاص بك دون أي مشاركة أو تخزين خارجي، مع تشفير شامل لجميع البيانات.",
          icon: ShieldCheck,
        },
        {
          title: "مقاطعة ذكية في الوقت الفعلي",
          desc: "تحدث أثناء إجابة أي طالب ليتوقف فورًا وينصت لتوجيهك تمامًا كما في الحصة الفعلية؛ لتنمية مهارة الحزم وإدارة الحوار الصفي.",
          icon: Headphones,
        },
      ],
      audienceTitle: "الفئات المستهدفة",
      audienceDesc:
        "مخصصة للمعلمين الجدد قبل بدء التدريس الفعلي، وللمعلمين ذوي الخبرة الراغبين بتجربة استراتيجيات صفية جديدة، ولمؤسسات إعداد وتأهيل المعلمين الساعية لقياس تقدم كوادرها بدقة.",
      ctaHeader: "هل أنت مستعد لبدء أول جلسة محاكاة صفية؟",
      ctaBtn: "ابدأ التدريب الآن",
      guideBtn: "دليل الاستخدام",
      footerCopyright: "جميع الحقوق محفوظة © 2026 نظام فطنة للذكاء الاصطناعي التربوي",
      telegramBtn: "الدعم عبر تيليجرام",
      dashboardBtn: "لوحة التحكم",
      loginBtn: "تسجيل الدخول",
    },
  };

  const activeContent = isEn ? content.en : isSa ? content.sa : content.eg;

  return (
    <div
      className="bg-[#F8FAFC] dark:bg-[#071328] text-[#071B3A] dark:text-white font-readex antialiased min-h-screen flex flex-col selection:bg-[#12B8C4]/20 selection:text-[#071B3A] transition-colors"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top Navbar */}
      <nav className="bg-white/80 dark:bg-[#071B3A]/90 backdrop-blur-md border-b border-[#071B3A]/10 dark:border-white/10 sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-default select-none pointer-events-none">
              <Logo variant="dark" height={32} className="dark:hidden" />
              <Logo variant="light" height={32} className="hidden dark:block" />
            </div>
            <span className="text-[#071B3A]/30 dark:text-white/30 text-sm">/</span>
            <span className="text-sm font-bold text-[#071B3A] dark:text-white">
              {activeContent.breadcrumb}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <MarketSwitcher locked={false} />
            <LanguageSwitcher />
            <ThemeToggle />

            {/* Pinned User Guide Button */}
            <UserGuideButton />

            {/* Telegram Support Button */}
            <a
              href="https://t.me/fitnaai"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-[#229ED9] hover:text-[#229ED9]/80 transition-all duration-150 hover:scale-110 active:scale-95 inline-flex items-center justify-center cursor-pointer shrink-0"
              title={activeContent.telegramBtn}
              aria-label="Telegram Support"
            >
              <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
            </a>

            {/* Primary Action / Auth button */}
            <Link
              href={isAuthenticated ? "/dashboard/teacher" : "/login"}
              className="px-3.5 h-8 rounded-full bg-[#12B8C4] hover:bg-[#0ea5b1] text-white font-bold text-xs shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center whitespace-nowrap shrink-0"
            >
              {isAuthenticated ? activeContent.dashboardBtn : activeContent.loginBtn}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-grow space-y-12 w-full">
        {/* Header Hero Section */}
        <section className="text-center space-y-3 pt-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#071B3A] dark:text-white tracking-tight">
            {activeContent.heroTitle}
          </h1>
          <p className="text-sm sm:text-base font-semibold text-[#12B8C4] max-w-2xl mx-auto leading-relaxed">
            {activeContent.heroSubtitle}
          </p>
        </section>

        {/* Section 1: What is Fitna? Card */}
        <section className="bg-white dark:bg-[#0A1A33] border border-[#071B3A]/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm transition-all">
          <h2 className="text-lg sm:text-xl font-black text-[#071B3A] dark:text-white mb-3">
            {activeContent.whatIsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#071B3A]/80 dark:text-white/80 leading-relaxed font-normal">
            {activeContent.whatIsDesc}
          </p>
        </section>

        {/* Section 2: How Does the Platform Work? */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-black text-[#071B3A] dark:text-white px-1">
            {activeContent.howTitle}
          </h2>

          <div className="space-y-3.5">
            {activeContent.howSteps.map((item, idx) => {
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

        {/* Section 3: Features Grid */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-black text-[#071B3A] dark:text-white px-1">
            {activeContent.featuresTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeContent.features.slice(0, 4).map((feat, idx) => {
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
                  {activeContent.features[4].title}
                </h3>
              </div>
              <p className="text-xs text-[#071B3A]/70 dark:text-white/70 leading-relaxed">
                {activeContent.features[4].desc}
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Who Is It For? Bottom Callout Card */}
        <section className="bg-[#E6F8F9] dark:bg-[#082436] border border-[#12B8C4]/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-black text-[#071B3A] dark:text-white">
              {activeContent.audienceTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#071B3A]/75 dark:text-white/75 max-w-2xl mx-auto leading-relaxed">
              {activeContent.audienceDesc}
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <h4 className="text-base sm:text-lg font-black text-[#12B8C4]">
              {activeContent.ctaHeader}
            </h4>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={isAuthenticated ? "/session/setup" : "/login"}
                className="px-6 py-2.5 rounded-xl bg-[#12B8C4] hover:bg-[#0ea5b1] text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{activeContent.ctaBtn}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>

              <Link
                href="/guide"
                className="px-5 py-2.5 rounded-xl border border-[#12B8C4]/40 bg-white dark:bg-white/5 hover:bg-[#12B8C4]/10 text-[#12B8C4] font-bold text-xs sm:text-sm transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>{activeContent.guideBtn}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#071B3A]/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs text-[#071B3A]/50 dark:text-white/50 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>{activeContent.footerCopyright}</span>
          <div className="flex items-center gap-6">
            <Link href="/guide" className="hover:text-[#12B8C4] transition">
              {activeContent.guideBtn}
            </Link>
            <a
              href="https://t.me/fitnaai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#229ED9] hover:underline inline-flex items-center gap-1"
            >
              <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
              <span>{activeContent.telegramBtn}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
