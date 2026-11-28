import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { checkRateLimit } from "@vercel/firewall";
import { validateLead } from "@/lib/email-leads/validation";

export const runtime = "nodejs";
export const maxDuration = 30;
const recipient = "tataremil2@gmail.com";
const sender = "Kyrgyzstan360 <travel@kyrgyzstan360.com>";
const maxBytes = 16000;
function result(body: object, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "600" } : {}) } });
}
function failure(code: string, status = 503) { return result({ code }, status); }

async function readBody(request: Request, signal: AbortSignal): Promise<Record<string, unknown> | null> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const buffer = new Uint8Array(maxBytes);
  let length = 0;
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", abort, { once: true });
  try {
    for (;;) {
      signal.throwIfAborted();
      const part = await reader.read();
      if (part.done) break;
      length += part.value.length;
      if (length > maxBytes) return null;
      buffer.set(part.value, length - part.value.length);
    }
    signal.throwIfAborted();
    const input: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, length)));
    return input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : null;
  } catch { return null; }
  finally { signal.removeEventListener("abort", abort); void reader.cancel().catch(() => {}); }
}

export async function POST(request: Request) {
  const deadline = AbortSignal.timeout(22_000);
  try {
    // This path never constructs a Supabase client, even when its environment variables exist.
    const env = process.env;
    if (env.VERCEL !== "1" || env.NODE_ENV !== "production" ||
        !["preview", "production"].includes(env.VERCEL_ENV ?? "")) return failure("unavailable");
    const origin = new URL(env.APP_BASE_URL ?? "");
    if (origin.protocol !== "https:" || origin.username || origin.password || origin.port || origin.search || origin.hash ||
        origin.pathname !== "/" || (env.VERCEL_ENV === "production" && origin.origin !== "https://www.kyrgyzstan360.com") ||
        (env.VERCEL_ENV === "preview" && !origin.hostname.endsWith(".vercel.app"))) return failure("unavailable");
    if (new URL(request.url).origin !== origin.origin || request.headers.get("origin") !== origin.origin) return failure("invalid", 403);
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return failure("invalid", 415);
    const key = env.RESEND_API_KEY;
    const hashKey = env.TRIP_REQUEST_RATE_LIMIT_SECRET;
    const turnstileKey = env.TURNSTILE_SECRET_KEY;
    if (!key || !/^re_[A-Za-z0-9_-]+$/.test(key) || !hashKey || hashKey.length < 32 ||
        !turnstileKey || /\s/.test(turnstileKey) ||
        env.RESEND_FROM_EMAIL !== sender || env.TRIP_REQUEST_OPERATOR_EMAIL !== recipient) return failure("unavailable");

    const input = await readBody(request, AbortSignal.any([deadline, AbortSignal.timeout(4000)]));
    if (!input) return failure("invalid", 400);
    const { data, errors } = validateLead(input);
    if (errors.length) return result({ code: "validation", errors }, 400);
    if (typeof input.token !== "string" || !input.token || input.token.length > 2048) return failure("challenge", 400);
    const ip = request.headers.get("x-vercel-forwarded-for")?.trim();
    if (!ip || !isIP(ip)) return failure("unavailable");
    const digest = (value: string) => createHmac("sha256", hashKey).update(value).digest("hex");
    // Vercel counters are shared across instances; never substitute an in-memory fallback.
    // Only the minimum headers reach the Firewall SDK, with a trusted configured host.
    const headers = new Headers({ host: origin.host, "x-real-ip": ip, "x-forwarded-for": ip });
    const limits = await Promise.all([ "ip:" + ip, "email:" + data.email.toLowerCase() ].map((value) =>
      checkRateLimit("k360-email-leads", { headers, rateLimitKey: digest(env.VERCEL_ENV + ":" + value), timeout: 2500 })));
    if (limits.some((limit) => limit.error === "not-found")) return failure("unavailable");
    if (limits.some((limit) => limit.rateLimited || limit.error === "blocked")) return failure("rate", 429);

    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", redirect: "error", cache: "no-store",
      body: new URLSearchParams({ secret: turnstileKey, response: input.token, remoteip: ip }),
      signal: AbortSignal.any([deadline, AbortSignal.timeout(7000)]),
    });
    if (!check.ok) return failure("unavailable");
    const challenge = await check.json();
    if (challenge.success !== true || challenge.hostname !== origin.hostname || challenge.action !== "trip_request") return failure("challenge", 400);

    // Stable content-based key also deduplicates a refresh/retry with a new client UUID.
    // Resend guarantees idempotency for 24 hours; changing payload creates a new request.
    const fingerprint = digest("email-lead-v1:" + env.VERCEL_ENV + ":" + JSON.stringify(data));
    const reference = "WEB-" + fingerprint.slice(0, 16).toUpperCase();
    const dates = data.dateMode === "exact" ? data.startDate + " – " + data.endDate :
      data.dateMode === "approximate" ? data.preferredPeriod : data.dateMode === "flexible" ? "Flexible" : "Not specified";
    const email = {
      from: sender, to: [recipient], reply_to: data.email,
      subject: (env.VERCEL_ENV === "preview" ? "[PREVIEW TEST] " : "") + "Kyrgyzstan360 travel request " + reference,
      // Plain text only. User input cannot create HTML, headers or additional recipients.
      text: [
        "Kyrgyzstan360 — new travel enquiry", "Reference: " + reference,
        "Name: " + data.name, "Email: " + data.email, "Phone / WhatsApp: " + (data.phone || "Not specified"),
        "Travel dates: " + dates, "Travelers: " + (data.adults ?? "Not specified"),
        "Budget per person (USD): " + (data.budget ?? "Not specified"), "Language: " + data.locale,
        "", "Travel preferences / message:", data.preferences || "Not specified",
        "", "This enquiry was delivered by email. It is not stored in CRM.",
      ].join("\n"),
    };
    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST", redirect: "error", cache: "no-store",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", "Idempotency-Key": "k360-email-lead/" + fingerprint },
      body: JSON.stringify(email), signal: AbortSignal.any([deadline, AbortSignal.timeout(9000)]),
    });
    if (!sent.ok) return failure("unavailable");
    const receipt = await sent.json();
    if (typeof receipt.id !== "string" || !/^[a-f0-9-]{36}$/i.test(receipt.id)) return failure("unavailable");
    return result({ reference, replayed: sent.headers.get("idempotent-replayed") === "true" }, 201);
  } catch {
    // Provider errors may contain personal data or credentials; never log their bodies/messages.
    return failure("unavailable");
  }
}
