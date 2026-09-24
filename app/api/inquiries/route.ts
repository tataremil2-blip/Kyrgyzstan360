const recipient = "tataremil2@gmail.com";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return Response.json({ error: "Email delivery is not configured yet." }, { status: 503 });
  }

  const input: unknown = await request.json().catch(() => null);
  if (!input || typeof input !== "object") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, phone, whatsapp, tour, preferredDates, riders, ridingLevel, message, travelMode, source, page, emailSubject, firstName, lastName } = input as Record<string, unknown>;
  const fields = { name, email, phone, whatsapp };
  const optionalFields = { tour, preferredDates, riders, ridingLevel, message, travelMode, source, page, emailSubject, firstName, lastName };

  const hasValidRequiredFields = typeof name === "string" && name.trim().length > 0
    && typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    && typeof whatsapp === "string" && whatsapp.trim().length > 0;

  const isWinterFreerideInfo = source === "Winter Freeride" && page === "/winter-freeride" && emailSubject === "[Kyrgyzstan360] Winter Freeride — Get More Info";
  const hasValidWinterNames = typeof firstName === "string" && firstName.trim().length > 0 && typeof lastName === "string" && lastName.trim().length > 0;

  if (Object.values(fields).some((value) => value !== undefined && value !== null && (typeof value !== "string" || value.length > 200)) || Object.entries(optionalFields).some(([key, value]) => value !== undefined && value !== null && (typeof value !== "string" || value.length > (key === "message" ? 1500 : 200))) || !hasValidRequiredFields || (isWinterFreerideInfo && !hasValidWinterNames)) {
    return Response.json({ error: "Please complete the required fields." }, { status: 400 });
  }

  const submittedAt = new Date().toISOString();
  const winterDetails = [
    ["Source", source],
    ["Page", page],
    ["Form", "Get More Info"],
    ["First Name", firstName],
    ["Last Name", lastName],
    ["Email", email],
    ["WhatsApp", whatsapp],
    ["Submitted", submittedAt],
  ];
  const details = isWinterFreerideInfo ? winterDetails : [
    ["Name", name],
    ["Email", email],
    ["Phone", typeof phone === "string" && phone ? phone : "Not provided"],
    ["WhatsApp", whatsapp],
    ...(typeof tour === "string" && tour ? [["Tour", tour]] : []),
    ...(typeof preferredDates === "string" && preferredDates ? [["Tour dates", preferredDates]] : []),
    ...(typeof travelMode === "string" && travelMode ? [["Travel format", travelMode]] : []),
    ...(typeof riders === "string" && riders ? [["Riders", riders]] : []),
    ...(typeof ridingLevel === "string" && ridingLevel ? [["Freeride experience", ridingLevel]] : []),
    ...(typeof message === "string" && message ? [["Message", message]] : []),
  ];

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
    signal: AbortSignal.timeout(15000),
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "Kyrgyzstan360/1.0",
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: email,
      subject: isWinterFreerideInfo ? emailSubject : typeof preferredDates === "string" && preferredDates ? `${typeof tour === "string" && tour ? tour : "Tour"} booking request | ${preferredDates} | ${name}` : typeof tour === "string" && tour ? `New ${tour} inquiry from ${name}` : `New Kyrgyzstan360 inquiry from ${name}`,
      text: `${isWinterFreerideInfo ? "NEW WINTER FREERIDE INQUIRY\n\n" : ""}${details.map(([label, value]) => `${label}: ${value}`).join("\n")}`,
      html: `<h1>${isWinterFreerideInfo ? "NEW WINTER FREERIDE INQUIRY" : "New Kyrgyzstan360 inquiry"}</h1><table>${details.map(([label, value]) => `<tr><td><strong>${escapeHtml(String(label))}</strong></td><td>${escapeHtml(String(value))}</td></tr>`).join("")}</table>`,
    }),
  });

  } catch {
    console.error("Email service connection failed");
    return Response.json({ error: "Email service is temporarily unavailable. Please try again or contact us on WhatsApp." }, { status: 503 });
  }

  if (!response.ok) {
    console.error("Resend failed", response.status, await response.text());
    return Response.json({ error: "We could not send your request. Please try again." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
