const recipient = "tataremil2@gmail.com";

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character); }

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return Response.json({ error: "Email delivery is not configured yet." }, { status: 503 });
  const input: unknown = await request.json().catch(() => null);
  if (!input || typeof input !== "object") return Response.json({ error: "Invalid request." }, { status: 400 });
  const { firstName, lastName, review, rating } = input as Record<string, unknown>;
  if (typeof firstName !== "string" || !firstName.trim() || firstName.length > 100 || typeof lastName !== "string" || !lastName.trim() || lastName.length > 100 || typeof review !== "string" || !review.trim() || review.length > 2000 || typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) return Response.json({ error: "Please complete the review." }, { status: 400 });
  const name = `${firstName.trim()} ${lastName.trim()}`;
  try {
    const response = await fetch("https://api.resend.com/emails", { signal: AbortSignal.timeout(15000), method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "User-Agent": "Kyrgyzstan360/1.0" }, body: JSON.stringify({ from, to: [recipient], subject: `New Kyrgyzstan360 review from ${name}`, text: `Name: ${name}\nRating: ${rating}/5\n\nReview:\n${review.trim()}`, html: `<h1>New Kyrgyzstan360 review</h1><p><strong>Name:</strong> ${escapeHtml(name)}<br /><strong>Rating:</strong> ${rating}/5</p><p>${escapeHtml(review.trim()).replace(/\n/g, "<br />")}</p>` }) });
    if (!response.ok) return Response.json({ error: "We could not send your review." }, { status: 502 });
  } catch { return Response.json({ error: "Email service is temporarily unavailable." }, { status: 503 }); }
  return Response.json({ ok: true });
}
