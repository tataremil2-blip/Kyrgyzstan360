import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import TripPlanner from "./TripPlanner";
import "./planner.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/plan-my-trip">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang === "ru" ? { title: "Планировщик путешествия — Kyrgyzstan360", description: "Выберите места, впечатления и стиль путешествия. Соберите маршрут и отправьте заявку местному гиду." } : { title: "Plan your trip — Kyrgyzstan360", description: "Choose destinations, experiences and travel style. Build your route and send a request to a local guide." };
}

export default function PlanMyTripPage() {
  return <TripPlanner firstMonth={new Date().toISOString().slice(0, 7)} />;
}
