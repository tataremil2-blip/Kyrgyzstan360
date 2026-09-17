import Link from "next/link";
import { notFound } from "next/navigation";
import "./tour-detail.css";
import "./recommended-route.css";

const recommendedRoute = [
  { day: "01", title: "Bishkek & Ala-Archa", text: "Begin in the capital, then head into Ala-Archa National Park for your first views of the high Tien Shan." },
  { day: "02", title: "Burana & Issyk-Kul", text: "Follow the old Silk Road to Burana Tower, then continue towards the vast blue water of Issyk-Kul." },
  { day: "03", title: "Karakol & Altyn-Arashan", text: "Explore Karakol and choose a rugged 4×4 ride or a hike into Altyn-Arashan for mountain views and hot springs." },
  { day: "04", title: "Jeti-Oguz, Barskoon & Skazka", text: "Travel the southern shore through red-rock gorges, waterfalls and the otherworldly shapes of Fairy Tale Canyon." },
  { day: "05", title: "Bokonbaevo & Song-Kul", text: "Meet local eagle hunters, cross into the highlands and settle into a yurt camp beside Song-Kul Lake." },
  { day: "06", title: "Song-Kul Jailoo", text: "Slow down on the summer pastures: ride horses, walk by the lake and share the quiet rhythm of nomadic life." },
  { day: "07", title: "High passes to Bishkek", text: "Take the scenic road back through the mountains — with time for the final views and roadside stops that make the journey yours." },
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
    {slug === "individual" && <section className="recommended-route"><div className="recommended-route-heading"><p>RECOMMENDED ITINERARY · 7 DAYS</p><h2>See the best<br /><em>of Kyrgyzstan.</em></h2><span>A beautiful first route through mountain landscapes, lake country and nomadic highlands. We adjust every day around your interests, travel style and the season.</span></div><ol>{recommendedRoute.map((stop) => <li key={stop.day}><span>DAY {stop.day}</span><div><h3>{stop.title}</h3><p>{stop.text}</p></div></li>)}</ol></section>}
    <section className="tour-detail-info"><p>KYRGYZSTAN, YOUR WAY</p><h2>The details<br /><em>matter.</em></h2><ul>{tour.details.map((detail, index) => <li key={detail}><span>0{index + 1}</span>{detail}</li>)}</ul></section>
  </main>;
}
