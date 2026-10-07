"use client";

import { useState } from "react";
import { type Market } from "@/lib/i18n/types";
import { Sparkles, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

interface MarketSelectorModalProps {
  isOpen: boolean;
  onSelect: (market: Market) => void;
}

export function MarketSelectorModal({ isOpen, onSelect }: MarketSelectorModalProps) {
  const [selected, setSelected] = useState<Market | null>(null);

  if (!isOpen) return null;

  const handleConfirm = (market: Market) => {
    setSelected(market);
    onSelect(market);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-2xl bg-[#071B3A] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden flex flex-col gap-6"
        dir="rtl"
      >
        {/* Decorative Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-r from-[#12B8C4]/30 via-amber-400/30 to-[#12B8C4]/30 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-amber-300 border border-white/15 mb-3 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>اختر بيئة التدريب المفضلة | Choose Classroom Region</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            مرحباً بك في فِطنة — Fitna AI
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md leading-relaxed">
            اختر البيئة التعليمية التي تود محاكاتها. يمكنك تغيير اختيارك في أي وقت لاحقاً بكل سهولة.
          </p>
        </div>

        {/* Market Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          {/* Egypt Card */}
          <button
            type="button"
            onClick={() => handleConfirm("eg")}
            className="group p-5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border-2 border-white/10 hover:border-[#12B8C4] transition-all duration-200 text-start flex flex-col justify-between gap-4 cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_24px_-4px_rgba(18,184,196,0.3)] relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#12B8C4]/20 text-[#12B8C4] border border-[#12B8C4]/40">
                مصر
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#12B8C4] transition-colors">
                الفصول الدراسية المصرية
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                محاكاة صوتية تفاعلية بلهجة مصرية عامية طبيعية مع طلاب يحاكون تحديات الفصول المصرية.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#12B8C4]">
              <span>دخول تجربة مصر</span>
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </div>
          </button>

          {/* Saudi Card */}
          <button
            type="button"
            onClick={() => handleConfirm("sa")}
            className="group p-5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border-2 border-white/10 hover:border-amber-400 transition-all duration-200 text-start flex flex-col justify-between gap-4 cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_24px_-4px_rgba(251,191,36,0.3)] relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                المملكة العربية السعودية
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                الفصول الدراسية السعودية
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                واجهة كاملة باللغة العربية الفصحى، ومحاكاة صفية بلهجة سعودية مدرسية طبيعية وسياق تعليمي سعودي.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-amber-300">
              <span>دخول تجربة السعودية</span>
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-white/50 relative z-10 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>سيتم حفظ اختيارك تلقائياً لزياراتك القادمة.</span>
        </div>
      </div>
    </div>
  );
}
