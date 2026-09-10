import "./hero.css";
import "./tour-icons.css";
import InquiryForm from "./InquiryForm";

const adventures = [
  { title: "Private journeys", description: "A route shaped around your time, pace and curiosity.", image: "https://www.alpin-ism.com/media/page/news/_fullWidth/untitled-7167-Pano.jpg" },
  { title: "Rent & ride", description: "Cars, motorcycles and the freedom of an open mountain road.", image: "https://www.voyagekirghizistan.com/_next/image?q=75&url=https%3A%2F%2Fnecvlggenujydiokngfg.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fnomadays-images%2Fphotos%2F93b97591-1d9c-4fd6-a6bb-e72c4014feeb%2Fcontent%2F438e2e8f-70f6-4b60-9b40-aa2d130e1dd1%2F14d90266-d041-41e8-9c9c-5fec63d9f3e9.jpg&w=1920" },
  { title: "Hike & camp", description: "Everything you need to disappear into the high country.", image: "https://35photo.pro/photos_temp/sizes/1275/6375224_1500n.jpg" },
  { title: "Local guidebook", description: "Places worth the detour, from people who know the way.", image: "https://miro.medium.com/v2/resize%3Afit%3A1024/0%2AasSB7Hg6sggt1nLM.jpg" },
];

const tourTypes = [
  { title: "Individual jeep tours", subtitle: "Private 4x4 routes", icon: "jeep" },
  { title: "Group jeep tours", subtitle: "Travel together", icon: "group" },
  { title: "Active tours", subtitle: "Hike, ride, explore", icon: "mountain" },
  { title: "Winter freeride camps", subtitle: "Deep snow & wild lines", icon: "snow" },
];

function Arrow() { return <span aria-hidden="true">{"\u2197"}</span>; }

function TourIcon({ type }: { type: string }) {
  if (type === "jeep") return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 38h40l-4-15H22zM17 38v8m30-8v8M10 46h44v6H10zM20 27l3-8h18l4 8M18 31h1m26 0h1" /></svg>;
  if (type === "group") return <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="21" r="7" /><path d="M18 48c1-10 7-15 14-15s13 5 14 15M17 28a6 6 0 1 0-5-9m35 9a6 6 0 1 1 5-9M12 47c0-6 2-10 7-12m33 0c5 2 7 6 7 12" /></svg>;
  if (type === "mountain") return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="m7 50 19-31 10 15 7-10 14 26H7ZM26 19l4 7 4-5M16 50h40" /></svg>;
  return <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 10v44M13 21l38 22M13 43l38-22M20 14l24 36M44 14 20 50" /><circle cx="32" cy="32" r="7" /></svg>;
}

export default function Home() {
  return <main>
    <header className="site-header"><div className="nav-shell"><a className="brand" href="#top" aria-label="Kyrgyzstan 360 home">KYRGYZSTAN<span>360</span></a><nav aria-label="Main navigation"><a href="#experience">Experience</a><a href="#tours">Tours</a><a href="#about">Why us</a></nav><a className="nav-cta" href="#contact">Plan my trip <Arrow /></a></div></header>
    <section className="hero" id="top"><img src="/hero-kyrgyzstan.jpg" alt="Green mountain valley in Kyrgyzstan" /><div className="hero-shade" /><div className="hero-content container"><p className="eyebrow light">Central Asia {"\u00b7"} Kyrgyzstan</p><h1>Explore <em>Kyrgyzstan</em><br /><span>and Central Asia</span><small>with Kyrgyzstan360</small></h1><div className="hero-bottom"><p>Small-group and private adventures through Kyrgyzstan&apos;s wild mountains, yurt valleys and open roads.</p><a className="button button-light" href="#contact">Start planning <Arrow /></a></div></div><p className="coordinates">41{String.fromCharCode(176)}12{String.fromCharCode(8242)}N {"\u00b7"} 74{String.fromCharCode(176)}46{String.fromCharCode(8242)}E</p><a className="scroll-cue" href="#experience">Scroll to explore <span>{"\u2193"}</span></a></section>
    <section className="section container" id="experience"><div className="section-heading split-heading"><div><p className="eyebrow">Find your way in</p><h2>Made for the<br />curious kind.</h2></div><p className="intro">There is no single way to experience Kyrgyzstan. Start with the trip that feels most like you.</p></div><div className="adventure-grid">{adventures.map((item, index) => <a className={`adventure-card card-${index + 1}`} href="#contact" key={item.title}><img src={item.image} alt="" /><div className="image-overlay" /><div className="card-copy"><span className="card-number">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><span className="circle-arrow"><Arrow /></span></div></a>)}</div></section>
    <section className="tour-icons-section" id="tours"><div className="container"><div className="tour-icons-heading"><div><p className="eyebrow light">Choose your journey</p><h2>Four ways to<br /><em>go further.</em></h2></div><p>Every tour is led locally and can be tailored around the experience you want.</p></div><div className="tour-icons-grid">{tourTypes.map((tour, index) => <a className="tour-icon-card" href="#contact" key={tour.title}><span className="tour-icon-number">0{index + 1}</span><span className="tour-icon-graphic"><TourIcon type={tour.icon} /></span><div><h3>{tour.title}</h3><p>{tour.subtitle}</p></div><span className="tour-icon-arrow"><Arrow /></span></a>)}</div></div></section>
    <section className="about-section container" id="about"><div className="about-stat"><span>01</span><strong>Local,<br />always.</strong></div><div className="about-copy"><p className="eyebrow">Why Kyrgyzstan360</p><h2>Travel with people who call these mountains home.</h2><p>We pair local knowledge with thoughtful planning, leaving enough room for the unexpected moments that make a journey unforgettable.</p><a className="text-link dark" href="#contact">Meet the team <Arrow /></a></div><div className="about-stat"><span>02</span><strong>Wild by<br />nature.</strong></div></section>
    <section className="contact-section" id="contact"><div className="container contact-inner"><p className="eyebrow">Start your journey</p><h2>Leave an inquiry<br /><em>and we&apos;ll contact you.</em></h2><p>Just leave your details and we&apos;ll get back to you shortly.</p><InquiryForm /></div></section>
    <footer><div className="container footer-inner"><a className="brand" href="#top">KYRGYZSTAN<span>360</span></a><p>Adventure begins where the road ends.</p><a href="mailto:hello@kyrgyzstan360.com">hello@kyrgyzstan360.com</a></div></footer>
  </main>;
}
