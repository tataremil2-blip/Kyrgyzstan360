import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import SimpleTripPlanner from "./SimpleTripPlanner";
import "./planner.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/plan-my-trip">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang === "ru" ? { title: "Планировщик путешествия — Kyrgyzstan360", description: "Выберите аэропорты, страны и места в Центральной Азии. Соберите набросок путешествия и обсудите маршрут с местным гидом." } : { title: "Plan your trip — Kyrgyzstan360", description: "Choose airports, countries and destinations in Central Asia. Build a trip outline and plan your journey with a local." };
}

export default function PlanMyTripPage() {
  return <SimpleTripPlanner />;
}
