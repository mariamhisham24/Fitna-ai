"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { type Market } from "@/lib/i18n/types";
import { ChevronDown, Check } from "lucide-react";

export function MarketSwitcher({ className = "" }: { className?: string }) {
  const { market, setMarket, lang } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectMarket = (m: Market) => {
    setMarket(m);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-start" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm ${
          className ||
          "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 dark:text-amber-300 dark:border-amber-400/40 hover:border-amber-500"
        }`}
        title={lang === "ar" ? "تغيير الدولة / السوق" : "Switch Region"}
        aria-expanded={open}
      >
        {market === "sa" ? (
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-3 rounded-xs shadow-xs shrink-0 overflow-hidden" viewBox="0 0 640 480">
              <path fill="#006c35" d="M0 0h640v480H0z"/>
              <path fill="#fff" d="M120 280h400v20H120zM220 180h200v40H220z"/>
            </svg>
            <span>السعودية</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-4 h-3 rounded-xs shadow-xs shrink-0 overflow-hidden" viewBox="0 0 640 480">
              <path fill="#ce1126" d="M0 0h640v160H0z"/>
              <path fill="#fff" d="M0 160h640v160H0z"/>
              <path fill="#000" d="M0 320h640v160H0z"/>
              <circle cx="320" cy="240" r="26" fill="#c09300"/>
            </svg>
            <span>مصر</span>
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1.5 w-48 rounded-xl bg-[#071B3A] border border-white/15 shadow-2xl py-1.5 z-50 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] text-white/50 font-medium uppercase tracking-wider border-b border-white/10 mb-1">
            {lang === "ar" ? "بيئة المحاكاة الصفية" : "Classroom Region"}
          </div>

          <button
            type="button"
            onClick={() => selectMarket("eg")}
            className={`w-full px-3 py-2 text-start flex items-center justify-between hover:bg-white/10 transition-colors ${
              market === "eg" ? "text-[#12B8C4] font-bold bg-white/5" : "text-white/90"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">🇪🇬</span>
              <div className="flex flex-col">
                <span>مصر (Egypt)</span>
                <span className="text-[10px] text-white/50 font-normal">بيئة مدرسية مصرية</span>
              </div>
            </div>
            {market === "eg" && <Check className="w-3.5 h-3.5 text-[#12B8C4]" />}
          </button>

          <button
            type="button"
            onClick={() => selectMarket("sa")}
            className={`w-full px-3 py-2 text-start flex items-center justify-between hover:bg-white/10 transition-colors ${
              market === "sa" ? "text-amber-300 font-bold bg-white/5" : "text-white/90"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">🇸🇦</span>
              <div className="flex flex-col">
                <span>السعودية (KSA)</span>
                <span className="text-[10px] text-white/50 font-normal">بيئة مدرسية سعودية (فصحى)</span>
              </div>
            </div>
            {market === "sa" && <Check className="w-3.5 h-3.5 text-amber-300" />}
          </button>
        </div>
      )}
    </div>
  );
}
