"use client";
import { useLocale, useTranslator } from "@/app/LocaleProvider";


import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "@/app/LocalizedLink";
import "./quick-inquiry-modal.css";

type QuickInquiryModalProps = {
  source: string;
  page: string;
  emailSubject: string;
  onClose: () => void;
  eyebrow?: string;
  description?: string;
  successMessage?: string;
};

export default function QuickInquiryModal({ source, page, emailSubject, onClose, eyebrow = "KYRGYZSTAN360", description = "Leave your details and I&apos;ll send you more information and available booking options.", successMessage = "I&apos;ll send you the details shortly." }: QuickInquiryModalProps) {
  const translate = useTranslator();
  const { locale } = useLocale();
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
        headers: { "Content-Type": "application/json", "Accept-Language": locale },
        body: JSON.stringify({ locale, source, page, emailSubject, name: `${firstName} ${lastName}`.trim(), firstName, lastName, email, whatsapp }),
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
      <button className="quick-inquiry-close" type="button" onClick={onClose} aria-label={translate("Close inquiry form")} ref={closeButtonRef}>×</button>
      {translate(status === "sent" ? <div className="quick-inquiry-success"><p>{translate(eyebrow)}</p><h2 id="quick-inquiry-title">{translate("Thank you.")}</h2><span>{translate(successMessage)}</span><button type="button" onClick={onClose}>{translate("CLOSE")}</button></div> : <>
        <p>{translate(eyebrow)}</p>
        <h2 id="quick-inquiry-title">{translate("Get more info")}</h2>
        <span id="quick-inquiry-description">{translate(description)}</span>
        <form onSubmit={submit}>
          <div className="quick-inquiry-fields">
            <label>{translate("FIRST NAME *")}<input name="firstName" type="text" autoComplete="given-name" required /></label>
            <label>{translate("LAST NAME *")}<input name="lastName" type="text" autoComplete="family-name" required /></label>
            <label>{translate("EMAIL *")}<input name="email" type="email" autoComplete="email" required /></label>
            <label>{translate("WHATSAPP NUMBER *")}<input name="whatsapp" type="tel" autoComplete="tel" placeholder={translate("+996 555 123 456")} required /></label>
          </div>
          {translate(status === "error" && <small className="quick-inquiry-error" role="alert">{translate(errorMessage)}</small>)}
          <button className="quick-inquiry-submit" type="submit" disabled={status === "sending"}>{translate(status === "sending" ? "SENDING..." : "SEND REQUEST")}</button>
          <p className="quick-inquiry-privacy">{translate("By submitting this form, you agree to our ")}<Link href="/privacy">{translate("Privacy Policy")}</Link>{translate(" and consent to the processing of your information for the purpose of responding to your inquiry.")}</p>
        </form>
      </>)}
    </section>
  </div>;
}


