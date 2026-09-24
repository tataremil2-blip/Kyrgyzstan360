"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./quick-inquiry-modal.css";

type QuickInquiryModalProps = {
  source: string;
  page: string;
  emailSubject: string;
  onClose: () => void;
};

export default function QuickInquiryModal({ source, page, emailSubject, onClose }: QuickInquiryModalProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("Something went wrong. Please try again.");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const whatsapp = String(form.get("whatsapp") ?? "").trim();
    setStatus("sending");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, page, emailSubject, name: `${firstName} ${lastName}`.trim(), firstName, lastName, email, whatsapp }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setErrorMessage(typeof result?.error === "string" ? result.error : "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return <div className="quick-inquiry-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="quick-inquiry-modal" role="dialog" aria-modal="true" aria-labelledby="quick-inquiry-title" aria-describedby="quick-inquiry-description" onMouseDown={(event) => event.stopPropagation()}>
      <button className="quick-inquiry-close" type="button" onClick={onClose} aria-label="Close inquiry form" ref={closeButtonRef}>×</button>
      {status === "sent" ? <div className="quick-inquiry-success"><p>WINTER FREERIDE · KYRGYZSTAN360</p><h2 id="quick-inquiry-title">Thank you.</h2><span>I&apos;ll send you the Winter Freeride details shortly.</span><button type="button" onClick={onClose}>CLOSE</button></div> : <>
        <p>WINTER FREERIDE · KYRGYZSTAN360</p>
        <h2 id="quick-inquiry-title">Get more info</h2>
        <span id="quick-inquiry-description">Leave your details and I&apos;ll send you more information about the Winter Freeride experience, available dates and booking options.</span>
        <form onSubmit={submit}>
          <div className="quick-inquiry-fields">
            <label>FIRST NAME *<input name="firstName" type="text" autoComplete="given-name" required /></label>
            <label>LAST NAME *<input name="lastName" type="text" autoComplete="family-name" required /></label>
            <label>EMAIL *<input name="email" type="email" autoComplete="email" required /></label>
            <label>WHATSAPP NUMBER *<input name="whatsapp" type="tel" autoComplete="tel" placeholder="+996 555 123 456" required /></label>
          </div>
          {status === "error" && <small className="quick-inquiry-error" role="alert">{errorMessage}</small>}
          <button className="quick-inquiry-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? "SENDING..." : "SEND REQUEST"}</button>
          <p className="quick-inquiry-privacy">By submitting this form, you agree to our <Link href="/privacy">Privacy Policy</Link> and consent to the processing of your information for the purpose of responding to your inquiry.</p>
        </form>
      </>}
    </section>
  </div>;
}


