import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "@/app/LocalizedLink";
import { getJourney, journeys } from "@/lib/journeys";
import "../journeys.css";
import "./journey-detail.css";

export function generateStaticParams() { return journeys.map(({ slug }) => ({ slug })); }
export default async function JourneyDetail({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { slug } = await params; const journey = getJourney(slug); if (!journey) notFound();
  return <main className="journey-detail"><section className="journey-detail-hero"><Image src={journey.coverImage} alt="" fill priority sizes="100vw" /><div><small>{journey.season.toUpperCase()} JOURNEY</small><h1>{journey.title}</h1><p>{[journey.duration, journey.countries?.join(" · ")].filter(Boolean).join(" · ")}</p></div></section><section className="journey-detail-story"><p className="journeys-kicker">THE ADVENTURE</p>{journey.story && <p>{journey.story}</p>}<p className="journey-placeholder-note">A collection of moments from a journey shared across Central Asia.</p></section>{journey.route && <section className="journey-route"><p className="journeys-kicker">THE ROUTE</p><div>{journey.route.map((place, index) => <span key={place}>{place}{index < journey.route!.length - 1 && <b aria-hidden="true">→</b>}</span>)}</div></section>}<section className="journey-gallery"><p className="journeys-kicker">MOMENTS FROM THE JOURNEY</p><div>{journey.galleryImages.map((image, index) => <Image key={`${image}-${index}`} src={image} alt="" width={900} height={700} />)}</div></section>{journey.review && <section className="journey-review"><p className="journeys-kicker">THEIR EXPERIENCE</p><blockquote>“{journey.review}”</blockquote>{journey.reviewerName && <cite>{journey.reviewerName}</cite>}</section>}{journey.instagramReelUrl && <section className="journey-instagram"><p className="journeys-kicker">WATCH THE JOURNEY</p><h2>See the full adventure on Instagram.</h2><a href={journey.instagramReelUrl} target="_blank" rel="noreferrer">WATCH ON INSTAGRAM ↗</a></section>}<section className="journey-final-cta"><p className="journeys-kicker">WANT YOUR OWN ADVENTURE?</p><h2>Tell us what you have in mind.<br />We&apos;ll help you build it.</h2><Link href="/plan-your-trip">PLAN MY TRIP →</Link></section></main>;
}
