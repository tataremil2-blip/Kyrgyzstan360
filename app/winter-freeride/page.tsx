import Link from "next/link";
import DepartureCalendar from "./DepartureCalendar";
import InquiryForm from "../InquiryForm";
import "./winter-tour.css";
import "./winter-places.css";
import "./winter-videos.css";
import "./winter-booking-details.css";

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
  "Additional and personal expenses",
];

const need = [
  "Confident off-piste skiing or snowboarding skills",
  "Freeride equipment and avalanche safety kit",
  "A good mood and appetite for the wild",
];

export default function WinterFreeridePage() {
  return <main className="winter-tour">
    <header className="winter-tour-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link className="winter-back" href="/">← BACK TO HOME</Link></header>
    <section className="winter-tour-hero"><img src="/winter-freeride-snowcat.png" alt="Three freeride skiers beside a snowcat in the snowy Tian Shan mountains" /><div className="winter-tour-shade" /><div className="winter-tour-hero-copy"><p>KYRGYZSTAN · WINTER FREERIDE</p><h1>FIRST LINES.<br /><em>Wild places.</em></h1></div><a className="winter-scroll" href="#program">DISCOVER THE RIDE ↓</a></section>
    <section className="winter-videos" aria-labelledby="winter-videos-title"><div className="winter-videos-heading"><div><p className="winter-kicker">SEE IT FOR YOURSELF</p><h2 id="winter-videos-title">The snow,<br /><em>in motion.</em></h2></div><a className="instagram-link" href="https://www.instagram.com/reel/DVX-Z75CIWX/" target="_blank" rel="noreferrer"><span>Instagram Reel</span><strong>Watch on Instagram ↗</strong></a></div><div className="youtube-grid"><article><div className="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/CMJK4tQrscI" title="Freeride in Kyrgyzstan — video one" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><a href="https://www.youtube.com/watch?v=CMJK4tQrscI" target="_blank" rel="noreferrer">Watch on YouTube ↗</a></article><article><div className="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/fc2AbHvf9TM" title="Freeride in Kyrgyzstan — video two" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><a href="https://www.youtube.com/watch?v=fc2AbHvf9TM" target="_blank" rel="noreferrer">Watch on YouTube ↗</a></article></div></section>
    <section className="winter-program" id="program" aria-labelledby="winter-program-title">
      <div className="winter-program-heading"><p className="winter-kicker">THE 7-DAY PROGRAM</p><h2 id="winter-program-title">Seven days.<br /><em>Beyond the slopes.</em></h2><p className="winter-weekly">Karakol ski resort, three days of snowcat freeriding in Jyrgalan and a taste of Kyrgyz culture.</p><p>From your arrival in Bishkek to your airport transfer home, follow the full journey below.</p></div>
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
      <div className="winter-details-grid">{[{ title: "Included", items: included }, { title: "Not included", items: excluded }, { title: "What to bring", items: need }].map((group) => <article key={group.title}><h3>{group.title}</h3><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div>
    </section>
    <section className="winter-places" id="places" aria-labelledby="winter-places-title">
      <div className="winter-places-heading"><p className="winter-kicker">THE PLACES &amp; THE PEOPLE</p><h2 id="winter-places-title">Beyond<br /><em>the itinerary.</em></h2></div>
      <article className="winter-place-feature"><figure><img src="/winter/karakol.jpg" alt="Snow-covered forest and mountains in Karakol" loading="lazy" /><figcaption>Winter in Karakol &middot; Collab Media / Unsplash</figcaption></figure><div><p className="winter-kicker">DAYS 1 &amp; 2</p><h3>Karakol<br /><em>Ski Resort.</em></h3><p>Your first stop after Bishkek. Settle into a hotel in Karakol, then spend a day at the ski resort getting used to the altitude and finding your rhythm with the group.</p><p>Mountain slopes and conifer forests set the scene for the start of your riding week. Your resort lift pass is included.</p><a href="https://www.karakol-ski.kg/gallery/zima" target="_blank" rel="noreferrer">Explore the resort &rarr;</a></div></article>
      <article className="winter-village"><p className="winter-kicker">DAYS 3 &ndash; 5</p><h3>Jyrgalan <em>Valley.</em></h3><p>Our base for three days of snowcat freeriding. Ride the surrounding mountains by day and return to the village after the first two riding days, before heading back to Karakol on day five.</p><h4>A place to come home to</h4><p>Explore local guesthouses and a hostel below. We confirm your accommodation and room arrangements when planning your booking.</p>
        <div className="winter-stays">{[
          { name: "Alakol-Jyrgalan", slug: "alakol-jyrgalan-guesthouse", image: "alakol", detail: "Guesthouse" },
          { name: "Salamat", slug: "salamat-guesthouse", image: "salamat", detail: "Guesthouse" },
          { name: "Rahat", slug: "rahat-guesthouse", image: "rahat", detail: "Guesthouse" },
          { name: "Baitor", slug: "baitor-guesthouse", image: "baitor", detail: "Guesthouse" },
          { name: "Ulan", slug: "ulan-hostel", image: "ulan", detail: "Hostel" },
        ].map((stay) => <a className="winter-stay" href={`https://jyrgalan.com/where-to-stay/${stay.slug}/`} target="_blank" rel="noreferrer" key={stay.slug}><img src={`/winter/${stay.image}.jpg`} alt={`${stay.name} accommodation in Jyrgalan`} loading="lazy" /><div><span>{stay.detail}</span><h5>{stay.name} <span aria-hidden="true">&nearr;</span></h5></div></a>)}</div>
        <p className="winter-photo-credit">Accommodation photos and listings: <a href="https://jyrgalan.com/where-to-stay/" target="_blank" rel="noreferrer">Destination Jyrgalan</a>.</p>
      </article>
      <div className="winter-culture-grid"><article><img src="/winter/horses.jpg" alt="Horseback riding in the countryside of Kyrgyzstan" loading="lazy" /><div><p className="winter-kicker">DAY 6</p><h3>On <em>horseback.</em></h3><p>Swap skis for a saddle. Discover Kyrgyz culture and enjoy a horseback ride as part of your day away from the slopes.</p><span className="winter-photo-credit">Victoria Nazaruk / Unsplash &middot; Illustrative summer photo</span></div></article><article><img src="/winter/eagles.jpg" alt="Kyrgyz eagle handler on horseback with a golden eagle" loading="lazy" /><div><p className="winter-kicker">DAY 7</p><h3>The eagle <em>tradition.</em></h3><p>Watch a traditional eagle show before the journey back to Bishkek and your airport transfer. A final encounter with Kyrgyz heritage to round off the week.</p><span className="winter-photo-credit">Spenser Sembrat / Unsplash</span></div></article></div>
    </section>
    <section className="winter-booking" id="book"><div className="winter-booking-inner"><p className="winter-kicker">YOUR NEXT WINTER STARTS HERE</p><h2>Join the <em>ride.</em></h2><p>Leave your details or contact us directly. We&apos;ll help you choose your week and plan your trip.</p><InquiryForm winter /></div></section>
  </main>;
}
