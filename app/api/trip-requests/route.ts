import { createHash, createHmac, randomUUID } from "node:crypto";
import { after } from "next/server";
import { database } from "@/lib/travel-requests/database";
import { deliverTripNotifications } from "@/lib/travel-requests/notifications";
import { uuidPattern, validate } from "@/lib/travel-requests/validation";

const maxBytes = 24000;

async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const buffer = new Uint8Array(maxBytes);
  let length = 0;
  try {
    for (;;) {
      const part = await reader.read();
      if (part.done) break;
      if (length + part.value.length > maxBytes) {
        await reader.cancel();
        return null;
      }
      buffer.set(part.value, length);
      length += part.value.length;
    }
    const input: unknown = JSON.parse(new TextDecoder().decode(buffer.subarray(0, length)));
    return input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function failure(code: string, status: number) {
  return Response.json({ code }, { status });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return failure("invalid", 415);
  const input = await readBody(request);
  const key = input?.key;
  if (!input || typeof key !== "string" || !uuidPattern.test(key)) return failure("invalid", 400);
  const { data, errors } = validate(input);
  if (errors.length) return Response.json({ code: "validation", errors }, { status: 400 });

  try {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    const hashKey = process.env.TRIP_REQUEST_RATE_LIMIT_SECRET;
    const origin = process.env.APP_BASE_URL;
    if (!secret || !hashKey || !origin) return failure("unavailable", 503);
    if (request.headers.get("origin") !== new URL(origin).origin) return failure("invalid", 403);
    const db = database();
    const fingerprint = createHash("sha256").update(JSON.stringify(data)).digest("hex");
    const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const bucket = createHmac("sha256", hashKey).update(ip).digest("hex");
    const limit = await db.rpc("consume_trip_request_limit", { p_bucket: bucket });
    if (limit.error) return failure("unavailable", 503);
    if (!limit.data) return Response.json({ code: "rate" }, { status: 429, headers: { "Retry-After": "900" } });

    const saved = await db.from("travel_requests").select("fingerprint,reference_number").eq("request_key", key).maybeSingle();
    if (saved.error) return failure("unavailable", 503);
    if (saved.data) {
      return saved.data.fingerprint === fingerprint
        ? Response.json({ reference: saved.data.reference_number })
        : failure("conflict", 409);
    }
    if (typeof input.token !== "string" || !input.token || input.token.length > 2048) return failure("challenge", 422);
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", signal: AbortSignal.timeout(8000),
      body: new URLSearchParams({ secret, response: input.token, idempotency_key: randomUUID() }),
    });
    if (!verification.ok) return failure("unavailable", 503);
    const result = await verification.json();
    if (!result.success || result.hostname !== new URL(origin).hostname || result.action !== "trip_request") {
      return failure("challenge", 422);
    }

    const created = await db.rpc("create_travel_request", { p_key: key, p_fingerprint: fingerprint, p_data: data });
    if (created.error) return failure("unavailable", 503);
    if (!created.data) return failure("conflict", 409);
    const reference = created.data as string;
    after(async () => {
      try { await deliverTripNotifications(reference); }
      catch { console.error("Trip notification processing failed"); }
    });
    return Response.json({ reference }, { status: 201 });
  } catch {
    return failure("unavailable", 503);
  }
}
