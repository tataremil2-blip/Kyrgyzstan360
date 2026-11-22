import { database } from "./database";

function required(value: string | undefined) {
  if (!value) throw new Error("Provider is not configured");
  return value;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "—";
}

function escapeHtml(value: unknown) {
  return text(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character] ?? character));
}

function emailShell(title: string, content: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f2eb;color:#1e293b;font-family:Arial,sans-serif"><main style="max-width:600px;margin:0 auto;padding:28px 16px"><section style="background:#fff;border:1px solid #e7e0d4;border-radius:16px;overflow:hidden"><header style="background:#12372a;color:#fff;padding:28px"><div style="font-size:12px;letter-spacing:2px;font-weight:700">KYRGYZSTAN360</div><h1 style="font-size:26px;line-height:1.2;margin:14px 0 0">${title}</h1></header><div style="padding:28px">${content}</div></section></main></body></html>`;
}

const previewTelegramBot = "Kyrgyzstan_360_leads_bot";

function shouldVerifyPreviewTelegramIdentity() {
  return process.env.VERCEL_ENV === "preview"
    && process.env.VERCEL_GIT_COMMIT_REF === "feature/travel-requests-mvp";
}

async function verifyPreviewTelegramIdentity(token: string) {
  const response = await fetch("https://api.telegram.org/bot" + token + "/getMe", {
    method: "GET",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return "provider_http_" + response.status;

  const result = await response.json() as {
    ok?: boolean;
    result?: { username?: string };
  };
  return result.ok && result.result?.username === previewTelegramBot
    ? null
    : "provider_identity_mismatch";
}

export async function deliverTripNotifications(reference?: string) {
  const db = database();
  const jobs = await db.rpc("claim_trip_notifications", { p_reference: reference ?? null });
  if (jobs.error) throw new Error("Could not claim notification jobs");
  await Promise.all((jobs.data ?? []).map(async (job: {
    id: string; request_id: string; kind: string; attempts: number;
  }) => {
    let providerId: string | null = null;
    let errorCode: string | null = null;
    try {
      const { data: trip, error } = await db.from("travel_requests")
        .select("id,reference_number,customer_name,customer_email,locale,countries,start_date,end_date,adults,children,budget,details")
        .eq("id", job.request_id).single();
      if (error || !trip) throw new Error("Request unavailable");
      const card = new URL("/admin/requests/" + trip.id, required(process.env.APP_BASE_URL)).href;
      const details = trip.details && typeof trip.details === "object" ? trip.details as Record<string, unknown> : {};
      const dates = trip.start_date ? trip.start_date + " – " + trip.end_date : "Flexible dates";
      const travelers = trip.adults + " adults, " + trip.children + " children";
      const interests = Array.isArray(details.interests) ? details.interests.filter((interest): interest is string => typeof interest === "string").join(", ") : "";
      const operatorText = [
        "KYRGYZSTAN360", "New Travel Request", "",
        "Request: " + trip.reference_number, "Name: " + trip.customer_name,
        "Email: " + trip.customer_email, "Phone / WhatsApp: " + text(details.phone),
        "Countries: " + trip.countries.join(", "), "Dates: " + dates,
        "Travelers: " + travelers, "Budget: USD " + trip.budget,
        "Interests: " + (interests || "—"), "", "Special requests:", text(details.preferences), "", "Open in CRM: " + card,
      ].join("\n");
      const telegram = job.kind === "telegram";
      const operator = job.kind === "operator_email";
      const title = operator ? "New travel request · " + trip.reference_number : "Your Kyrgyzstan360 adventure starts here";
      const body = operator ? operatorText : [
        "Your Kyrgyzstan360 adventure starts here", "",
        "We've received your travel request. Our team will review your preferences and contact you shortly to start building your personalized Central Asia itinerary.", "",
        "Request number: " + trip.reference_number,
        "Destinations: " + trip.countries.join(", "),
        "Dates: " + dates,
        "Travelers: " + travelers, "",
        "You don't need to submit another request — your request is already in our system.", "",
        "Kyrgyzstan360", "Adventure starts where the road ends.",
      ].join("\n");
      const html = operator
        ? emailShell("New Travel Request", `<p style="margin:0 0 20px">A new website request is ready for review.</p><table style="width:100%;border-collapse:collapse;font-size:14px">${[
          ["Request", trip.reference_number], ["Name", trip.customer_name], ["Email", trip.customer_email],
          ["Phone / WhatsApp", text(details.phone)], ["Countries", trip.countries.join(", ")], ["Dates", dates],
          ["Travelers", travelers], ["Budget", "USD " + trip.budget], ["Interests", interests || "—"],
        ].map(([label, value]) => `<tr><td style="padding:9px 0;border-bottom:1px solid #eee;color:#64748b;width:38%">${escapeHtml(label)}</td><td style="padding:9px 0;border-bottom:1px solid #eee">${escapeHtml(value)}</td></tr>`).join("")}</table><h2 style="font-size:16px;margin:24px 0 8px">Special requests</h2><p style="white-space:pre-wrap;margin:0 0 26px">${escapeHtml(details.preferences)}</p><a href="${escapeHtml(card)}" style="display:inline-block;background:#d97706;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Open in CRM</a>`)
        : emailShell("Your Kyrgyzstan360 adventure starts here", `<p style="font-size:16px;line-height:1.6;margin-top:0">Thank you for your request. We&rsquo;ve received your travel request. Our team will review your preferences and contact you shortly to start building your personalized Central Asia itinerary.</p><div style="background:#f8f6f1;border-radius:10px;padding:16px;margin:22px 0"><p style="margin:0 0 8px"><strong>Request number:</strong> ${escapeHtml(trip.reference_number)}</p><p style="margin:0 0 8px"><strong>Destinations:</strong> ${escapeHtml(trip.countries.join(", "))}</p><p style="margin:0 0 8px"><strong>Dates:</strong> ${escapeHtml(dates)}</p><p style="margin:0"><strong>Travelers:</strong> ${escapeHtml(travelers)}</p></div><p style="line-height:1.6">You don&rsquo;t need to submit another request &mdash; your request is already in our system.</p><p style="margin:28px 0 0"><strong>Kyrgyzstan360</strong><br><span style="color:#64748b">Adventure starts where the road ends.</span></p>`);
      const telegramToken = telegram ? required(process.env.TELEGRAM_BOT_TOKEN) : null;
      if (telegram && shouldVerifyPreviewTelegramIdentity()) {
        errorCode = await verifyPreviewTelegramIdentity(telegramToken!);
      }
      if (!errorCode) {
        const url = telegram
          ? "https://api.telegram.org/bot" + telegramToken + "/sendMessage"
          : "https://api.resend.com/emails";
        const response = await fetch(url, {
          method: "POST", signal: AbortSignal.timeout(10000),
          headers: telegram ? { "Content-Type": "application/json" } : {
            "Content-Type": "application/json", Authorization: "Bearer " + required(process.env.RESEND_API_KEY),
            "Idempotency-Key": "trip-notification/" + job.id,
          },
          body: JSON.stringify(telegram ? {
            chat_id: required(process.env.TELEGRAM_CHAT_ID), text: operatorText, link_preview_options: { is_disabled: true },
          } : {
            from: required(process.env.RESEND_FROM_EMAIL),
            to: [operator ? required(process.env.TRIP_REQUEST_OPERATOR_EMAIL) : trip.customer_email],
            subject: title, text: body, html,
          }),
        });
        if (!response.ok) {
          errorCode = "provider_http_" + response.status;
        } else {
          const result = await response.json();
          if (telegram && !result.ok) errorCode = "provider_rejected";
          else providerId = String(telegram ? result.result.message_id : result.id);
        }
      }
    } catch {
      errorCode = "delivery_unavailable";
    }
    const state = errorCode ? (job.attempts >= 5 ? "failed" : "pending") : "sent";
    const { error } = await db.from("notification_jobs").update({
      state, error_code: errorCode, provider_id: providerId,
      available_at: new Date(Date.now() + 60_000 * 2 ** job.attempts).toISOString(),
    }).eq("id", job.id).eq("state", "sending").eq("attempts", job.attempts);
    if (error || errorCode) console.error("Trip notification status", job.id, error ? "storage_error" : errorCode);
  }));
}
