"use client";
import { useLocale } from "@/app/LocaleProvider";
import Link from "@/app/LocalizedLink";
import "./inquiry-form.css";

type Props = { compact?: boolean; winter?: boolean; preferredDates?: string; tour?: string; groupBooking?: boolean; submitLabel?: string; message?: string; showDescription?: boolean; successMessage?: string };
export default function InquiryForm({ tour, preferredDates, message }: Props) {
  const { locale } = useLocale();
  const context = [tour, preferredDates, message].filter(Boolean).join("\n").slice(0, 1500);
  return <div className="inquiry-form">
    <p>{locale === "ru" ? "Расскажите о поездке в короткой форме — Эмиль ответит вам по email." : "Tell us about your trip in our short form. Emil will reply by email."}</p>
    <Link className="button" href={"/plan-your-trip" + (context ? "?trip=" + encodeURIComponent(context) : "")}>{locale === "ru" ? "СОЗДАТЬ ПУТЕШЕСТВИЕ" : "BUILD YOUR ADVENTURE"} →</Link>
  </div>;
}
