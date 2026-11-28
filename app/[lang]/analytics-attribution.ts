const publicSections = new Set([
  "about-emil", "cookies", "guide-book", "journeys", "legal", "plan-your-trip",
  "privacy", "rent", "terms", "winter-freeride",
]);
const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_content", "utm_term", "utm_source_platform"] as const;
type UtmKey = (typeof utmKeys)[number];
type UtmAllowlist = Partial<Record<UtmKey, readonly string[]>>;
const standardValues: UtmAllowlist = {
  utm_source: ["google", "bing", "yandex", "facebook", "instagram", "youtube", "telegram", "newsletter"],
  utm_medium: ["cpc", "ppc", "paid_search", "paid_social", "organic", "social", "email", "referral", "display"],
  utm_source_platform: ["google_ads", "meta", "microsoft_ads"],
};
const safeLabel = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/;
const safeClickId = /^(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{20,150}$/;

export type Attribution = {
  landingPath: string;
  referrer: string;
  campaign: Partial<Record<UtmKey | "gclid", string>>;
};

export function publicAnalyticsPath(pathname: string) {
  const [, language, section, slug, ...extra] = pathname.replace(/\/$/, "").split("/");
  if ((language !== "en" && language !== "ru") || extra.length) return;
  if (!section) return `/${language}`;
  if (!slug && publicSections.has(section)) return `/${language}/${section}`;
  // Group dynamic pages by route. Arbitrary or mistyped slugs can contain private information.
  if ((section === "journeys" || section === "tours") && slug) return `/${language}/${section}/detail`;
}

export function parseUtmAllowlist(config: string | undefined): UtmAllowlist {
  try {
    const data = JSON.parse(config ?? "{}");
    return Object.fromEntries(utmKeys.flatMap((key) => {
      const labels: unknown = data?.[key];
      return Array.isArray(labels) ? [[key, labels.filter((value): value is string =>
        typeof value === "string" && safeLabel.test(value))]] : [];
    }));
  } catch {
    return {};
  }
}

function publicReferrer(raw: string, origin: string) {
  try {
    const url = new URL(raw);
    if (!["https:", "http:"].includes(url.protocol) || url.origin === origin) return "";
    if (/^(?:www\.)?google\.(?:com|[a-z]{2}|(?:co|com)\.[a-z]{2})$/.test(url.hostname)) {
      return "https://www.google.com/";
    }
    const sources = ["bing.com", "yandex.com", "yandex.ru", "duckduckgo.com", "instagram.com",
      "facebook.com", "youtube.com", "linkedin.com", "t.me"];
    const source = sources.find((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
    return source ? `https://${source}/` : "";
  } catch {
    return "";
  }
}

export function captureAttribution(url: URL, referrer: string, allowlist: UtmAllowlist): Attribution | undefined {
  const landingPath = publicAnalyticsPath(url.pathname);
  if (!landingPath) return;
  const campaign: Attribution["campaign"] = {};
  for (const key of utmKeys) {
    const matches = url.searchParams.getAll(key);
    if (matches.length !== 1) continue;
    const value = matches[0];
    if (safeLabel.test(value) &&
        (standardValues[key]?.includes(value) || allowlist[key]?.includes(value))) campaign[key] = value;
  }
  const clickIds = url.searchParams.getAll("gclid");
  if (clickIds.length === 1 && safeClickId.test(clickIds[0])) campaign.gclid = clickIds[0];
  return { landingPath, referrer: publicReferrer(referrer, url.origin), campaign };
}

export function withoutAdClick(attribution: Attribution): Attribution {
  const campaign = { ...attribution.campaign };
  delete campaign.gclid;
  return { ...attribution, campaign };
}

export function restoreAttribution(raw: string, origin: string, allowlist: UtmAllowlist) {
  try {
    const { landingPath, referrer, campaign } = JSON.parse(raw);
    if (typeof landingPath !== "string" || typeof referrer !== "string" || !campaign || typeof campaign !== "object") {
      return;
    }
    const path = publicAnalyticsPath(landingPath);
    if (!path || path !== landingPath) return;
    const url = new URL(path, origin);
    for (const key of [...utmKeys, "gclid"] as const) {
      if (typeof campaign[key] === "string") url.searchParams.set(key, campaign[key]);
    }
    return captureAttribution(url, referrer, allowlist);
  } catch {
    return;
  }
}

export function analyticsLocation(origin: string, path: string, attribution: Attribution) {
  const url = new URL(path, origin);
  for (const [key, value] of Object.entries(attribution.campaign)) url.searchParams.set(key, value);
  return url.href;
}
