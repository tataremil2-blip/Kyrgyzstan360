"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
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
    <div className="form-submit"><button type="submit" disabled={status === "sending" || status === "sent"}>{status === "sending" ? "Sending..." : status === "sent" ? "Sent ✓" : status === "error" ? "Try again" : submitLabel ?? (preferredDates ? "Send booking request" : "Send inquiry")}</button><p role="status" aria-live="polite">{status === "sent" ? "Thank you — your inquiry has been sent." : status === "error" ? errorMessage : "We will contact you shortly."}</p></div>
    <p className="form-privacy-notice"><span>By submitting this form, you agree to our policy and consent to the processing of your information for the purpose of responding to your inquiry.</span><Link href="/privacy">Privacy Policy</Link></p>
    <div className="direct-contact"><p>Or contact us directly</p><a className="whatsapp-link" href="https://wa.me/996557444225" target="_blank" rel="noreferrer"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.4 3.6A11.8 11.8 0 0 0 2.8 19.1L2 22l3-0.8A11.8 11.8 0 1 0 20.4 3.6Z" fill="#25D366" /><path d="M8.1 6.8c-.3-.6-.6-.6-.9-.6H6.5c-.2 0-.6.1-.8.4s-1.1 1.1-1.1 2.7 1.1 3.1 1.3 3.3 2.2 3.5 5.4 4.7c2.6 1 3.2.8 3.8.8.6-.1 1.9-.8 2.2-1.6s.3-1.5.2-1.6-.3-.2-.7-.4-1.9-.9-2.2-1-.6-.1-.9.2-1 1-1.2 1.2-.4.2-.7.1c-1.8-.9-3-1.6-4.2-3.7-.3-.5.3-.5.8-1.6.1-.2 0-.5-.1-.7l-1-2.4Z" fill="#fff" /></svg><span>WhatsApp: +996 557 444 225</span></a><a href="mailto:tataremil2@gmail.com">tataremil2@gmail.com</a></div>
  </form>;
}


