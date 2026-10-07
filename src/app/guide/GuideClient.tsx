"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TelegramIcon } from "@/components/TelegramIcon";
import {
  BookOpen,
  User,
  Sliders,
  Mic,
  BarChart3,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface GuideClientProps {
  initialLang?: string;
  isAuthenticated: boolean;
}

export function GuideClient({ isAuthenticated }: GuideClientProps) {
  // Accordion FAQ state (default first item open)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const sections = [
    {
      id: "auth",
      number: "١",
      title: "١) الحساب والدخول",
      icon: User,
      bullets: [
        "ادخل من صفحة تسجيل الدخول ببريدك الإلكتروني وكلمة المرور، أو بزر «المتابعة بحساب Google» بضغطة واحدة.",
        "ما عندك حساب؟ اضغط «أنشئ حسابًا الآن» واملأ الاسم والبريد وكلمة المرور — الحساب الجاهز في ثوانٍ.",
        "عايز تجرب الأول؟ زر «تجربة المنصة فورًا بحساب تجريبي» يفتح لك حساب معلم كامل بدون أي تسجيل.",
        "نسيت كلمة المرور؟ «نسيت كلمة المرور؟» تحت حقل كلمة المرور ترسل لك رابط استعادة على بريدك.",
      ],
    },
    {
      id: "setup",
      number: "٢",
      title: "٢) تجهيز جلسة المحاكاة",
      icon: Sliders,
      bullets: [
        "من لوحة التحكم اضغط «ابدأ جلسة جديدة» لتنتقل لصفحة التجهيز.",
        "اكتب موضوع الدرس (أو اختر موضوعًا موجودًا)، ثم الصق ملخص الدرس في خانة «محتوى الدرس» — أو ارفع ملف PDF فيقرأه النظام بنفسه.",
        "ما عايز تكتب درس من الصفر؟ اضغط أي قالب جاهز من شريط «قوالب دروس جاهزة» فيتحول لملخص درس كامل فورًا.",
        "اختر اللهجة (مصرية أو سعودية) — الطلاب هيتفاهموا ويتكلموا بنفس اللهجة اللي اخترتها.",
        "حدد مدة الجلسة (١٠–٣٠ دقيقة)، نمط الفصل (متوازن / مشاغب / فاقد للتركيز)، وهدفك التدريبي.",
        "حدد «يا مستر» أو «يا ميس» واكتب اسمك — الطلاب هينادوا بيك بالصيغة دي طول الجلسة.",
      ],
    },
    {
      id: "live",
      number: "٣",
      title: "٣) غرفة المحاكاة الحية",
      icon: Mic,
      bullets: [
        "اضغط زر المايك الكبير مرة واحدة ليبدأ الاستماع المفتوح — كل ما تتكلم، الفصل يسمعك ويرد عليك بالصوت.",
        "اتكلم بشكل طبيعي من غير ما تضغط أي زر؛ النظام بيحدد نهاية جملتك لوحده من سكتتك.",
        "عايز تقطع طالب وهو بيتكلم؟ اتكلم بصوت واضح مباشرة — النظام يوقفه فورًا ويسمع لك (Barge-in).",
        "من تابة «سجل الحوار» تقرأ كل اللي اتقال في الجلسة لحظة بلحظة، ومن «الفصل» تشاهد حالة كل طالب.",
        "على الموبايل: اسمح لإذن المايكروفون من المتصفح أول مرة، واستخدم سماعة أو مكان هادئ لأفضل تجربة.",
        "زر كتم الصوت (جنب المايك) يوقف الاستماع مؤقتًا — مثلًا لو حبيت تشرب أو تشتغل حاجة تانية.",
      ],
    },
    {
      id: "report",
      number: "٤",
      title: "٤) نهاية الجلسة والتقرير",
      icon: BarChart3,
      bullets: [
        "اضغط زر إنهاء المحاكاة في أي وقت — أو خلّي المؤقت يخلص الجلسة تلقائيًا.",
        "بعد النهاية يولّد النظام تقريرًا تقييميًا كاملًا: ملخص الجلسة، ستة محاور بيداغوجية، تحليل نبرتك، نقاط قوتك، وخطط تطوير.",
        "من صفحة «كل الجلسات» ترجع لأي تقرير قديم، ومن «لوحة النمو» تتابع تطورك عبر الجلسات.",
        "تقدر تعيد توليد التقرير من صفحة الجلسة لو حبيت نسخة محدّثة بعد مراجعة الحوار.",
      ],
    },
    {
      id: "settings",
      number: "٥",
      title: "٥) الإعدادات والنصائح",
      icon: Sparkles,
      bullets: [
        "من الإعدادات تعدّل اسمك وصيغة المناداة ولهجة الفصل الافتراضية وهدفك التدريبي.",
        "بياناتك محفوظة ومشفّرة، وصوتك بيتعالج داخل الجلسة — ما بنستخدمه لأي تدريب خارجي.",
        "لأفضل أداء استخدم Chrome أو Safari حديثين، وتأكد إن المايك مش مكتوم من إعدادات النظام.",
        "لو الطالب مش بيرد: تأكد إن زر المايك مضاء، اتكلم أعلى شوية، أو اضغط المايك مرتين (إيقاف ثم تشغيل).",
      ],
    },
  ];

  const faqs = [
    {
      q: "هل أحتاج مايكروفون احترافي لتشغيل المحاكاة؟",
      a: "لا على الإطلاق! مايكروفون اللابتوب العادي أو سماعة الهاتف السلكية/البلوتوث كافية تماماً. تأكد فقط من الوجود في غرفة هادئة والسماح للمتصفح بالوصول للمايك.",
    },
    {
      q: "كيف يقاطعني الطلاب أو أقاطعهم (Barge-in)؟",
      a: "النظام مدعوم بتقنية Barge-in الحية. إذا قاطعك طالب وتحدثت بصوت واضح، سيتوقف الطالب عن الكلام فوراً ويتحول للاستماع إليك تماماً كما يحدث في الفصل الحقيقي.",
    },
    {
      q: "هل يتم تخزين تسجيلي الصوتي في خوادم خارجية؟",
      a: "أبداً. يتم تحويل الصوت إلى نص وتوليد التحليلات الصوتية محلياً أثناء الجلسة لإنتاج التقرير التربوي فقط. جميع بياناتك مشفرة ولا تُستخدم لتدريب أي نماذج عامة.",
    },
    {
      q: "ما الفرق بين النمط المتوازن والمشاغب والفاقد للتركيز؟",
      a: "النمط المتوازن يمثل فصلاً طبيعياً مع تفاوت معتاد في الانتباه. النمط المشاغب يزيد من مقاطعات الطلاب وتشتتهم لاختبار مهارات الحزم والضبط. أما الفاقد للتركيز فيتطلب طرح أسئلة سقراطية متكررة لإعادة دمجهم.",
    },
  ];

  return (
    <div
      className="bg-[#F8FAFC] dark:bg-[#071328] text-[#071B3A] dark:text-white font-readex antialiased min-h-screen flex flex-col selection:bg-[#12B8C4]/20 selection:text-[#071B3A] transition-colors"
      dir="rtl"
    >
      {/* Top Navbar matching /about */}
      <nav className="bg-white/80 dark:bg-[#071B3A]/90 backdrop-blur-md border-b border-[#071B3A]/10 dark:border-white/10 sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo variant="dark" height={32} className="dark:hidden transition-transform duration-200 group-hover:scale-105" />
              <Logo variant="light" height={32} className="hidden dark:block transition-transform duration-200 group-hover:scale-105" />
            </Link>
            <span className="text-[#071B3A]/30 dark:text-white/30 text-sm">/</span>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#12B8C4]">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>دليل الاستخدام</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 text-xs">
            <ThemeToggle />

            {/* Link to About */}
            <Link
              href="/about"
              className="px-3 py-1 rounded-full border border-[#071B3A]/10 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#071B3A]/80 dark:text-white/80 transition text-xs font-semibold"
            >
              عن المنصة
            </Link>

            {/* Telegram Support Button */}
            <a
              href="https://t.me/fitnaai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#229ED9] hover:text-[#229ED9]/80 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-150 hover:scale-110 active:scale-95 inline-flex items-center justify-center cursor-pointer"
              title="الدعم عبر تيليجرام"
              aria-label="Telegram Support"
            >
              <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
            </a>

            {/* Primary Action / Auth button */}
            <Link
              href={isAuthenticated ? "/dashboard/teacher" : "/login"}
              className="px-4 py-1.5 rounded-xl bg-[#12B8C4] hover:bg-[#0ea5b1] text-white font-bold text-xs shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isAuthenticated ? "لوحة التحكم" : "تسجيل الدخول"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Guide Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full flex-grow flex flex-col space-y-10">
        {/* Page Hero Header */}
        <section className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#12B8C4]/10 text-[#12B8C4] border border-[#12B8C4]/25 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>دليل المعلم الشامل</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#071B3A] dark:text-white tracking-tight">
            دليل استخدام فِطْنَة
          </h1>
          <p className="text-sm sm:text-base font-semibold text-[#12B8C4]">
            كل خطوة تحتاجها لتتحول من أول تسجيل دخول إلى تقرير تقييم كامل — بالتفصيل.
          </p>
        </section>

        {/* 5 Core Guide Sections Cards */}
        <div className="space-y-4">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section
                key={sec.id}
                className="bg-white dark:bg-[#0A1A33] rounded-3xl border border-[#071B3A]/10 dark:border-white/10 p-6 sm:p-7 shadow-sm transition-all hover:border-[#12B8C4]/40"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#071B3A]/5 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#12B8C4]/10 dark:bg-[#12B8C4]/20 text-[#12B8C4] flex items-center justify-center shrink-0 border border-[#12B8C4]/20">
                      <Icon className="w-4 h-4 text-[#12B8C4]" />
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-[#071B3A] dark:text-white">
                      {sec.title}
                    </h2>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-[#12B8C4]/10 text-[#12B8C4] text-xs font-black flex items-center justify-center">
                    {sec.number}
                  </span>
                </div>

                {/* Section Bullets with Teal Dots */}
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#071B3A]/80 dark:text-white/80 leading-relaxed font-normal">
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
        <section className="bg-white dark:bg-[#0A1A33] rounded-3xl border border-[#071B3A]/10 dark:border-white/10 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#071B3A]/5 dark:border-white/10">
            <div className="w-9 h-9 rounded-2xl bg-[#12B8C4]/10 dark:bg-[#12B8C4]/20 flex items-center justify-center border border-[#12B8C4]/20">
              <Sparkles className="w-4 h-4 text-[#12B8C4]" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#071B3A] dark:text-white">
              أسئلة سريعة حول الاستخدام
            </h2>
          </div>

          <div className="divide-y divide-[#071B3A]/5 dark:divide-white/10">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3.5 first:pt-1 last:pb-1">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-start gap-3 group cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#071B3A] dark:text-white group-hover:text-[#12B8C4] transition">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#12B8C4] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-xs text-[#071B3A]/70 dark:text-white/70 leading-relaxed pr-2">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Block matching /about */}
        <section className="bg-[#E6F8F9] dark:bg-[#082436] border border-[#12B8C4]/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-[#12B8C4]">
              شغل المايك واتكلم — الباقي علينا.
            </h3>
            <p className="text-xs sm:text-sm text-[#071B3A]/75 dark:text-white/75 max-w-2xl mx-auto leading-relaxed">
              محاكي فِطنة جاهز لتدريبك الآن، اختر جلستك وتحدث بصوتك الطبيعي مع طلاب الذكاء الاصطناعي.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={isAuthenticated ? "/session/setup" : "/login"}
              className="px-6 py-2.5 rounded-xl bg-[#12B8C4] hover:bg-[#0ea5b1] text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>ابدأ التدريب الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              href="/about"
              className="px-5 py-2.5 rounded-xl border border-[#12B8C4]/40 bg-white dark:bg-white/5 hover:bg-[#12B8C4]/10 text-[#12B8C4] font-bold text-xs sm:text-sm transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>عن المنصة</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#071B3A]/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs text-[#071B3A]/50 dark:text-white/50 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>
            جميع الحقوق محفوظة © 2026 نظام فطنة للذكاء الاصطناعي التربوي
          </span>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-[#12B8C4] transition">
              عن المنصة
            </Link>
            <a
              href="https://t.me/fitnaai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#229ED9] hover:underline inline-flex items-center gap-1"
            >
              <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
              <span>الدعم عبر تيليجرام</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
