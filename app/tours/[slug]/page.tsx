import Link from "next/link";
import { notFound } from "next/navigation";
import "./tour-detail.css";
import "./recommended-route.css";
import "./recommended-route-refinement.css";
import "./recommended-route-cta.css";
import "./recommended-route-price.css";
import "./group-tour.css";

const recommendedRoute = [
  { day: "01", title: "Bishkek → Kochkor → Song-Kul", stay: "Yurt camp at Song-Kul", text: "Drive through Kochkor to the highland lake of Song-Kul. Sleep in yurts and begin to feel the rhythm of Kyrgyz nomadic culture." },
  { day: "02", title: "Song-Kul → Naryn → Kel-Suu", stay: "Mountain-view camp at Kel-Suu", text: "Travel through Naryn towards Kel-Suu, a dramatic alpine lake beneath the high peaks of the Tien Shan." },
  { day: "03", title: "Kel-Suu → Naryn", stay: "Hotel in Naryn", text: "Choose your way to the lake: hike, ride horses or take a special off-road transfer. Spend time on the water by boat, then return to camp before driving to Naryn." },
  { day: "04", title: "Naryn → South Issyk-Kul", stay: "Comfortable yurts on Issyk-Kul", text: "Cross a mountain pass towards the southern shore of Issyk-Kul and settle into a comfortable yurt camp by the lake." },
  { day: "05", title: "Barskoon → Skazka → Karakol", stay: "Hotel in Karakol", text: "See the Barskoon waterfalls, explore Fairy Tale Canyon, watch an eagle-hunting show and continue to Karakol." },
  { day: "06", title: "Kyrchyn Gorge → Bishkek", stay: "Evening arrival in Bishkek", text: "Travel back via Kyrchyn Gorge, the setting of the World Nomad Games, then arrive in Bishkek in the evening." },
];

const groupTourRoute = [
  { day: "01", route: "Bishkek → Kochkor → Song-Kul", text: "Drive through Kochkor to Song-Kul. Sleep in yurts and get to know the living rhythms, hospitality and traditions of Kyrgyz nomadic culture." },
  { day: "02", route: "Song-Kul → Naryn → Kel-Suu", text: "Travel via Naryn to the remote Kel-Suu Lake, set beneath the high peaks of the Tien Shan. Overnight with wide mountain views." },
  { day: "03", route: "Kel-Suu → Naryn", text: "Choose how to reach the lake: hiking, horse riding or a special off-road transfer. Add a boat ride when conditions allow, then return to camp before driving to Naryn for a hotel night." },
  { day: "04", route: "Naryn → South Issyk-Kul", text: "Cross a mountain pass towards the southern shore of Issyk-Kul and settle into comfortable yurts by the lake." },
  { day: "05", route: "Barskoon → Skazka → Karakol", text: "See the Barskoon waterfalls, walk through Fairy Tale Canyon, watch an eagle-hunting show and continue to Karakol." },
  { day: "06", route: "Karakol → Altyn-Arashan", text: "Ride into Altyn-Arashan in a classic Soviet UAZ, soak in the hot springs and return to Karakol in the evening." },
  { day: "07", route: "Kyrchyn Gorge → Bishkek", text: "Travel to Bishkek via Kyrchyn Gorge, the setting of the World Nomad Games, and arrive in the capital in the evening." },
];

const groupIncluded = ["4×4 group transport and fuel", "Experienced local driver-guide", "Accommodation according to the program", "Cultural stops and route coordination", "Kel-Suu border-zone permit support"];
const groupNotIncluded = ["International flights", "Personal travel insurance", "Meals at city cafés", "Optional horse and boat activities"];

const tours = {
  individual: {
    label: "PRIVATE TRAVEL · FROM 1 GUEST",
    title: "Your route.<br />Your <em>pace.</em>",
    copy: "We shape a private itinerary around your wishes: horse riding and hikes, serious off-road adventure, or an easy journey on comfortable roads with carefully chosen hotels. Your Kyrgyzstan, your way.",
    image: "https://static.tildacdn.com/tild6433-6464-4331-a663-626566666632/DJI_0355.jpg",
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

export default async function TourDetailPage({ params }: PageProps<"/tours/[slug]">) {
  const { slug } = await params;
  if (!(slug in tours)) notFound();
  const tour = tours[slug as TourSlug];

  return <main className="tour-detail">
    <header className="tour-detail-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link className="tour-detail-back" href="/#explore">← BACK TO ADVENTURES</Link></header>
    <section className="tour-detail-hero"><img src={tour.image} alt={slug === "individual" ? "Jeep on a mountain road in Kyrgyzstan" : slug === "group" ? "A convoy of jeeps in the mountains of Kyrgyzstan" : "Mountain landscape in Kyrgyzstan"} /><div className="tour-detail-shade" /><div className="tour-detail-copy"><p>{tour.label}</p><h1 dangerouslySetInnerHTML={{ __html: tour.title }} /><span>{tour.copy}</span><Link className="tour-detail-cta" href="/#contact">PLAN THIS TOUR <b>↗</b></Link></div></section>
    {slug === "individual" && <section className="recommended-route"><div className="recommended-route-heading"><p>OUR RECOMMENDED ROUTE · 6 DAYS</p><h2>Mountains.<br /><em>Nomadic spirit.</em></h2><span>This is our recommended first journey through Kyrgyzstan&apos;s wildest landscapes: high lakes, yurts, horses, mountain roads and the places where nomadic culture still feels close.</span><div className="route-price"><span>PROGRAM FROM</span><strong>$1,800</strong><em>6 days · private itinerary</em><p>Includes B&amp;B accommodation, comfortable Jeep transfer, delicious mountain picnics, a bar on wheels and a local guide who knows Kyrgyz culture and mountains inside out.</p></div><div className="route-inquiry"><p>YOUR JOURNEY, YOUR WAY</p><strong>Ready to make it yours?</strong><span>Leave an inquiry for an exact price and a route shaped around you. We&apos;ll create your personal program together.</span><Link className="recommended-route-cta" href="/#contact">CREATE MY PROGRAM <b>↗</b></Link></div></div><ol>{recommendedRoute.map((stop) => <li key={stop.day}><span>DAY {stop.day}</span><div><h3>{stop.title}</h3><p>{stop.text}</p><small>{stop.stay}</small></div></li>)}</ol></section>}
    {slug === "group" && <><section className="group-facts"><span><b>7</b> DAYS</span><span><b>MAY—OCT</b> BOOKING SEASON</span><span><b>FROM 3</b> GUESTS</span><span><b>4×4</b> JEEP EXPEDITION</span></section><section className="group-why"><div><p>WHY GO TOGETHER</p><h2>More roads.<br /><em>More stories.</em></h2></div><div><p>This is the Kyrgyzstan you want to share: winding passes, yurt dinners, cold lake mornings and the small moments between destinations.</p><ul><li>Travel in a close-knit 4×4 group</li><li>Meet people who came for the same wild places</li><li>Keep the logistics easy — and the adventure real</li></ul></div></section><section className="group-route"><div className="group-route-heading"><p>OUR RECOMMENDED GROUP ROUTE</p><h2>High lakes.<br /><em>One good crew.</em></h2><span>A seven-day jeep journey from Bishkek through Song-Kul, Kel-Suu, Issyk-Kul and the wild mountains around Karakol.</span></div><ol>{groupTourRoute.map((stop) => <li key={stop.day}><span>DAY {stop.day}</span><div><h3>{stop.route}</h3><p>{stop.text}</p></div></li>)}</ol></section><section className="group-inclusions"><div><p>TRANSPARENTLY PLANNED</p><h2>What&apos;s<br /><em>covered.</em></h2></div><div className="group-inclusions-lists"><ul><li className="list-title">INCLUDED</li>{groupIncluded.map((item) => <li key={item}><b>↗</b>{item}</li>)}</ul><ul><li className="list-title">NOT INCLUDED</li>{groupNotIncluded.map((item) => <li key={item}><b>—</b>{item}</li>)}</ul></div></section><section className="group-booking"><p>BOOKING OPEN MAY—OCTOBER</p><h2>Join the<br /><em>next crew.</em></h2><span>Tell us your preferred dates and group size. We&apos;ll share availability, the final price and everything you need to know before departure.</span><Link href="/#contact">ASK FOR DATES &amp; PRICE <b>↗</b></Link></section></>}
    {slug !== "group" && <section className="tour-detail-info"><p>KYRGYZSTAN, YOUR WAY</p><h2>The details<br /><em>matter.</em></h2><ul>{tour.details.map((detail, index) => <li key={detail}><span>0{index + 1}</span>{detail}</li>)}</ul></section>}
  </main>;
}
