import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale } from "./i18n";
import { createTranslator } from "./translate";

export async function getTranslator() {
  const locale = await lang();
  if (!locale || !isLocale(locale)) notFound();
  return createTranslator(locale);
}
