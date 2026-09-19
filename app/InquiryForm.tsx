"use client";

import { FormEvent, useState } from "react";
import "./inquiry-form.css";

export default function InquiryForm({ compact = false, winter = false, preferredDates, tour, groupBooking = false, submitLabel }: { compact?: boolean; winter?: boolean; preferredDates?: string; tour?: string; groupBooking?: boolean; submitLabel?: string }) {
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
        body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone: winter ? undefined : form.get("phone"), whatsapp: form.get("whatsapp"), tour: tour ?? (winter ? "Winter freeride camp" : undefined), preferredDates, travelMode: groupBooking ? form.get("travelMode") : undefined }),
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
      {(compact || winter) && <label>Your email<input name="email" type="email" autoComplete="email" placeholder="you@email.com" required /></label>}
      <label>WhatsApp number<input name="whatsapp" type="tel" autoComplete={winter ? "tel" : undefined} placeholder="+996 ..." required /></label>
      {groupBooking && <label className="form-travel-mode">How will you travel?<select name="travelMode" defaultValue="" required><option value="" disabled>Select an option</option><option value="Passenger">Passenger — with an experienced driver</option><option value="Driver">Driver — share the wheel in a rented 4×4</option></select></label>}
      {!compact && !winter && <label className="form-email">Your email<input name="email" type="email" autoComplete="email" placeholder="you@email.com" required /></label>}
    </div>
    <div className="form-submit"><button type="submit" disabled={status === "sending" || status === "sent"}>{status === "sending" ? "Sending..." : status === "sent" ? "Sent ✓" : status === "error" ? "Try again" : submitLabel ?? (preferredDates ? "Send booking request" : "Send inquiry")} <span aria-hidden="true">{status === "sent" ? "" : "\u2197"}</span></button><p role="status" aria-live="polite">{status === "sent" ? "Thank you — your inquiry has been sent." : status === "error" ? errorMessage : "We will contact you shortly."}</p></div>
    <div className="direct-contact"><p>Or contact us directly</p><a href="https://wa.me/996557444225" target="_blank" rel="noreferrer">WhatsApp: +996 557 444 225</a><a href="mailto:tataremil2@gmail.com">tataremil2@gmail.com</a></div>
  </form>;
}
