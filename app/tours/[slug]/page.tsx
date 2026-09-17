import Link from "next/link";
import { notFound } from "next/navigation";
import "./tour-detail.css";
import "./recommended-route.css";
import "./recommended-route-refinement.css";
import "./recommended-route-cta.css";
import "./recommended-route-price.css";

const recommendedRoute = [
  { day: "01", title: "Bishkek → Kochkor → Song-Kul", stay: "Yurt camp at Song-Kul", text: "Drive through Kochkor to the highland lake of Song-Kul. Sleep in yurts and begin to feel the rhythm of Kyrgyz nomadic culture." },
  { day: "02", title: "Song-Kul → Naryn → Kel-Suu", stay: "Mountain-view camp at Kel-Suu", text: "Travel through Naryn towards Kel-Suu, a dramatic alpine lake beneath the high peaks of the Tien Shan." },
  { day: "03", title: "Kel-Suu → Naryn", stay: "Hotel in Naryn", text: "Choose your way to the lake: hike, ride horses or take a special off-road transfer. Spend time on the water by boat, then return to camp before driving to Naryn." },
  { day: "04", title: "Naryn → South Issyk-Kul", stay: "Comfortable yurts on Issyk-Kul", text: "Cross a mountain pass towards the southern shore of Issyk-Kul and settle into a comfortable yurt camp by the lake." },
  { day: "05", title: "Barskoon → Skazka → Karakol", stay: "Hotel in Karakol", text: "See the Barskoon waterfalls, explore Fairy Tale Canyon, watch an eagle-hunting show and continue to Karakol." },
  { day: "06", title: "Kyrchyn Gorge → Bishkek", stay: "Evening arrival in Bishkek", text: "Travel back via Kyrchyn Gorge, the setting of the World Nomad Games, then arrive in Bishkek in the evening." },
];

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
    image: "https://d36tnp772eyphs.cloudfront.net/blogs/1/2019/02/Kyrgyzstan-mountain-landscape.jpg",
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
    <section className="tour-detail-hero"><img src={tour.image} alt={slug === "individual" ? "Jeep on a mountain road in Kyrgyzstan" : "Mountain landscape in Kyrgyzstan"} /><div className="tour-detail-shade" /><div className="tour-detail-copy"><p>{tour.label}</p><h1 dangerouslySetInnerHTML={{ __html: tour.title }} /><span>{tour.copy}</span><Link className="tour-detail-cta" href="/#contact">PLAN THIS TOUR <b>↗</b></Link></div></section>
    {slug === "individual" && <section className="recommended-route"><div className="recommended-route-heading"><p>OUR RECOMMENDED ROUTE · 6 DAYS</p><h2>Mountains.<br /><em>Nomadic spirit.</em></h2><span>This is our recommended first journey through Kyrgyzstan&apos;s wildest landscapes: high lakes, yurts, horses, mountain roads and the places where nomadic culture still feels close.</span><div className="route-price"><span>PROGRAM FROM</span><strong>$1,800</strong><em>6 days · private itinerary</em><p>Includes B&amp;B accommodation, comfortable Jeep transfer, delicious mountain picnics, a bar on wheels and a local guide who knows Kyrgyz culture and mountains inside out.</p></div><div className="route-inquiry"><p>YOUR JOURNEY, YOUR WAY</p><strong>Ready to make it yours?</strong><span>Leave an inquiry for an exact price and a route shaped around you. We&apos;ll create your personal program together.</span><Link className="recommended-route-cta" href="/#contact">CREATE MY PROGRAM <b>↗</b></Link></div></div><ol>{recommendedRoute.map((stop) => <li key={stop.day}><span>DAY {stop.day}</span><div><h3>{stop.title}</h3><p>{stop.text}</p><small>{stop.stay}</small></div></li>)}</ol></section>}
    <section className="tour-detail-info"><p>KYRGYZSTAN, YOUR WAY</p><h2>The details<br /><em>matter.</em></h2><ul>{tour.details.map((detail, index) => <li key={detail}><span>0{index + 1}</span>{detail}</li>)}</ul></section>
  </main>;
}
