import Link from "next/link";
import InquiryForm from "../InquiryForm";
import SectionPageNav from "../SectionPageNav";
import "./guide-book.css";

const guideHighlights = [
  { number: "01", title: "Plan with confidence", copy: "Use a considered starting point for shaping an independent journey through Kyrgyzstan." },
  { number: "02", title: "Go beyond the obvious", copy: "Discover the places, roads and mountain atmosphere that make a self-led route feel personal." },
  { number: "03", title: "Travel your own way", copy: "Keep the freedom to choose your own pace while travelling with better local context." },
];

export default function GuideBookPage() {
  return <main className="guide-page">
    <header className="guide-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link href="/#explore">← ALL ADVENTURES</Link></header>
    <section className="guide-hero" id="overview"><img src="/guide-book-hiker-map.png" alt="Traveller looking at a map in the mountains of Kyrgyzstan" /><div /><div className="guide-hero-copy"><p>KYRGYZSTAN GUIDE BOOK</p><h1>Make the<br /><em>route yours.</em></h1><span>A personal guide book for travellers who want to explore Kyrgyzstan independently, with local perspective before the journey begins.</span><a href="#request">GET THE GUIDE ↗</a></div></section>
    <SectionPageNav label="Guide book sections" items={[{ href: "#overview", label: "Overview" }, { href: "#inside", label: "Inside the guide" }, { href: "#request", label: "Get the guide" }]} />
    <section className="guide-intro" id="inside"><div><p>GO WITH A PLAN</p><h2>Your route.<br /><em>Your pace.</em></h2></div><span>Created for curious travellers who want the space to make Kyrgyzstan their own, while starting with a guide shaped by real time on the road.</span></section>
    <section className="guide-highlights" aria-label="Guide book highlights">{guideHighlights.map((highlight) => <article key={highlight.number}><b>{highlight.number}</b><h3>{highlight.title}</h3><p>{highlight.copy}</p></article>)}</section>
    <section className="guide-request" id="request"><div><p>GET THE GUIDE BOOK</p><h2>Start with<br /><em>the right map.</em></h2><span>Leave your details and we&apos;ll share the current Guide Book price and delivery information.</span></div><InquiryForm compact tour="Kyrgyzstan Guide Book" submitLabel="GET THE GUIDE" /></section>
  </main>;
}
