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
      title: "١) الحساب وتسجيل الدخول",
      icon: User,
      bullets: [
        "سجّل الدخول عبر صفحة الدخول باستخدام بريدك الإلكتروني وكلمة المرور، أو عبر زر «المتابعة باستخدام Google» بنقرة واحدة.",
        "ليس لديك حساب؟ انقر على «أنشئ حسابًا الآن» وأدخل الاسم والبريد الإلكتروني وكلمة المرور — يتم تجهيز الحساب في ثوانٍ معدودة.",
        "ترغب في التجربة أولاً؟ يتيح لك زر «تجربة المنصة فورًا بحساب تجريبي» الدخول المباشر بحساب معلّم متكامل دون الحاجة إلى التسجيل.",
        "نسيت كلمة المرور؟ يتيح لك خيار «نسيت كلمة المرور؟» استلام رابط آمن لاستعادة كلمة المرور عبر بريدك الإلكتروني.",
      ],
    },
    {
      id: "setup",
      number: "٢",
      title: "٢) إعداد جلسة المحاكاة",
      icon: Sliders,
      bullets: [
        "من لوحة التحكم، انقر على «ابدأ جلسة جديدة» للانتقال إلى صفحة الإعداد المسبق للجلسة.",
        "حدّد موضوع الدرس (أو اختر من الموضوعات المقترحة)، ثم أضف ملخص المحتوى في خانة «محتوى الدرس» — أو ارفع ملف PDF ليقوم النظام باستخلاص محتواه تلقائيًا.",
        "يمكنك الاستعانة بأحد النماذج المسبقة من شريط «قوالب دروس جاهزة» ليتم إدراج ملخص تعليمي شامل فورًا دون الحاجة للكتابة من البداية.",
        "اختر اللهجة المرغوبة (المصرية أو السعودية) — حيث يتفاعل الطلاب الافتراضيون ويتحدثون معك بذات اللهجة المختارة طوال الجلسة.",
        "حدّد مدة الجلسة (١٠ إلى ٣٠ دقيقة)، ونمط الفصل التعليمي (متوازن / متشتت / غير متفاعل)، إلى جانب هدفك التدريبي المنشود.",
        "حدّد اللقب المفضّل («يا مستر»، «يا ميس»، أو «يا أستاذ») واكتب اسمك — لكي يناديك الطلاب باللقب والاسم طيلة المحاكاة.",
      ],
    },
    {
      id: "live",
      number: "٣",
      title: "٣) غرفة المحاكاة الصفية الحية",
      icon: Mic,
      bullets: [
        "انقر على زر الميكروفون لمرة واحدة لبدء وضع الاستماع المفتوح — وعندما تتحدث، يستمع إليك الفصل ويجيبك الطلاب صوتيًا في الوقت الفعلي.",
        "تحدث بنبرتك وأسلوبك الطبيعي دون الحاجة للضغط المستمر على أي زر؛ يتعرّف النظام تلقائيًا على انتهاء جملتك وفقًا لفترات الصمت الطبيعية.",
        "ترغب في مقاطعة طالب أثناء حديثه؟ تحدث بصوت واضح ومباشر — وسيقوم نظام المقاطعة الذكية (Barge-in) بإيقاف الطالب فورًا للإنصات إليك.",
        "من خلال تبويب «سجل الحوار» يمكنك متابعة النصوص المنطوقة لحظة بلحظة، ومن تبويب «الفصل» تتابع الحالة النفسية ومستوى انتباه كل طالب.",
        "عبر الهواتف الذكية: يُرجى منح المتصفح إذن الوصول إلى الميكروفون، ويُفضّل استخدام سماعات أو التواجد في بيئة هادئة لتجربة مثالية.",
        "يسمح لك زر كتم الصوت المجاور للميكروفون بإيقاف الاستماع مؤقتًا متى أردت أخذ استراحة سريعة.",
      ],
    },
    {
      id: "report",
      number: "٤",
      title: "٤) ختام الجلسة وتقرير التقييم",
      icon: BarChart3,
      bullets: [
        "يمكنك إنهاء المحاكاة في أي وقت عبر زر «إنهاء الجلسة»، أو الانتظار حتى انتهاء الوقت المحدد تلقائيًا.",
        "عقب انتهاء الجلسة، يُنتج النظام تقريرًا تقييميًا شاملاً يتضمن: ملخص الحوار، والتقييم وفق ستة محاور تربوية، وتحليل نبرة الصوت، ونقاط القوة، وتوصيات التطوير المهني.",
        "من صفحة «سجل الجلسات» يمكنك استعراض كافة التقارير السابقة، وعبر «لوحة النمو» تتابع وتيرة تطورك وتصاعد مهاراتك عبر الجلسات المتتالية.",
        "تستطيع إعادة توليد التقرير التحليلي من داخل صفحة الجلسة في حال رغبت بتحديث المخرجات بعد مراجعة مجريات الحوار.",
      ],
    },
    {
      id: "settings",
      number: "٥",
      title: "٥) الإعدادات والإرشادات العامة",
      icon: Sparkles,
      bullets: [
        "من قسم الإعدادات، تستطيع تعديل اسمك واللقب المعتمد واللهجة الافتراضية والهدف التدريبي المستمر.",
        "كافة بياناتك الصوتية والنصية مشفرة بصورة آمنة وتُعالج حصرًا لإنتاج التقرير التحليلي؛ ولا تُستخدم لأي أغراض تدريبية خارجية.",
        "للحصول على أفضل استجابة، يُوصى باستخدام أحدث إصدارات متصفح Chrome أو Safari مع التحقق من تفعيل الميكروفون من إعدادات جهازك.",
        "في حال عدم استجابة الطلاب: تأكد من تفعيل إضاءة زر الميكروفون، أو ارفع صوتك قليلاً، أو أعد تشغيل الميكروفون بنقرتين متتاليتين.",
      ],
    },
  ];

  const faqs = [
    {
      q: "هل يتطلب تشغيل المحاكاة ميكروفونًا احترافيًا؟",
      a: "لا يتطلب ذلك إطلاقًا؛ إذ يُعد ميكروفون الحاسوب المحمول أو سماعة الهاتف المعتادة كافيًا تمامًا. احرص فقط على التواجد في مكان قليل الضوضاء والسماح للمتصفح بالوصول للميكروفون.",
    },
    {
      q: "كيف تعمل ميزة المقاطعة المباشرة أثناء حديث الطالب (Barge-in)؟",
      a: "المنصة مزودة بخاصية المقاطعة الذكية في الوقت الفعلي؛ فعندما تتحدث بصوت مسموع أثناء إجابة أحد الطلاب، يتوقف الطالب فورًا عن الكلام ليفسح المجال لتوجيهك تمامًا كما يجري في الحصة الصفية الحقيقية.",
    },
    {
      q: "هل يتم تخزين التسجيلات الصوتية أو مشاركتها خارجيًا؟",
      a: "كافة المعالجات الصوتية والنصية تجري وتُحلل لغرض استخراج مؤشرات الأداء والتقرير البيداغوجي الخاص بك فقط. بياناتك محمية ومشفرة ولا يتم تخزينها أو مشاركتها مع أطراف خارجية.",
    },
    {
      q: "ما هو الفارق بين أنماط الفصل (المتوازن، المتشتت، وغير المتفاعل)؟",
      a: "النمط المتوازن يمثل بيئة صفية قياسية بتفاعل طبيعي. النمط المتشتت يختبر قدرتك على احتواء المقاطعات وضبط النظام الصفي بحزم وحكمة. بينما يتطلب النمط غير المتفاعل طرح أسئلة سقراطية استدراجية متكررة لتحفيز الطلاب الخاملين.",
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
            <div className="flex items-center gap-2 cursor-default select-none pointer-events-none">
              <Logo variant="dark" height={32} className="dark:hidden" />
              <Logo variant="light" height={32} className="hidden dark:block" />
            </div>
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
        {/* Page Hero Header - Pure Modern Standard Arabic */}
        <section className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#12B8C4]/10 text-[#12B8C4] border border-[#12B8C4]/25 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>دليل المعلم الشامل</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#071B3A] dark:text-white tracking-tight">
            دليل استخدام فِطْنَة
          </h1>
          <p className="text-sm sm:text-base font-semibold text-[#12B8C4]">
            دليلك الشامل خطوة بخطوة من تسجيل الدخول الأول وحتى استخراج التقرير التقييمي المتكامل.
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
              أسئلة شائعة حول الاستخدام
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

        {/* Bottom CTA Block */}
        <section className="bg-[#E6F8F9] dark:bg-[#082436] border border-[#12B8C4]/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-[#12B8C4]">
              ابدأ تدريبك الصفي التفاعلي الآن
            </h3>
            <p className="text-xs sm:text-sm text-[#071B3A]/75 dark:text-white/75 max-w-2xl mx-auto leading-relaxed">
              محاكي فِطنة جاهز لمرافقتك نحو التميز المهني، حدد معايير جلستك وتفاعل بصوتك الطبيعي مع طلاب الذكاء الاصطناعي.
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
