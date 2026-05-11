"use client";

import { createContext, useContext, useEffect, useState } from "react";
import en, { type Translations } from "../i18n/en";
import ar from "../i18n/ar";

type Lang = "en" | "ar";

interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const translations: Record<Lang, Translations> = { en, ar };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("bizify-lang") as Lang | null;
    applyLang(stored ?? "en");
  }, []);

  function applyLang(next: Lang) {
    setLang(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    localStorage.setItem("bizify-lang", next);
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        t: translations[lang],
        toggleLang: () => applyLang(lang === "en" ? "ar" : "en"),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
