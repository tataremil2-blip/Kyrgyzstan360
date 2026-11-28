"use client";
import { useLocale } from "@/app/LocaleProvider";
import { useEffect, useRef } from "react";
import InquiryForm from "./InquiryForm";
import "./quick-inquiry-modal.css";

type Props = { source: string; page: string; emailSubject: string; onClose: () => void; eyebrow?: string; description?: string; successMessage?: string };
export default function QuickInquiryModal({ source, onClose }: Props) {
  const { locale } = useLocale();
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [onClose]);
  return <div className="tour-modal-backdrop"><section className="tour-modal" role="dialog" aria-modal="true" aria-labelledby="email-inquiry-title">
    <button ref={close} type="button" className="tour-modal-close" onClick={onClose} aria-label={locale === "ru" ? "Закрыть" : "Close"}>×</button>
    <h2 id="email-inquiry-title">{locale === "ru" ? "Ваше приключение" : "Your adventure"}</h2>
    <InquiryForm tour={source} />
  </section></div>;
}
