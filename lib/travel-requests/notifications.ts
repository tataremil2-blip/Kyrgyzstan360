import { database } from "./database";

function required(value: string | undefined) {
  if (!value) throw new Error("Provider is not configured");
  return value;
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
        .select("id,reference_number,customer_name,customer_email,locale,countries,start_date,end_date,adults,children,budget")
        .eq("id", job.request_id).single();
      if (error || !trip) throw new Error("Request unavailable");
      const card = new URL("/admin/requests/" + trip.id, required(process.env.APP_BASE_URL)).href;
      const operatorText = [
        trip.reference_number, trip.customer_name, trip.countries.join(", "),
        trip.start_date ? trip.start_date + " – " + trip.end_date : "Flexible dates",
        "Travelers: " + trip.adults + " adults, " + trip.children + " children",
        "Budget per person: USD " + trip.budget, card,
      ].join("\n");
      const telegram = job.kind === "telegram";
      const operator = job.kind === "operator_email";
      const ru = trip.locale === "ru";
      const title = operator ? "New trip request" : ru ? "Ваша заявка на путешествие" : "Your trip request";
      const body = operator ? operatorText : ru
        ? "Спасибо за заявку! Наши специалисты изучат ваши пожелания и свяжутся с вами. Номер заявки: " + trip.reference_number
        : "Thank you for your request! Our local travel experts will review your preferences and contact you. Reference: " + trip.reference_number;
      const url = telegram
        ? "https://api.telegram.org/bot" + required(process.env.TELEGRAM_BOT_TOKEN) + "/sendMessage"
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
          subject: title + " · " + trip.reference_number, text: body,
        }),
      });
      if (!response.ok) {
        errorCode = "provider_http_" + response.status;
      } else {
        const result = await response.json();
        if (telegram && !result.ok) errorCode = "provider_rejected";
        else providerId = String(telegram ? result.result.message_id : result.id);
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
