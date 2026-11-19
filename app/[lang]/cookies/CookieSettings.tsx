"use client";
import { useLocale, useTranslator } from "@/app/LocaleProvider";


import { useRouter } from "next/navigation";

export default function CookieSettings() {
  const translate = useTranslator();
  const router = useRouter();
  const { locale } = useLocale();
  function resetConsent() { localStorage.removeItem("kyrgyzstan360-cookie-consent"); router.push(`/${locale}`); }
  return <div className="cookie-settings"><h2>{translate("Change your choice")}</h2><p>{translate("You can revoke your consent at any time. Resetting it will return you to the home page, where the banner will appear again.")}</p><button type="button" onClick={resetConsent}>{translate("RESET COOKIE CHOICE")}</button></div>;
}
