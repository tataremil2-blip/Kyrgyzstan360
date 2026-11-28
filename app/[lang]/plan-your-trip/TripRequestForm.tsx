"use client";

import { useRef, useState, type FormEvent } from "react";
import { utmKeys, validate } from "@/lib/travel-requests/validation";
import Turnstile from "./Turnstile";
import TripRequestSuccess from "./TripRequestSuccess";
import { trackAcceptedTripRequest, trackPublicEvent } from "../analytics";

type DateMode = "" | "exact" | "approximate" | "flexible";
const initial = { name: "", email: "", phone: "", dateMode: "" as DateMode, startDate: "", endDate: "", preferredPeriod: "", travelers: "", budget: "", preferences: "" };

const copy = {
  en: {
    invalidWhatsApp: "Enter a WhatsApp number with its country code, or leave it blank.",
    name: "Full name", email: "Email", whatsapp: "WhatsApp", dates: "When are you thinking of traveling?", exact: "Exact dates", approximate: "Approximate dates", flexible: "Flexible dates", start: "Start date", end: "End date", period: "Approximate month", travelers: "Number of travelers", budget: "Budget per person", message: "Tell us what you have in mind", send: "SEND MY REQUEST", sending: "Sending…", privacy: "By sending, you agree to our", policy: "Privacy Policy", errors: { name: "Enter your full name.", email: "Enter a valid email address.", dates: "Check the travel dates.", travelers: "Enter a number from 1 to 100.", budget: "Enter a positive amount with up to two decimal places.", preferences: "Use 3,000 characters or fewer.", challenge: "Please complete the verification again.", rate: "Too many attempts. Please wait 15 minutes and try again.", unavailable: "We couldn't confirm your request. Please try again.", conflict: "This submission was already used. Please try again." },
  },
  ru: {
    invalidWhatsApp: "Укажите номер WhatsApp с кодом страны или оставьте поле пустым.",
    name: "Имя и фамилия", email: "Электронная почта", whatsapp: "WhatsApp", dates: "Когда вы планируете путешествие?", exact: "Точные даты", approximate: "Примерные даты", flexible: "Гибкие даты", start: "Дата начала", end: "Дата окончания", period: "Примерный месяц", travelers: "Количество путешественников", budget: "Бюджет на человека", message: "Ваши пожелания к поездке", send: "ОТПРАВИТЬ ЗАЯВКУ", sending: "Отправляем…", privacy: "Отправляя форму, вы принимаете", policy: "Политику конфиденциальности", errors: { name: "Укажите имя и фамилию.", email: "Проверьте адрес электронной почты.", dates: "Проверьте даты путешествия.", travelers: "Укажите число от 1 до 100.", budget: "Введите положительную сумму с точностью до двух знаков.", preferences: "Используйте не более 3 000 символов.", challenge: "Пожалуйста, пройдите проверку ещё раз.", rate: "Слишком много попыток. Повторите через 15 минут.", unavailable: "Не удалось подтвердить отправку. Попробуйте ещё раз.", conflict: "Эта отправка уже использована. Попробуйте ещё раз." },
  },
};

export default function TripRequestForm({ locale, context = "" }: { locale: "en" | "ru"; context?: string }) {
  const text = copy[locale];
  const [form, setForm] = useState({ ...initial, preferences: context });
  const [errors, setErrors] = useState<string[]>([]);
  const [reference, setReference] = useState("");
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);
  const [sending, setSending] = useState(false);
  const pending = useRef(false);
  const submission = useRef<{ payload: string; key: string } | null>(null);
  const started = useRef(false);

  function update<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function startedOnce() { if (!started.current) { started.current = true; trackPublicEvent("trip_request_started", locale); } }
  function clearDates(mode: DateMode) { update("dateMode", mode); if (mode !== "exact") { update("startDate", ""); update("endDate", ""); } if (mode !== "approximate") update("preferredPeriod", ""); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const params = new URLSearchParams(window.location.search);
    const { errors: invalid, data } = validate({
      ...form, locale, countries: [], interests: [], flexible: form.dateMode === "flexible", adults: form.travelers === "" ? null : Number(form.travelers), children: null,
      budget: form.budget === "" ? null : Number(form.budget), contact: form.phone ? "whatsapp" : "email", consent: true,
      utm: Object.fromEntries(utmKeys.map((key) => [key, params.get(key)])),
    });
    if (invalid.length) { setErrors(invalid); return; }
    startedOnce();
    if (!token) { setErrors(["challenge"]); return; }
    pending.current = true; setSending(true); setErrors([]);
    try {
      const payload = JSON.stringify(data);
      if (submission.current?.payload !== payload) submission.current = { payload, key: crypto.randomUUID() };
      const response = await fetch("/api/email-leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, key: submission.current.key, token }), signal: AbortSignal.timeout(25_000) });
      const result = await response.json();
      if (!response.ok || typeof result.reference !== "string") { const reason = ["challenge", "rate", "conflict", "validation"].includes(result.code) ? result.code : "unavailable"; if (reason === "conflict") submission.current = null; setErrors(reason === "validation" && Array.isArray(result.errors) ? result.errors : [reason]); trackPublicEvent("trip_request_failed", locale, reason); return; }
      setReference(result.reference);
      trackAcceptedTripRequest(response.status, result, locale);
    } catch { setErrors(["unavailable"]); trackPublicEvent("trip_request_failed", locale, "network"); }
    finally { pending.current = false; setSending(false); setToken(""); setReset((value) => value + 1); }
  }

  if (reference) return <TripRequestSuccess locale={locale} reference={reference} />;
  return <section className="trip-form-shell" id="trip-form" aria-labelledby="trip-form-heading">
    <form onSubmit={submit} onChange={startedOnce} noValidate aria-describedby={errors.length ? "trip-errors" : undefined}>
      <fieldset disabled={sending} className="trip-fields"><div className="trip-pair"><label className="trip-field">{text.name} *<input autoComplete="name" maxLength={120} required value={form.name} onChange={(event) => update("name", event.target.value)} /></label><label className="trip-field">{text.email} *<input type="email" autoComplete="email" maxLength={254} required value={form.email} onChange={(event) => update("email", event.target.value)} /></label></div>
        <label className="trip-field">{text.whatsapp}<input type="tel" autoComplete="tel" maxLength={30} value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>
        <fieldset className="trip-date-modes"><legend>{text.dates}</legend><div className="trip-date-options">{(["exact", "approximate", "flexible"] as const).map((mode) => <label key={mode}><input type="radio" name="dateMode" checked={form.dateMode === mode} onChange={() => clearDates(mode)} /><span>{text[mode]}</span></label>)}</div>
          {form.dateMode === "exact" && <div className="trip-pair"><label className="trip-field">{text.start}<input type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} /></label><label className="trip-field">{text.end}<input type="date" min={form.startDate || undefined} value={form.endDate} onChange={(event) => update("endDate", event.target.value)} /></label></div>}
          {form.dateMode === "approximate" && <label className="trip-field">{text.period}<input type="month" value={form.preferredPeriod} onChange={(event) => update("preferredPeriod", event.target.value)} /></label>}
        </fieldset>
        <div className="trip-pair"><label className="trip-field">{text.travelers}<input type="number" min="1" max="100" inputMode="numeric" value={form.travelers} onChange={(event) => update("travelers", event.target.value)} /></label><label className="trip-field">{text.budget}<input type="number" min="0.01" step="0.01" inputMode="decimal" value={form.budget} onChange={(event) => update("budget", event.target.value)} /></label></div>
        <label className="trip-field">{text.message}<textarea rows={5} maxLength={3000} placeholder={locale === "ru" ? "Расскажите всё, что считаете важным…" : "Tell us anything you'd like us to know…"} value={form.preferences} onChange={(event) => update("preferences", event.target.value)} /></label>
        <p className="trip-privacy">{text.privacy} <a href={`/${locale}/privacy`} target="_blank" rel="noopener">{text.policy}</a>.</p><Turnstile locale={locale} reset={reset} onToken={setToken} />
      </fieldset>
      {errors.length > 0 && <ul id="trip-errors" className="trip-errors" role="alert">{errors.map((code) => <li key={code}>{code === "contact" ? text.invalidWhatsApp : text.errors[code as keyof typeof text.errors] ?? text.errors.unavailable}</li>)}</ul>}
      {errors.length > 0 && <p className="trip-privacy">{locale === "ru" ? "Нужна помощь? Напишите нам: " : "Need help? Contact us: "}<a href="mailto:travel@kyrgyzstan360.com">travel@kyrgyzstan360.com</a> · <a href="https://wa.me/996557444225" target="_blank" rel="noopener noreferrer">WhatsApp</a>.</p>}
      <button className="trip-submit" type="submit" disabled={sending}>{sending ? text.sending : text.send}</button>
    </form>
  </section>;
}
