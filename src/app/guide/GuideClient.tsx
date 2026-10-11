"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TelegramIcon } from "@/components/TelegramIcon";
import { MarketSwitcher } from "@/components/MarketSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation, type Language, type Market } from "@/lib/i18n";
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
} from "lucide-react";

interface GuideClientProps {
  initialLang?: Language;
  initialMarket?: Market;
  isAuthenticated: boolean;
}

export function GuideClient({
  initialLang,
  initialMarket,
  isAuthenticated,
}: GuideClientProps) {
  const { lang: ctxLang, market: ctxMarket } = useTranslation();
  const lang = ctxLang || initialLang || "ar";
  const market = ctxMarket || initialMarket || "eg";
  const isEn = lang === "en";
  const isRtl = !isEn;
  const isSa = market === "sa";

  // Accordion FAQ state (default first item open)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const content = {
    en: {
      breadcrumb: "User Guide",
      badge: "Comprehensive Teacher Guide",
      heroTitle: "Fitna AI User Guide",
      heroSubtitle:
        "Your step-by-step handbook from your very first login to generating a certified pedagogical evaluation report.",
      aboutBtn: "About Fitna",
      dashboardBtn: "Dashboard",
      loginBtn: "Sign In",
      faqHeader: "Frequently Asked Questions",
      telegramBtn: "Telegram Support",
      footerCopyright: "All rights reserved © 2026 Fitna AI Pedagogical System",
      sections: [
        {
          id: "auth",
          number: "1",
          title: "1) Account Creation & Sign In",
          icon: User,
          bullets: [
            "Sign in with your email and password, or use one-click 'Continue with Google'.",
            "New to Fitna? Click 'Sign Up', enter your name and email — your simulation workspace will be ready in seconds.",
            "Want to explore immediately? Use 'Try Demo Account' for instant access to a pre-configured teacher environment without any registration.",
            "Forgot your password? Use the 'Forgot Password?' link to receive a secure password recovery email.",
          ],
        },
        {
          id: "setup",
          number: "2",
          title: "2) Configuring Your Simulation Session",
          icon: Sliders,
          bullets: [
            "From your Dashboard, click 'Start New Simulation' to open the session setup screen.",
            "Specify your lesson topic (or select from suggested grade-level topics), and enter a summary in 'Lesson Content' — or upload a PDF document for automatic pedagogical extraction.",
            "Choose a pre-made lesson plan from the 'Lesson Templates' carousel to instantly populate learning objectives and background facts without typing from scratch.",
            "Select your classroom environment (American English, Saudi Arabia, or Egypt) — your AI students (Liam, Emma, Oliver, Sophia) will converse in natural, accent-perfect speech throughout the lesson.",
            "Set session duration (10 to 30 minutes), classroom dynamic pattern (Balanced, Disruptive & Active, or Passive & Quiet), and your target instructional objective.",
            "Select your preferred teacher title ('Mr.', 'Ms.', or 'Teacher') and enter your name so students address you naturally throughout the simulation.",
          ],
        },
        {
          id: "live",
          number: "3",
          title: "3) The Live Interactive Classroom Room",
          icon: Mic,
          bullets: [
            "Click the microphone button once to activate open listening mode — as you speak, the room listens and students respond vocally in real time.",
            "Speak in your natural cadence without holding down any push-to-talk button; the system automatically detects natural pauses when you finish your thought.",
            "Need to interrupt a student mid-sentence? Speak firmly and directly — the intelligent Barge-in system pauses the student immediately to yield the floor to your guidance.",
            "Use the 'Dialogue Stream' tab to follow transcribed turns in real time, and the 'Classroom' tab to monitor each student's mental state, attention, and comprehension levels.",
            "On mobile devices: grant browser microphone permissions and use headphones or a quiet room for optimal speech recognition.",
            "Use the mute toggle beside the microphone anytime you wish to take a quick breather or review your notes.",
          ],
        },
        {
          id: "report",
          number: "4",
          title: "4) Session Wrap-Up & Assessment Report",
          icon: BarChart3,
          bullets: [
            "End your lesson anytime using 'End Session', or allow the timer to naturally complete the session.",
            "Fitna generates a comprehensive evaluation report featuring: transcript audio playback, Danielson (3b, 3c, 2d) and CLASS rubric scorecards, acoustic tone analysis, pedagogical strengths, and prioritized development recommendations.",
            "Review past performances in 'Session History', and track long-term instructional progress in your 'Growth Dashboard'.",
            "Generate exportable, beautifully styled PDF reports for professional portfolios, school leadership reviews, and accreditation files.",
          ],
        },
        {
          id: "settings",
          number: "5",
          title: "5) Account Settings & Best Practices",
          icon: Sparkles,
          bullets: [
            "In Settings, adjust your display name, preferred honorific title, default classroom market, and long-term training objectives.",
            "All speech and text data are securely encrypted and processed strictly to generate your diagnostic report; no audio is sold or shared with external parties.",
            "For optimal real-time responsiveness, we recommend the latest versions of Google Chrome or Apple Safari with high-speed internet.",
            "If students seem unresponsive: verify the microphone indicator glow, project your voice clearly, or toggle the microphone off and on.",
          ],
        },
      ],
      faqs: [
        {
          q: "Do I need a professional external microphone?",
          a: "Not at all. Your laptop's built-in microphone or standard phone earbuds work great. Just ensure you are in a relatively quiet environment and grant your browser microphone permission.",
        },
        {
          q: "How does real-time student interruption (Barge-in) work?",
          a: "Fitna AI features low-latency voice interruption. When you speak while an AI student is talking, the student stops talking immediately and listens to your redirection, exactly like in a live classroom.",
        },
        {
          q: "Is my session audio stored or shared publicly?",
          a: "All voice data is processed privately to extract your performance metrics and diagnostic report. Your sessions are strictly confidential and encrypted.",
        },
        {
          q: "What is the difference between classroom patterns?",
          a: "Balanced represents a standard classroom with steady participation. Disruptive tests your classroom management and behavior redirection. Passive challenges you to deploy higher-order Socratic questions to draw quiet students out.",
        },
      ],
    },
    sa: {
      breadcrumb: "دليل الاستخدام",
      badge: "دليل المعلم الشامل",
      heroTitle: "دليل استخدام فِطْنَة",
      heroSubtitle:
        "دليلك الشامل خطوة بخطوة من تسجيل الدخول الأول وحتى استخراج التقرير التقييمي البيداغوجي المعتمد.",
      aboutBtn: "عن المنصة",
      dashboardBtn: "لوحة التحكم",
      loginBtn: "تسجيل الدخول",
      faqHeader: "الأسئلة الشائعة",
      telegramBtn: "الدعم عبر تيليجرام",
      footerCopyright: "جميع الحقوق محفوظة © 2026 نظام فطنة للذكاء الاصطناعي التربوي",
      sections: [
        {
          id: "auth",
          number: "١",
          title: "١) الحساب وتسجيل الدخول",
          icon: User,
          bullets: [
            "سجّل الدخول عبر صفحة الدخول باستخدام بريدك الإلكتروني وكلمة المرور، أو عبر زر «المتابعة باستخدام Google» بنقرة واحدة.",
            "ليس لديك حساب؟ انقر على «أنشئ حسابًا الآن» وأدخل الاسم والبريد الإلكتروني — يتم تجهيز مساحة المحاكاة الخاصة بك في ثوانٍ معدودة.",
            "ترغب في التجربة أولاً؟ يتيح لك خيار «الحساب التجريبي» الدخول المباشر واستكشاف المنصة بكامل خصائصها دون الحاجة إلى التسجيل المسبق.",
            "نسيت كلمة المرور؟ يتيح لك رابط «نسيت كلمة المرور؟» استلام رابط آمن ومباشر لإعادة تعيين كلمة المرور عبر بريدك الإلكتروني.",
          ],
        },
        {
          id: "setup",
          number: "٢",
          title: "٢) إعداد جلسة المحاكاة الصفية",
          icon: Sliders,
          bullets: [
            "من لوحة التحكم، انقر على «ابدأ محاكاة جديدة» للانتقال إلى صفحة الضبط المسبق للجلسة التدريبية.",
            "حدّد موضوع الدرس وأضف ملخص المحتوى في خانة «محتوى الدرس» — أو ارفع ملف PDF ليقوم النظام باستخلاص محتواه التعليمي وأهدافه تلقائيًا.",
            "يمكنك الاستعانة بأحد النماذج المسبقة من شريط «قوالب دروس جاهزة» لإدراج خطة درس نموذجية فورًا دون الحاجة للكتابة اليدوية.",
            "اختر البيئة الصفية المرغوبة (السعودية، المصرية، أو الإنجليزية) — حيث يتفاعل الطلاب الافتراضيون (ريم، وفهد، وسلطان، وجوري) باللغة الفصحى وبأصوات طلاب سعوديين طبيعية طوال الجلسة.",
            "حدّد مدة الجلسة (١٠ إلى ٣٠ دقيقة)، ونمط الفصل التعليمي (متوازن / متشتت / غير متفاعل)، إلى جانب هدفك التدريبي المنشود.",
            "حدّد اللقب المفضّل («يا أستاذ» أو «يا أستاذة») واكتب اسمك — لكي يناديك الطلاب باللقب والاسم طيلة المحاكاة.",
          ],
        },
        {
          id: "live",
          number: "٣",
          title: "٣) غرفة المحاكاة الصفية الحية",
          icon: Mic,
          bullets: [
            "انقر على زر الميكروفون لمرة واحدة لبدء وضع الاستماع المفتوح — وعندما تتحدث، ينصت الفصل إليك ويجيبك الطلاب صوتيًا في الوقت الفعلي.",
            "تحدث بنبرتك وأسلوبك التدريسي الطبيعي دون الحاجة للضغط المستمر على أي زر؛ يتعرّف النظام تلقائيًا على انتهاء جملتك وسؤالك.",
            "ترغب في مقاطعة طالب أثناء حديثه لتصحيح مفهوم أو إدارة الوقت؟ تحدث بصوت واضح — وسيقوم نظام المقاطعة الذكية (Barge-in) بإيقاف الطالب فورًا للإنصات لتوجيهك.",
            "من خلال تبويب «سجل الحوار» يمكنك متابعة النصوص المنطوقة لحظة بلحظة، ومن تبويب «الفصل» تتابع الحالة النفسية ومستوى انتباه كل طالب.",
            "عبر الهواتف الذكية: يُرجى منح المتصفح إذن الوصول إلى الميكروفون، ويُفضّل استخدام سماعات أو التواجد في بيئة هادئة لتجربة مثالية.",
            "يسمح لك زر كتم الصوت المجاور للميكروفون بإيقاف الاستماع مؤقتًا متى أردت أخذ استراحة سريعة.",
          ],
        },
        {
          id: "report",
          number: "٤",
          title: "٤) ختام الجلسة وتقرير التقييم البيداغوجي",
          icon: BarChart3,
          bullets: [
            "يمكنك إنهاء المحاكاة في أي وقت عبر زر «إنهاء الجلسة»، أو الانتظار حتى انتهاء الوقت المحدد تلقائيًا.",
            "عقب انتهاء الجلسة، يُنتج النظام تقريرًا تقييميًا شاملاً يتضمن: تشخيص الأداء وفق معايير Danielson و CLASS، وتوازن زمن حديث المعلم (TTT)، ونسبة الأسئلة السقراطية، ومؤشر الشمولية، وتوصيات التطوير المهني.",
            "من صفحة «سجل الجلسات» يمكنك استعراض التقارير السابقة، وعبر «لوحة النمو» تتابع وتيرة تطورك وتصاعد مهاراتك عبر الجلسات المتتالية.",
            "يتيح لك النظام تصدير التقرير بصيغة PDF معتمدة لحفظها في ملف الإنجاز المهني أو مشاركتها مع المشرفين التربويين.",
          ],
        },
        {
          id: "settings",
          number: "٥",
          title: "٥) الإعدادات والإرشادات العامة",
          icon: Sparkles,
          bullets: [
            "من قسم الإعدادات، تستطيع تعديل اسمك واللقب المعتمد والبيئة الصفية الافتراضية والهدف التدريبي المستمر.",
            "كافة بياناتك الصوتية والنصية مشفرة بصورة آمنة وتُعالج حصرًا لإنتاج التقرير التحليلي؛ ولا تُستخدم لأي أغراض خارجية.",
            "للحصول على أفضل استجابة، يُوصى باستخدام أحدث إصدارات متصفح Chrome أو Safari مع التحقق من تفعيل الميكروفون من إعدادات جهازك.",
            "في حال عدم استجابة الطلاب: تأكد من تفعيل إضاءة زر الميكروفون، أو ارفع صوتك قليلاً، أو أعد تشغيل الميكروفون بنقرتين متتاليتين.",
          ],
        },
      ],
      faqs: [
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
      ],
    },
    eg: {
      breadcrumb: "دليل الاستخدام",
      badge: "دليل المعلم الشامل",
      heroTitle: "دليل استخدام فِطْنَة",
      heroSubtitle:
        "دليلك الشامل خطوة بخطوة من تسجيل الدخول الأول وحتى استخراج التقرير التقييمي المتكامل.",
      aboutBtn: "عن المنصة",
      dashboardBtn: "لوحة التحكم",
      loginBtn: "تسجيل الدخول",
      faqHeader: "الأسئلة الشائعة",
      telegramBtn: "الدعم عبر تيليجرام",
      footerCopyright: "جميع الحقوق محفوظة © 2026 نظام فطنة للذكاء الاصطناعي التربوي",
      sections: [
        {
          id: "auth",
          number: "١",
          title: "١) الحساب وتسجيل الدخول",
          icon: User,
          bullets: [
            "سجّل الدخول عبر صفحة الدخول باستخدام بريدك الإلكتروني وكلمة المرور، أو عبر زر «المتابعة باستخدام Google» بنقرة واحدة.",
            "ليس لديك حساب؟ انقر على «أنشئ حسابًا الآن» وأدخل الاسم والبريد الإلكتروني — يتم تجهيز الحساب في ثوانٍ معدودة.",
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
            "حدّد موضوع الدرس وأضف ملخص المحتوى في خانة «محتوى الدرس» — أو ارفع ملف PDF ليقوم النظام باستخلاص محتواه تلقائيًا.",
            "يمكنك الاستعانة بأحد النماذج المسبقة من شريط «قوالب دروس جاهزة» ليتم إدراج ملخص تعليمي شامل فورًا دون الحاجة للكتابة من البداية.",
            "اختر البيئة المرغوبة (المصرية، السعودية، أو الإنجليزية) — حيث يتفاعل الطلاب الافتراضيون (سارة، وعمر، ويوسف، ونور) بلهجة الفصول المصرية وأصوات واقعية طوال الجلسة.",
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
            "عقب انتهاء الجلسة، يُنتج النظام تقريرًا تقييميًا شاملاً يتضمن: ملخص الحوار، والتقييم وفق ستة محاور تربوية، ونقاط القوة، وتوصيات التطوير المهني.",
            "من صفحة «سجل الجلسات» يمكنك استعراض كافة التقارير السابقة، وعبر «لوحة النمو» تتابع وتيرة تطورك وتصاعد مهاراتك عبر الجلسات المتتالية.",
            "تستطيع تصدير التقرير بصيغة PDF عالية الجودة بضغطة واحدة من زر الطباعة / تصدير PDF.",
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
      ],
      faqs: [
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
      ],
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
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#12B8C4]">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{activeContent.breadcrumb}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <MarketSwitcher locked={false} />
            <LanguageSwitcher />
            <ThemeToggle />

            {/* Link to About */}
            <Link
              href="/about"
              className="px-3 h-8 rounded-full border border-[#071B3A]/10 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#071B3A]/80 dark:text-white/80 transition text-xs font-semibold inline-flex items-center whitespace-nowrap shrink-0"
            >
              {activeContent.aboutBtn}
            </Link>

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

      {/* Main Guide Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full flex-grow flex flex-col space-y-10">
        {/* Page Hero Header */}
        <section className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#12B8C4]/10 text-[#12B8C4] border border-[#12B8C4]/25 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{activeContent.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#071B3A] dark:text-white tracking-tight">
            {activeContent.heroTitle}
          </h1>
          <p className="text-sm sm:text-base font-semibold text-[#12B8C4] max-w-2xl mx-auto leading-relaxed">
            {activeContent.heroSubtitle}
          </p>
        </section>

        {/* 5 Core Guide Sections Cards */}
        <div className="space-y-4">
          {activeContent.sections.map((sec) => {
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

        {/* FAQ Accordion Section */}
        <section className="bg-white dark:bg-[#0A1A33] rounded-3xl border border-[#071B3A]/10 dark:border-white/10 p-6 sm:p-7 shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-black text-[#071B3A] dark:text-white pb-2 border-b border-[#071B3A]/5 dark:border-white/10">
            {activeContent.faqHeader}
          </h2>

          <div className="divide-y divide-[#071B3A]/5 dark:divide-white/5">
            {activeContent.faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-3.5 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between text-start gap-3 py-1 font-bold text-xs sm:text-sm text-[#071B3A] dark:text-white hover:text-[#12B8C4] dark:hover:text-[#12B8C4] transition cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#12B8C4] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs sm:text-sm text-[#071B3A]/70 dark:text-white/70 leading-relaxed pr-1 animate-in fade-in duration-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Card */}
        <section className="bg-gradient-to-br from-[#12B8C4]/15 via-transparent to-[#FFB52E]/10 rounded-3xl border border-[#12B8C4]/30 p-7 text-center space-y-3.5">
          <h3 className="text-base sm:text-lg font-black text-[#071B3A] dark:text-white">
            {isEn
              ? "Ready to step into your smart virtual classroom?"
              : "جاهز لتجربة فصلك الذكي الآن؟"}
          </h3>
          <p className="text-xs sm:text-sm text-[#071B3A]/70 dark:text-white/70 max-w-lg mx-auto leading-relaxed">
            {isEn
              ? "Experience dynamic, voice-powered AI students and master classroom leadership in a completely safe training space."
              : "جرّب المحاكاة بصوتك الطبيعي واكتشف أسلوبك التدريسي قبل الحصة الفعلية."}
          </p>
          <div className="pt-2">
            <Link
              href={isAuthenticated ? "/session/setup" : "/login"}
              className="px-6 py-2.5 rounded-full bg-[#12B8C4] hover:bg-[#0ea5b1] text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{isEn ? "Start Simulation Now" : "ابدأ المحاكاة الآن"}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#071B3A]/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs text-[#071B3A]/50 dark:text-white/50 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>{activeContent.footerCopyright}</span>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-[#12B8C4] transition">
              {activeContent.aboutBtn}
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
