import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import TripRequestForm from "./TripRequestForm";
import "./trip-request.css";

const origin = "https://kyrgyzstan360.com";
const path = (lang: string) => origin + "/" + lang + "/plan-your-trip";
const copy = {
  en: {
    title: "Explore Central Asia. Your Way.",
    description: "Create your own private adventure through Kyrgyzstan and Central Asia. Travel with local experts, enjoy flexible itineraries and book directly without third-party marketplace commissions.",
    primary: "Get My Free Trip Proposal", secondary: "Build Your Adventure",
  },
  ru: {
    title: "Центральная Азия. По вашему маршруту.",
    description: "Спланируйте индивидуальное путешествие по Кыргызстану и Центральной Азии. Путешествуйте с местными экспертами, выбирайте гибкий маршрут и бронируйте напрямую без комиссий сторонних площадок.",
    primary: "Получить бесплатное предложение", secondary: "Собрать свой маршрут",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/plan-your-trip">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return {
    title: copy[lang].title + " | Kyrgyzstan360",
    description: copy[lang].description,
    alternates: { canonical: path(lang), languages: { en: path("en"), ru: path("ru"), "x-default": path("en") } },
  };
}

export default async function PlanYourTrip({ params }: PageProps<"/[lang]/plan-your-trip">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const message = copy[lang];
  return <main className="trip-request">
    <header className="trip-request-hero">
      <Image src="/hero-kyrgyzstan.jpg" alt="" fill sizes="100vw" preload />
      <div className="trip-request-intro">
        <a href={"/" + lang} className="trip-request-brand">Kyrgyzstan360</a>
        <h1>{message.title}</h1>
        <p>{message.description}</p>
        <div className="trip-request-actions">
          <a href="#trip-form">{message.primary}</a>
          <a href={"/" + lang + "/plan-my-trip"}>{message.secondary}</a>
        </div>
      </div>
    </header>
    <TripRequestForm locale={lang} />
  </main>;
}
