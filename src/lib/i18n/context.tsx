"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ar } from "./dictionaries/ar";
import { sa } from "./dictionaries/sa";
import { en } from "./dictionaries/en";
import type { Dictionary, Language, Market, Direction } from "./types";

type I18nContextType = {
  lang: Language;
  market: Market;
  dir: Direction;
  t: Dictionary;
  setLanguage: (lang: Language) => void;
  setMarket: (market: Market) => void;
};

const I18nContext = createContext<I18nContextType>({
  lang: "ar",
  market: "eg",
  dir: "rtl",
  t: ar,
  setLanguage: () => {},
  setMarket: () => {},
});

export function I18nProvider({
  initialLang = "ar",
  initialMarket = "eg",
  children,
}: {
  initialLang?: Language;
  initialMarket?: Market;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [lang, setLangState] = useState<Language>(initialLang);
  const [market, setMarketState] = useState<Market>(initialMarket);

  useEffect(() => {
    setLangState(initialLang);
  }, [initialLang]);

  useEffect(() => {
    setMarketState(initialMarket);
  }, [initialMarket]);

  // Client-side cookie / localStorage check on mount
  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)fitna_market=(eg|sa|en)(?:;|$)/);
      if (match && (match[1] === "eg" || match[1] === "sa" || match[1] === "en")) {
        setMarketState(match[1] as Market);
      } else {
        const local = localStorage.getItem("fitna_market");
        if (local === "eg" || local === "sa" || local === "en") {
          setMarketState(local as Market);
          document.cookie = `fitna_market=${local}; path=/; max-age=31536000; SameSite=Lax`;
        }
      }

      const matchLang = document.cookie.match(/(?:^|;\s*)language=(ar|en)(?:;|$)/);
      if (matchLang && (matchLang[1] === "ar" || matchLang[1] === "en")) {
        setLangState(matchLang[1] as Language);
        document.documentElement.lang = matchLang[1];
        document.documentElement.dir = matchLang[1] === "en" ? "ltr" : "rtl";
      } else {
        const localLang = localStorage.getItem("language");
        if (localLang === "ar" || localLang === "en") {
          setLangState(localLang as Language);
          document.cookie = `language=${localLang}; path=/; max-age=31536000; SameSite=Lax`;
          document.documentElement.lang = localLang;
          document.documentElement.dir = localLang === "en" ? "ltr" : "rtl";
        }
      }
    }
  }, []);

  function setLanguage(newLang: Language) {
    setLangState(newLang);
    document.cookie = `language=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("language", newLang);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === "en" ? "ltr" : "rtl";
    }
    router.refresh();
  }

  function setMarket(newMarket: Market) {
    const nextLang: Language = newMarket === "en" ? "en" : "ar";
    setMarketState(newMarket);
    setLangState(nextLang);
    document.cookie = `fitna_market=${newMarket}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `language=${nextLang}; path=/; max-age=31536000; SameSite=Lax`;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("fitna_market", newMarket);
      localStorage.setItem("language", nextLang);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLang;
      document.documentElement.dir = nextLang === "en" ? "ltr" : "rtl";
    }
    router.refresh();
  }

  const dir: Direction = lang === "en" ? "ltr" : "rtl";
  const t = lang === "en" ? en : market === "sa" ? sa : ar;

  return (
    <I18nContext.Provider value={{ lang, market, dir, t, setLanguage, setMarket }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
