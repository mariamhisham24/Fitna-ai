import { ar } from "./dictionaries/ar";
import { sa } from "./dictionaries/sa";
import { en } from "./dictionaries/en";
import type { Dictionary, Language, Market, Direction } from "./types";

export * from "./types";
export { useTranslation, I18nProvider } from "./context";

export function getDictionary(lang: Language = "ar", market: Market = "eg"): Dictionary {
  if (lang === "en") return en;
  return market === "sa" ? sa : ar;
}

export function getDirection(lang: Language = "ar"): Direction {
  return lang === "en" ? "ltr" : "rtl";
}

