"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cookieConsentEvent, cookieConsentKey, winterPromoCtaClickedKey, winterPromoDismissedAtKey } from "./browser-preferences";
import "./winter-promo-modal.css";

const dismissalDuration = 24 * 60 * 60 * 1000;

export default function WinterPromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [canShowPromo, setCanShowPromo] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function dismiss() {
    try { localStorage.setItem(winterPromoDismissedAtKey, String(Date.now())); }
    catch { /* The popup still closes if browser storage is unavailable. */ }
    setIsOpen(false);
  }

  function exploreWinter() {
    try { sessionStorage.setItem(winterPromoCtaClickedKey, "true"); }
    catch { /* The navigation remains available if browser storage is unavailable. */ }
    setIsOpen(false);
  }

  useEffect(() => {
    function updateConsentState() {
      try {
        const choice = localStorage.getItem(cookieConsentKey);
        setCanShowPromo(choice === "accepted" || choice === "rejected");
      } catch {
        setCanShowPromo(false);
      }
    }

    updateConsentState();
    window.addEventListener(cookieConsentEvent, updateConsentState);
    return () => window.removeEventListener(cookieConsentEvent, updateConsentState);
  }, []);

  useEffect(() => {
    if (!canShowPromo) return;

    try {
      const storedDismissal = localStorage.getItem(winterPromoDismissedAtKey);
      const dismissedAt = Number(storedDismissal);
      const isValidDismissal = Number.isFinite(dismissedAt) && dismissedAt > 0 && dismissedAt <= Date.now();
      const hasActiveDismissal = isValidDismissal && Date.now() - dismissedAt < dismissalDuration;

      if (storedDismissal !== null && !hasActiveDismissal) localStorage.removeItem(winterPromoDismissedAtKey);
      if (hasActiveDismissal || sessionStorage.getItem(winterPromoCtaClickedKey) === "true") return;
    } catch {
      return;
    }

    const timer = window.setTimeout(() => setIsOpen(true), 2000);
    return () => window.clearTimeout(timer);
  }, [canShowPromo]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return <div className="winter-promo-backdrop" role="presentation">
    <section className="winter-promo-modal" role="dialog" aria-modal="true" aria-labelledby="winter-promo-title" aria-describedby="winter-promo-description">
      <button className="winter-promo-close" type="button" onClick={dismiss} aria-label="Close winter offer" ref={closeButtonRef}>×</button>
      <div className="winter-promo-image"><Image src="/winter-promo-freeride.png" alt="Freeride skiers near a snowcat in the Kyrgyz mountains" fill sizes="(max-width: 700px) calc(100vw - 28px), 43vw" priority /></div>
      <div className="winter-promo-content">
        <p>WINTER 2026/27 · LIMITED OFFER</p>
        <h2 id="winter-promo-title">Discover Kyrgyzstan<br /><em>This Winter.</em></h2>
        <span className="winter-promo-offer">FIRST 20 SPOTS · SAVE 5%</span>
        <span id="winter-promo-description" className="winter-promo-description">Private freeride adventures in the Tien Shan with local guides and snowcat access.</span>
        <div className="winter-promo-pricing" aria-label="Winter tour price"><del>€1,900</del><strong>€1,805</strong></div>
        <small>Limited to the first 20 bookings for Winter 2026/27.</small>
        <div className="winter-promo-actions"><Link href="/winter-freeride" onClick={exploreWinter}>EXPLORE WINTER TOURS <b aria-hidden="true">↗</b></Link><button type="button" onClick={dismiss}>Maybe later</button></div>
      </div>
    </section>
  </div>;
}
