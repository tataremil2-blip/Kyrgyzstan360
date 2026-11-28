import { getTranslator } from "@/lib/server-translations";
import Image from "next/image";
import Link from "@/app/LocalizedLink";
import "./about-emil.css";

const moments = ["/founder-kyrgyzstan.jpg", "/individual-tour.jpg", "/hero-kyrgyzstan.jpg", "/rent-service-camp.jpg", "/winter/horses.jpg", "/winter/snowcat-slope.webp"];

export default async function AboutEmilPage() {
  const t = await getTranslator();
  return <main className="about-emil-page">
    <section className="about-emil-hero"><Image src="/founder-kyrgyzstan.jpg" alt={t("Emil in Kyrgyzstan")} fill priority sizes="100vw" /><div><p>{t("FROM CITY LIFE")}</p><h1>{t("Into the mountains")}</h1></div></section>
    <section className="about-emil-intro"><p className="about-kicker">{t("A PERSONAL NOTE")}</p><h2>{t("This is the place where I share the story behind Kyrgyzstan360.")}</h2><p>{t("The full story is still being written. What I know already is that the road, the mountains and the people of Central Asia have become part of how I live.")}</p></section>
    <section className="about-emil-split"><div><p className="about-kicker">{t("WHERE IT STARTED")}</p><h2>{t("A different life. A different rhythm.")}</h2></div><p>{t("I used to spend my days in the city, running businesses. Then the mountains pulled me in.")}</p></section>
    <section className="about-emil-split about-emil-dark"><div><p className="about-kicker">{t("WHY I CHOSE THE MOUNTAINS")}</p><h2>{t("The road became the destination.")}</h2></div><p>{t("Today I travel the roads of Central Asia and share the places I love with the people who come here.")}</p></section>
    <section className="about-emil-philosophy"><p className="about-kicker">{t("WHY CENTRAL ASIA")}</p><h2>{t("I don't simply sell destinations. I live and travel through this region.")}</h2><div><p>{t("Central Asia is a collection of roads, landscapes and encounters that keep revealing something new.")}</p><p>{t("That personal connection is the foundation of how I want to share it.")}</p></div></section>
    <section className="about-emil-way"><p className="about-kicker">{t("HOW I LIKE TO TRAVEL")}</p><h2>{t("Mountain roads. Local people. Room for the unexpected.")}</h2><div className="about-emil-way-grid">{["4×4 roads", "Yurts and horses", "Remote places", "Spontaneous stops"].map((item) => <span key={item}>{t(item)}</span>)}</div></section>
    <section className="about-emil-share"><p className="about-kicker">{t("WHAT I WANT TO SHARE")}</p><h2>{t("Come for the landscapes. Leave with a story that is yours.")}</h2></section>
    <section className="about-emil-gallery"><p className="about-kicker">{t("PHOTO STORY")}</p><div>{moments.map((src, i) => <Image key={src} src={src} alt="" width={900} height={700} className={`about-moment about-moment-${i + 1}`} />)}</div></section>
    <section className="about-emil-final"><p className="about-kicker">{t("COME SEE CENTRAL ASIA WITH ME")}</p><h2>{t("Let's build an adventure you'll actually remember.")}</h2><Link href="/plan-your-trip">{t("Build Your Adventure")} →</Link></section>
  </main>;
}
