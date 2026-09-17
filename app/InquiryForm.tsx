"use client";

import { FormEvent, useState } from "react";
import "./inquiry-form.css";

export default function InquiryForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone: form.get("phone"), whatsapp: form.get("whatsapp") }),
      });

      if (!response.ok) throw new Error("Inquiry request failed");
      setStatus("sent");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return <form className={`inquiry-form inquiry-form-simple${compact ? " inquiry-form-compact" : ""}`} onSubmit={handleSubmit}>
    <div className="form-grid">
      <label>{compact ? "Your name" : "Full name"}<input name="name" autoComplete="name" placeholder={compact ? "Your name" : "Surname and name"} required /></label>
      {!compact && <label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="+996 ..." required /></label>}
      {compact && <label>Your email<input name="email" type="email" autoComplete="email" placeholder="you@email.com" required /></label>}
      <label>WhatsApp number<input name="whatsapp" type="tel" placeholder="+996 ..." required /></label>
      {!compact && <label className="form-email">Your email<input name="email" type="email" autoComplete="email" placeholder="you@email.com" required /></label>}
    </div>
    <div className="form-submit"><button type="submit" disabled={status === "sending" || status === "sent"}>{status === "sending" ? "Sending..." : status === "sent" ? "Sent ✓" : status === "error" ? "Try again" : "Send inquiry"} <span aria-hidden="true">{status === "sent" ? "" : "\u2197"}</span></button><p>{status === "sent" ? "Thank you — your inquiry has been sent." : status === "error" ? "We could not send it. Please try again." : "We will contact you shortly."}</p></div>
    <div className="direct-contact"><p>Or contact us directly</p><a href="https://wa.me/996557444225" target="_blank" rel="noreferrer">WhatsApp: +996 557 444 225</a><a href="mailto:tataremil2@gmail.com">tataremil2@gmail.com</a></div>
  </form>;
}
