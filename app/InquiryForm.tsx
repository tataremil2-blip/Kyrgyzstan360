"use client";

import { FormEvent, useState } from "react";
import "./inquiry-form.css";

export default function InquiryForm({ compact = false, winter = false, preferredDates }: { compact?: boolean; winter?: boolean; preferredDates?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const [errorMessage, setErrorMessage] = useState("We could not send it. Please try again.");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus("sending");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone: winter ? undefined : form.get("phone"), whatsapp: form.get("whatsapp"), tour: winter ? "Winter freeride camp" : undefined, preferredDates: winter ? preferredDates : undefined }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setErrorMessage(typeof result?.error === "string" ? result.error : "We could not send it. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      formElement.reset();
    } catch {
      setErrorMessage("Connection failed. Please try again or contact us on WhatsApp.");
      setStatus("error");
    }
  }

  return <form className={`inquiry-form inquiry-form-simple${compact ? " inquiry-form-compact" : ""}${winter ? " inquiry-form-winter" : ""}`} onSubmit={handleSubmit}>
    <div className="form-grid">
      <label>{winter ? "Surname and first name" : compact ? "Your name" : "Full name"}<input name="name" autoComplete="name" placeholder={compact && !winter ? "Your name" : "Surname and name"} required /></label>
      {!compact && !winter && <label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="+996 ..." required /></label>}
      {(compact || winter) && <label>Your email<input name="email" type="email" autoComplete="email" placeholder="you@email.com" required /></label>}
      <label>WhatsApp number<input name="whatsapp" type="tel" autoComplete={winter ? "tel" : undefined} placeholder="+996 ..." required /></label>
      {!compact && !winter && <label className="form-email">Your email<input name="email" type="email" autoComplete="email" placeholder="you@email.com" required /></label>}
    </div>
    <div className="form-submit"><button type="submit" disabled={status === "sending" || status === "sent"}>{status === "sending" ? "Sending..." : status === "sent" ? "Sent ✓" : status === "error" ? "Try again" : preferredDates ? "Send booking request" : "Send inquiry"} <span aria-hidden="true">{status === "sent" ? "" : "\u2197"}</span></button><p role="status" aria-live="polite">{status === "sent" ? "Thank you — your inquiry has been sent." : status === "error" ? errorMessage : "We will contact you shortly."}</p></div>
    <div className="direct-contact"><p>Or contact us directly</p><a href="https://wa.me/996557444225" target="_blank" rel="noreferrer">WhatsApp: +996 557 444 225</a><a href="mailto:tataremil2@gmail.com">tataremil2@gmail.com</a></div>
  </form>;
}
