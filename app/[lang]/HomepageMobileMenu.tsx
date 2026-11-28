"use client";

import { useRef } from "react";
import LanguageSwitcher from "@/app/LanguageSwitcher";
import { LocalizedAnchor } from "@/app/LocalizedLink";

type HomepageMobileMenuProps = {
  experiences: string;
  trips: string;
  howItWorks: string;
  about: string;
  signIn: string;
  account: string;
  plan: string;
  travelerSignedIn: boolean;
};

export default function HomepageMobileMenu({
  experiences,
  trips,
  howItWorks,
  about,
  signIn,
  account,
  plan,
  travelerSignedIn,
}: HomepageMobileMenuProps) {
  const menu = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => menu.current?.removeAttribute("open");

  return <details className="p4-mobile-menu" ref={menu}>
    <summary aria-label="Open navigation"><span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" /></summary>
    <div>
      <nav aria-label="Mobile navigation">
        <a href="#styles" onClick={closeMenu}>{experiences}</a>
        <a href="#trips" onClick={closeMenu}>{trips}</a>
        <a href="#how-it-works" onClick={closeMenu}>{howItWorks}</a>
        <a href="#why-travel-with-us" onClick={closeMenu}>{about}</a>
        <LanguageSwitcher inline />
        {travelerSignedIn
          ? <LocalizedAnchor href="/account" onClick={closeMenu}>{account}</LocalizedAnchor>
          : <LocalizedAnchor href="/account/login" onClick={closeMenu}>{signIn}</LocalizedAnchor>}
        <LocalizedAnchor className="p4-button" href="/plan-your-trip" onClick={closeMenu}>{plan}</LocalizedAnchor>
      </nav>
    </div>
  </details>;
}
