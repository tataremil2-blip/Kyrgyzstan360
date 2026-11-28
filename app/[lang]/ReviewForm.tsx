"use client";
import { useLocale } from "@/app/LocaleProvider";
export default function ReviewForm() {
  const { locale } = useLocale();
  return <p><a href="mailto:travel@kyrgyzstan360.com">{locale === "ru" ? "Поделиться впечатлениями по email" : "Share your experience by email"} →</a></p>;
}
