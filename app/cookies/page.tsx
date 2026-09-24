import Link from "next/link";
import CookieSettings from "./CookieSettings";
import "../legal/legal.css";
import "./cookie-settings.css";

const sections = [
  ["What this website uses", "Kyrgyzstan360 currently uses browser local storage for consent and small on-site experience preferences. The website does not currently include Google Analytics, Meta Pixel, or another analytics or marketing service."],
  ["Necessary storage", "The cookie-choice setting is stored locally as kyrgyzstan360-cookie-consent so the banner is not shown repeatedly. This setting is necessary to remember your choice."],
  ["Experience preferences", "The home page may store a 24-hour dismissal time for the Winter 2026/27 promotional window and a session-only marker after its winter CTA is selected. These settings are used only for the website experience."],
  ["Analytics and marketing", "No first-party analytics or marketing cookies are currently used by Kyrgyzstan360. If optional analytics or marketing tools are added in the future, they will only run after consent has been given."],
  ["Third-party media", "The winter page includes YouTube videos using YouTube's privacy-enhanced youtube-nocookie.com embed. Any interaction with embedded media is also subject to the provider's own policies."],
  ["Your choice", "Accepting or rejecting optional cookies is recorded locally in your browser. Rejecting optional cookies does not affect core website functionality."],
] as const;

export default function CookiePolicyPage() {
  return <main className="legal-page"><header className="legal-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link href="/">← BACK TO HOME</Link></header><section className="legal-intro"><p>KYRGYZSTAN360</p><h1>Cookie<br /><em>policy.</em></h1><span>A clear explanation of the cookies and local browser storage currently used by this website.</span></section><section className="legal-content">{sections.map(([title, content], index) => <article key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{content}</p></div></article>)}<CookieSettings /></section></main>;
}
