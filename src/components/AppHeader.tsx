"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MarketSwitcher } from "@/components/MarketSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "@/lib/i18n/context";
import { TelegramIcon } from "@/components/TelegramIcon";
import { UserGuideButton } from "@/components/UserGuideButton";

export function AppHeader({ title }: { title?: string }) {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 bg-white dark:bg-white/5 border-b border-[#071B3A]/10 dark:border-white/10 gap-2">
      <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
        <div className="flex items-center shrink-0 cursor-default select-none pointer-events-none">
          <Logo variant="dark" height={22} className="dark:hidden sm:h-[26px]" />
          <Logo variant="light" height={22} className="hidden dark:block sm:h-[26px]" />
        </div>
        {title && <span className="text-[#071B3A]/40 dark:text-white/40 hidden sm:inline">/</span>}
        {title && <span className="text-xs sm:text-sm text-[#071B3A]/70 dark:text-white/70 truncate hidden sm:inline">{title}</span>}
      </div>
      <div className="flex items-center gap-1 sm:gap-3 text-sm shrink-0">
        <MarketSwitcher locked={true} />
        <ThemeToggle />
        <LanguageSwitcher />

        {/* Desktop-only secondary items to preserve phone real estate */}
        <div className="hidden sm:flex items-center gap-2">
          <UserGuideButton />
          <a
            href="https://t.me/fitnaai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#229ED9] hover:text-[#229ED9]/80 p-1 rounded-lg hover:bg-[#071B3A]/5 dark:hover:bg-white/10 transition-all duration-150 hover:scale-110 active:scale-95 inline-flex items-center justify-center cursor-pointer"
            title="الدعم عبر تيليجرام / Telegram Support"
            aria-label="Telegram Support"
          >
            <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
          </a>
          <Link
            href="/settings"
            className="text-[#071B3A]/70 dark:text-white/70 hover:text-[#071B3A] dark:hover:text-white text-xs font-medium"
          >
            {t.nav.settings}
          </Link>
        </div>

        <LogoutButton className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-medium cursor-pointer shrink-0">
          {t.nav.logout}
        </LogoutButton>
      </div>
    </header>
  );
}
