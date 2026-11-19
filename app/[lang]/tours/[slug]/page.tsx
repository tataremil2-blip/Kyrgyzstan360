import { getTranslator } from "@/lib/server-translations";
import { LocalizedAnchor } from "@/app/LocalizedLink";
import Link from "@/app/LocalizedLink";
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


async function KyrgyzstanRouteMap() {
  const translate = await getTranslator();
  return <figure className="group-route-map"><svg viewBox="0 0 720 420" role="img" aria-labelledby="route-map-title route-map-description"><title id="route-map-title">{translate("Group expedition route across Kyrgyzstan")}</title><desc id="route-map-description">{translate("The route links Bishkek, Kochkor, Song-Kul, Tash-Rabat, Kel-Suu, Naryn, Kadji-Sai, Karakol and Kyrchyn Gorge.")}</desc><path className="map-outline" d="M77 155 120 118 202 121 259 91 315 100 358 78 409 100 455 89 494 113 552 102 590 134 656 136 678 171 653 203 603 211 563 243 494 239 446 269 382 264 342 293 273 281 228 310 169 292 137 258 84 244 58 203Z" /><path className="map-route" d="M119 131 251 178 230 214 261 275 482 271 282 239 248 198 416 187 489 157 440 140 119 131" /><g className="map-stop"><circle cx="119" cy="131" r="7" /><text x="119" y="113">{translate("BISHKEK")}</text></g><g className="map-stop"><circle cx="251" cy="178" r="7" /><text x="251" y="160">{translate("KOCHKOR")}</text></g><g className="map-stop"><circle cx="230" cy="214" r="7" /><text x="202" y="239">{translate("SONG-KUL")}</text></g><g className="map-stop"><circle cx="261" cy="275" r="7" /><text x="261" y="306">{translate("TASH-RABAT")}</text></g><g className="map-stop"><circle cx="482" cy="271" r="7" /><text x="482" y="303">{translate("KEL-SUU")}</text></g><g className="map-stop"><circle cx="282" cy="239" r="7" /><text x="299" y="246">{translate("NARYN")}</text></g><g className="map-stop"><circle cx="248" cy="198" r="7" /><text x="204" y="190">{translate("KADJI-SAI")}</text></g><g className="map-stop"><circle cx="416" cy="187" r="7" /><text x="416" y="169">{translate("KARAKOL")}</text></g><g className="map-stop"><circle cx="489" cy="157" r="7" /><text x="489" y="139">{translate("KYRCHYN")}</text></g></svg><figcaption><span>{translate("8 DAYS")}</span><span>{translate("9 STOPS")}</span><span>{translate("ONE EXPEDITION")}</span></figcaption></figure>;
}

async function ExactKyrgyzstanRouteMap() {
  const translate = await getTranslator();
  const googleMapsRoute = "https://www.google.com/maps/dir/Bishkek,+Kyrgyzstan/Kochkor,+Kyrgyzstan/Song-Kul,+Kyrgyzstan/Tash-Rabat,+Kyrgyzstan/Kel-Suu,+Kyrgyzstan/Naryn,+Kyrgyzstan/Kadji-Sai,+Kyrgyzstan/Karakol,+Kyrgyzstan/Kyrchyn+Gorge,+Kyrgyzstan/Bishkek,+Kyrgyzstan";
  return <figure className="exact-route-map"><KyrgyzstanRouteMap /><svg viewBox="0 0 720 420" role="img" aria-labelledby="exact-route-map-title exact-route-map-description"><title id="exact-route-map-title">{translate("Exact locations of the group expedition route")}</title><desc id="exact-route-map-description">{translate("Each stop is placed according to its real-world latitude and longitude.")}</desc><path className="exact-map-outline" d="M80 87 143 61 219 74 281 57 344 72 415 56 493 67 548 53 610 77 670 87 692 118 672 156 623 165 578 199 526 215 478 235 405 226 354 254 291 242 234 275 170 258 123 227 81 219 54 183 66 134Z" /><path className="exact-map-route" d="M347 56 414 113 381 144 387 231 559 221 427 180 494 144 563 89 526 100 347 56" /><g className="exact-map-stop"><circle cx="347" cy="56" r="7" /><text x="347" y="39">{translate("BISHKEK")}</text></g><g className="exact-map-stop"><circle cx="414" cy="113" r="7" /><text x="414" y="96">{translate("KOCHKOR")}</text></g><g className="exact-map-stop"><circle cx="381" cy="144" r="7" /><text x="350" y="164">{translate("SONG-KUL")}</text></g><g className="exact-map-stop"><circle cx="387" cy="231" r="7" /><text x="387" y="256">{translate("TASH-RABAT")}</text></g><g className="exact-map-stop"><circle cx="559" cy="221" r="7" /><text x="559" y="246">{translate("KEL-SUU")}</text></g><g className="exact-map-stop"><circle cx="427" cy="180" r="7" /><text x="454" y="186">{translate("NARYN")}</text></g><g className="exact-map-stop"><circle cx="494" cy="144" r="7" /><text x="512" y="137">{translate("KADJI-SAI")}</text></g><g className="exact-map-stop"><circle cx="563" cy="89" r="7" /><text x="587" y="94">{translate("KARAKOL")}</text></g><g className="exact-map-stop"><circle cx="526" cy="100" r="7" /><text x="526" y="81">{translate("KYRCHYN")}</text></g></svg><figcaption><span>{translate("LOCATIONS AT REAL COORDINATES")}</span><LocalizedAnchor href={googleMapsRoute} target="_blank" rel="noreferrer">{translate("OPEN IN GOOGLE MAPS ↗")}</LocalizedAnchor></figcaption></figure>;
}

const tours = {
  individual: {
    label: "PRIVATE TRAVEL · FROM 1 GUEST",
    title: "Your route<br />Your pace",
    copy: "We shape a private itinerary around your wishes: horse riding and hikes, serious off-road adventure, or an easy journey on comfortable roads with carefully chosen hotels. Your Kyrgyzstan, your way.",
    image: "/individual-tour.jpg",
    details: ["Private driver and flexible route", "Start from 1 guest", "Local planning from first idea to final day"],
  },
  group: {
    label: "SHARED ADVENTURE · FROM 3 GUESTS",
    title: "Good roads<br />Great company",
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

async function GroupTourPage({ tour }: { tour: typeof tours.group }) {
  const translate = await getTranslator();
  return <main className="tour-detail group-tour-page">
    <header className="tour-detail-header group-tour-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link className="tour-detail-back" href="/#explore">{translate("← ALL TOURS")}</Link></header>
    <section className="tour-detail-hero group-tour-hero" id="overview"><img src={tour.image} alt={translate("A convoy of jeeps in the mountains of Kyrgyzstan")} /><div className="tour-detail-shade" /><div className="group-hero-content"><div className="group-hero-copy"><div className="group-hero-meta"><span>{translate("8 DAYS")}</span><span>{translate("MAY—OCT")}</span></div><p>{translate(tour.label)}</p><h1 dangerouslySetInnerHTML={{ __html: translate(tour.title) }} /><span>{translate(tour.copy)}</span></div><div className="group-hero-form"><p>{translate("PLAN A GROUP JOURNEY")}</p><strong>{translate("Get dates and a tailored quote.")}</strong><InquiryForm compact tour="Group tour" /></div></div></section>
    <nav className="group-page-nav" aria-label={translate("Group tour sections")}><LocalizedAnchor href="#overview">{translate("Overview")}</LocalizedAnchor><LocalizedAnchor href="#experience">{translate("Highlights")}</LocalizedAnchor><LocalizedAnchor href="#program">{translate("Program")}</LocalizedAnchor><LocalizedAnchor href="#vehicles">{translate("Vehicles")}</LocalizedAnchor><LocalizedAnchor href="#included">{translate("Included")}</LocalizedAnchor><LocalizedAnchor href="#booking">{translate("Book")}</LocalizedAnchor><LocalizedAnchor href="#extreme">{translate("Extreme")}</LocalizedAnchor></nav>
    <section className="group-facts"><span><b>8</b>{translate(" DAYS")}</span><span><b>{translate("MAY—OCT")}</b>{translate(" BOOKING SEASON")}</span><span><b>{translate("LOST")}</b>{translate(" LOCATIONS")}</span><span><b>4×4</b>{translate(" JEEP EXPEDITION")}</span></section>
    <section className="group-why" id="experience"><div><p>{translate("WHY NOW")}</p><h2>{translate("Wild, while")}<br />{translate("it still is")}</h2></div><div><p>{translate("Kyrgyzstan remains a country of raw nature and places far beyond the usual route. Development is moving fast; this is a rare moment to see high lakes, mountain passes and nomadic landscapes before mass tourism changes the rhythm of the country.")}</p><ul><li>{translate("Reach places that still feel truly remote")}</li><li>{translate("See unfiltered mountain landscapes, not crowded viewpoints")}</li><li>{translate("Experience Kyrgyzstan in its original, wilder character")}</li></ul></div></section>
    <section className="group-route" id="program"><div className="group-route-copy"><div className="group-route-heading"><p>{translate("OUR GROUP EXPEDITION ROUTE")}</p><h2>{translate("High lakes")}<br />{translate("One good crew")}</h2><span>{translate("Eight days from Bishkek through Song-Kul, Tash-Rabat, Kel-Suu, Issyk-Kul and the mountains around Karakol.")}</span></div><ol>{translate(groupTourRoute.map((stop) => <li key={stop.day} tabIndex={0}><span>{(stop.day === "PREP" ? translate("ARRIVAL") : translate("DAY {day}", { day: stop.day }))}</span><div><h3>{translate(stop.route)}</h3><div className="route-day-expanded"><p>{translate(stop.text)}</p><img src={stop.image} alt={translate(stop.imageAlt)} loading="lazy" /></div></div></li>))}</ol></div><aside className="group-route-visuals"><ExactKyrgyzstanRouteMap /><div className="group-route-photo-grid">{translate(groupRoutePhotos.map((photo) => <LocalizedAnchor href={photo.source} key={photo.title} target="_blank" rel="noreferrer"><img src={photo.image} alt={translate(photo.title)} loading="lazy" /><span><strong>{translate(photo.title)}</strong><small>{translate(photo.subtitle)}</small></span></LocalizedAnchor>))}</div></aside></section>
    <section className="group-vehicles" id="vehicles"><div className="group-vehicles-heading"><p>{translate("THE EXPEDITION FLEET")}</p><h2>{translate("Built for")}<br />{translate("the long way")}</h2><span>{translate("We travel in prepared 4×4 vehicles made for mountain passes, river crossings and the roads that lead to the places most visitors never reach.")}</span></div><div className="group-vehicles-content"><div className="vehicle-gallery">{translate(expeditionVehicles.map((vehicle) => <article key={vehicle.name}><img src={vehicle.image} alt={translate("Prepared {vehicle} for off-road travel", { vehicle: vehicle.name })} loading="lazy" /><span><strong>{translate(vehicle.name)}</strong><small>{translate(vehicle.description)}</small></span></article>))}</div><div className="vehicle-options"><article><span>01</span><div><h3>{translate("Drive the route.")}</h3><p>{translate("Travel in a crew of four and share the wheel between everyone in the car. Take your turn on the mountain roads with support from the expedition team.")}</p></div></article><article><span>02</span><div><h3>{translate("Ride as a passenger.")}</h3><p>{translate("Experienced local drivers lead the way, while you settle back, take in the landscapes and enjoy every stop on the route.")}</p></div></article></div></div></section>
    <section className="group-inclusions" id="included"><div><p>{translate("TRANSPARENTLY PLANNED")}</p><h2>{translate("What's")}<br /><em>{translate("covered.")}</em></h2></div><div className="group-inclusions-lists"><ul><li className="list-title">{translate("INCLUDED")}</li>{translate(groupIncluded.map((item) => <li key={item}><b>↗</b>{translate(item)}</li>))}</ul><ul><li className="list-title">{translate("NOT INCLUDED")}</li>{translate(groupNotIncluded.map((item) => <li key={item}><b>—</b>{translate(item)}</li>))}</ul></div></section>
    <GroupDepartureCalendar departures={groupDepartures} />
    <section className="group-pricing"><div><p>{translate("EXPEDITION PRICE")}</p><h2>{translate("Choose your")}<br />{translate("place in the crew")}</h2><span>{translate("Choose how you want to travel. Send us an inquiry with your preferred dates and we will prepare a precise offer.")}</span></div><div className="group-price-options"><section className="price-tier"><div className="price-tier-heading"><p>{translate("RIDE AS A PASSENGER")}</p><span>{translate("Travel with an experienced local driver and enjoy every view along the route.")}</span></div><div className="price-table" role="table" aria-label={translate("Passenger expedition prices")}><div className="price-table-row price-table-head" role="row"><span role="columnheader">{translate("PLACES")}</span><span role="columnheader">{translate("PRICE PER GUEST")}</span></div><div className="price-table-row" role="row"><span role="cell">{translate("1 PLACE")}</span><strong role="cell">{translate("€2,180")}</strong></div><div className="price-table-row" role="row"><span role="cell">{translate("2 PLACES")}</span><strong role="cell">{translate("€1,920")}</strong></div><div className="price-table-row" role="row"><span role="cell">{translate("3 PLACES")}</span><strong role="cell">{translate("€1,750")}</strong></div></div></section><section className="price-tier"><div className="price-tier-heading"><p>{translate("DRIVE A RENTED 4×4 · FROM 2 GUESTS")}</p><span>{translate("Drive under our team's supervision and share the wheel with everyone in the car.")}</span></div><div className="price-table" role="table" aria-label={translate("Driver expedition prices")}><div className="price-table-row price-table-head" role="row"><span role="columnheader">{translate("PLACES")}</span><span role="columnheader">{translate("PRICE PER GUEST")}</span></div><div className="price-table-row" role="row"><span role="cell">{translate("2 PLACES")}</span><strong role="cell">{translate("€1,920")}</strong></div><div className="price-table-row" role="row"><span role="cell">{translate("3 PLACES")}</span><strong role="cell">{translate("€1,750")}</strong></div><div className="price-table-row" role="row"><span role="cell">{translate("4 PLACES")}</span><strong role="cell">{translate("€1,750")}</strong></div></div></section></div></section>
    <section className="group-booking" id="booking"><p>{translate("BOOKING OPEN MAY—OCTOBER")}</p><h2>{translate("Join the")}<br />{translate("next crew")}</h2><span>{translate("Tell us your preferred dates and group size. We'll share availability, the final price and everything you need to know before departure.")}</span><InquiryForm compact tour="Group tour" /></section>
    <section className="group-extreme" id="extreme"><div className="group-extreme-copy"><p>{translate("MAKE IT WILDER")}</p><h2>{translate("One more day")}<br />{translate("Full throttle")}</h2><span>{translate("Build an extreme day into your expedition and take the route beyond the 4×4.")}</span><ul><li><b>01</b><div><strong>{translate("Enduro riding")}</strong><small>{translate("For confident riders with off-road experience.")}</small></div></li><li><b>02</b><div><strong>{translate("Quad bikes")}</strong><small>{translate("Explore open terrain on four wheels.")}</small></div></li><li><b>03</b><div><strong>{translate("Jet skis")}</strong><small>{translate("Take to the water for a different kind of mountain day.")}</small></div></li></ul></div><div className="group-extreme-form"><p>{translate("EXTREME ADD-ON")}</p><h3>{translate("Want to add")}<br /><em>{translate("more adrenaline?")}</em></h3><span>{translate("Tell us what you have in mind and we'll share the details, availability and requirements.")}</span><InquiryForm compact tour="Extreme add-on request" /></div></section>
  </main>;
}

export default async function TourDetailPage({ params }: PageProps<"/[lang]/tours/[slug]">) {
  const translate = await getTranslator();
  const { slug } = await params;
  if (!(slug in tours)) notFound();
  const tour = tours[slug as TourSlug];
  if (slug === "group") return <GroupTourPage tour={tours.group} />;

  return <main className="tour-detail">
    <header className="tour-detail-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link></header>
    <section className="tour-detail-hero" id="overview"><img src={tour.image} alt={translate(slug === "individual" ? "Jeep on a mountain road in Kyrgyzstan" : slug === "group" ? "A convoy of jeeps in the mountains of Kyrgyzstan" : "Mountain landscape in Kyrgyzstan")} /><div className="tour-detail-shade" /><div className="tour-detail-copy"><p>{translate(tour.label)}</p><h1 dangerouslySetInnerHTML={{ __html: translate(tour.title) }} /><span>{translate(tour.copy)}</span>{translate(slug === "individual" ? <IndividualTourInquiry /> : <Link className="tour-detail-cta" href="/#contact">{translate("PLAN THIS TOUR ")}<b>↗</b></Link>)}</div></section>
    <SectionPageNav label={translate("Tour sections")} items={slug === "individual" ? [{ href: "#overview", label: "Overview" }, { href: "#route", label: "Route" }, { href: "#details", label: "Details" }] : [{ href: "#overview", label: "Overview" }, { href: "#details", label: "Details" }]} />
    {translate(slug === "individual" && <section className="recommended-route" id="route"><div className="recommended-route-heading"><p>{translate("OUR RECOMMENDED ROUTE · 6 DAYS")}</p><h2>{translate("Mountains")}<br />{translate("Nomadic spirit")}</h2><span>{translate("This is our recommended first journey through Kyrgyzstan's wildest landscapes: high lakes, yurts, horses, mountain roads and the places where nomadic culture still feels close.")}</span><div className="route-price"><span>{translate("PROGRAM FROM")}</span><strong>{translate("$1,800")}</strong><em>{translate("6 days · private itinerary")}</em><p>{translate("Includes B&B accommodation, comfortable Jeep transfer, delicious mountain picnics, a bar on wheels and a local guide who knows Kyrgyz culture and mountains inside out.")}</p></div><div className="route-inquiry"><p>{translate("YOUR JOURNEY, YOUR WAY")}</p><strong>{translate("Ready to make it yours?")}</strong><span>{translate("Leave an inquiry for an exact price and a route shaped around you. We'll create your personal program together.")}</span><IndividualTourInquiry className="recommended-route-cta" label={translate("CREATE MY PROGRAM")} /></div></div><ol>{translate(recommendedRoute.map((stop) => <li key={stop.day}><span>{translate("DAY ")}{translate(stop.day)}</span><div><h3>{translate(stop.title)}</h3><p>{translate(stop.text)}</p><small>{translate(stop.stay)}</small></div></li>))}</ol></section>)}
    <section className="tour-detail-info" id="details"><p>{translate("KYRGYZSTAN, YOUR WAY")}</p><h2>{translate("The details")}<br />{translate("matter")}</h2><ul>{translate(tour.details.map((detail, index) => <li key={detail}><span>0{translate(index + 1)}</span>{translate(detail)}</li>))}</ul></section>

  </main>;
}