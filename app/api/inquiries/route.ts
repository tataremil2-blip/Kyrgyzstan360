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

  const { name, email, phone, whatsapp } = input as Record<string, unknown>;
  const fields = { name, email, phone, whatsapp };

  if (Object.values(fields).some((value) => value !== undefined && (typeof value !== "string" || value.length > 200)) || typeof name !== "string" || typeof email !== "string" || typeof whatsapp !== "string") {
    return Response.json({ error: "Please complete the required fields." }, { status: 400 });
  }

  const details = [
    ["Name", name],
    ["Email", email],
    ["Phone", typeof phone === "string" && phone ? phone : "Not provided"],
    ["WhatsApp", whatsapp],
  ];

  const response = await fetch("https://api.resend.com/emails", {
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
      subject: `New Kyrgyzstan360 inquiry from ${name}`,
      text: details.map(([label, value]) => `${label}: ${value}`).join("\n"),
      html: `<h1>New Kyrgyzstan360 inquiry</h1><table>${details.map(([label, value]) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join("")}</table>`,
    }),
  });

  if (!response.ok) {
    console.error("Resend failed", response.status, await response.text());
    return Response.json({ error: "We could not send your request. Please try again." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
