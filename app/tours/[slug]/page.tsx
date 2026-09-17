import Link from "next/link";
import { notFound } from "next/navigation";
import "./tour-detail.css";

const tours = {
  individual: {
    label: "PRIVATE TRAVEL · FROM 1 GUEST",
    title: "Your route.<br />Your <em>pace.</em>",
    copy: "A personal journey across Kyrgyzstan, designed around the places, rhythm and experiences that matter to you.",
    image: "https://www.alpin-ism.com/media/page/news/_fullWidth/untitled-7167-Pano.jpg",
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
    <section className="tour-detail-hero"><img src={tour.image} alt="Mountain landscape in Kyrgyzstan" /><div className="tour-detail-shade" /><div className="tour-detail-copy"><p>{tour.label}</p><h1 dangerouslySetInnerHTML={{ __html: tour.title }} /><span>{tour.copy}</span><Link className="tour-detail-cta" href="/#contact">PLAN THIS TOUR <b>↗</b></Link></div></section>
    <section className="tour-detail-info"><p>KYRGYZSTAN, YOUR WAY</p><h2>The details<br /><em>matter.</em></h2><ul>{tour.details.map((detail, index) => <li key={detail}><span>0{index + 1}</span>{detail}</li>)}</ul></section>
  </main>;
}
