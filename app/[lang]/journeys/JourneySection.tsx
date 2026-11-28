"use client";

import { useTranslator } from "@/app/LocaleProvider";
import { useState } from "react";
import Link from "@/app/LocalizedLink";
import { journeys, type JourneySeason } from "@/lib/journeys";
import JourneyCard from "./JourneyCard";
import "./journeys.css";

export default function JourneySection({ archive = false }: { archive?: boolean }) {
  const t = useTranslator();
  const [season, setSeason] = useState<JourneySeason>("summer");
  const visible = journeys.filter((journey) => journey.season === season && (archive || journey.featured)).slice(0, archive ? undefined : 6);
  return <section id="journeys" className={`journeys-section${archive ? " journeys-archive" : ""}`}>
    <div className="journeys-intro">
      {archive ? <><p className="journeys-kicker">{t("Real journeys")}</p><h1>{t("Stories from the road.")}</h1></> : <h2>{t("Journeys we’ve shared")}</h2>}
      <p>{t(archive ? "Discover real adventures across Kyrgyzstan and Central Asia." : "Travel stories from the mountains and roads of Central Asia.")}</p>
    </div>
    <div className="journey-tabs" role="tablist" aria-label={t("Journey season")}><button className={season === "summer" ? "active" : ""} onClick={() => setSeason("summer")} role="tab" aria-selected={season === "summer"}>{t("Summer")}</button><button className={season === "winter" ? "active" : ""} onClick={() => setSeason("winter")} role="tab" aria-selected={season === "winter"}>{t("Winter")}</button></div>
    <div className="journey-grid">{visible.map((journey) => <JourneyCard key={journey.slug} journey={journey} />)}</div>
    {!archive && <Link className="journeys-all-link" href="/journeys">{t("Explore all journeys")} <span aria-hidden="true">→</span></Link>}
  </section>;
}
