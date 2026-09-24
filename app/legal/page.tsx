import Link from "next/link";
import "./legal.css";

const sections = [
  ["Website owner / rights holder", "Kyrgyzstan360. Legal owner details: [to be added]."],
  ["Contact information", "Email: tataremil2@gmail.com. Other contact details: [to be added]."],
  ["Copyright notice", "Unless stated otherwise, the website design, text and original materials are protected by applicable copyright laws."],
  ["Website content ownership", "Kyrgyzstan360 retains rights to its original website content. Reuse requires prior written permission unless applicable law permits it."],
  ["Photography and media rights", "Photographs, video and other media are used with permission, under licence, or belong to their respective rights holders. Rights-holder details: [to be added where required]."],
  ["Terms of website use", "This website is provided for general information about travel services. Availability, itineraries and prices are confirmed only after direct communication with Kyrgyzstan360."],
  ["Liability disclaimer", "Information is maintained with care but may change. Kyrgyzstan360 is not responsible for losses arising solely from reliance on website information; mandatory consumer rights remain unaffected."],
  ["Privacy-related legal information", "Inquiry and review form data are used to respond to requests and manage communications. Full privacy policy and data-retention details: [to be added]."],
] as const;

export default function LegalPage() {
  return <main className="legal-page"><header className="legal-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link href="/">← BACK TO HOME</Link></header><section className="legal-intro"><p>KYRGYZSTAN360</p><h1>Legal<br /><em>information.</em></h1><span>Essential website and content information. Placeholders are marked where details need to be supplied.</span></section><section className="legal-content">{sections.map(([title, content], index) => <article key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{content}</p></div></article>)}</section></main>;
}
