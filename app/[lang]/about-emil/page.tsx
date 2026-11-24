import Image from "next/image";
import Link from "@/app/LocalizedLink";
import "./about-emil.css";

const moments = ["/founder-kyrgyzstan.jpg", "/individual-tour.jpg", "/hero-kyrgyzstan.jpg", "/rent-service-camp.jpg", "/winter/horses.jpg", "/winter/snowcat-slope.webp"];

export default function AboutEmilPage() {
  return <main className="about-emil-page">
    <section className="about-emil-hero"><Image src="/founder-kyrgyzstan.jpg" alt="Emil in the Kyrgyz mountains" fill priority sizes="100vw" /><div><p>FROM CITY LIFE</p><h1>TO THE<br />MOUNTAINS.</h1></div></section>
    <section className="about-emil-intro"><p className="about-kicker">A PERSONAL NOTE</p><h2>This is the place where I share the story behind Kyrgyzstan360.</h2><p>The full story is still being written. What I know already is that the road, the mountains and the people of Central Asia have become part of how I live.</p></section>
    <section className="about-emil-split"><div><p className="about-kicker">WHERE IT STARTED</p><h2>A different life. A different rhythm.</h2></div><p>Space for the story of Emil&apos;s city and business life, and the moment travel gradually became more important than routine.</p></section>
    <section className="about-emil-split about-emil-dark"><div><p className="about-kicker">WHY I CHOSE THE MOUNTAINS</p><h2>The road became the destination.</h2></div><p>Space for the transition into guiding, road trips, mountains and expeditions — shared in Emil&apos;s own words.</p></section>
    <section className="about-emil-philosophy"><p className="about-kicker">WHY CENTRAL ASIA</p><h2>I don&apos;t simply sell destinations. I live and travel through this region.</h2><div><p>Central Asia is a collection of roads, landscapes and encounters that keep revealing something new.</p><p>That personal connection is the foundation of how I want to share it.</p></div></section>
    <section className="about-emil-way"><p className="about-kicker">HOW I LIKE TO TRAVEL</p><h2>Mountain roads. Local people. Room for the unexpected.</h2><div className="about-emil-way-grid">{["4×4 roads", "Yurts and horses", "Remote places", "Spontaneous stops"].map((item) => <span key={item}>{item}</span>)}</div></section>
    <section className="about-emil-share"><p className="about-kicker">WHAT I WANT TO SHARE</p><h2>Come for the landscapes. Leave with a story that is yours.</h2></section>
    <section className="about-emil-gallery"><p className="about-kicker">PHOTO STORY</p><div>{moments.map((src, i) => <Image key={src} src={src} alt="" width={900} height={700} className={`about-moment about-moment-${i + 1}`} />)}</div></section>
    <section className="about-emil-final"><p className="about-kicker">COME SEE CENTRAL ASIA WITH ME</p><h2>Let&apos;s build an adventure you&apos;ll actually remember.</h2><Link href="/plan-your-trip">PLAN MY TRIP →</Link></section>
  </main>;
}
