import Link from "@/app/LocalizedLink";
import Image from "next/image";
import type { Journey } from "@/lib/journeys";

export default function JourneyCard({ journey }: { journey: Journey }) {
  return <Link className="journey-card" href={`/journeys/${journey.slug}`}>
    <Image src={journey.coverImage} alt="" fill sizes="(max-width: 700px) 45vw, 31vw" />
    <span className="journey-card-arrow" aria-hidden="true">↗</span>
    <div className="journey-card-copy"><small>{journey.season.toUpperCase()} {journey.duration ? "· " + journey.duration : ""}</small><h3>{journey.title}</h3>{journey.duration && journey.countries && <span>{journey.duration} · {journey.countries.length} {journey.countries.length === 1 ? "country" : "countries"}</span>}</div>
  </Link>;
}
