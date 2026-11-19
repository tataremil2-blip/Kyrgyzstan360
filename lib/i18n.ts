export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];
export function isLocale(value: string): value is Locale {
  return value === "en" || value === "ru";
}
export function stripLocale(path: string): string {
  return path.replace(/^\/(en|ru)(?=\/|[?#]|$)/, "") || "/";
}
export function localizedHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const path = stripLocale(href);
  if (/^\/(api|_next)(\/|$)/.test(path) || /\.[^/]+$/.test(path.split(/[?#]/)[0])) return href;
  return `/${locale}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;
}
export const dictionaries = {
  en: {
    language: "Language", back: "BACK", home: "Back to homepage", info: "GET MORE INFO", guide: "GET YOUR GUIDE",
    navigation: "Main navigation", winter: "Winter", explore: "Choose your adventure", guideBook: "Guide book", reviews: "Reviews", contact: "Contact",
    description: "Small-group and private adventures across Kyrgyzstan.",
  },
  ru: {
    language: "Язык", back: "НАЗАД", home: "На главную", info: "УЗНАТЬ ПОДРОБНЕЕ", guide: "ПОЛУЧИТЬ ПУТЕВОДИТЕЛЬ",
    navigation: "Главное меню", winter: "Зима", explore: "Выбрать путешествие", guideBook: "Путеводитель", reviews: "Отзывы", contact: "Контакты",
    description: "Индивидуальные путешествия и туры в небольших группах по Кыргызстану.",
  },
};
