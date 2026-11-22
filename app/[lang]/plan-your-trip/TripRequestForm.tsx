"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { countries, interests, utmKeys, validate } from "@/lib/travel-requests/validation";
import Turnstile from "./Turnstile";
import { track, useTripPageAnalytics } from "./analytics";

const initial = {
  countries: ["KG"], interests: [] as string[], startDate: "", endDate: "", flexible: false,
  adults: "2", children: "0", budget: "", preferences: "", name: "", email: "", phone: "",
  contact: "email", telegram: "", residence: "", consent: false,
};
const labels = {
  en: {
    steps: ["Destinations", "Dates & Travelers", "Travel Interests", "Travel Preferences", "Contact Details"],
    headings: ["Which countries would you like to visit?", "When are you planning to travel?", "What would you love to experience?", "Tell us about your dream adventure", "How can we reach you?"],
    countries: ["Kyrgyzstan", "Kazakhstan", "Uzbekistan", "Tajikistan", "Turkmenistan"],
    interests: ["Nature & Mountains", "Road Trips & 4×4 Adventures", "Hiking & Trekking", "Horse Riding", "Nomadic Culture", "Historical Cities & Silk Road", "Lakes & Canyons", "Winter Adventures & Freeride", "Photography", "Family Travel", "Cultural Experiences"],
    required: "Included in every trip", start: "Start date", end: "End date", flexible: "My dates are flexible",
    adults: "Number of adults", children: "Number of children", budget: "Approximate budget per person (USD)",
    preferences: "Describe your dream trip, the places you would love to visit, your preferred travel pace, accommodation preferences or any special requests.",
    name: "Full name", email: "Email", phone: "WhatsApp / Phone", contact: "Preferred contact method",
    telegram: "Telegram username", residence: "Country of residence", consent: "I agree to the", policy: "Privacy Policy",
    next: "Continue", back: "Back", send: "Send My Trip Request", sending: "Sending…",
    free: "Free request. No payment required. No booking commitment.",
    success: "Your request has been received", thanks: "Thank you for your request! Our local travel experts will review your preferences and contact you to help create your perfect Central Asia journey.",
    reference: "Request number", optional: "optional",
    createAccount: "Create your free account", accountHint: "Create an account to track your request, manage your trip details and keep everything in one place.",
    errors: {
      countries: "Your trip must include Kyrgyzstan.", dates: "Enter a valid date range starting today or later, or select flexible dates and leave both dates blank.",
      travelers: "Enter 1–100 adults and 0–100 children.", budget: "Enter a positive USD budget with up to two decimal places.",
      interests: "Choose from the listed interests.", preferences: "Use 3,000 characters or fewer.",
      name: "Enter your full name (up to 120 characters).", email: "Enter a valid email address.",
      contact: "Check your contact details. For WhatsApp use an international number with +. For Telegram enter your username.",
      consent: "Agree to the Privacy Policy to continue.", challenge: "Please complete the verification again.",
      rate: "Too many attempts. Please wait 15 minutes and try again.", unavailable: "We couldn't confirm your request. Please try again.",
      conflict: "This submission was already used. Please try again.",
    },
  },
  ru: {
    steps: ["Страны", "Даты и участники", "Интересы", "Пожелания", "Контакты"],
    headings: ["Какие страны вы хотите посетить?", "Когда вы планируете путешествие?", "Что вы хотите увидеть и попробовать?", "Расскажите о путешествии своей мечты", "Как с вами связаться?"],
    countries: ["Кыргызстан", "Казахстан", "Узбекистан", "Таджикистан", "Туркменистан"],
    interests: ["Природа и горы", "Автопутешествия и 4×4", "Походы и треккинг", "Верховая езда", "Кочевая культура", "Исторические города и Шёлковый путь", "Озёра и каньоны", "Зимние приключения и фрирайд", "Фотография", "Семейные путешествия", "Культурные мероприятия"],
    required: "Входит в каждое путешествие", start: "Дата начала", end: "Дата окончания", flexible: "Мои даты гибкие",
    adults: "Количество взрослых", children: "Количество детей", budget: "Примерный бюджет на человека (USD)",
    preferences: "Опишите путешествие мечты, места, которые хотите посетить, желаемый темп, варианты размещения или особые пожелания.",
    name: "Имя и фамилия", email: "Электронная почта", phone: "WhatsApp / телефон", contact: "Предпочтительный способ связи",
    telegram: "Имя пользователя Telegram", residence: "Страна проживания", consent: "Я принимаю", policy: "Политику конфиденциальности",
    next: "Продолжить", back: "Назад", send: "Отправить заявку", sending: "Отправляем…",
    free: "Заявка бесплатна и не обязывает к оплате или бронированию.",
    success: "Ваша заявка получена", thanks: "Спасибо за заявку! Наши местные эксперты изучат ваши пожелания и свяжутся с вами, чтобы составить маршрут по Центральной Азии.",
    reference: "Номер заявки", optional: "необязательно",
    createAccount: "Создать бесплатный аккаунт", accountHint: "Создайте аккаунт, чтобы отслеживать заявку, хранить детали поездки и держать всё в одном месте.",
    errors: {
      countries: "Маршрут должен включать Кыргызстан.", dates: "Укажите корректные даты, начиная с сегодняшнего дня, или выберите гибкие даты и оставьте оба поля пустыми.",
      travelers: "Укажите от 1 до 100 взрослых и от 0 до 100 детей.", budget: "Введите положительную сумму в USD с точностью до двух знаков после запятой.",
      interests: "Выберите интересы из списка.", preferences: "Используйте не более 3 000 символов.",
      name: "Укажите имя и фамилию (до 120 символов).", email: "Укажите действительный email.",
      contact: "Проверьте контакты. Для WhatsApp используйте международный номер с +, для Telegram — имя пользователя.",
      consent: "Примите Политику конфиденциальности, чтобы продолжить.", challenge: "Пожалуйста, пройдите проверку ещё раз.",
      rate: "Слишком много попыток. Повторите через 15 минут.", unavailable: "Не удалось подтвердить отправку. Попробуйте ещё раз.",
      conflict: "Эта отправка уже использована. Попробуйте ещё раз.",
    },
  },
};

export default function TripRequestForm({ locale }: { locale: "en" | "ru" }) {
  const copy = labels[locale];
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [reference, setReference] = useState("");
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);
  const [sending, setSending] = useState(false);
  const pending = useRef(false);
  const submission = useRef<{ payload: string; key: string } | null>(null);
  const completed = useRef(new Set<number>());
  const started = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useTripPageAnalytics(locale);

  function markStarted() {
    if (!started.current) { started.current = true; track("started", locale); }
  }

  function update<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggle(key: "countries" | "interests", value: string) {
    update(key, form[key].includes(value) ? form[key].filter((entry) => entry !== value) : [...form[key], value]);
  }

  function move(next: number) {
    setErrors([]);
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }

  function complete() {
    if (completed.current.has(step)) return;
    completed.current.add(step);
    track("step_completed", locale, { step });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const params = new URLSearchParams(window.location.search);
    const { errors: invalid, data } = validate({
      ...form, locale, adults: Number(form.adults), children: form.children === "" ? NaN : Number(form.children),
      budget: Number(form.budget), utm: Object.fromEntries(utmKeys.map((key) => [key, params.get(key)])),
    }, step);
    if (invalid.length) {
      setErrors(invalid);
      return;
    }
    if (!started.current) { started.current = true; track("started", locale); }
    if (step < 5) {
      complete();
      move(step + 1);
      return;
    }
    if (!token) { setErrors(["challenge"]); return; }
    complete();
    pending.current = true;
    setSending(true);
    setErrors([]);
    try {
      const payload = JSON.stringify(data);
      if (submission.current?.payload !== payload) submission.current = { payload, key: crypto.randomUUID() };
      const response = await fetch("/api/trip-requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, key: submission.current.key, token }), signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (!response.ok || typeof result.reference !== "string") {
        const reason = ["challenge", "rate", "conflict", "validation"].includes(result.code) ? result.code : "unavailable";
        if (reason === "conflict") submission.current = null;
        setErrors(reason === "validation" && Array.isArray(result.errors) ? result.errors : [reason]);
        track("failed", locale, { reason });
        return;
      }
      setReference(result.reference);
      track("submitted", locale, { reference: result.reference });
      track("conversion", locale, { reference: result.reference });
      requestAnimationFrame(() => heading.current?.focus());
    } catch {
      setErrors(["unavailable"]);
      track("failed", locale, { reason: "network" });
    } finally {
      pending.current = false;
      setSending(false);
      setToken("");
      setReset((current) => current + 1);
    }
  }

  function field(key: "startDate" | "endDate" | "adults" | "children" | "budget" | "name" | "email" | "phone" | "telegram" | "residence",
    label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) {
    return <label className="trip-field">{label}<input {...props} value={form[key]} onChange={(event) => update(key, event.target.value)} /></label>;
  }

  return <section className="trip-form-shell" id="trip-form" aria-labelledby="trip-form-heading">
    {reference ? <div className="trip-success">
      <h2 ref={heading} tabIndex={-1} id="trip-form-heading">{copy.success}</h2>
      <p>{copy.thanks}</p><p>{copy.reference} <strong>{reference}</strong></p><p>{copy.accountHint}</p><Link href="/account/register">{copy.createAccount}</Link>
    </div> : <>
      <div className="trip-progress"><span>{copy.steps[step - 1]}</span><span>{step} / 5</span></div>
      <progress value={step} max={5} aria-label={locale === "ru" ? "Прогресс заполнения" : "Form progress"} />
      <h2 ref={heading} tabIndex={-1} id="trip-form-heading">{copy.headings[step - 1]}</h2>
      <form onSubmit={submit} onChange={markStarted} noValidate aria-describedby={errors.length ? "trip-errors" : undefined}>
        <fieldset disabled={sending} className="trip-fields" aria-labelledby="trip-form-heading">
          {step === 1 && <div className="trip-options">{countries.map((country, index) => <label key={country}>
            <input type="checkbox" checked={form.countries.includes(country)} disabled={country === "KG"} onChange={() => toggle("countries", country)} />
            <span>{copy.countries[index]}{country === "KG" && <small>{copy.required}</small>}</span>
          </label>)}</div>}
          {step === 2 && <>
            <div className="trip-pair">
              {field("startDate", copy.start, { type: "date", required: !form.flexible })}
              {field("endDate", copy.end, { type: "date", min: form.startDate || undefined, required: !form.flexible })}
            </div>
            <label className="trip-check"><input type="checkbox" checked={form.flexible} onChange={(event) => update("flexible", event.target.checked)} />{copy.flexible}</label>
            <div className="trip-pair">
              {field("adults", copy.adults, { type: "number", min: 1, max: 100, required: true })}
              {field("children", copy.children, { type: "number", min: 0, max: 100, required: true })}
            </div>
            {field("budget", copy.budget, { type: "number", min: 0.01, step: 0.01, inputMode: "decimal", required: true })}
          </>}
          {step === 3 && <div className="trip-options">{interests.map((interest, index) => <label key={interest}>
            <input type="checkbox" checked={form.interests.includes(interest)} onChange={() => toggle("interests", interest)} />
            <span>{copy.interests[index]}</span>
          </label>)}</div>}
          {step === 4 && <label className="trip-field">{copy.preferences} ({copy.optional})
            <textarea rows={6} maxLength={3000} value={form.preferences} onChange={(event) => update("preferences", event.target.value)} />
          </label>}
          {step === 5 && <>
            <div className="trip-pair">
              {field("name", copy.name, { autoComplete: "name", maxLength: 120, required: true })}
              {field("email", copy.email, { type: "email", autoComplete: "email", maxLength: 254, required: true })}
            </div>
            <label className="trip-field">{copy.contact}<select value={form.contact} onChange={(event) => update("contact", event.target.value)}>
              <option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="telegram">Telegram</option>
            </select></label>
            {field("phone", copy.phone + (form.contact === "whatsapp" ? "" : " (" + copy.optional + ")"),
              { type: "tel", autoComplete: "tel", maxLength: 30, required: form.contact === "whatsapp" })}
            {form.contact === "telegram" && field("telegram", copy.telegram, { maxLength: 33, required: true })}
            {field("residence", copy.residence + " (" + copy.optional + ")", { autoComplete: "country-name", maxLength: 100 })}
            <div className="trip-check">
              <label><input type="checkbox" checked={form.consent} required aria-describedby="trip-privacy"
                onChange={(event) => update("consent", event.target.checked)} /> {copy.consent}</label>
              <a id="trip-privacy" href={"/" + locale + "/privacy"} target="_blank" rel="noopener">{copy.policy}</a>
            </div>
            <Turnstile locale={locale} reset={reset} onToken={setToken} />
          </>}
        </fieldset>
        {errors.length > 0 && <ul id="trip-errors" className="trip-errors" role="alert">{errors.map((code) =>
          <li key={code}>{copy.errors[code as keyof typeof copy.errors] ?? copy.errors.unavailable}</li>)}</ul>}
        <div className="trip-buttons">
          {step > 1 && <button type="button" className="trip-back" disabled={sending} onClick={() => move(step - 1)}>{copy.back}</button>}
          <button type="submit" disabled={sending}>{step < 5 ? copy.next : sending ? copy.sending : copy.send}</button>
        </div>
        {step === 5 && <p className="trip-free">{copy.free}</p>}
      </form>
    </>}
  </section>;
}
