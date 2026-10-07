"use client";

import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface UserGuideButtonProps {
  className?: string;
}

export function UserGuideButton({ className }: UserGuideButtonProps) {
  const { lang } = useTranslation();
  const isRtl = lang === "ar";

  return (
    <Link
      href="/guide"
      className={
        className ||
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#12B8C4]/40 bg-[#12B8C4]/10 hover:bg-[#12B8C4]/20 text-[#12B8C4] hover:text-white transition-all duration-200 text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
      }
      title={isRtl ? "دليل استخدام فِطْنَة الشامل" : "Fitna AI User Guide"}
    >
      <BookOpen className="w-3.5 h-3.5 shrink-0" />
      <span>{isRtl ? "دليل الاستخدام" : "User Guide"}</span>
    </Link>
  );
}
