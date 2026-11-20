import { createClient } from "@supabase/supabase-js";

const DATABASE_FETCH_TIMEOUT_MS = 12_000;
const SAFE_TRANSPORT_CODES = new Set([
  "EAI_AGAIN",
  "EADDRNOTAVAIL",
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "EPIPE",
  "ETIMEDOUT",
  "ERR_HTTP_INVALID_HEADER_VALUE",
  "ERR_INVALID_CHAR",
  "ERR_TLS_CERT_ALTNAME_INVALID",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

function safeName(value: unknown) {
  if (!value || typeof value !== "object") return "unknown";
  const name = (value as { name?: unknown }).name;
  return typeof name === "string" && /^[A-Za-z][A-Za-z0-9]{0,31}$/.test(name) ? name : "unknown";
}

function safeTransportCode(value: unknown) {
  return typeof value === "string" && SAFE_TRANSPORT_CODES.has(value) ? value : "other";
}

function causeOf(value: unknown): unknown {
  return value && typeof value === "object" ? (value as { cause?: unknown }).cause : undefined;
}

function causeCodeOf(value: unknown): unknown {
  return value && typeof value === "object" ? (value as { code?: unknown }).code : undefined;
}

function requestAttempt(headers?: HeadersInit) {
  try {
    let retryCount: unknown;
    if (typeof Headers !== "undefined" && headers instanceof Headers) {
      retryCount = headers.get("x-retry-count");
    } else if (Array.isArray(headers)) {
      retryCount = headers.find(([name]) => name.toLowerCase() === "x-retry-count")?.[1];
    } else if (headers && typeof headers === "object") {
      retryCount = Object.entries(headers).find(([name]) => name.toLowerCase() === "x-retry-count")?.[1];
    }
    const parsed = Number(retryCount ?? 0);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 3 ? parsed + 1 : 1;
  } catch {
    return 1;
  }
}

export function databaseFetchOptions(
  init?: RequestInit,
  timeoutSignal = AbortSignal.timeout(DATABASE_FETCH_TIMEOUT_MS),
) {
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;
  return { ...init, cache: "no-store" as RequestCache, signal };
}

export async function databaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  const startedAt = Date.now();
  let fetchStarted = false;
  const attempt = requestAttempt(init?.headers);
  try {
    const options = databaseFetchOptions(init);
    fetchStarted = true;
    return await fetch(input, options);
  } catch (error) {
    const cause = causeOf(error);
    console.error("Supabase database transport failure", {
      stage: "postgrest_fetch",
      errorName: safeName(error),
      causeName: safeName(cause),
      causeCode: safeTransportCode(causeCodeOf(cause)),
      durationMs: Date.now() - startedAt,
      attempt,
      fetchStarted,
    });
    throw error;
  }
}

export function database() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Trip request storage is unavailable");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: databaseFetch },
  });
}
