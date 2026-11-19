"use client";

import { useEffect } from "react";
import { cookieConsentEvent, cookieConsentKey } from "../browser-preferences";

type EventName = "page_view" | "started" | "step_completed" | "submitted" | "failed" | "conversion";
type GoogleWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; [key: string]: unknown };
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function accepted() {
  try { return localStorage.getItem(cookieConsentKey) === "accepted"; }
  catch { return false; }
}

function google() {
  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId) || !accepted()) return;
  const browser = window as unknown as GoogleWindow;
  browser["ga-disable-" + measurementId] = false;
  if (!browser.gtag) {
    const dataLayer = browser.dataLayer ??= [];
    // The Google tag consumes the arguments object in its command queue.
    // eslint-disable-next-line prefer-rest-params
    browser.gtag = function () { dataLayer.push(arguments); };
    browser.gtag("js", new Date());
    browser.gtag("config", measurementId, { send_page_view: false, allow_google_signals: false,
      allow_ad_personalization_signals: false, page_location: window.location.origin + window.location.pathname, page_referrer: "" });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
    document.head.append(script);
    window.addEventListener(cookieConsentEvent, () => {
      browser["ga-disable-" + measurementId] = !accepted();
    });
  }
  return browser.gtag;
}

export function track(event: EventName, locale: string, options?: { step?: number; reason?: string; reference?: string }) {
  const gtag = google();
  if (!gtag) return;
  if (options?.reference) {
    try {
      const key = "k360-analytics:" + event + ":" + options.reference;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch { /* The form also guards against concurrent submits. */ }
  }
  gtag("event", "trip_request_" + event, {
    send_to: measurementId, language: locale, step: options?.step, reason: options?.reason,
    page_location: window.location.origin + "/" + locale + "/plan-your-trip",
    page_referrer: "",
    page_title: "Plan your trip",
  });
}

export function useTripPageAnalytics(locale: string) {
  useEffect(() => {
    let sent = false;
    function synchronize() {
      if (!accepted() && measurementId) {
        (window as unknown as GoogleWindow)["ga-disable-" + measurementId] = true;
      } else if (!sent && google()) {
        sent = true;
        track("page_view", locale);
      }
    }
    synchronize();
    window.addEventListener(cookieConsentEvent, synchronize);
    return () => window.removeEventListener(cookieConsentEvent, synchronize);
  }, [locale]);
}
