"use client";
import { useLocale, useTranslator } from "@/app/LocaleProvider";


import Link from "@/app/LocalizedLink";
import { useEffect, useState } from "react";
import { cookieConsentEvent, cookieConsentKey, type CookieChoice } from "./browser-preferences";
import "./cookie-consent.css";

export default function CookieConsent() {
  const translate = useTranslator();
  const { locale } = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [adAttribution, setAdAttribution] = useState(false);
  const ru = locale === "ru";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const choice = localStorage.getItem(cookieConsentKey);
        const hasValidChoice = choice === "accepted" || choice === "accepted-attribution" || choice === "rejected";
        if (!hasValidChoice && choice !== null) localStorage.removeItem(cookieConsentKey);
        setIsVisible(!hasValidChoice);
      } catch {
        setIsVisible(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function choose(choice: CookieChoice) {
    try {
      localStorage.setItem(cookieConsentKey, choice);
    } catch { /* Without stored consent, optional analytics remains off. */ }
    finally {
      window.dispatchEvent(new Event(cookieConsentEvent));
      setIsVisible(false);
    }
  }

  if (!isVisible) return null;

  return <section className="cookie-consent" aria-label={translate("Cookie consent")}>
    <p>{ru
      ? "С вашего согласия мы используем Google Analytics для статистики посещений и заявок. Учёт переходов из рекламы можно разрешить отдельно."
      : "With your permission, we use Google Analytics to understand visits and requests. You can also opt in to ad attribution."}</p>
    <div>
      <Link href="/cookies">{translate("Cookie Policy")}</Link>
      <label className="cookie-attribution">
        <input type="checkbox" checked={adAttribution} onChange={(event) => setAdAttribution(event.target.checked)} />
        {ru ? "Учёт переходов из рекламы" : "Ad attribution"}
      </label>
      <button type="button" onClick={() => choose("rejected")}>{translate("REJECT")}</button>
      <button type="button" onClick={() => choose(adAttribution ? "accepted-attribution" : "accepted")}>
        {ru ? "Разрешить аналитику" : "Allow analytics"}
      </button>
    </div>
  </section>;
}
