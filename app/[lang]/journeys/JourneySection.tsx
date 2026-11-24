"use client";

import { useState } from "react";
import Link from "@/app/LocalizedLink";
import { journeys, type JourneySeason } from "@/lib/journeys";
import JourneyCard from "./JourneyCard";
import "./journeys.css";

export default function JourneySection({ archive = false }: { archive?: boolean }) {
  const [season, setSeason] = useState<JourneySeason>("summer");
  const visible = journeys.filter((journey) => journey.season === season && (archive || journey.featured)).slice(0, archive ? undefined : 6);
  return <section className={`journeys-section${archive ? " journeys-archive" : ""}`}>
    <div className="journeys-intro"><p className="journeys-kicker">{archive ? "REAL JOURNEYS" : "JOURNEYS WE'VE SHARED"}</p>{archive ? <h1>Stories from the road.</h1> : <h2>JOURNEYS WE&apos;VE SHARED</h2>}<p>{archive ? "Discover real adventures across Kyrgyzstan and Central Asia." : "Real travelers. Real adventures. Real Central Asia."}</p>{!archive && <span>Every journey is different. Here are some of the adventures we&apos;ve shared with travelers exploring Central Asia.</span>}</div>
    <div className="journey-tabs" role="tablist" aria-label="Journey season"><button className={season === "summer" ? "active" : ""} onClick={() => setSeason("summer")} role="tab" aria-selected={season === "summer"}>SUMMER</button><button className={season === "winter" ? "active" : ""} onClick={() => setSeason("winter")} role="tab" aria-selected={season === "winter"}>WINTER</button></div>
    <div className="journey-grid">{visible.map((journey) => <JourneyCard key={journey.slug} journey={journey} />)}</div>
    {!archive && <Link className="journeys-all-link" href="/journeys">EXPLORE ALL JOURNEYS <span aria-hidden="true">→</span></Link>}
  </section>;
}
