import Link from "next/link";
import { notFound } from "next/navigation";
import InquiryForm from "../../InquiryForm";
import GroupDepartureCalendar from "../../GroupDepartureCalendar";
import SectionPageNav from "../../SectionPageNav";
import IndividualTourInquiry from "../../IndividualTourInquiry";

import "./tour-detail.css";
import "./recommended-route.css";
import "./recommended-route-refinement.css";
import "./recommended-route-cta.css";
import "./recommended-route-price.css";
import "./group-tour.css";
import "./group-tour-v2.css";
import "./group-tour-route-map.css";
import "./exact-route-map.css";
import "./group-departures.css";
import "./group-departures-buttons.css";
import "./group-inclusions-tight.css";
import "./group-pricing-tight.css";
import "./group-pricing-tables.css";
import "./group-extreme.css";
import "./group-route-photos.css";
import "./group-route-expandable-days.css";
import "./group-vehicles.css";
import "./group-vehicles-generated.css";


const recommendedRoute = [
  { day: "01", title: "Bishkek → Kochkor → Song-Kul", stay: "Yurt camp at Song-Kul", text: "Drive through Kochkor to the highland lake of Song-Kul. Sleep in yurts and begin to feel the rhythm of Kyrgyz nomadic culture." },
  { day: "02", title: "Song-Kul → Naryn → Kel-Suu", stay: "Mountain-view camp at Kel-Suu", text: "Travel through Naryn towards Kel-Suu, a dramatic alpine lake beneath the high peaks of the Tien Shan." },
  { day: "03", title: "Kel-Suu → Naryn", stay: "Hotel in Naryn", text: "Choose your way to the lake: hike, ride horses or take a special off-road transfer. Spend time on the water by boat, then return to camp before driving to Naryn." },
  { day: "04", title: "Naryn → South Issyk-Kul", stay: "Comfortable yurts on Issyk-Kul", text: "Cross a mountain pass towards the southern shore of Issyk-Kul and settle into a comfortable yurt camp by the lake." },
  { day: "05", title: "Barskoon → Skazka → Karakol", stay: "Hotel in Karakol", text: "See the Barskoon waterfalls, explore Fairy Tale Canyon, watch an eagle-hunting show and continue to Karakol." },
  { day: "06", title: "Kyrchyn Gorge → Bishkek", stay: "Evening arrival in Bishkek", text: "Travel back via Kyrchyn Gorge, the setting of the World Nomad Games, then arrive in Bishkek in the evening." },
];

const groupTourRoute = [
  { day: "PREP", route: "Arrival in Bishkek", text: "Meet your hosts at the airport, settle into a comfortable Bishkek hotel and ease into the adventure.", image: "https://kabar.kg/media/images/IMG_5713.2e16d0ba.fill-1200x630.png", imageAlt: "Bishkek with mountains in the distance" },
  { day: "01", route: "Bishkek → Kochkor → Song-Kul", text: "Cross beautiful mountain passes, stop for picnic lunches with big views and sleep in yurts on the shore of the high-altitude lake.", image: "https://trevelor.com/wp-content/uploads/2024/07/Son-Kol-lake-yurt-camps.jpg", imageAlt: "Yurts on the shore of Song-Kul" },
  { day: "02", route: "Song-Kul → Tash-Rabat", text: "Travel through dramatic gorges to Tash-Rabat, the Silk Road caravanserai and one of Kyrgyzstan’s most important landmarks. Overnight in comfortable rooms.", image: "https://cdn-1.aki.kg/127/.storage/ennews/images/Culture/002ed5d80f3f9decb4ab8334446a91b2.jpg", imageAlt: "Tash-Rabat caravanserai" },
  { day: "03", route: "Tash-Rabat → Kel-Suu", text: "Enter the border zone and follow the Chinese frontier to Kel-Suu, one of the country’s most beautiful and remote lakes.", image: "https://images.locationscout.net/2023/11/kel-suu-lake-kyrgyz-republic-9ahr.webp?h=1400&q=80", imageAlt: "Turquoise waters of Kel-Suu Lake" },
  { day: "04", route: "Kel-Suu → Naryn", text: "Reach the lake by special transport across fast rivers and wetlands, take a boat ride when conditions allow, then continue to Naryn for a comfortable hotel stay.", image: "https://static.tildacdn.one/tild6434-3662-4566-b762-386263636537/1200px-Kel-Suu_lake_.jpg", imageAlt: "Kel-Suu Lake in a mountain gorge" },
  { day: "05", route: "Naryn → Kadji-Sai", text: "Cross a 4,000-metre pass, with views of snowy summits and glaciers, before reaching the southern shore of Issyk-Kul.", image: "https://static.tildacdn.com/tild3939-3931-4866-b438-633435333933/2023-09-06_014611.jpg", imageAlt: "Mountain road in Kyrgyzstan" },
  { day: "06", route: "Kadji-Sai → Karakol", text: "Watch an eagle-hunting show, explore Skazka Nature Park and Barskoon Waterfall — where Yuri Gagarin once recovered — then settle into Karakol.", image: "https://triptokyrgyzstan.com/sites/default/files/media/image/19020235_waterfall0377_0.jpg", imageAlt: "Barskoon waterfall" },
  { day: "07", route: "Karakol → Kyrchyn → Bishkek", text: "Return to Bishkek via Kyrchyn Gorge, home of the World Nomad Games. Celebrate the journey with a farewell dinner and a transfer to your hotel.", image: "/individual-tour.jpg", imageAlt: "Mountain landscape on the road to Bishkek" },
];

const groupIncluded = ["4×4 group transport and fuel", "Experienced local driver-guide", "Accommodation according to the program", "Cultural stops and route coordination", "Kel-Suu border-zone permit support"];
const groupNotIncluded = ["International flights", "Travel & medical insurance", "Meals at city cafés", "Optional horse and boat activities"];

const groupDepartures = [
  { month: "May", dates: ["01 — 08", "12 — 19", "24 — 31"] },
  { month: "June", dates: ["05 — 12", "19 — 26", "30 Jun — 07 Jul"] },
  { month: "July", dates: ["13 — 20", "24 — 31"] },
  { month: "August", dates: ["03 — 10", "20 — 27", "31 Aug — 07 Sep"] },
  { month: "September", dates: ["10 — 17", "21 — 28"] },
];

const groupRoutePhotos = [
  { title: "Song-Kul", subtitle: "Yurts by the high lake", image: "https://trevelor.com/wp-content/uploads/2024/07/Son-Kol-lake-yurt-camps.jpg", source: "https://trevelor.com/tours/3-days-horse-back-riding-to-song-kul-lake/" },
  { title: "Tash-Rabat", subtitle: "Silk Road caravanserai", image: "https://cdn-1.aki.kg/127/.storage/ennews/images/Culture/002ed5d80f3f9decb4ab8334446a91b2.jpg", source: "https://akipress.com/news%3A617987%3A8_wild_and_beautiful_places_in_Kyrgyzstan__National_Geographic/" },
  { title: "Kel-Suu", subtitle: "A lake beyond the frontier", image: "https://images.locationscout.net/2023/11/kel-suu-lake-kyrgyz-republic-9ahr.webp?h=1400&q=80", source: "https://www.locationscout.net/kyrgyz-republic/47612-kel-suu-lake" },
  { title: "Barskoon", subtitle: "Waterfall in the Tien Shan", image: "https://triptokyrgyzstan.com/sites/default/files/media/image/19020235_waterfall0377_0.jpg", source: "https://triptokyrgyzstan.com/en/destinations/places/tears-bars-waterfall" },
];

const expeditionVehicles = [
  { name: "Land Cruiser 100", description: "A proven 4×4 platform, prepared for long mountain roads and remote terrain.", image: "/vehicles/land-cruiser-100-mountains.png" },
  { name: "Lexus LX 470", description: "Comfort and 4×4 capability for a calm, confident ride far beyond the main roads.", image: "/vehicles/lexus-lx-470-mountains.png" },
];


function KyrgyzstanRouteMap() {
  return <figure className="group-route-map"><svg viewBox="0 0 720 420" role="img" aria-labelledby="route-map-title route-map-description"><title id="route-map-title">Group expedition route across Kyrgyzstan</title><desc id="route-map-description">The route links Bishkek, Kochkor, Song-Kul, Tash-Rabat, Kel-Suu, Naryn, Kadji-Sai, Karakol and Kyrchyn Gorge.</desc><path className="map-outline" d="M77 155 120 118 202 121 259 91 315 100 358 78 409 100 455 89 494 113 552 102 590 134 656 136 678 171 653 203 603 211 563 243 494 239 446 269 382 264 342 293 273 281 228 310 169 292 137 258 84 244 58 203Z" /><path className="map-route" d="M119 131 251 178 230 214 261 275 482 271 282 239 248 198 416 187 489 157 440 140 119 131" /><g className="map-stop"><circle cx="119" cy="131" r="7" /><text x="119" y="113">BISHKEK</text></g><g className="map-stop"><circle cx="251" cy="178" r="7" /><text x="251" y="160">KOCHKOR</text></g><g className="map-stop"><circle cx="230" cy="214" r="7" /><text x="202" y="239">SONG-KUL</text></g><g className="map-stop"><circle cx="261" cy="275" r="7" /><text x="261" y="306">TASH-RABAT</text></g><g className="map-stop"><circle cx="482" cy="271" r="7" /><text x="482" y="303">KEL-SUU</text></g><g className="map-stop"><circle cx="282" cy="239" r="7" /><text x="299" y="246">NARYN</text></g><g className="map-stop"><circle cx="248" cy="198" r="7" /><text x="204" y="190">KADJI-SAI</text></g><g className="map-stop"><circle cx="416" cy="187" r="7" /><text x="416" y="169">KARAKOL</text></g><g className="map-stop"><circle cx="489" cy="157" r="7" /><text x="489" y="139">KYRCHYN</text></g></svg><figcaption><span>8 DAYS</span><span>9 STOPS</span><span>ONE EXPEDITION</span></figcaption></figure>;
}

function ExactKyrgyzstanRouteMap() {
  const googleMapsRoute = "https://www.google.com/maps/dir/Bishkek,+Kyrgyzstan/Kochkor,+Kyrgyzstan/Song-Kul,+Kyrgyzstan/Tash-Rabat,+Kyrgyzstan/Kel-Suu,+Kyrgyzstan/Naryn,+Kyrgyzstan/Kadji-Sai,+Kyrgyzstan/Karakol,+Kyrgyzstan/Kyrchyn+Gorge,+Kyrgyzstan/Bishkek,+Kyrgyzstan";
  return <figure className="exact-route-map"><KyrgyzstanRouteMap /><svg viewBox="0 0 720 420" role="img" aria-labelledby="exact-route-map-title exact-route-map-description"><title id="exact-route-map-title">Exact locations of the group expedition route</title><desc id="exact-route-map-description">Each stop is placed according to its real-world latitude and longitude.</desc><path className="exact-map-outline" d="M80 87 143 61 219 74 281 57 344 72 415 56 493 67 548 53 610 77 670 87 692 118 672 156 623 165 578 199 526 215 478 235 405 226 354 254 291 242 234 275 170 258 123 227 81 219 54 183 66 134Z" /><path className="exact-map-route" d="M347 56 414 113 381 144 387 231 559 221 427 180 494 144 563 89 526 100 347 56" /><g className="exact-map-stop"><circle cx="347" cy="56" r="7" /><text x="347" y="39">BISHKEK</text></g><g className="exact-map-stop"><circle cx="414" cy="113" r="7" /><text x="414" y="96">KOCHKOR</text></g><g className="exact-map-stop"><circle cx="381" cy="144" r="7" /><text x="350" y="164">SONG-KUL</text></g><g className="exact-map-stop"><circle cx="387" cy="231" r="7" /><text x="387" y="256">TASH-RABAT</text></g><g className="exact-map-stop"><circle cx="559" cy="221" r="7" /><text x="559" y="246">KEL-SUU</text></g><g className="exact-map-stop"><circle cx="427" cy="180" r="7" /><text x="454" y="186">NARYN</text></g><g className="exact-map-stop"><circle cx="494" cy="144" r="7" /><text x="512" y="137">KADJI-SAI</text></g><g className="exact-map-stop"><circle cx="563" cy="89" r="7" /><text x="587" y="94">KARAKOL</text></g><g className="exact-map-stop"><circle cx="526" cy="100" r="7" /><text x="526" y="81">KYRCHYN</text></g></svg><figcaption><span>LOCATIONS AT REAL COORDINATES</span><a href={googleMapsRoute} target="_blank" rel="noreferrer">OPEN IN GOOGLE MAPS ↗</a></figcaption></figure>;
}

const tours = {
  individual: {
    label: "PRIVATE TRAVEL · FROM 1 GUEST",
    title: "Your route.<br />Your <em>pace.</em>",
    copy: "We shape a private itinerary around your wishes: horse riding and hikes, serious off-road adventure, or an easy journey on comfortable roads with carefully chosen hotels. Your Kyrgyzstan, your way.",
    image: "/individual-tour.jpg",
    details: ["Private driver and flexible route", "Start from 1 guest", "Local planning from first idea to final day"],
  },
  group: {
    label: "SHARED ADVENTURE · FROM 3 GUESTS",
    title: "Good roads.<br /><em>Great company.</em>",
    copy: "Bring your people together for a considered group journey through open valleys, mountain lakes and nomadic landscapes.",
    image: "https://static.tildacdn.com/tild3939-3931-4866-b438-633435333933/2023-09-06_014611.jpg",
    details: ["Designed for groups of 3 or more", "Comfortable transport and local insight", "A route that leaves room for shared discovery"],
  },
  "extreme-group": {
    label: "OFF THE BEATEN TRACK · FROM 3 GUESTS",
    title: "Go further.<br /><em>Feel more.</em>",
    copy: "For a group that wants the wilder side of Kyrgyzstan: remote tracks, big mountain terrain and a real sense of expedition.",
    image: "https://35photo.pro/photos_temp/sizes/1275/6375224_1500n.jpg",
    details: ["For groups of 3 or more", "Remote terrain and adventurous routes", "Built with experienced local support"],
  },
} as const;

type TourSlug = keyof typeof tours;

export function generateStaticParams() {
  return Object.keys(tours).map((slug) => ({ slug }));
}

function GroupTourPage({ tour }: { tour: typeof tours.group }) {
  return <main className="tour-detail group-tour-page">
    <header className="tour-detail-header group-tour-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link className="tour-detail-back" href="/#explore">← ALL TOURS</Link></header>
    <section className="tour-detail-hero group-tour-hero" id="overview"><img src={tour.image} alt="A convoy of jeeps in the mountains of Kyrgyzstan" /><div className="tour-detail-shade" /><div className="group-hero-content"><div className="group-hero-copy"><div className="group-hero-meta"><span>8 DAYS</span><span>MAY—OCT</span></div><p>{tour.label}</p><h1 dangerouslySetInnerHTML={{ __html: tour.title }} /><span>{tour.copy}</span></div><div className="group-hero-form"><p>PLAN A GROUP JOURNEY</p><strong>Get dates and a tailored quote.</strong><InquiryForm compact tour="Group tour" /></div></div></section>
    <nav className="group-page-nav" aria-label="Group tour sections"><a href="#overview">Overview</a><a href="#experience">Highlights</a><a href="#program">Program</a><a href="#vehicles">Vehicles</a><a href="#included">Included</a><a href="#booking">Book</a><a href="#extreme">Extreme</a></nav>
    <section className="group-facts"><span><b>8</b> DAYS</span><span><b>MAY—OCT</b> BOOKING SEASON</span><span><b>LOST</b> LOCATIONS</span><span><b>4×4</b> JEEP EXPEDITION</span></section>
    <section className="group-why" id="experience"><div><p>WHY NOW</p><h2>Wild, while<br /><em>it still is.</em></h2></div><div><p>Kyrgyzstan remains a country of raw nature and places far beyond the usual route. Development is moving fast; this is a rare moment to see high lakes, mountain passes and nomadic landscapes before mass tourism changes the rhythm of the country.</p><ul><li>Reach places that still feel truly remote</li><li>See unfiltered mountain landscapes, not crowded viewpoints</li><li>Experience Kyrgyzstan in its original, wilder character</li></ul></div></section>
    <section className="group-route" id="program"><div className="group-route-copy"><div className="group-route-heading"><p>OUR GROUP EXPEDITION ROUTE</p><h2>High lakes.<br /><em>One good crew.</em></h2><span>Eight days from Bishkek through Song-Kul, Tash-Rabat, Kel-Suu, Issyk-Kul and the mountains around Karakol.</span></div><ol>{groupTourRoute.map((stop) => <li key={stop.day} tabIndex={0}><span>{stop.day === "PREP" ? "ARRIVAL" : `DAY ${stop.day}`}</span><div><h3>{stop.route}</h3><div className="route-day-expanded"><p>{stop.text}</p><img src={stop.image} alt={stop.imageAlt} loading="lazy" /></div></div></li>)}</ol></div><aside className="group-route-visuals"><ExactKyrgyzstanRouteMap /><div className="group-route-photo-grid">{groupRoutePhotos.map((photo) => <a href={photo.source} key={photo.title} target="_blank" rel="noreferrer"><img src={photo.image} alt={photo.title} loading="lazy" /><span><strong>{photo.title}</strong><small>{photo.subtitle}</small></span></a>)}</div></aside></section>
    <section className="group-vehicles" id="vehicles"><div className="group-vehicles-heading"><p>THE EXPEDITION FLEET</p><h2>Built for<br /><em>the long way.</em></h2><span>We travel in prepared 4×4 vehicles made for mountain passes, river crossings and the roads that lead to the places most visitors never reach.</span></div><div className="group-vehicles-content"><div className="vehicle-gallery">{expeditionVehicles.map((vehicle) => <article key={vehicle.name}><img src={vehicle.image} alt={`Prepared ${vehicle.name} for off-road travel`} loading="lazy" /><span><strong>{vehicle.name}</strong><small>{vehicle.description}</small></span></article>)}</div><div className="vehicle-options"><article><span>01</span><div><h3>Drive the route.</h3><p>Travel in a crew of four and share the wheel between everyone in the car. Take your turn on the mountain roads with support from the expedition team.</p></div></article><article><span>02</span><div><h3>Ride as a passenger.</h3><p>Experienced local drivers lead the way, while you settle back, take in the landscapes and enjoy every stop on the route.</p></div></article></div></div></section>
    <section className="group-inclusions" id="included"><div><p>TRANSPARENTLY PLANNED</p><h2>What&apos;s<br /><em>covered.</em></h2></div><div className="group-inclusions-lists"><ul><li className="list-title">INCLUDED</li>{groupIncluded.map((item) => <li key={item}><b>↗</b>{item}</li>)}</ul><ul><li className="list-title">NOT INCLUDED</li>{groupNotIncluded.map((item) => <li key={item}><b>—</b>{item}</li>)}</ul></div></section>
    <GroupDepartureCalendar departures={groupDepartures} />
    <section className="group-pricing"><div><p>EXPEDITION PRICE</p><h2>Choose your<br /><em>place in the crew.</em></h2><span>Choose how you want to travel. Send us an inquiry with your preferred dates and we will prepare a precise offer.</span></div><div className="group-price-options"><section className="price-tier"><div className="price-tier-heading"><p>RIDE AS A PASSENGER</p><span>Travel with an experienced local driver and enjoy every view along the route.</span></div><div className="price-table" role="table" aria-label="Passenger expedition prices"><div className="price-table-row price-table-head" role="row"><span role="columnheader">PLACES</span><span role="columnheader">PRICE PER GUEST</span></div><div className="price-table-row" role="row"><span role="cell">1 PLACE</span><strong role="cell">€2,180</strong></div><div className="price-table-row" role="row"><span role="cell">2 PLACES</span><strong role="cell">€1,920</strong></div><div className="price-table-row" role="row"><span role="cell">3 PLACES</span><strong role="cell">€1,750</strong></div></div></section><section className="price-tier"><div className="price-tier-heading"><p>DRIVE A RENTED 4×4 · FROM 2 GUESTS</p><span>Drive under our team&apos;s supervision and share the wheel with everyone in the car.</span></div><div className="price-table" role="table" aria-label="Driver expedition prices"><div className="price-table-row price-table-head" role="row"><span role="columnheader">PLACES</span><span role="columnheader">PRICE PER GUEST</span></div><div className="price-table-row" role="row"><span role="cell">2 PLACES</span><strong role="cell">€1,920</strong></div><div className="price-table-row" role="row"><span role="cell">3 PLACES</span><strong role="cell">€1,750</strong></div><div className="price-table-row" role="row"><span role="cell">4 PLACES</span><strong role="cell">€1,750</strong></div></div></section></div></section>
    <section className="group-booking" id="booking"><p>BOOKING OPEN MAY—OCTOBER</p><h2>Join the<br /><em>next crew.</em></h2><span>Tell us your preferred dates and group size. We&apos;ll share availability, the final price and everything you need to know before departure.</span><InquiryForm compact tour="Group tour" /></section>
    <section className="group-extreme" id="extreme"><div className="group-extreme-copy"><p>MAKE IT WILDER</p><h2>One more day.<br /><em>Full throttle.</em></h2><span>Build an extreme day into your expedition and take the route beyond the 4×4.</span><ul><li><b>01</b><div><strong>Enduro riding</strong><small>For confident riders with off-road experience.</small></div></li><li><b>02</b><div><strong>Quad bikes</strong><small>Explore open terrain on four wheels.</small></div></li><li><b>03</b><div><strong>Jet skis</strong><small>Take to the water for a different kind of mountain day.</small></div></li></ul></div><div className="group-extreme-form"><p>EXTREME ADD-ON</p><h3>Want to add<br /><em>more adrenaline?</em></h3><span>Tell us what you have in mind and we&apos;ll share the details, availability and requirements.</span><InquiryForm compact tour="Extreme add-on request" /></div></section>
  </main>;
}

export default async function TourDetailPage({ params }: PageProps<"/tours/[slug]">) {
  const { slug } = await params;
  if (!(slug in tours)) notFound();
  const tour = tours[slug as TourSlug];
  if (slug === "group") return <GroupTourPage tour={tours.group} />;

  return <main className="tour-detail">
    <header className="tour-detail-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link></header>
    <section className="tour-detail-hero" id="overview"><img src={tour.image} alt={slug === "individual" ? "Jeep on a mountain road in Kyrgyzstan" : slug === "group" ? "A convoy of jeeps in the mountains of Kyrgyzstan" : "Mountain landscape in Kyrgyzstan"} /><div className="tour-detail-shade" /><div className="tour-detail-copy"><p>{tour.label}</p><h1 dangerouslySetInnerHTML={{ __html: tour.title }} /><span>{tour.copy}</span>{slug === "individual" ? <IndividualTourInquiry /> : <Link className="tour-detail-cta" href="/#contact">PLAN THIS TOUR <b>↗</b></Link>}</div></section>
    <SectionPageNav label="Tour sections" items={slug === "individual" ? [{ href: "#overview", label: "Overview" }, { href: "#route", label: "Route" }, { href: "#details", label: "Details" }] : [{ href: "#overview", label: "Overview" }, { href: "#details", label: "Details" }]} />
    {slug === "individual" && <section className="recommended-route" id="route"><div className="recommended-route-heading"><p>OUR RECOMMENDED ROUTE · 6 DAYS</p><h2>Mountains.<br /><em>Nomadic spirit.</em></h2><span>This is our recommended first journey through Kyrgyzstan&apos;s wildest landscapes: high lakes, yurts, horses, mountain roads and the places where nomadic culture still feels close.</span><div className="route-price"><span>PROGRAM FROM</span><strong>$1,800</strong><em>6 days · private itinerary</em><p>Includes B&amp;B accommodation, comfortable Jeep transfer, delicious mountain picnics, a bar on wheels and a local guide who knows Kyrgyz culture and mountains inside out.</p></div><div className="route-inquiry"><p>YOUR JOURNEY, YOUR WAY</p><strong>Ready to make it yours?</strong><span>Leave an inquiry for an exact price and a route shaped around you. We&apos;ll create your personal program together.</span><IndividualTourInquiry className="recommended-route-cta" label="CREATE MY PROGRAM" /></div></div><ol>{recommendedRoute.map((stop) => <li key={stop.day}><span>DAY {stop.day}</span><div><h3>{stop.title}</h3><p>{stop.text}</p><small>{stop.stay}</small></div></li>)}</ol></section>}
    <section className="tour-detail-info" id="details"><p>KYRGYZSTAN, YOUR WAY</p><h2>The details<br /><em>matter.</em></h2><ul>{tour.details.map((detail, index) => <li key={detail}><span>0{index + 1}</span>{detail}</li>)}</ul></section>

  </main>;
}



