import Link from "next/link";
import DepartureCalendar from "./DepartureCalendar";
import InquiryForm from "../InquiryForm";
import "./winter-tour.css";
import "./jyrgalan.css";
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
    <section className="winter-tour-hero"><img src="/winter-freeride-snowcat.png" alt="Three freeride skiers beside a snowcat in the snowy Tian Shan mountains" /><div className="winter-tour-shade" /><div className="winter-tour-hero-copy"><p>KYRGYZSTAN · WINTER FREERIDE</p><h1>FIRST LINES.<br /><em>Wild places.</em></h1></div><a className="winter-scroll" href="#experience">DISCOVER THE RIDE ↓</a></section>
    <section className="winter-videos" aria-labelledby="winter-videos-title"><div className="winter-videos-heading"><div><p className="winter-kicker">SEE IT FOR YOURSELF</p><h2 id="winter-videos-title">The snow,<br /><em>in motion.</em></h2></div><a className="instagram-link" href="https://www.instagram.com/reel/DVX-Z75CIWX/" target="_blank" rel="noreferrer"><span>Instagram Reel</span><strong>Watch on Instagram ↗</strong></a></div><div className="youtube-grid"><article><div className="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/CMJK4tQrscI" title="Freeride in Kyrgyzstan — video one" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><a href="https://www.youtube.com/watch?v=CMJK4tQrscI" target="_blank" rel="noreferrer">Watch on YouTube ↗</a></article><article><div className="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/fc2AbHvf9TM" title="Freeride in Kyrgyzstan — video two" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><a href="https://www.youtube.com/watch?v=fc2AbHvf9TM" target="_blank" rel="noreferrer">Watch on YouTube ↗</a></article></div></section>
    <section className="winter-intro" id="experience"><div><p className="winter-kicker">THE WINTER WE CHASE</p><h2>Soft snow,<br />no repeats.</h2></div><div className="winter-intro-copy"><p>From the slopes of Karakol to the snowcat-accessed terrain of Jyrgalan, each riding day brings a new perspective on the Tien Shan. The terrain changes, but the feeling stays the same — your group, a clean face and the first line of the day.</p><p>Start with a day at Karakol ski resort, then spend three days freeriding from a snowcat in Jyrgalan. Beyond the snow, discover Kyrgyz culture, ride horses and watch a traditional eagle show.</p></div></section>
    <section className="jyrgalan-section"><div className="jyrgalan-photo"><img src="https://cdn1.matadornetwork.com/blogs/1/2023/03/nansen-kyrgyzstan-ski-trip.jpg" alt="A skier riding fresh powder in the mountains of Kyrgyzstan" /></div><div className="jyrgalan-copy"><p className="winter-kicker">OUR FREERIDE BASE</p><h2>Jyrgalan<br /><em>Valley.</em></h2><p>Our camps take place in Jyrgalan — a remote valley in the eastern Tien Shan, about 60 km from Karakol. Seven surrounding peaks hold cold powder and open up a remarkable variety of freeride terrain.</p><p>Jyrgalan is still well away from mass tourism: no lift queues, no busy resort scene, just wide mountain space and the chance to find untouched snow. Our experienced local guides choose the day&apos;s terrain according to conditions, helping the group make the most of each fresh line.</p><span>Remote terrain · Local knowledge · Fresh tracks</span></div></section>
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
    <section className="winter-checklist"><div><p className="winter-kicker">INCLUDED IN THE PRICE</p><h2>The details,<br /><em>taken care of.</em></h2></div><ul>{included.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ul></section>
    <section className="winter-ready winter-excluded"><div><p className="winter-kicker">NOT INCLUDED</p><h2>Plan for<br /><em>the extras.</em></h2></div><ul>{excluded.map((item) => <li key={item}><span aria-hidden="true">+</span>{item}</li>)}</ul></section>
    <section className="winter-booking" id="book"><div className="winter-booking-inner"><p className="winter-kicker">WEEKLY WINTER TOURS</p><h2>Join the <em>ride.</em></h2><p>Leave your details. We&apos;ll get in touch with available dates and the tour plan.</p><InquiryForm winter /></div></section>
    <section className="winter-feature"><div className="winter-feature-copy"><p className="winter-kicker">MORE THAN THE DESCENT</p><h2>Ride hard.<br /><em>Reset deeply.</em></h2><p>Beyond the powder, there is another side of Kyrgyzstan to discover: time on horseback, local culture and the tradition of working with eagles. An optional banya after riding offers a chance to unwind.</p></div><div className="winter-feature-points"><span>Kyrgyz culture</span><span>Horseback riding</span><span>Eagle show</span><span>Optional banya</span></div></section>

    <section className="winter-ready"><div><p className="winter-kicker">WHAT YOU NEED</p><h2>Come ready<br />to <em>ride.</em></h2></div><ul>{need.map((item) => <li key={item}><span>↗</span>{item}</li>)}</ul></section>
  </main>;
}
