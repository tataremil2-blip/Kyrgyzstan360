"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "@/app/LocalizedLink";
import { useLocale } from "@/app/LocaleProvider";
import { defaultTripDraft, airports, countries, destinations, experiences, suggestedDays, parseTripDraft, plannerCopy, plannerStorageKey, type TripDraft } from "@/lib/planner";
import InquiryForm from "../InquiryForm";
import PlannerAuthGate from "./PlannerAuthGate";
import { adviseRoute } from "@/lib/route-advisor";
import CommunityRequests from "./CommunityRequests";

const initialSnapshot = JSON.stringify(defaultTripDraft);
let memorySnapshot = initialSnapshot;
function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getSnapshot() {
  try { return localStorage.getItem(plannerStorageKey) ?? memorySnapshot; } catch { return memorySnapshot; }
}
function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener("trip-draft-updated", notify);
  return () => { window.removeEventListener("storage", notify); window.removeEventListener("trip-draft-updated", notify); };
}
function saveDraft(value: TripDraft) {
  memorySnapshot = JSON.stringify(value);
  try { localStorage.setItem(plannerStorageKey, memorySnapshot); } catch { /* Keep the current session usable when storage is blocked. */ }
  window.dispatchEvent(new Event("trip-draft-updated"));
}

export default function TripPlanner() {
  const { locale } = useLocale();
  const copy = plannerCopy[locale] as typeof plannerCopy[typeof locale] & Record<string, string>;
  const ru = locale === "ru";
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => initialSnapshot);
  const draft = useMemo(() => parseTripDraft(raw), [raw]);
  const [placeSearch, setPlaceSearch] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [parserStatus, setParserStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [parserMessage, setParserMessage] = useState("");
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [publicName, setPublicName] = useState("");
  const result = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const authDialog = useRef<HTMLDialogElement>(null);
  const chosen = destinations.filter((place) => draft.destinations.includes(place.id));
  const activities = experiences.filter((item) => draft.experiences.includes(item.id));
  const style = { en: "", ru: "" };
  const duration = suggestedDays(draft.destinations);
  const arrival = airports.find((airport) => airport.id === draft.arrivalAirport);
  const departure = airports.find((airport) => airport.id === draft.departureAirport);
  const selectedCountries = countries.filter((country) => draft.countries.includes(country.id)).sort((a, b) => {
    const rank = (id: string) => id === arrival?.country ? -1 : id === departure?.country ? 1 : 0;
    return rank(a.id) - rank(b.id);
  });
  const incompleteEstimate = chosen.some((place) => place.days === null) || selectedCountries.some((country) => !chosen.some((place) => place.country === country.id));
  const routeAdvice = adviseRoute({ selectedPlaceCount: chosen.length, knownPlaceDays: duration, unknownPlaceCount: chosen.filter((place) => place.days === null).length, selectedCountryCount: selectedCountries.length, tripDays: draft.days, hasArrival: Boolean(arrival), hasDeparture: Boolean(departure) });
  const matchesSearch = (place: typeof destinations[number]) => `${place.ru} ${place.en}`.toLocaleLowerCase().includes((placeSearch[place.country] ?? "").trim().toLocaleLowerCase());
  const outline = [
    { label: arrival?.[locale] ?? (ru ? "Выберите аэропорт прилёта" : "Choose your arrival airport"), kind: ru ? "Прилёт" : "Arrival" },
    ...selectedCountries.flatMap((country) => {
      const places = chosen.filter((place) => place.country === country.id);
      return places.length ? places.map((place) => ({ label: place[locale], kind: country[locale] })) : [{ label: ru ? `${country[locale]} — места подберём вместе` : `${country[locale]} — destinations to discuss`, kind: ru ? "Страна" : "Country" }];
    }),
    { label: departure?.[locale] ?? (ru ? "Выберите аэропорт вылета" : "Choose your departure airport"), kind: ru ? "Вылет" : "Departure" },
  ];
  const selectedMonth = draft.month ? `${copy.months[Number(draft.month.slice(5)) - 1]} ${draft.month.slice(0, 4)}` : copy.flexible;
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const selected = draft.startDate ? new Date(`${draft.startDate}T12:00:00`) : new Date();
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 0).getDate();
    return Array.from({ length: startOffset + daysInMonth }, (_, index) => index < startOffset ? null : new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), index - startOffset + 1));
  }, [calendarCursor]);
  const calendarMonthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(calendarCursor);
  const selectedDateLabel = [draft.startDate, draft.endDate].filter(Boolean).map((date) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`))).join(" — ");
  function selectTravelDate(value: string) {
    if (!draft.startDate || draft.endDate || value < draft.startDate) update({ startDate: value, endDate: "", month: value.slice(0, 7) });
    else update({ endDate: value });
  }
  const winter = draft.experiences.includes("winter") || ["11", "12", "01", "02", "03"].includes(draft.month.slice(5));
  function update(values: Partial<TripDraft>) {
    saveDraft({ ...draft, ...values, showResult: false }); setError("");
  }
  async function analyzeFreeText() {
    if (!draft.freeText.trim()) return;
    setParserStatus("loading"); setParserMessage("");
    try {
      const response = await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json", "Accept-Language": locale }, body: JSON.stringify({ text: draft.freeText }) });
      const result = await response.json() as { parsed?: { days: number | null; arrivalAirport: TripDraft["arrivalAirport"]; departureAirport: TripDraft["departureAirport"]; destinations: TripDraft["destinations"]; experiences?: TripDraft["experiences"]; itinerary?: TripDraft["aiItinerary"] }; message?: string; error?: string };
      if (!response.ok || !result.parsed) throw new Error(result.error ?? "Parser error");
      const parsed = result.parsed;
      update({ ...(parsed.days && [6, 8, 12].includes(parsed.days) ? { days: parsed.days as TripDraft["days"] } : {}), ...(parsed.arrivalAirport ? { arrivalAirport: parsed.arrivalAirport } : {}), ...(parsed.departureAirport ? { departureAirport: parsed.departureAirport } : {}), ...(parsed.destinations.length ? { destinations: parsed.destinations } : {}), ...(parsed.experiences?.length ? { experiences: parsed.experiences } : {}), ...(parsed.itinerary?.length ? { aiItinerary: parsed.itinerary } : {}) });
      setParserStatus("done"); setParserMessage(ru ? "Пожелания разобраны. Проверьте выбор ниже." : "Your wishes were extracted. Review the choices below.");
    } catch { setParserStatus("error"); setParserMessage(ru ? "Не удалось разобрать текст. Проверьте соединение и попробуйте снова." : "We could not extract the text. Check the connection and try again."); }
  }
  function preview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!arrival || !departure) { setError(ru ? "Выберите аэропорты прилёта и вылета." : "Choose your arrival and departure airports."); return; }
    if (!selectedCountries.length) { setError(ru ? "Выберите хотя бы одну страну." : "Choose at least one country."); return; }
    saveDraft({ ...draft, showResult: true });
    requestAnimationFrame(() => { result.current?.focus(); result.current?.scrollIntoView({ behavior: "smooth", block: "start" }); });
  }
  useEffect(() => {
    if (!inquiryOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); if (previous?.isConnected) previous.focus(); };
  }, [inquiryOpen]);
  useEffect(() => {
    if (!authOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const element = authDialog.current;
    element?.showModal();
    return () => { element?.close(); if (previous?.isConnected) previous.focus(); };
  }, [authOpen]);
  const inquirySummary = [
    draft.freeText ? `${ru ? "Описание туриста" : "Traveller description"}: ${draft.freeText}` : "",
    ru ? "Пожелания к поездке (маршрут не подтверждён)" : "Trip wishlist (route not confirmed)",
    `${ru ? "Прилёт" : "Arrival"}: ${arrival?.[locale] ?? "—"}; ${ru ? "Вылет" : "Departure"}: ${departure?.[locale] ?? "—"}`,
    selectedCountries.map((country) => country[locale]).join(", "),
    chosen.map((place) => place[locale]).join(", "),
    `${ru ? "Оценка длительности" : "Initial duration estimate"}: ${incompleteEstimate ? (ru ? "уточняется" : "to discuss") : duration}; ${copy.guests}: ${draft.guests}; ${selectedMonth}`,
    activities.map((item) => item[locale]).join(", "),
    `${ru ? "Даты поездки" : "Travel dates"}: ${draft.startDate || "—"} → ${draft.endDate || "—"}`,
    `${ru ? "Бюджет на человека" : "Budget per person"}: ${draft.budget || "—"}`,
    `${copy.budget}: ${copy[draft.budget as keyof typeof copy] ?? draft.budget}`,
  ].join("\n");
  const pdfSummary = [
    `Travel dates: ${draft.startDate || "To be confirmed"} to ${draft.endDate || "To be confirmed"}`,
    `Travellers: ${draft.guests}`,
    `Budget per person (USD): ${draft.budget || "To be discussed"}`,
    `Arrival: ${arrival?.en ?? "To be confirmed"}`,
    `Departure: ${departure?.en ?? "To be confirmed"}`,
    `Countries: ${selectedCountries.map((country) => country.en).join(", ") || "To be confirmed"}`,
    `Places: ${chosen.map((place) => place.en).join(", ") || "To be confirmed"}`,
    `Experiences: ${activities.map((item) => item.en).join(", ") || "To be confirmed"}`,
  ].join("\n");

  return <main className="planner-page adventure-page">
    <header className="planner-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link href="/#explore">{copy.back}</Link></header>
    <div className="adventure-shell">
      <div className="adventure-hero" role="img" aria-label={ru ? "Горы Кыргызстана" : "Mountains of Kyrgyzstan"}><span>{ru ? "МЕСТНЫЕ ГИДЫ · КЫРГЫЗСТАН И ЦЕНТРАЛЬНАЯ АЗИЯ" : "LOCAL GUIDES · KYRGYZSTAN & CENTRAL ASIA"}</span></div>
      <div className="adventure-intro"><p className="planner-eyebrow">{ru ? "НАЙДИТЕ СВОЕГО ГИДА" : "FIND YOUR LOCAL GUIDE"}</p><h1>{ru ? "Создайте своё путешествие с местными" : "Create your journey with local people"}</h1><p>{ru ? "Оставьте запрос о поездке — опытные местные гиды изучат ваши пожелания, предложат маршрут и назовут свою цену. Вы будете напрямую обсуждать детали с человеком, который знает эти места изнутри." : "Leave a trip request and experienced local guides will review your wishes, suggest a route and share their price. You will work directly with someone who knows these places from the inside."}</p><div className="planner-guide-model"><div><strong>{ru ? "1. Расскажите, чего хотите" : "1. Tell us what you want"}</strong><span>{ru ? "Маршрут, даты, места и впечатления" : "Route, dates, places and experiences"}</span></div><div><strong>{ru ? "2. Гиды изучат запрос" : "2. Local guides review it"}</strong><span>{ru ? "Люди с опытом в регионе" : "People with real local experience"}</span></div><div><strong>{ru ? "3. Выберите предложение" : "3. Choose your offer"}</strong><span>{ru ? "Маршрут и цена напрямую от гида" : "A route and price directly from a guide"}</span></div></div><label className="ai-trip-prompt"><span>{ru ? "Опишите путешествие своими словами" : "Describe your trip in your own words"}</span><textarea value={draft.freeText} maxLength={4000} onChange={(event) => { update({ freeText: event.target.value }); setParserStatus("idle"); }} placeholder={ru ? "Например: 8 дней, прилетаю в Бишкек, улетаю из Алматы, хочу шоу орлов, Кель-Суу и пожить в юрте…" : "For example: 8 days, arrive in Bishkek, fly from Almaty, eagle show, Kel-Suu and a night in a yurt…"} /><div className="ai-prompt-actions"><small>{draft.freeText.length}/4000</small><button type="button" onClick={analyzeFreeText} disabled={!draft.freeText.trim() || parserStatus === "loading"}>{parserStatus === "loading" ? (ru ? "Разбираем…" : "Reading…") : (ru ? "Разобрать пожелания" : "Extract my wishes")}</button></div><small>{parserMessage || (ru ? "Сначала проверим, что удалось понять из вашего запроса." : "First we’ll review what we understood from your request.")}</small></label></div>
      <form onSubmit={preview} className="adventure-builder">
        <div className="route-advice" aria-live="polite">{routeAdvice.map((message) => <p className={message.level} key={message.key}>{message.key === "airports" ? (ru ? "Выберите аэропорты прилёта и вылета — тогда набросок будет полнее." : "Choose arrival and departure airports to complete the outline.") : message.key === "unknownDuration" ? (ru ? "Для некоторых мест длительность ещё не подтверждена; итоговые дни уточним." : "Some destinations have no confirmed duration yet; we’ll refine the days.") : message.key === "borders" ? (ru ? "В маршруте несколько стран: пересечения границ и документы нужно проверить отдельно." : "This route crosses countries; border crossings and documents need a separate check.") : message.key === "tooDense" ? (ru ? "Выбранные места могут не поместиться в заданный срок без плотного графика." : "The selected places may not fit the trip length without a tight schedule.") : (ru ? "Добавьте места, чтобы получить набросок маршрута." : "Add destinations to see a route outline.")}</p>)}</div>
        {draft.aiItinerary.length > 0 && <section className="ai-itinerary" aria-labelledby="ai-itinerary-title"><p className="planner-eyebrow">{ru ? "ЧЕРНОВИК ИИ" : "AI DRAFT"}</p><h3 id="ai-itinerary-title">{ru ? "Предварительная программа по дням" : "Preliminary day-by-day programme"}</h3><p className="planner-hint">{ru ? "Проверьте программу: это предложение ИИ, а не подтверждённый маршрут." : "Review this programme: it is an AI suggestion, not a confirmed route."}</p><ol>{draft.aiItinerary.map((day) => <li key={day.day}><strong>{ru ? `День ${day.day}` : `Day ${day.day}`}: {day.title}</strong><span>{day.activities.join(" · ")}</span>{day.overnightPlaceId && <small>{ru ? `Ночёвка: ${day.overnightPlaceId}` : `Overnight: ${day.overnightPlaceId}`}</small>}</li>)}</ol></section>}
        <div className="adventure-choices">
          <fieldset><legend>{ru ? "1. Прилёт и вылет" : "1. Arrival and departure"}</legend><div className="flight-fields">{(["arrivalAirport", "departureAirport"] as const).map((field) => <label key={field}>{field === "arrivalAirport" ? (ru ? "Куда прилетаете?" : "Where do you arrive?") : (ru ? "Откуда улетаете?" : "Where do you depart?")}<select value={draft[field]} onChange={(event) => update({ [field]: event.target.value as TripDraft[typeof field] })}><option value="">{ru ? "Выберите аэропорт" : "Choose an airport"}</option>{airports.map((airport) => <option key={airport.id} value={airport.id}>{airport[locale]}</option>)}</select></label>)}</div><p className="planner-hint">{ru ? "Можно прилететь в одну страну, а улететь из другой." : "You can arrive in one country and fly home from another."}</p></fieldset>
          <fieldset><legend>{ru ? "2. Выберите страны и места" : "2. Choose countries and places"}</legend><div className="country-choices">{countries.map((country) => <button type="button" key={country.id} aria-pressed={draft.countries.includes(country.id)} aria-controls={`places-${country.id}`} onClick={() => {
            const selected = draft.countries.includes(country.id);
            update({ countries: selected ? draft.countries.filter((id) => id !== country.id) : [...draft.countries, country.id], destinations: selected ? draft.destinations.filter((id) => !destinations.some((place) => place.id === id && place.country === country.id)) : draft.destinations });
          }}>{country[locale]}<span aria-hidden="true">{draft.countries.includes(country.id) ? "✓" : "+"}</span></button>)}</div><p className="planner-hint">{ru ? "Выберите одну или несколько стран. Ниже появятся места каждой выбранной страны." : "Select one or more countries to see their destinations below."}</p>{countries.map((country) => <div id={`places-${country.id}`} key={country.id} hidden={!draft.countries.includes(country.id)} className="country-places"><h3>{country[locale]}</h3>{<label className="place-search">{ru ? "Найти место" : "Find a place"}<input type="search" value={placeSearch[country.id] ?? ""} onChange={(event) => setPlaceSearch({ ...placeSearch, [country.id]: event.target.value })} placeholder={ru ? "Название места…" : "Destination name…"} /><small>{ru ? "Найдено" : "Found"}: {destinations.filter((place) => place.country === country.id && matchesSearch(place)).length}</small></label>}{destinations.some((place) => place.country === country.id) ? <div className="destination-grid">{destinations.filter((place) => place.country === country.id && matchesSearch(place)).map((place) => {
            const selected = draft.destinations.includes(place.id);
            return <button type="button" className={`destination-card ${selected ? "is-selected" : ""}`} key={place.id} aria-pressed={selected} onClick={() => update({ destinations: selected ? draft.destinations.filter((id) => id !== place.id) : [...draft.destinations, place.id] })}><span className="destination-name">{place[locale]}<span aria-hidden="true">{selected ? "✓" : "+"}</span></span><span className="destination-duration">{place.days === null ? (ru ? "Длительность уточним" : "Duration to discuss") : ru ? `Ориентир: ${place.days} ${place.days === 1 ? "день" : "дня"}` : `Suggested ${place.days} ${place.days === 1 ? "day" : "days"}`}</span></button>;
          })}</div> : <p className="country-empty">{ru ? "Можно включить эту страну в поездку. Места для посещения подберём вместе при обсуждении маршрута." : "Include this country in your trip. We’ll choose its destinations together when discussing your route."}</p>}</div>)}</fieldset>
          <fieldset><legend>{ru ? "3. Выберите впечатления" : "3. Choose your experiences"}</legend><div className="experience-grid">{experiences.map((item) => <label key={item.id}><input type="checkbox" checked={draft.experiences.includes(item.id)} onChange={(event) => update({ experiences: event.target.checked ? [...draft.experiences, item.id] : draft.experiences.filter((id) => id !== item.id) })} /><span>{item[locale]}</span></label>)}</div></fieldset>
          <section className="adventure-details"><h3>{ru ? "Даты, гости и бюджет" : "Dates, guests and budget"}</h3><div className="trip-calendar" aria-label={ru ? "Календарь поездки" : "Travel calendar"}><div className="trip-calendar-head"><button type="button" aria-label={ru ? "Предыдущий месяц" : "Previous month"} onClick={() => setCalendarCursor(new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1))}>←</button><strong>{calendarMonthLabel}</strong><button type="button" aria-label={ru ? "Следующий месяц" : "Next month"} onClick={() => setCalendarCursor(new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1))}>→</button></div><div className="trip-calendar-weekdays">{(ru ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((day) => <span key={day}>{day}</span>)}</div><div className="trip-calendar-grid">{calendarDays.map((date, index) => { if (!date) return <span key={`empty-${index}`} />; const value = toDateInputValue(date); const isStart = value === draft.startDate; const isEnd = value === draft.endDate; const isInRange = Boolean(draft.startDate && draft.endDate && value > draft.startDate && value < draft.endDate); return <button type="button" key={value} className={`${isStart || isEnd ? "is-selected" : ""} ${isInRange ? "is-in-range" : ""}`} aria-label={`${value}${isStart ? (ru ? ", начало поездки" : ", trip start") : isEnd ? (ru ? ", конец поездки" : ", trip end") : ""}`} onClick={() => selectTravelDate(value)}>{date.getDate()}</button>; })}</div><div className="trip-calendar-footer"><span>{selectedDateLabel || (ru ? "Нажмите дату начала, затем дату окончания" : "Choose a start date, then an end date")}</span>{(draft.startDate || draft.endDate) && <button type="button" onClick={() => update({ startDate: "", endDate: "", month: "" })}>{ru ? "Очистить даты" : "Clear dates"}</button>}</div></div><div className="trip-planning-inputs"><section className="travellers-picker"><p>{copy.guests}</p><div><button type="button" aria-label={ru ? "Уменьшить количество путешественников" : "Reduce travellers"} disabled={draft.guests <= 1} onClick={() => update({ guests: draft.guests - 1 })}>−</button><strong aria-live="polite">{draft.guests}</strong><span>{ru ? (draft.guests === 1 ? "путешественник" : "путешественника") : (draft.guests === 1 ? "traveller" : "travellers")}</span><button type="button" aria-label={ru ? "Увеличить количество путешественников" : "Add traveller"} disabled={draft.guests >= 16} onClick={() => update({ guests: draft.guests + 1 })}>+</button></div></section><label className="budget-input">{ru ? "Бюджет на человека, USD" : "Budget per person, USD"}<span><b>$</b><input type="number" min="0" step="50" inputMode="decimal" value={draft.budget} onChange={(e) => update({ budget: e.target.value })} placeholder={ru ? "Например: 1200" : "For example: 1200"} /></span></label></div><p className="planner-hint">{ru ? "Укажите бюджет на одного человека без международных перелётов." : "Enter the budget per person, excluding international flights."}</p></section>
        </div>
        <aside className="adventure-summary"><p className="planner-eyebrow">{ru ? "ВАШ ВЫБОР" : "YOUR SELECTION"}</p><h2>{ru ? "Ваше приключение" : "Your adventure"}</h2><p aria-live="polite">{ru ? `Направлений: ${chosen.length}` : `${chosen.length} destinations`}</p><div className="adventure-duration"><strong>{incompleteEstimate ? "—" : duration || "—"}</strong><span>{incompleteEstimate ? (ru ? "длительность уточним" : "duration to discuss") : (ru ? "дней в выбранных местах" : "days at selected destinations")}</span></div><h3 className="route-outline-title">{ru ? "Набросок маршрута" : "Route outline"}</h3><ol className="airport-route" aria-live="polite">{outline.map((stop, index) => <li key={`${index}-${stop.label}`}><small>{stop.kind}</small><span>{stop.label}</span></li>)}</ol><p className="planner-hint">{ru ? "Предварительная последовательность. Дни перелётов, трансферы и границы ещё не учтены. Порядок мест и стран уточним с учётом дорог и сезона." : "A preliminary sequence. Flight days, transfers and border crossings are not included yet. We’ll refine the order of places and countries for roads and season."}</p>{winter && <p className="planner-season-note">{ru ? "Зимнюю доступность горных направлений и подходящий транспорт согласуем отдельно." : "We’ll confirm winter access to mountain destinations and suitable transport separately."}</p>}{error && <p className="planner-error" role="alert">{error}</p>}<button className="planner-primary" type="submit">{ru ? "Посмотреть моё путешествие" : "Preview My Adventure"}</button><p className="planner-hint">{ru ? "Ваш выбор сохраняется, если доступно локальное хранилище браузера." : "Your choices are saved when browser storage is available."}</p><button className="planner-text-button" type="button" onClick={() => { saveDraft({ ...defaultTripDraft }); setPlaceSearch({}); setError(""); }}>{copy.reset}</button></aside>
      </form>
      {draft.showResult && <section ref={result} tabIndex={-1} className="adventure-preview" aria-labelledby="adventure-preview-title"><p className="planner-eyebrow">{ru ? "ВАШ ЗАПРОС ГОТОВ" : "YOUR REQUEST IS READY"}</p><h2 id="adventure-preview-title">{ru ? "Теперь найдём подходящего местного гида." : "Now let’s find the right local guide."}</h2><div className="planner-summary"><span>{selectedMonth}</span><span>{copy.guests}: {draft.guests}</span><span>{style[locale]}</span></div><ol className="airport-route">{outline.map((stop, index) => <li key={`${index}-${stop.label}`}><small>{stop.kind}</small><span>{stop.label}</span></li>)}</ol><p>{activities.length ? activities.map((item) => item[locale]).join(" · ") : ru ? "Активности подберём вместе." : "We’ll choose experiences together."}</p><p>{copy.budget}: {copy[draft.budget]}</p><p className="planner-hint">{ru ? "Это ваши пожелания, а не готовая программа. После регистрации ваш запрос увидят местные гиды: они свяжутся с вами напрямую и предложат маршрут, доступность и свою цену." : "This is your wishlist, not a fixed itinerary. After sign-in, local guides can review it, contact you directly and propose their route, availability and price."}</p><button className="planner-primary" type="button" onClick={() => setAuthOpen(true)}>{ru ? "Получить предложения гидов и PDF" : "Get guide offers and PDF"}</button><small>{ru ? "Регистрация нужна только на этом шаге — чтобы мы могли передать запрос и отправить PDF." : "Sign-in is only needed at this step so we can share your request and send the PDF."}</small></section>}
      <CommunityRequests locale={locale} current={draft.showResult && publicName ? { id: "my-request", title: publicName, meta: `${draft.days} ${ru ? "дней" : "days"} · ${arrival?.[locale] ?? "—"} → ${departure?.[locale] ?? "—"}`, places: chosen.map((place) => place[locale]), text: draft.freeText || (ru ? "Хочу собрать маршрут по Кыргызстану." : "I want to build a route through Kyrgyzstan.") } : null} />
    </div>
    {requestSent && <dialog open className="planner-dialog planner-success-dialog"><p className="planner-eyebrow">KYRGYZSTAN360</p><h2>{ru ? "Запрос отправлен" : "Request sent"}</h2><p>{ru ? "Мы отправили ваши данные и PDF с пожеланиями к поездке на email. Местный гид свяжется с вами в WhatsApp." : "We sent your details and a PDF of your trip preferences to your email. A local guide will contact you on WhatsApp."}</p><button className="planner-primary" type="button" onClick={() => setRequestSent(false)}>{ru ? "Понятно" : "Got it"}</button></dialog>}
    {authOpen && <dialog ref={authDialog} className="planner-dialog" aria-labelledby="planner-auth-title"><button className="planner-dialog-close" type="button" aria-label={copy.close} onClick={() => setAuthOpen(false)}>×</button><p className="planner-eyebrow">KYRGYZSTAN360</p><h2 id="planner-auth-title">{ru ? "Получить предложение и PDF" : "Get your offer and PDF"}</h2><PlannerAuthGate locale={locale} onReady={async (profile) => { try { const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json", "Accept-Language": locale }, body: JSON.stringify({ name: profile.firstName, firstName: profile.firstName, email: profile.email, whatsapp: profile.whatsapp, tour: "Custom trip planner", message: inquirySummary, pdfSummary, page: `/${locale}/plan-my-trip` }) }); if (!response.ok) throw new Error("Email delivery failed"); setPublicName(profile.firstName); setAuthOpen(false); setRequestSent(true); } catch { setError(ru ? "Не удалось отправить PDF. Проверьте email и попробуйте ещё раз." : "We could not send the PDF. Check your email and try again."); setAuthOpen(false); } }} /></dialog>}
    {inquiryOpen && <dialog ref={dialog} className="planner-dialog" aria-labelledby="planner-inquiry-title" onCancel={() => setInquiryOpen(false)} onClose={() => setInquiryOpen(false)}><button className="planner-dialog-close" type="button" aria-label={copy.close} onClick={() => setInquiryOpen(false)}>×</button><p className="planner-eyebrow">KYRGYZSTAN360</p><h2 id="planner-inquiry-title">{copy.inquiry}</h2><p>{ru ? "Оставьте контакты. В заявку войдут аэропорты, страны, места и пожелания к поездке." : "Leave your contacts. Your request includes airports, countries, destinations and travel preferences."}</p><InquiryForm compact tour="Custom trip planner (wishlist)" preferredDates={selectedMonth} message={inquirySummary} submitLabel={ru ? "Отправить запрос" : "Send my request"} /></dialog>}
  </main>;
}

