import Link from "next/link";
import InquiryForm from "../InquiryForm";
import SectionPageNav from "../SectionPageNav";
import "./rent.css";

const categories = [
  { number: "01", title: "4×4 vehicles", copy: "Prepared Land Cruiser 100 and Lexus LX 470 for mountain passes, remote valleys and long road days.", image: "/vehicles/land-cruiser-100-mountains.png", alt: "Prepared Land Cruiser 100 in the mountains" },
  { number: "02", title: "Motorcycles", copy: "Motorcycles for riders who want more freedom on Kyrgyzstan’s mountain roads and open trails.", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=85", alt: "Motorcycle on an open road" },
  { number: "03", title: "Hiking gear", copy: "Tents, sleeping systems, cooking equipment and the essentials for multi-day walks in the mountains.", image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=1200&q=85", alt: "Hiking tent in the mountains" },
];

export default function RentPage() {
  return <main className="rent-page">
    <header className="rent-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link href="/#explore">← ALL ADVENTURES</Link></header>
    <section className="rent-hero" id="overview"><img src="/vehicles/lexus-lx-470-mountains.png" alt="Lexus LX 470 on a mountain road" /><div /><div className="rent-hero-copy"><p>KYRGYZSTAN RENT SERVICE</p><h1>Go your<br /><em>own way.</em></h1><span>Rent the vehicle or equipment that takes you further — then make the route your own.</span><a href="#request">ASK ABOUT AVAILABILITY ↗</a></div></section>
    <SectionPageNav label="Rent service sections" items={[{ href: "#overview", label: "Overview" }, { href: "#vehicles", label: "Vehicles" }, { href: "#motorcycles", label: "Motorcycles" }, { href: "#gear", label: "Hiking gear" }, { href: "#request", label: "Request" }]} />
    <section className="rent-intro"><p>WHAT WE RENT</p><h2>Everything for<br /><em>the road ahead.</em></h2><span>Whether you are planning a self-drive expedition, a motorcycle escape or a trek into the high country, we can help you start properly equipped.</span></section>
    <section className="rent-categories">{categories.map((category) => <article id={category.title === "4×4 vehicles" ? "vehicles" : category.title === "Motorcycles" ? "motorcycles" : "gear"} key={category.title}><img src={category.image} alt={category.alt} loading="lazy" /><div><b>{category.number}</b><h3>{category.title}</h3><p>{category.copy}</p></div></article>)}</section>
    <section className="rent-request" id="request"><div><p>RENTAL REQUEST</p><h2>Tell us what<br /><em>you need.</em></h2><span>Share your dates and the equipment you are looking for. We will send availability and a tailored rental offer.</span></div><InquiryForm compact tour="Rent service request" /></section>
  </main>;
}
