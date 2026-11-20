import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

const previewUrl = "https://epyifhlwdhzlpfpnavkg.supabase.co";
const branch = "feature/travel-requests-mvp";
const safeCodes = new Set([
  "ENOTFOUND", "EAI_AGAIN", "ECONNRESET", "ECONNREFUSED", "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_SOCKET", "ERR_INVALID_CHAR",
  "ERR_HTTP_INVALID_HEADER_VALUE", "ERR_TLS_CERT_ALTNAME_INVALID",
]);

export function inspectKey(key) {
  const value = typeof key === "string" ? key : "";
  const flags = {
    present: value.length > 0,
    surroundingWhitespace: value !== value.trim(),
    whitespace: /\s/u.test(value),
    quotes: /["'\u2018\u2019\u201c\u201d]/u.test(value),
    crLf: /[\r\n]/u.test(value),
    controls: /[\u0000-\u001f\u007f]/u.test(value),
    nonAscii: /[^\u0020-\u007e]/u.test(value),
    httpHeaderConstructible: false,
    format: "unknown",
    legacyProjectMatches: null,
  };
  try {
    new Headers({ apikey: value });
    flags.httpHeaderConstructible = true;
  } catch { /* Never print header construction errors: messages may contain the value. */ }

  if (/^sb_secret_[A-Za-z0-9_-]+$/.test(value)) {
    flags.format = "sb_secret";
  } else if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) {
    try {
      const payload = JSON.parse(Buffer.from(value.split(".")[1], "base64url").toString("utf8"));
      if (payload.role === "service_role") {
        flags.format = "legacy_service_role";
        flags.legacyProjectMatches = payload.ref === "epyifhlwdhzlpfpnavkg";
      }
    } catch { /* Classification only, no decoded payload is returned or logged. */ }
  }
  return flags;
}

export function previewScope(env) {
  return env.VERCEL_ENV === "preview" && env.VERCEL_GIT_COMMIT_REF === branch;
}

export function usableKey(flags) {
  return flags.present && flags.httpHeaderConstructible && !flags.whitespace && !flags.quotes &&
    !flags.controls && !flags.nonAscii && (flags.format === "sb_secret" ||
      flags.format === "legacy_service_role" && flags.legacyProjectMatches === true);
}

export async function sdkHeaderCheck() {
  const fake = "sb_secret_diagnostic_placeholder";
  let observed;
  const client = createClient(previewUrl, fake, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (_input, init) => {
      const headers = new Headers(init?.headers);
      observed = {
        apikeyCorrect: headers.get("apikey") === fake,
        newKeyUsedAsBearer: headers.get("authorization") === `Bearer ${fake}`,
      };
      return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
    } },
  });
  await client.from("staff_members").select("user_id").limit(1).retry(false);
  return observed ?? { apikeyCorrect: false, newKeyUsedAsBearer: false };
}

export async function checkPreviewKey(env = process.env, fetcher = fetch, log = console.info) {
  // Never read env files. Production exits before reading its Supabase configuration.
  if (!previewScope(env)) return;
  const urlMatches = env.NEXT_PUBLIC_SUPABASE_URL === previewUrl;
  log("Preview key configuration", { stage: "scope", preview: true, branchMatches: true, urlMatches });
  if (!urlMatches) return;
  const key = env.SUPABASE_SECRET_KEY;
  const flags = inspectKey(key);
  log("Preview key configuration", { stage: "key_format", ...flags });
  log("Preview key configuration", { stage: "sdk_fake_key_headers", ...await sdkHeaderCheck() });
  if (!usableKey(flags)) {
    log("Preview key configuration", { stage: "postgrest_control", status: 0,
      requestSent: false, code: "invalid_key_configuration" });
    return;
  }

  const headers = new Headers({ apikey: key });
  if (flags.format === "legacy_service_role") headers.set("Authorization", `Bearer ${key}`);
  const startedAt = Date.now();
  let status = 0;
  try {
    // Exactly one read-only request. New-format keys are sent only in apikey.
    const response = await fetcher(new URL("/rest/v1/staff_members?select=user_id&limit=1", previewUrl), {
      method: "GET", headers, signal: AbortSignal.timeout(8000), redirect: "error",
    });
    status = response.status;
    await response.body?.cancel();
    log("Preview key configuration", { stage: "postgrest_control", status,
      durationMs: Date.now() - startedAt, code: "http_response", responseReceived: true });
  } catch (error) {
    const rawCode = error?.cause?.code ?? error?.code;
    const errorName = ["TypeError", "AbortError", "TimeoutError"].includes(error?.name) ? error.name : "other";
    log("Preview key configuration", { stage: "postgrest_control", status,
      durationMs: Date.now() - startedAt, errorName, responseReceived: status > 0,
      code: safeCodes.has(rawCode) ? rawCode : "transport_error" });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkPreviewKey().catch(() => console.info("Preview key configuration", {
    stage: "check_failed", code: "internal_check_error",
  }));
}
