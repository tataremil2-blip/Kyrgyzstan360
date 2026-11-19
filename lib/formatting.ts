import type { Locale } from "./i18n";

export function formatDepartureLabel(value: string, locale: Locale) {
  if (locale === "en") return value;
  const months: Record<string, string> = { May: "мая", June: "июня", Jun: "июня", July: "июля", Jul: "июля", August: "августа", Aug: "августа", September: "сентября", Sep: "сентября", October: "октября", Oct: "октября" };
  return value.replace(/\b(May|June|Jun|July|Jul|August|Aug|September|Sep|October|Oct)\b/g, (month) => months[month]);
}
