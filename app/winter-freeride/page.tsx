import Link from "next/link";
import InquiryForm from "../InquiryForm";
import "./winter-tour.css";
import "./jyrgalan.css";
import "./winter-videos.css";
import "./winter-booking-details.css";

const included = [
  "A private group of up to three riders",
  "Comfortable transfer from Bishkek to the mountains",
  "A personal freeride guide for every ski day",
  "New terrain and fresh lines across several locations",
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
    <section className="winter-intro" id="experience"><div><p className="winter-kicker">THE WINTER WE CHASE</p><h2>Soft snow,<br />no repeats.</h2></div><div className="winter-intro-copy"><p>Every morning starts somewhere new: a remote ridge, a quiet valley, a snowcat track disappearing into the Tien Shan. The terrain changes, but the feeling stays the same — your group, a clean face and the first line of the day.</p><p>We move between locations to follow the best snow and keep every run fresh. After skiing, slow down at the après-ski bar, soak in hot springs and let the mountains do the rest.</p></div></section>
    <section className="jyrgalan-section"><div className="jyrgalan-photo"><img src="https://cdn1.matadornetwork.com/blogs/1/2023/03/nansen-kyrgyzstan-ski-trip.jpg" alt="A skier riding fresh powder in the mountains of Kyrgyzstan" /></div><div className="jyrgalan-copy"><p className="winter-kicker">OUR FREERIDE BASE</p><h2>Jyrgalan<br /><em>Valley.</em></h2><p>Our camps take place in Jyrgalan — a remote valley in the eastern Tien Shan, about 60 km from Karakol. Seven surrounding peaks hold cold powder and open up a remarkable variety of freeride terrain.</p><p>Jyrgalan is still well away from mass tourism: no lift queues, no busy resort scene, just wide mountain space and the chance to find untouched snow. Our experienced local guides choose the day&apos;s terrain according to conditions, helping the group make the most of each fresh line.</p><span>Remote terrain · Local knowledge · Fresh tracks</span></div></section>
    <section className="winter-booking" id="book"><div className="winter-booking-inner"><p className="winter-kicker">FREERIDE CAMP REQUEST</p><h2>Reserve your<br /><em>first tracks.</em></h2><p>Tell us when you want to ride and a little about your freeride experience. We&apos;ll check snowcat availability, put together the right camp format and send a clear, personal proposal.</p><div className="winter-booking-promises"><article><span>01</span><strong>Small by design</strong><p>Up to three riders with a personal freeride guide.</p></article><article><span>02</span><strong>Safety first</strong><p>We discuss conditions, your experience and required safety equipment before you arrive.</p></article><article><span>03</span><strong>Clear next steps</strong><p>You receive availability, a full quote and the plan for transfers and mountain days.</p></article></div><div className="winter-booking-form-heading"><span>YOUR CAMP, STARTS HERE</span><p>Share the essentials below. We&apos;ll reply with the right questions — and no generic package.</p></div><InquiryForm winter /></div></section>
    <section className="winter-feature"><div className="winter-feature-copy"><p className="winter-kicker">MORE THAN THE DESCENT</p><h2>Ride hard.<br /><em>Reset deeply.</em></h2><p>Powder days give way to warm stories: a drink by the bar, steam rising over hot springs, and the kind of silence only wild nature can offer.</p></div><div className="winter-feature-points"><span>Different locations</span><span>AprÈs-ski bar</span><span>Hot springs</span><span>Wild mountain atmosphere</span></div></section>
    <section className="winter-checklist"><div><p className="winter-kicker">WHAT&apos;S INCLUDED</p><h2>The mountain,<br /><em>made easy.</em></h2></div><ul>{included.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ul></section>
    <section className="winter-ready"><div><p className="winter-kicker">WHAT YOU NEED</p><h2>Come ready<br />to <em>ride.</em></h2></div><ul>{need.map((item) => <li key={item}><span>↗</span>{item}</li>)}</ul></section>
  </main>;
}
