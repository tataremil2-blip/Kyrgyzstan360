"use client";

import { usePathname } from "next/navigation";
import { locales, localizedHref } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";
import "./language-switcher.css";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const { locale, dictionary } = useLocale();
  return <nav className="language-switcher" aria-label={dictionary.language}>
    {locales.map((target) => <a key={target} href={localizedHref(pathname, target)} lang={target} hrefLang={target} aria-label={target === "ru" ? "Русский" : "English"} aria-current={target === locale ? "page" : undefined}
      onClick={(event) => {
        event.currentTarget.href = localizedHref(pathname, target) + window.location.search + window.location.hash;
        document.cookie = `k360-language=${target}; Path=/; Max-Age=31536000; SameSite=Lax`;
      }}>{target.toUpperCase()}</a>)}
  </nav>;
}
