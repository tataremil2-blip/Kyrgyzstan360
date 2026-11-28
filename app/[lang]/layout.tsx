import { createTranslator } from "@/lib/translate";
import { notFound } from "next/navigation";
import { isLocale, locales, dictionaries } from "@/lib/i18n";
import { LocaleProvider } from "@/app/LocaleProvider";
import LanguageSwitcher from "@/app/LanguageSwitcher";
import type { Metadata } from "next";
import { Suspense } from "react";
import PublicAnalytics from "./PublicAnalytics";
import "./globals.css";
import "./typography.css";
import "./design-system.css";
import "./cookie-mobile-overrides.css";
import BackButton from "./BackButton";
import CookieConsent from "./CookieConsent";
import MobileHeader from "./MobileHeader";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return { title: createTranslator(lang)("Kyrgyzstan360 — Wild, your way"), description: dictionaries[lang].description };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LocaleProvider locale={lang}>
          <LanguageSwitcher />
          <MobileHeader />
          {children}
          <BackButton />
          <CookieConsent />
          <Suspense fallback={null}><PublicAnalytics /></Suspense>
        </LocaleProvider>
      </body>
    </html>
  );
}
