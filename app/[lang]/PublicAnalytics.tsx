"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { syncPublicAnalytics, trackPublicEvent } from "./analytics";
import { cookieConsentEvent, cookieConsentKey } from "./browser-preferences";

export default function PublicAnalytics() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => { syncPublicAnalytics(); }, [pathname, search]);
  useEffect(() => {
    function onConsent() { syncPublicAnalytics(); }
    function onStorage(event: StorageEvent) {
      if (!event.key || event.key === cookieConsentKey) onConsent();
    }
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element) || event.button !== 0) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href][data-build-adventure]");
      if (!anchor || anchor.hasAttribute("hreflang") || anchor.hasAttribute("download")) return;
      const target = new URL(anchor.href);
      if (target.origin !== window.location.origin || target.pathname === window.location.pathname) return;
      const match = /^\/(en|ru)\/plan-your-trip\/?$/.exec(target.pathname);
      if (match) trackPublicEvent("build_your_adventure_click", match[1] === "ru" ? "ru" : "en");
    }
    window.addEventListener(cookieConsentEvent, onConsent);
    window.addEventListener("storage", onStorage);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener(cookieConsentEvent, onConsent);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  return null;
}
