"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  GraduationCap,
  Mic,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  storageKey?: string;
}

interface StepConfig {
  targetSelector?: string;
  isModal?: boolean;
}

const STEPS_CONFIG: StepConfig[] = [
  { isModal: true }, // Step 1: Welcome modal
  { targetSelector: '[data-tour="dashboard-header"]' }, // Step 2: Dashboard Header
  { targetSelector: '[data-tour="new-session-btn"]' }, // Step 3: New Session CTA
  { targetSelector: '[data-tour="recent-simulations-card"]' }, // Step 4: Simulations & AI Students
  { targetSelector: '[data-tour="overall-level-card"]' }, // Step 5: Metrics & Analytics
  { isModal: true }, // Step 6: Completion celebration modal
];

export function OnboardingTour({
  isOpen,
  onClose,
  onComplete,
  storageKey = "fitna_has_seen_onboarding",
}: OnboardingTourProps) {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const isRtl = lang === "ar";

  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const totalSteps = STEPS_CONFIG.length;
  const currentConfig = STEPS_CONFIG[currentStep];

  // Helper to mark onboarding as permanently completed/skipped
  const markAsSeen = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "true");
      localStorage.setItem("fitna_has_seen_onboarding", "true");
    } catch {
      // localStorage may fail in private mode
    }
  }, [storageKey]);

  const handleSkip = useCallback(() => {
    markAsSeen();
    onClose();
  }, [markAsSeen, onClose]);

  const handleFinish = useCallback(() => {
    markAsSeen();
    onClose();
    if (onComplete) {
      onComplete();
    } else {
      router.push("/session/setup");
    }
  }, [markAsSeen, onClose, onComplete, router]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentStep, totalSteps, handleFinish]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Intelligent tooltip positioning algorithm
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || currentConfig.isModal || !currentConfig.targetSelector) {
      setTargetRect(null);
      setTooltipPos(null);
      return;
    }

    const el = document.querySelector(currentConfig.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        // Mobile anchors to bottom sheet
        setTooltipPos(null);
        return;
      }

      const tooltipWidth = Math.min(430, window.innerWidth - 32);
      const tooltipMargin = 16;
      const tooltipEl = tooltipRef.current;
      const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 340;

      const spaceBelow = window.innerHeight - rect.bottom - tooltipMargin;
      const spaceAbove = rect.top - tooltipMargin;
      const spaceLeft = rect.left - tooltipMargin;
      const spaceRight = window.innerWidth - rect.right - tooltipMargin;

      let top: number;
      let left: number;

      // Check available space with smart directional fallback
      if (spaceBelow >= tooltipHeight) {
        // Option 1: Fits comfortably below
        top = rect.bottom + tooltipMargin;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
      } else if (spaceAbove >= tooltipHeight) {
        // Option 2: Fits comfortably above
        top = rect.top - tooltipHeight - tooltipMargin;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
      } else if (isRtl && spaceLeft >= tooltipWidth) {
        // Option 3 (RTL): Place to the LEFT of the element (e.g. overall-level-card on right side)
        top = rect.top;
        left = rect.left - tooltipWidth - tooltipMargin;
      } else if (!isRtl && spaceRight >= tooltipWidth) {
        // Option 3 (LTR): Place to the RIGHT of the element
        top = rect.top;
        left = rect.right + tooltipMargin;
      } else if (spaceLeft >= tooltipWidth) {
        top = rect.top;
        left = rect.left - tooltipWidth - tooltipMargin;
      } else if (spaceRight >= tooltipWidth) {
        top = rect.top;
        left = rect.right + tooltipMargin;
      } else {
        // Tight space: Choose whichever side has more room
        if (spaceBelow >= spaceAbove) {
          top = rect.bottom + tooltipMargin;
        } else {
          top = rect.top - tooltipHeight - tooltipMargin;
        }
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
      }

      // Hard clamp so tooltip NEVER extends past any edge of the viewport
      const maxTop = Math.max(tooltipMargin, window.innerHeight - tooltipHeight - tooltipMargin);
      top = Math.max(tooltipMargin, Math.min(top, maxTop));

      const maxLeft = Math.max(tooltipMargin, window.innerWidth - tooltipWidth - tooltipMargin);
      left = Math.max(tooltipMargin, Math.min(left, maxLeft));

      setTooltipPos({ top, left });
    } else {
      setTargetRect(null);
      setTooltipPos(null);
    }
  }, [isOpen, currentConfig, isRtl]);

  // Scroll target element smoothly into view
  useEffect(() => {
    if (!isOpen) return;

    if (!currentConfig.isModal && currentConfig.targetSelector) {
      const el = document.querySelector(currentConfig.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const timer1 = setTimeout(updateTargetPosition, 200);
        const timer2 = setTimeout(updateTargetPosition, 450);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    } else {
      setTargetRect(null);
      setTooltipPos(null);
    }
  }, [isOpen, currentStep, currentConfig, updateTargetPosition]);

  // Real-time tracking on scroll and resize
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("scroll", updateTargetPosition, { passive: true });
    window.addEventListener("resize", updateTargetPosition);
    return () => {
      window.removeEventListener("scroll", updateTargetPosition);
      window.removeEventListener("resize", updateTargetPosition);
    };
  }, [isOpen, updateTargetPosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight") {
        if (isRtl) handleBack();
        else handleNext();
      } else if (e.key === "ArrowLeft") {
        if (isRtl) handleNext();
        else handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleSkip, handleNext, handleBack, isRtl]);

  // Lock background scroll only in centered modal steps
  useEffect(() => {
    if (isOpen && currentConfig.isModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, currentConfig.isModal]);

  if (!isOpen) return null;

  const stepCounterText = (t.onboarding?.stepOf || "الخطوة {current} من {total}")
    .replace("{current}", String(currentStep + 1))
    .replace("{total}", String(totalSteps));

  return (
    <div
      className="fixed inset-0 z-50 select-none font-readex transition-opacity duration-300"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Dynamic SVG Spotlight Cutout Backdrop */}
      {targetRect && !currentConfig.isModal ? (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto transition-all duration-300"
          style={{ width: "100vw", height: "100vh" }}
          onClick={handleNext}
          onWheel={(e) => {
            // Forward mouse wheel scrolling to page so user can comfortably scroll
            window.scrollBy({ top: e.deltaY, behavior: "auto" });
          }}
        >
          <defs>
            <mask id="spotlight-mask">
              {/* White background reveals mask (dark overlay) */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black cutout conceals mask (reveals underlying target) */}
              <rect
                x={Math.max(0, targetRect.left - 8)}
                y={Math.max(0, targetRect.top - 8)}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="16"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(7, 27, 58, 0.78)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      ) : (
        /* Full Backdrop for Modal Steps */
        <div
          className="absolute inset-0 bg-[#071B3A]/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={currentConfig.isModal ? undefined : handleNext}
        />
      )}

      {/* Pulsing highlight ring around targeted element */}
      {targetRect && !currentConfig.isModal && (
        <div
          className="absolute pointer-events-none rounded-2xl border-2 border-[#12B8C4] shadow-[0_0_24px_rgba(18,184,196,0.6)] animate-pulse transition-all duration-300"
          style={{
            left: `${Math.max(0, targetRect.left - 8)}px`,
            top: `${Math.max(0, targetRect.top - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
        />
      )}

      {/* Step 1: Centered Welcome Modal */}
      {currentStep === 0 && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#071B3A] rounded-3xl border border-[#071B3A]/10 dark:border-white/10 shadow-2xl p-6 sm:p-8 text-center flex flex-col items-center relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#12B8C4] via-[#FFB52E] to-[#12B8C4]" />

            {/* Close / Skip button */}
            <button
              type="button"
              onClick={handleSkip}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-[#071B3A]/40 dark:text-white/40 hover:text-[#071B3A] dark:hover:text-white p-1 rounded-full transition cursor-pointer"
              title={t.onboarding?.skip || "تخطي"}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Banner */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#12B8C4]/20 to-[#FFB52E]/20 text-[#12B8C4] flex items-center justify-center mb-5 border border-[#12B8C4]/30 shadow-inner">
              <Compass className="w-8 h-8 text-[#12B8C4]" />
            </div>

            {/* Badge */}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#12B8C4]/15 text-[#12B8C4] border border-[#12B8C4]/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {t.onboarding?.badge || "دليل الاستخدام السريع"}
            </span>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#071B3A] dark:text-white mb-3">
              {t.onboarding?.step1Title || "أهلاً بك في فِطنة"}
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#071B3A]/70 dark:text-white/70 leading-relaxed max-w-md mb-6">
              {t.onboarding?.step1Desc ||
                "فِطنة هي محاكاة ذكية للفصل الدراسي تساعدك تتدرّب على إدارة الفصل والتعامل مع مواقف مختلفة قبل ما تدخل الفصل الحقيقي."}
            </p>

            {/* Progress dots & actions */}
            <div className="w-full flex flex-col gap-4">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {STEPS_CONFIG.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-6 bg-[#12B8C4]"
                        : "w-2 bg-[#071B3A]/15 dark:bg-white/15"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-[#071B3A]/15 dark:border-white/15 text-[#071B3A]/70 dark:text-white/70 hover:bg-[#071B3A]/5 dark:hover:bg-white/5 text-xs font-semibold transition cursor-pointer"
                >
                  {t.onboarding?.skip || "تخطي"}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-[#12B8C4] hover:bg-[#0ea5b1] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#12B8C4]/25 transition hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.onboarding?.startTour || "ابدأ الجولة"}</span>
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Centered Finish Celebration Modal */}
      {currentStep === 5 && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#071B3A] rounded-3xl border border-[#071B3A]/10 dark:border-white/10 shadow-2xl p-6 sm:p-8 text-center flex flex-col items-center relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#12B8C4] via-[#FFB52E] to-[#12B8C4]" />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#12B8C4]/20 to-[#FFB52E]/30 text-[#FFB52E] flex items-center justify-center mb-4 border border-[#FFB52E]/30 shadow-inner">
              <GraduationCap className="w-9 h-9 text-[#FFB52E]" />
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB52E]/15 text-[#FFB52E] border border-[#FFB52E]/25 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isRtl ? "اكتملت الجولة" : "Tour Completed"}
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-[#071B3A] dark:text-white mb-3">
              {t.onboarding?.step6Title || "أنت جاهز للبدء"}
            </h2>

            <p className="text-xs sm:text-sm text-[#071B3A]/70 dark:text-white/70 leading-relaxed max-w-md mb-6">
              {t.onboarding?.step6Desc ||
                "دلوقتي تقدر تبدأ أول تجربة ليك في فِطنة. تقدر في أي وقت ترجع لدليل الاستخدام من القائمة العلوية."}
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3 px-5 rounded-xl bg-[#FFB52E] hover:bg-[#f5aa25] text-[#071B3A] text-sm font-extrabold shadow-lg shadow-amber-400/25 transition hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.onboarding?.finishAndStart || "ابدأ التجربة الآن"}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-semibold text-[#071B3A]/60 dark:text-white/60 hover:text-[#071B3A] dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  <span>{t.onboarding?.back || "السابق"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-xs font-semibold text-[#071B3A]/50 dark:text-white/50 hover:text-[#071B3A] dark:hover:text-white cursor-pointer"
                >
                  {t.onboarding?.close || "إغلاق"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Steps 2-5: Interactive Tooltip Card Anchored Near Element */}
      {currentStep > 0 && currentStep < 5 && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-auto transition-all duration-300 max-w-[430px] w-[calc(100%-24px)] sm:w-[430px]"
          style={
            tooltipPos
              ? { top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }
              : { bottom: "16px", left: "12px", right: "12px", margin: "0 auto" }
          }
        >
          <div className="bg-white dark:bg-[#071B3A] rounded-2xl border border-[#12B8C4]/40 dark:border-[#12B8C4]/40 shadow-2xl p-4 sm:p-5 relative flex flex-col max-h-[min(520px,calc(100vh-28px))] overflow-hidden backdrop-blur-md">
            {/* Top glowing accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#12B8C4] to-[#FFB52E]" />

            {/* Header: Badge & Counter (Never scrolls) */}
            <div className="flex items-center justify-between mb-2.5 pt-0.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#12B8C4]/15 text-[#12B8C4] flex items-center justify-center">
                  {currentStep === 1 && <Compass className="w-3.5 h-3.5" />}
                  {currentStep === 2 && <Sparkles className="w-3.5 h-3.5" />}
                  {currentStep === 3 && <Mic className="w-3.5 h-3.5" />}
                  {currentStep === 4 && <BarChart3 className="w-3.5 h-3.5" />}
                </span>
                <span className="text-[11px] font-bold text-[#12B8C4]">
                  {stepCounterText}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSkip}
                className="text-[#071B3A]/40 dark:text-white/40 hover:text-[#071B3A] dark:hover:text-white p-1 rounded-full transition cursor-pointer"
                title={t.onboarding?.skip || "تخطي"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body Container (If screen height is constrained) */}
            <div className="overflow-y-auto overscroll-contain pr-1 pl-1 flex-1 min-h-0 space-y-2 mb-2">
              {currentStep === 1 && (
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#071B3A] dark:text-white mb-1.5">
                    {t.onboarding?.step2Title || "لوحة التحكم الرئيسية"}
                  </h3>
                  <p className="text-xs text-[#071B3A]/70 dark:text-white/70 leading-relaxed">
                    {t.onboarding?.step2Desc ||
                      "من هنا تقدر تبدأ تجربة جديدة، تراجع جلساتك السابقة، وتشوف أداءك وتطورك عبر الزمن."}
                  </p>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#071B3A] dark:text-white mb-1.5">
                    {t.onboarding?.step3Title || "بدء محاكاة جديدة"}
                  </h3>
                  <p className="text-xs text-[#071B3A]/70 dark:text-white/70 leading-relaxed">
                    {t.onboarding?.step3Desc ||
                      "ابدأ جلسة جديدة واختار إعدادات الفصل والهدف التدريبي والموضوع اللي عايز تركز عليه، مع إمكانية تجربة الفصل المصري أو السعودي."}
                  </p>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#071B3A] dark:text-white mb-1.5">
                    {t.onboarding?.step4Title || "محاكاة الفصل والطلاب بالذكاء الاصطناعي"}
                  </h3>
                  <p className="text-xs text-[#071B3A]/70 dark:text-white/70 leading-relaxed">
                    {t.onboarding?.step4Desc ||
                      "هنا هتدخل الفصل وتتعامل مع طلاب بالذكاء الاصطناعي، وكل طالب له شخصيته وطريقة تفاعله المختلفة. تقدر تتكلم معاهم بالصوت عبر المايكروفون، وكل طالب هيرد عليك بصوته الطبيعي وتفاعلاته اللحظية."}
                  </p>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#071B3A] dark:text-white mb-1">
                    {t.onboarding?.step5Title || "التحليلات ومؤشرات الأداء"}
                  </h3>
                  <p className="text-xs text-[#071B3A]/70 dark:text-white/70 leading-relaxed mb-2">
                    {t.onboarding?.step5Desc ||
                      "بعد الجلسة، فِطنة بتحلل أداءك وتديك ملاحظات تساعدك تعرف نقاط قوتك وإيه اللي محتاج تطوره، بناءً على مقاييس تربوية حقيقية."}
                  </p>

                  {/* Real Metrics Highlight Pill List */}
                  <div className="bg-[#F6F0E4]/60 dark:bg-white/[0.04] rounded-xl p-2.5 border border-[#071B3A]/5 dark:border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-[#12B8C4] uppercase block">
                      {t.onboarding?.step5MetricsTitle || "أهم المقاييس التربوية المقاسة:"}
                    </span>
                    <div className="grid grid-cols-1 gap-1 text-[11px] text-[#071B3A]/80 dark:text-white/80">
                      <div className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#12B8C4] mt-1 shrink-0" />
                        <span>{t.onboarding?.step5MetricTtt}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFB52E] mt-1 shrink-0" />
                        <span>{t.onboarding?.step5MetricSocratic}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#12B8C4] mt-1 shrink-0" />
                        <span>{t.onboarding?.step5MetricInclusion}</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D96B58] mt-1 shrink-0" />
                        <span>{t.onboarding?.step5MetricPatterns}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer Navigation Bar (Always 100% visible and accessible) */}
            <div className="flex items-center justify-between pt-2.5 border-t border-[#071B3A]/10 dark:border-white/10 shrink-0 bg-white/95 dark:bg-[#071B3A]/95">
              {/* Progress Dots */}
              <div className="flex items-center gap-1">
                {STEPS_CONFIG.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-4 bg-[#12B8C4]"
                        : "w-1.5 bg-[#071B3A]/20 dark:bg-white/20"
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#071B3A]/70 dark:text-white/70 hover:bg-[#071B3A]/5 dark:hover:bg-white/5 transition flex items-center gap-1 cursor-pointer"
                >
                  {isRtl ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                  <span>{t.onboarding?.back || "السابق"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3.5 py-1.5 rounded-lg bg-[#12B8C4] hover:bg-[#0ea5b1] text-white text-xs font-bold shadow-sm transition hover:shadow active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>{t.onboarding?.next || "التالي"}</span>
                  {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
