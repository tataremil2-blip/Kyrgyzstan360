import { permanentRedirect, notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function LegacyPlanner({ params }: PageProps<"/[lang]/plan-my-trip">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  permanentRedirect(`/${lang}/plan-your-trip`);
}
