import { getTranslator } from "@/lib/server-translations";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "@/app/LocalizedLink";
import { getJourney, journeys } from "@/lib/journeys";
import "../journeys.css";
import "./journey-detail.css";

export function generateStaticParams() { return journeys.map(({ slug }) => ({ slug })); }
export default async function JourneyDetail({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const t = await getTranslator();
  const { slug } = await params; const journey = getJourney(slug); if (!journey) notFound();
  return <main className="journey-detail"><section className="journey-detail-hero"><Image src={journey.coverImage} alt="" fill priority sizes="100vw" /><div><small>{t(journey.season === "summer" ? "Summer journey" : "Winter journey")}</small><h1>{t(journey.title)}</h1><p>{[journey.duration && t(journey.duration), journey.countries?.map(country => t(country)).join(" · ")].filter(Boolean).join(" · ")}</p></div></section><section className="journey-detail-story"><p className="journeys-kicker">{t("THE ADVENTURE")}</p>{journey.story && <p>{t(journey.story)}</p>}<p className="journey-placeholder-note">{t("A collection of moments from a journey shared across Central Asia.")}</p></section>{journey.route && <section className="journey-route"><p className="journeys-kicker">{t("THE ROUTE")}</p><div>{journey.route.map((place, index) => <span key={place}>{t(place)}{index < journey.route!.length - 1 && <b aria-hidden="true">→</b>}</span>)}</div></section>}<section className="journey-gallery"><p className="journeys-kicker">{t("MOMENTS FROM THE JOURNEY")}</p><div>{journey.galleryImages.map((image, index) => <Image key={`${image}-${index}`} src={image} alt="" width={900} height={700} />)}</div></section>{journey.review && <section className="journey-review"><p className="journeys-kicker">{t("THEIR EXPERIENCE")}</p><blockquote>“{t(journey.review)}”</blockquote>{journey.reviewerName && <cite>{journey.reviewerName}</cite>}</section>}{journey.instagramReelUrl && <section className="journey-instagram"><p className="journeys-kicker">{t("WATCH THE JOURNEY")}</p><h2>{t("See the full adventure on Instagram.")}</h2><a href={journey.instagramReelUrl} target="_blank" rel="noreferrer">{t("WATCH ON INSTAGRAM ↗")}</a></section>}<section className="journey-final-cta"><p className="journeys-kicker">{t("WANT YOUR OWN ADVENTURE?")}</p><h2>{t("Tell us what you have in mind. We’ll help you plan it.")}</h2><Link href="/plan-your-trip">{t("Build Your Adventure")} →</Link></section></main>;
}
