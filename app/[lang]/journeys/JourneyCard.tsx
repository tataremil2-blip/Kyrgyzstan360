import { useTranslator } from "@/app/LocaleProvider";
import Link from "@/app/LocalizedLink";
import Image from "next/image";
import type { Journey } from "@/lib/journeys";

export default function JourneyCard({ journey }: { journey: Journey }) {
  const t = useTranslator();
  return <Link className="journey-card" href={`/journeys/${journey.slug}`}>
    <Image src={journey.coverImage} alt="" fill sizes="(max-width: 700px) 45vw, 31vw" />
    <span className="journey-card-arrow" aria-hidden="true">↗</span>
    <div className="journey-card-copy">
      <small>{t(journey.season === "summer" ? "Summer" : "Winter")}{journey.duration && ` · ${t(journey.duration)}`}</small>
      <h3>{t(journey.title)}</h3>
    </div>
  </Link>;
}
