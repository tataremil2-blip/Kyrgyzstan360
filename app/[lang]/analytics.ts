"use client";

import {
  analyticsLocation, captureAttribution, parseUtmAllowlist, publicAnalyticsPath, restoreAttribution,
  withoutAdClick, type Attribution,
} from "./analytics-attribution";
import { cookieConsentKey, type CookieChoice } from "./browser-preferences";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};
const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const approvedUtm = parseUtmAllowlist(process.env.NEXT_PUBLIC_GA_UTM_ALLOWLIST);
const attributionKey = "k360-analytics-attribution-v1";
const countedReferences = new Set<string>();
let initialVisit: Attribution | undefined;
let activeVisit: Attribution | undefined;
let lastPath: string | undefined;
let lastPublicPath: string | undefined;
let lastReferrer = "";
let tagInitialized = false;
let configuredConsent: CookieChoice | undefined;

function consentChoice(): CookieChoice | undefined {
  try {
    const stored = localStorage.getItem(cookieConsentKey);
    if (stored === "rejected" || stored === "accepted" || stored === "accepted-attribution") return stored;
  } catch { /* Storage may be disabled. */ }
}

function deactivate(browser: AnalyticsWindow, clearVisit: boolean) {
  if (!id) return;
  Reflect.set(browser, `ga-disable-${id}`, true);
  if (configuredConsent) {
    browser.gtag?.("consent", "update", {
      analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    });
  }
  configuredConsent = undefined;
  lastPath = undefined;
  lastPublicPath = undefined;
  lastReferrer = "";
  if (clearVisit || activeVisit) {
    initialVisit = undefined;
    activeVisit = undefined;
    try { sessionStorage.removeItem(attributionKey); } catch { /* Storage may be disabled. */ }
  }
}

function loadGoogle(browser: AnalyticsWindow, location: string, referrer: string, choice: CookieChoice) {
  if (!id) return;
  Reflect.set(browser, `ga-disable-${id}`, false);
  if (!tagInitialized) {
    const queue = browser.dataLayer ??= [];
    // gtag consumes the arguments object as a command in the data layer.
    // eslint-disable-next-line prefer-rest-params
    browser.gtag ??= function () { queue.push(arguments); };
    browser.gtag("js", new Date());
    browser.gtag("consent", "default", {
      analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    });
  }
  if (configuredConsent !== choice) {
    browser.gtag?.("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: choice === "accepted-attribution" ? "granted" : "denied",
      ad_personalization: "denied",
    });
    configuredConsent = choice;
  }
  // Keep the tag defaults sanitized as well as each event payload.
  browser.gtag?.("set", { page_location: location, page_referrer: referrer, page_title: "Kyrgyzstan360" });
  if (tagInitialized) return;
  browser.gtag?.("config", id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: location,
    page_referrer: referrer,
  });
  const script = document.createElement("script");
  script.async = true;
  script.referrerPolicy = "no-referrer";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.append(script);
  tagInitialized = true;
}

function updateAnalytics() {
  if (typeof window === "undefined" || !id || !/^G-[A-Z0-9]+$/.test(id)) return;
  const browser = window as AnalyticsWindow;
  const url = new URL(browser.location.href);
  const path = publicAnalyticsPath(url.pathname);
  if (!path) {
    deactivate(browser, false);
    return;
  }

  const choice = consentChoice();
  if (!choice || choice === "rejected") {
    // Hold the first landing route only in this document until a choice is made.
    // No analytics storage or external request exists before opt-in.
    if (!choice && !initialVisit) initialVisit = captureAttribution(url, document.referrer, approvedUtm);
    deactivate(browser, choice === "rejected");
    return;
  }

  let restored: Attribution | undefined;
  if (!activeVisit) {
    try {
      const value = sessionStorage.getItem(attributionKey);
      if (value) restored = restoreAttribution(value, url.origin, approvedUtm);
    } catch { /* Storage may be disabled. */ }
  }
  const capture = initialVisit ?? captureAttribution(url, document.referrer, approvedUtm);
  if (!capture) return;
  const visit = choice === "accepted-attribution" ? capture : withoutAdClick(capture);
  const saved = activeVisit ?? restored;
  const differentCampaign = Object.entries(visit.campaign).some(([key, value]) =>
    saved?.campaign[key as keyof Attribution["campaign"]] !== value);
  const externalArrival = !activeVisit && visit.referrer && visit.referrer !== saved?.referrer;
  const attributed = saved && !differentCampaign && !externalArrival ? saved : visit;
  activeVisit = choice === "accepted-attribution" ? attributed : withoutAdClick(attributed);
  initialVisit = undefined;
  try { sessionStorage.setItem(attributionKey, JSON.stringify(activeVisit)); } catch { /* Storage may be disabled. */ }

  const location = analyticsLocation(url.origin, path, activeVisit);
  const referrer = lastPath === url.pathname ? lastReferrer
    : lastPublicPath ? new URL(lastPublicPath, url.origin).href : activeVisit.referrer;
  loadGoogle(browser, location, referrer, choice);
  // Compare actual paths locally so two different journey/tour details each count.
  if (lastPath !== url.pathname) {
    browser.gtag?.("event", "page_view", {
      send_to: id, page_location: location, page_referrer: referrer, landing_path: activeVisit.landingPath,
    });
    lastPath = url.pathname;
    lastPublicPath = path;
    lastReferrer = referrer;
  }
  return { browser, visit: activeVisit, location, referrer };
}

export function syncPublicAnalytics() {
  try {
    return updateAnalytics();
  } catch { /* Tracking errors must never interrupt navigation or form delivery. */ }
}

function emit(browser: AnalyticsWindow, name: string, params: Record<string, string | undefined>) {
  try {
    browser.gtag?.("event", name, params);
  } catch { /* Analytics is optional. */ }
}

export function trackPublicEvent(name: "build_your_adventure_click" | "trip_request_started" | "trip_request_failed",
  language: "en" | "ru", reason?: "challenge" | "rate" | "conflict" | "validation" | "unavailable" | "network") {
  const context = syncPublicAnalytics();
  if (!context) return;
  emit(context.browser, name, {
    send_to: id, language, page_location: context.location, page_referrer: context.referrer,
    landing_path: context.visit.landingPath,
    ...(reason ? { reason } : {}),
  });
}

export function trackAcceptedTripRequest(status: number, result: { reference: string; replayed?: unknown },
  language: "en" | "ru") {
  if (status !== 201 || result.replayed !== false || !/^WEB-[A-F0-9]{16}$/.test(result.reference)) return;
  if (countedReferences.has(result.reference)) return;
  const context = syncPublicAnalytics();
  if (!context) return;
  // The reference is used only for local deduplication and is never sent to Google.
  const key = `k360-analytics:conversion:${result.reference}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch { /* Keep deduplication in memory when storage is disabled. */ }
  countedReferences.add(result.reference);
  emit(context.browser, "trip_request_conversion", {
    send_to: id, language, page_location: context.location, page_referrer: context.referrer,
    landing_path: context.visit.landingPath,
  });
}
