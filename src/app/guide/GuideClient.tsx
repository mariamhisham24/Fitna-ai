"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MarketSwitcher } from "@/components/MarketSwitcher";
import { TelegramIcon } from "@/components/TelegramIcon";
import {
  BookOpen,
  User,
  Sliders,
  Mic,
  BarChart3,
  Sparkles,
  MessageSquare,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { type Language } from "@/lib/i18n";

interface GuideClientProps {
  initialLang: Language;
  isAuthenticated: boolean;
}

export function GuideClient({ initialLang, isAuthenticated }: GuideClientProps) {
  const { lang: ctxLang } = useTranslation();
  const lang = ctxLang || initialLang;
  const isRtl = lang === "ar";

  // Accordion FAQ state (default first item open)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const sections = [
    {
      id: "auth",
      number: isRtl ? "١" : "1",
      title: isRtl ? "١) الحساب والدخول" : "1) Account & Sign In",
      icon: User,
      bullets: isRtl
        ? [
            "ادخل من صفحة تسجيل الدخول ببريدك الإلكتروني وكلمة المرور، أو بزر «المتابعة بحساب Google» بضغطة واحدة.",
            "ما عندك حساب؟ اضغط «أنشئ حسابًا الآن» واملأ الاسم والبريد وكلمة المرور — الحساب الجاهز في ثوانٍ.",
            "عايز تجرب الأول؟ زر «تجربة المنصة فورًا بحساب تجريبي» يفتح لك حساب معلم كامل بدون أي تسجيل.",
            "نسيت كلمة المرور؟ «نسيت كلمة المرور؟» تحت حقل كلمة المرور ترسل لك رابط استعادة على بريدك.",
          ]
        : [
            "Sign in with your email and password, or use one-click 'Continue with Google'.",
            "Don't have an account? Click 'Create an Account' and enter your name, email, and password — ready in seconds.",
            "Want to explore first? 'Try Instantly with Demo Account' launches a complete teacher simulator with no sign-up.",
            "Forgot your password? Click 'Forgot Password?' beneath the password field to receive a reset link.",
          ],
    },
    {
      id: "setup",
      number: isRtl ? "٢" : "2",
      title: isRtl ? "٢) تجهيز جلسة المحاكاة" : "2) Setting Up the Simulation",
      icon: Sliders,
      bullets: isRtl
        ? [
            "من لوحة التحكم اضغط «ابدأ جلسة جديدة» لتنتقل لصفحة التجهيز.",
            "اكتب موضوع الدرس (أو اختر موضوعًا موجودًا)، ثم الصق ملخص الدرس في خانة «محتوى الدرس» — أو ارفع ملف PDF فيقرأه النظام بنفسه.",
            "ما عايز تكتب درس من الصفر؟ اضغط أي قالب جاهز من شريط «قوالب دروس جاهزة» فيتحول لملخص درس كامل فورًا.",
            "اختر اللهجة (مصرية أو سعودية) — الطلاب هيتفاهموا ويتكلموا بنفس اللهجة اللي اخترتها.",
            "حدد مدة الجلسة (١٠–٣٠ دقيقة)، نمط الفصل (متوازن / مشاغب / فاقد للتركيز)، وهدفك التدريبي.",
            "حدد «يا مستر» أو «يا ميس» واكتب اسمك — الطلاب هينادوا بيك بالصيغة دي طول الجلسة.",
          ]
        : [
            "From your dashboard, click 'Start New Session' to navigate to the setup studio.",
            "Type your lesson topic (or select one), then paste your lesson summary into 'Lesson Content' — or upload a PDF for automatic parsing.",
            "Don't want to author from scratch? Pick any ready-made template from 'Lesson Templates' to populate an instant summary.",
            "Select dialect (Saudi or Egyptian) — the AI students will converse fluently in your chosen dialect.",
            "Configure session duration (10–30 mins), classroom dynamic (balanced / disruptive / disengaged), and pedagogical objective.",
            "Set your title ('Mr.' or 'Ms.') and name — students will address you naturally throughout.",
          ],
    },
    {
      id: "live",
      number: isRtl ? "٣" : "3",
      title: isRtl ? "٣) غرفة المحاكاة الحية" : "3) Live Classroom Simulation",
      icon: Mic,
      bullets: isRtl
        ? [
            "اضغط زر المايك الكبير مرة واحدة ليبدأ الاستماع المفتوح — كل ما تتكلم، الفصل يسمعك ويرد عليك بالصوت.",
            "اتكلم بشكل طبيعي من غير ما تضغط أي زر؛ النظام بيحدد نهاية جملتك لوحده من سكتتك.",
            "عايز تقطع طالب وهو بيتكلم؟ اتكلم بصوت واضح مباشرة — النظام يوقفه فورًا ويسمع لك (Barge-in).",
            "من تابة «سجل الحوار» تقرأ كل اللي اتقال في الجلسة لحظة بلحظة، ومن «الفصل» تشاهد حالة كل طالب.",
            "على الموبايل: اسمح لإذن المايكروفون من المتصفح أول مرة، واستخدم سماعة أو مكان هادئ لأفضل تجربة.",
            "زر كتم الصوت (جنب المايك) يوقف الاستماع مؤقتًا — مثلًا لو حبيت تشرب أو تشتغل حاجة تانية.",
          ]
        : [
            "Click the large microphone button once to enable open listening — speak freely and students respond vocally in real time.",
            "Speak naturally without holding buttons; intelligent silence detection recognizes when you finish speaking.",
            "Need to interrupt a speaking student? Speak clearly — the real-time Barge-in engine pauses them immediately to listen.",
            "Switch to 'Transcript' to monitor dialogue text in real time, or 'Classroom' to observe student status.",
            "On mobile: Grant microphone permissions when prompted, and use headphones or a quiet environment for best audio.",
            "The mute button next to the mic temporarily pauses listening whenever you need a brief pause.",
          ],
    },
    {
      id: "report",
      number: isRtl ? "٤" : "4",
      title: isRtl ? "٤) نهاية الجلسة والتقرير" : "4) Session Completion & Report",
      icon: BarChart3,
      bullets: isRtl
        ? [
            "اضغط زر إنهاء المحاكاة في أي وقت — أو خلّي المؤقت يخلص الجلسة تلقائيًا.",
            "بعد النهاية يولّد النظام تقريرًا تقييميًا كاملًا: ملخص الجلسة، ستة محاور بيداغوجية، تحليل نبرتك، نقاط قوتك، وخطط تطوير.",
            "من صفحة «كل الجلسات» ترجع لأي تقرير قديم، ومن «لوحة النمو» تتابع تطورك عبر الجلسات.",
            "تقدر تعيد توليد التقرير من صفحة الجلسة لو حبيت نسخة محدّثة بعد مراجعة الحوار.",
          ]
        : [
            "End simulation at any moment via 'End Session', or let the countdown timer conclude automatically.",
            "Upon completion, the system synthesizes a comprehensive report: session summary, 6 pedagogical dimensions, tone analysis, strengths, and targeted recommendations.",
            "Revisit past sessions anytime from 'Session History', and track longitudinal mastery on 'Growth Analytics'.",
            "Regenerate reports directly from the session review page if you wish to generate refreshed evaluations.",
          ],
    },
    {
      id: "settings",
      number: isRtl ? "٥" : "5",
      title: isRtl ? "٥) الإعدادات والنصائح" : "5) Settings & Best Practices",
      icon: Sparkles,
      bullets: isRtl
        ? [
            "من الإعدادات تعدّل اسمك وصيغة المناداة ولهجة الفصل الافتراضية وهدفك التدريبي.",
            "بياناتك محفوظة ومشفّرة، وصوتك بيتعالج داخل الجلسة — ما بنستخدمه لأي تدريب خارجي.",
            "لأفضل أداء استخدم Chrome أو Safari حديثين، وتأكد إن المايك مش مكتوم من إعدادات النظام.",
            "لو الطالب مش بيرد: تأكد إن زر المايك مضاء، اتكلم أعلى شوية، أو اضغط المايك مرتين (إيقاف ثم تشغيل).",
          ]
        : [
            "Adjust your name, honorific title, default dialect, and target skills anytime in Settings.",
            "Your data is fully encrypted and private; voice audio is processed solely in-session and never used for external model training.",
            "For optimal experience, use modern Chrome or Safari and ensure system microphone input is unmuted.",
            "If students do not answer: confirm the mic button is lit, speak slightly louder, or click mic twice (pause and resume).",
          ],
    },
  ];

  const faqs = [
    {
      question: isRtl ? "هل صوتي بيتخزن؟" : "Is my voice stored permanently?",
      answer: isRtl
        ? "بيتم معالجته لحظيًا لتحويل الكلام لنص وتحليل النبرة داخل الجلسة، وما بيتخزن بشكل دائم للتدريب الخارجي."
        : "Audio is processed in real time for transcription and pedagogical metrics during your session, and is never stored permanently for external training.",
    },
    {
      question: isRtl ? "أقدر أغير اللهجة بعد ما أبدأ؟" : "Can I change the dialect after starting?",
      answer: isRtl
        ? "إعدادات اللهجة بتتحدد لكل جلسة قبل البدء، وتقدر تنهي الجلسة الحالية وتبدأ جلسة جديدة باللهجة اللي تختارها (مصرية أو سعودية)."
        : "Dialect is set per session before launching. You can end your current session and start a new one with your chosen dialect (Egyptian or Saudi) at any time.",
    },
    {
      question: isRtl ? "إزاي أوقف طالب مشاغب؟" : "How do I redirect a disruptive student?",
      answer: isRtl
        ? "اتكلم بصوت حازم وواضح مباشرة باسم الطالب، النظام مزود بميزة المقاطعة الفورية (Barge-in) اللي بتسكت الطالب فور سماع صوتك، وتقدر توجهه أو تطرح سؤال سقراطي لإعادة تركيزه."
        : "Address the student directly by name in a clear, assertive tone. The instant Barge-in feature stops the student speaking immediately, allowing you to ask an open-ended Socratic question and restore focus.",
    },
    {
      question: isRtl ? "التقرير بيتولد إزاي؟" : "How is the evaluation report generated?",
      answer: isRtl
        ? "فور الضغط على إنهاء الجلسة، النظام بيحلل التسجيل والحوار كاملاً وفق معايير Danielson و CLASS، ويحسب وقت حديث المعلم ونسبة الأسئلة السقراطية ويولد التقرير الشامل في ثوانٍ."
        : "Upon ending the session, the engine synthesizes the entire transcript against Danielson and CLASS frameworks, computing Teacher Talk Time, Socratic questioning, and inclusivity to output your comprehensive report in seconds.",
    },
  ];

  return (
    <div
      className="bg-[#F6F0E4] dark:bg-[#05142B] text-[#071B3A] dark:text-white font-readex antialiased min-h-screen flex flex-col selection:bg-[#12B8C4]/20 selection:text-[#071B3A] transition-colors"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Sticky Nile Top Navigation Bar with Official Breadcrumb */}
      <header className="bg-[#071B3A]/95 text-white sticky top-0 z-40 border-b border-white/10 backdrop-blur-md shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand + Breadcrumb Cluster */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group py-1" title="Fitna AI">
              <Logo variant="light" height={34} className="transition-transform duration-200 group-hover:scale-105" />
            </Link>
            <span className="text-white/30 text-sm font-light">/</span>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#12B8C4]">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{isRtl ? "دليل الاستخدام" : "User Guide"}</span>
            </div>
          </div>

          {/* Action Cluster */}
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
            <MarketSwitcher />
            <LanguageSwitcher className="hover:scale-105 active:scale-95 transition-transform duration-150" />
            <div className="hover:scale-105 active:scale-95 transition-transform duration-150">
              <ThemeToggle />
            </div>

            {/* Telegram Support Navbar Button */}
            <a
              href="https://t.me/fitnaai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#229ED9] hover:text-[#229ED9]/80 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-150 hover:scale-110 active:scale-95 inline-flex items-center justify-center cursor-pointer"
              title={isRtl ? "الدعم عبر تيليجرام" : "Telegram Support"}
              aria-label="Telegram Support"
            >
              <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
            </a>

            <div className="h-4 w-px bg-white/20 hidden sm:block" />

            <Link
              href="/"
              className="text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition hidden sm:inline"
            >
              {isRtl ? "عن المنصة" : "About"}
            </Link>

            {isAuthenticated ? (
              <Link
                href="/dashboard/teacher"
                className="px-3.5 py-1.5 rounded-xl bg-[#12B8C4] hover:bg-[#0ea5b1] text-white font-bold transition shadow-sm hover:shadow"
              >
                {isRtl ? "لوحة التحكم" : "Dashboard"}
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl bg-[#12B8C4] hover:bg-[#0ea5b1] text-white font-bold transition shadow-sm hover:shadow"
              >
                {isRtl ? "تسجيل الدخول" : "Sign In"}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Guide Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex-grow flex flex-col gap-8">
        {/* Page Hero Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#12B8C4]/15 text-[#12B8C4] border border-[#12B8C4]/25 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isRtl ? "دليل المعلم الشامل" : "Comprehensive Teacher Manual"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#071B3A] dark:text-white tracking-tight">
            {isRtl ? "دليل استخدام فِطْنَة" : "Fitna AI User Guide"}
          </h1>
          <p className="text-xs sm:text-base text-[#071B3A]/70 dark:text-white/70 leading-relaxed font-normal">
            {isRtl
              ? "كل خطوة تحتاجها لتتحول من أول تسجيل دخول إلى تقرير تقييم كامل — بالتفصيل."
              : "Every step you need to go from your first login to a complete evaluation report — in detail."}
          </p>
        </div>

        {/* 5 Core Guide Sections Cards */}
        <div className="space-y-5">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section
                key={sec.id}
                className="bg-white dark:bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-[#071B3A]/10 dark:border-white/10 p-5 sm:p-7 shadow-sm transition hover:shadow-md"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-[#071B3A]/5 dark:border-white/10">
                  <div className="w-9 h-9 rounded-xl bg-[#12B8C4]/15 text-[#12B8C4] flex items-center justify-center shrink-0 border border-[#12B8C4]/25">
                    <Icon className="w-5 h-5 text-[#12B8C4]" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#071B3A] dark:text-white">
                    {sec.title}
                  </h2>
                </div>

                {/* Section Bullets with Teal Dots */}
                <ul className="space-y-3 text-xs sm:text-sm text-[#071B3A]/85 dark:text-white/85 leading-relaxed">
                  {sec.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#12B8C4] mt-1.5 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Quick FAQ Accordion Card */}
        <section className="bg-white dark:bg-white/[0.04] rounded-2xl sm:rounded-3xl border border-[#071B3A]/10 dark:border-white/10 p-5 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#071B3A]/5 dark:border-white/10">
            <div className="w-9 h-9 rounded-xl bg-[#FFB52E]/15 text-[#FFB52E] flex items-center justify-center shrink-0 border border-[#FFB52E]/30">
              <MessageSquare className="w-5 h-5 text-[#FFB52E]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#071B3A] dark:text-white">
              {isRtl ? "أسئلة سريعة" : "Frequently Asked Questions"}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#071B3A]/10 dark:border-white/10 overflow-hidden transition-all bg-[#F6F0E4]/30 dark:bg-white/[0.02]"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-start cursor-pointer hover:bg-[#F6F0E4]/60 dark:hover:bg-white/[0.05] transition"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#071B3A] dark:text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#12B8C4] shrink-0 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[#071B3A]/75 dark:text-white/75 leading-relaxed border-t border-[#071B3A]/5 dark:border-white/5 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Block */}
        <div className="pt-4 pb-6 flex flex-col items-center justify-center text-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href={isAuthenticated ? "/session/setup" : "/login"}
              className="px-6 py-3 rounded-xl bg-[#12B8C4] hover:bg-[#0ea5b1] text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 inline-flex items-center gap-2"
            >
              <span>{isRtl ? "ابدأ التدريب الآن" : "Start Simulation Now"}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>

            <Link
              href="/about"
              className="px-6 py-3 rounded-xl border border-[#12B8C4]/40 hover:border-[#12B8C4] text-[#12B8C4] hover:bg-[#12B8C4]/10 font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95"
            >
              {isRtl ? "عن المنصة" : "About Platform"}
            </Link>
          </div>

          <p className="text-xs text-[#071B3A]/50 dark:text-white/50 font-medium">
            {isRtl ? "شغل المايك واتكلم — الباقي علينا." : "Turn on the mic and speak — we handle the rest."}
          </p>
        </div>
      </main>

      {/* Corporate Footer with Telegram Support */}
      <footer className="border-t border-[#071B3A]/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs text-[#071B3A]/50 dark:text-white/50 py-6 mt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>
            {isRtl
              ? "جميع الحقوق محفوظة © 2026 نظام فطنة للذكاء الاصطناعي التربوي"
              : "All rights reserved © 2026 Fitna AI Pedagogical System"}
          </span>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#071B3A] dark:hover:text-white transition">
              {isRtl ? "المعايير المعتمدة" : "Standards"}
            </Link>
            <Link href="/" className="hover:text-[#071B3A] dark:hover:text-white transition">
              {isRtl ? "سياسة الخصوصية" : "Privacy Policy"}
            </Link>
            <a
              href="https://t.me/fitnaai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#12B8C4] transition flex items-center gap-1.5 font-medium text-[#071B3A]/70 dark:text-white/70"
            >
              <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
              <span>{isRtl ? "المساعدة والدعم" : "Help & Support"}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
