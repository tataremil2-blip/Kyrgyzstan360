"use client";

import { usePathname } from "next/navigation";
import { locales, localizedHref, stripLocale } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";
import "./language-switcher.css";

export default function LanguageSwitcher({ inline = false }: { inline?: boolean }) {
  const pathname = usePathname();
  const { locale, dictionary } = useLocale();
  if (!inline && stripLocale(pathname) === "/") return null;
  return <nav className={inline ? "language-switcher language-switcher-inline" : "language-switcher"} aria-label={dictionary.language}>
    {locales.map((target) => <a key={target} href={localizedHref(pathname, target)} lang={target} hrefLang={target} aria-label={target === "ru" ? "Русский" : "English"} aria-current={target === locale ? "page" : undefined}
      onClick={(event) => {
        event.currentTarget.href = localizedHref(pathname, target) + window.location.search + window.location.hash;
        document.cookie = `k360-language=${target}; Path=/; Max-Age=31536000; SameSite=Lax`;
      }}>{target.toUpperCase()}</a>)}
  </nav>;
}
