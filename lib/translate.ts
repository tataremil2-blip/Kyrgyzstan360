import russian from "./translations/ru.json";
import type { Locale } from "./i18n";

const messages: Record<string, string> = russian;
const entities: Record<string, string> = { apos: "'", quot: '"', amp: "&", nbsp: " ", middot: "·", euro: "€", rarr: "→", times: "×", ndash: "–", mdash: "—" };
export function normalizeMessage(value: string) {
  return value.replace(/&([a-z]+);/g, (match, entity: string) => entities[entity] ?? match).replace(/\s+/g, " ").trim();
}

// Translate at the presentation boundary; route IDs, prices and form values
// remain shared data. Non-string React children pass through unchanged.
export function createTranslator(locale: Locale) {
  return function t<T>(value: T, values?: Record<string, string | number>): T {
    if (typeof value !== "string") return value;
    const key = normalizeMessage(value);
    const translated = locale === "ru" ? messages[key] : undefined;
    let text = translated === undefined
      ? value.replace(/&([a-z]+);/g, (match, entity: string) => entities[entity] ?? match)
      : (value.match(/^\s*/)?.[0] ?? "") + translated + (value.match(/\s*$/)?.[0] ?? "");
    if (locale === "ru") text = text.replace(/([€$])(\d{1,3}(?:,\d{3})+)/g, (_, currency: string, amount: string) => `${new Intl.NumberFormat("ru-RU").format(Number(amount.replaceAll(",", "")))} ${currency}`);
    return (values ? text.replace(/\{(\w+)\}/g, (match, name: string) => values[name] === undefined ? match : String(values[name])) : text) as T;
  };
}
