"use client";

import Link from "@/app/LocalizedLink";
import LanguageSwitcher from "@/app/LanguageSwitcher";
import { stripLocale } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import HomeNavLinks from "./HomeNavLinks";
import { useTranslator } from "@/app/LocaleProvider";
import MobileNav from "./MobileNav";
import "./mobile-header.css";

export default function MobileHeader() {
  const t = useTranslator();
  const pathname = stripLocale(usePathname());
  if (pathname === "/") return null;
  return (
    <header className="mobile-site-header">
      <Link className="mobile-site-brand" href="/" aria-label={t("Kyrgyzstan360 home")}>KYRGYZSTAN360</Link>
      <MobileNav className="mobile-menu">
        <div className="mobile-menu-panel">
          <nav aria-label={t("Mobile navigation")}>
            <HomeNavLinks />
            <LanguageSwitcher inline />

            <Link className="mobile-menu-cta" href="/plan-your-trip" data-build-adventure>{t("Build Your Adventure")}</Link>
          </nav>
        </div>
      </MobileNav>
    </header>
  );
}
