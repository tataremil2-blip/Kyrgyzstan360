"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cookieConsentEvent, cookieConsentKey } from "./browser-preferences";
import "./cookie-consent.css";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const choice = localStorage.getItem(cookieConsentKey);
        const hasValidChoice = choice === "accepted" || choice === "rejected";
        if (!hasValidChoice && choice !== null) localStorage.removeItem(cookieConsentKey);
        setIsVisible(!hasValidChoice);
      } catch {
        setIsVisible(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function choose(choice: "accepted" | "rejected") {
    try {
      localStorage.setItem(cookieConsentKey, choice);
    } finally {
      window.dispatchEvent(new Event(cookieConsentEvent));
      setIsVisible(false);
    }
  }

  if (!isVisible) return null;

  return <section className="cookie-consent" aria-label="Cookie consent"><p>We use cookies to improve your experience and understand how our website is used. You can accept or reject optional cookies.</p><div><Link href="/cookies">Cookie Policy</Link><button type="button" onClick={() => choose("rejected")}>REJECT</button><button type="button" onClick={() => choose("accepted")}>ACCEPT</button></div></section>;
}
