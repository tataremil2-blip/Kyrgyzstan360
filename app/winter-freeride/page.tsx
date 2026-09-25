import Link from "next/link";
import DepartureCalendar from "./DepartureCalendar";
import InquiryForm from "../InquiryForm";
import SectionPageNav from "../SectionPageNav";
import "./winter-tour.css";
import "./winter-places.css";
import "./winter-videos.css";
import "./winter-booking-details.css";
import "./winter-typography.css";

const itinerary = [
  { title: "Arrival in Bishkek & transfer to Karakol", description: "Meet us at Bishkek airport and travel to Karakol. Check in to your hotel and settle in before the riding begins." },
  { title: "Karakol ski resort", description: "Spend the day skiing or snowboarding at Karakol ski resort. Get used to the altitude, find your rhythm and get to know your guide and fellow riders. Overnight at your hotel in Karakol." },
  { title: "Jyrgalan & the first snowcat day", description: "Head to the village of Jyrgalan, board the snowcat and ride until the evening. After your first day of freeriding, check in to your hotel in Jyrgalan." },
  { title: "A full day of snowcat freeriding", description: "Board the snowcat in the morning for a full day in the mountains. Return to your hotel afterwards, with an optional banya session to unwind." },
  { title: "More fresh tracks & back to Karakol", description: "Enjoy another full day of snowcat freeriding. In the evening, leave Jyrgalan and transfer back to Karakol." },
  { title: "Kyrgyz culture & horseback riding", description: "Take a break from the slopes to get to know the culture of Kyrgyzstan and explore on horseback." },
  { title: "Eagle show & departure", description: "Watch a traditional eagle show, then travel to Bishkek and transfer to the airport for your departure." },
];

const included = [
  "All program transfers, including airport transfers",
  "English-speaking guide",
  "Accommodation",
  "Meals",
  "Lift pass for Karakol ski resort",
  "Snowcat rides on days 3, 4 and 5",
  "Horseback riding",
  "Eagle show",
];

const excluded = [
  "Ski and snowboard equipment rental",
  "Freeride equipment rental",
  "Travel insurance",
  "Additional and personal expenses",
];

const need = [
  "Confident off-piste skiing or snowboarding skills",
  "Freeride equipment and avalanche safety kit",
  "A good mood and appetite for the wild",
];

const detailSymbols: Record<string, string> = {
  "All program transfers, including airport transfers": "🚐",
  "English-speaking guide": "🗣️",
  Accommodation: "🛏️",
  Meals: "🍽️",
  "Lift pass for Karakol ski resort": "🎿",
  "Snowcat rides on days 3, 4 and 5": "🚜",
  "Horseback riding": "🐎",
  "Eagle show": "🦅",
  "Ski and snowboard equipment rental": "🎿",
  "Freeride equipment rental": "🏂",
  "Travel insurance": "🛡️",
  "Additional and personal expenses": "💳",
  "Confident off-piste skiing or snowboarding skills": "⛷️",
  "Freeride equipment and avalanche safety kit": "🎒",
  "A good mood and appetite for the wild": "😊",
};

function DetailIcon({ kind }: { kind: "included" | "excluded" | "bring" }) {
  if (kind === "included") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="m8 12.2 2.5 2.5 5.5-6" /></svg>;
  if (kind === "excluded") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7.5h15v11h-15z" /><path d="M7 7.5V5.8h9v1.7M15.5 12h4M8 13h4" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8.5h10a2 2 0 0 1 2 2v9H5v-9a2 2 0 0 1 2-2Z" /><path d="M9 8.5V6.8a3 3 0 0 1 6 0v1.7M5 13H3.5v4H5m14-4h1.5v4H19M9 12h6" /></svg>;
}

export default function WinterFreeridePage() {
  return <main className="winter-tour">
    <header className="winter-tour-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link></header>
    <section className="winter-tour-hero" id="overview"><img src="/winter-freeride-snowcat.png" alt="Three freeride skiers beside a snowcat in the snowy Tian Shan mountains" /><div className="winter-tour-shade" /><div className="winter-tour-hero-copy"><p>KYRGYZSTAN · WINTER FREERIDE</p><h1>FIRST LINES.<br /><em>Wild places.</em></h1></div><a className="winter-scroll" href="#program">DISCOVER THE RIDE ↓</a></section>
    <SectionPageNav label="Winter tour sections" items={[{ href: "#overview", label: "Overview" }, { href: "#videos", label: "Videos" }, { href: "#program", label: "Program" }, { href: "#dates", label: "Dates" }, { href: "#details", label: "Included" }, { href: "#places", label: "Places" }, { href: "#book", label: "Book" }]} />
    <section className="winter-videos" id="videos" aria-labelledby="winter-videos-title"><div className="winter-videos-heading"><div><p className="winter-kicker">SEE IT FOR YOURSELF</p><h2 id="winter-videos-title">The snow,<br /><em>in motion.</em></h2></div><a className="instagram-link" href="https://www.instagram.com/reel/DVX-Z75CIWX/" target="_blank" rel="noreferrer"><span>Instagram Reel</span><strong>Watch on Instagram ↗</strong></a></div><div className="youtube-grid"><article><div className="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/CMJK4tQrscI" title="Freeride in Kyrgyzstan — video one" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><a href="https://www.youtube.com/watch?v=CMJK4tQrscI" target="_blank" rel="noreferrer">Watch on YouTube ↗</a></article><article><div className="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/fc2AbHvf9TM" title="Freeride in Kyrgyzstan — video two" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><a href="https://www.youtube.com/watch?v=fc2AbHvf9TM" target="_blank" rel="noreferrer">Watch on YouTube ↗</a></article></div></section>
    <section className="winter-program" id="program" aria-labelledby="winter-program-title">
      <div className="winter-program-heading"><p className="winter-kicker">THE 7-DAY PROGRAM</p><h2 id="winter-program-title">Seven days.<br /><em>Beyond the slopes.</em></h2><p className="winter-weekly">7 days: Karakol ski resort, three snowcat freeride days in Jyrgalan, Kyrgyz culture and airport transfers from Bishkek.</p></div>
      <ol className="winter-program-steps">
        {itinerary.map((day, index) => <li key={day.title}><span>DAY {index + 1}</span><div><h3>{day.title}</h3><p>{day.description}</p></div></li>)}
      </ol>
    </section>
    <section className="winter-price" id="dates" aria-labelledby="winter-price-title">
      <div><p className="winter-kicker">PRICE &amp; DEPARTURES</p><h2 id="winter-price-title">Your week<br /><em>in the mountains.</em></h2></div>
      <div className="winter-price-details"><p className="winter-price-amount">&euro;1,900 <span>per person</span></p><p className="winter-price-duration">7 days &middot; 1 resort day &middot; 3 snowcat days</p><div className="winter-departures"><h3>Departures every week</h3><p>Every Monday to Sunday, from 21 December 2026 to 28 March 2027.</p></div><a className="winter-price-link" href="#book">ENQUIRE ABOUT DATES <span aria-hidden="true">&rarr;</span></a></div>
      <DepartureCalendar />
    </section>
    <section className="winter-details-section" id="details" aria-labelledby="winter-details-title">
      <p className="winter-kicker">THE PRACTICAL DETAILS</p><h2 id="winter-details-title">Your trip,<br /><em>taken care of.</em></h2>
      <div className="winter-details-grid">{[
        { title: "Included", icon: "included" as const, itemIcon: "✓", items: included },
        { title: "Not included", icon: "excluded" as const, itemIcon: "×", items: excluded },
        { title: "What to bring", icon: "bring" as const, itemIcon: "→", items: need },
      ].map((group) => <article key={group.title}><div className="winter-detail-heading"><span className="winter-detail-icon"><DetailIcon kind={group.icon} /></span><h3>{group.title}</h3></div><ul>{group.items.map((item) => <li key={item}><span className={`winter-item-icon winter-item-icon-${group.icon}`} aria-hidden="true">{group.itemIcon}</span><span>{item}</span><span className="winter-item-symbol" aria-hidden="true">{detailSymbols[item]}</span></li>)}</ul></article>)}</div>
    </section>
    <section className="winter-places" id="places" aria-labelledby="winter-places-title">
      <div className="winter-places-heading"><p className="winter-kicker">THE PLACES &amp; THE PEOPLE</p><h2 id="winter-places-title">Beyond<br /><em>the itinerary.</em></h2></div>
      <article className="winter-place-feature"><figure><img src="/winter/karakol.jpg" alt="Snow-covered forest and mountains in Karakol" loading="lazy" /><figcaption>Winter in Karakol &middot; Collab Media / Unsplash</figcaption></figure><div><p className="winter-kicker">DAYS 1 &amp; 2</p><h3>Karakol<br /><em>Ski Resort.</em></h3><p>Start in a Karakol hotel, then spend a day at the ski resort with the group. Your resort lift pass is included.</p><a href="https://www.karakol-ski.kg/gallery/zima" target="_blank" rel="noreferrer">Explore the resort &rarr;</a></div></article>
      <article className="winter-village"><p className="winter-kicker">DAYS 3 &ndash; 5</p><h3>Jyrgalan <em>Valley.</em></h3><p>Our base for three days of snowcat freeriding. Ride the surrounding mountains by day and return to the village after the first two riding days, before heading back to Karakol on day five.</p><h4>A place to come home to</h4><p>Warm, simple rooms and comfortable beds are waiting after a full day in the mountains. We confirm your accommodation and room arrangements when planning your booking.</p>
        <div className="winter-stays" aria-label="Guest rooms in Jyrgalan">
          <figure className="winter-stay"><img src="/winter/room-alakol-020.jpg" alt="Twin room with wooden beds and patterned bedding at Alakol-Jyrgalan Guesthouse" loading="lazy" /></figure>
          <figure className="winter-stay"><img src="/winter/room-salamat.jpg" alt="Bright triple room with prepared beds at Salamat Guesthouse" loading="lazy" /></figure>
          <figure className="winter-stay"><img src="/winter/snowcat-slope.webp" alt="Red snowcat climbing a powder-covered mountain slope in the Tian Shan" loading="lazy" /></figure>
          <figure className="winter-stay"><img src="/winter/skiers-descent.webp" alt="A group of four skiers descending together through fresh powder" loading="lazy" /></figure>
        </div>
        
      </article>
      <div className="winter-culture-grid"><article><img src="/winter/horseback-winter.png" alt="Riders beside a river in a winter gorge with snow-covered spruce trees" loading="lazy" /><div><p className="winter-kicker">DAY 6</p><h3>On <em>horseback.</em></h3><p>Swap skis for a saddle. Discover Kyrgyz culture and enjoy a horseback ride as part of your day away from the slopes.</p></div></article><article><img src="/winter/eagle-hunter-winter.png" alt="Golden eagle perched on the gloved hand of a mounted hunter in traditional Kyrgyz clothing against snowy mountains" loading="lazy" /><div><p className="winter-kicker">DAY 7</p><h3>The eagle <em>tradition.</em></h3><p>Watch a traditional eagle show before the journey back to Bishkek and your airport transfer. A final encounter with Kyrgyz heritage to round off the week.</p></div></article></div>
    </section>
    <section className="winter-booking" id="book"><div className="winter-booking-inner"><p className="winter-kicker">Your winter starts here</p><h2>Join the <em>ride.</em></h2><p>Leave your details or contact us directly. We&apos;ll help you choose your week and plan your trip.</p><InquiryForm winter /></div></section>
  </main>;
}



