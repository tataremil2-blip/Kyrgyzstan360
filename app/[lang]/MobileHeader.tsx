"use client";

import Link from "@/app/LocalizedLink";
import LanguageSwitcher from "@/app/LanguageSwitcher";
import { stripLocale } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";
import "./mobile-header.css";

export default function MobileHeader() {
  const pathname = stripLocale(usePathname());
  if (pathname === "/") return null;
  return (
    <header className="mobile-site-header">
      <Link className="mobile-site-brand" href="/" aria-label="Kyrgyzstan360 home">KYRGYZSTAN360</Link>
      <MobileNav className="mobile-menu">
        <div className="mobile-menu-panel">
          <nav aria-label="Mobile navigation">
            <Link href="/#countries">Destinations</Link>
            <Link href="/#trips">Trips</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/#why-local">About</Link>
            <LanguageSwitcher inline />

            <Link className="mobile-menu-cta" href="/plan-your-trip">Plan my trip</Link>
          </nav>
        </div>
      </MobileNav>
    </header>
  );
}
