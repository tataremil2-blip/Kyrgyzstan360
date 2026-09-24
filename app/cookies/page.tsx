import LegalLayout from "../legal/LegalLayout";
import CookieSettings from "./CookieSettings";
import "./cookie-settings.css";

const sections = [
  ["What this website uses", "Kyrgyzstan360 uses browser local storage for consent and small on-site experience preferences. The website does not currently include Google Analytics, Meta Pixel, or another analytics or marketing service."],
  ["Necessary storage", "The cookie-choice setting is stored locally as kyrgyzstan360-cookie-consent so the banner is not shown repeatedly. This setting is necessary to remember your choice."],
  ["Experience preferences", "The home page may store kyrgyzstan360-winter-promo-dismissed-at for 24 hours when the Winter 2026/27 promotional window is dismissed. A session-only marker, kyrgyzstan360-winter-promo-cta-clicked, avoids showing the promotion again after its CTA is selected."],
  ["Analytics and marketing", "No first-party analytics or marketing cookies are currently used by Kyrgyzstan360. If optional analytics or marketing tools are added in the future, they will only run after consent has been given."],
  ["Third-party media", "The winter page includes YouTube videos using YouTube's privacy-enhanced youtube-nocookie.com embed. Interacting with embedded media is also subject to the provider's own policies."],
  ["Your choice", "Accepting or rejecting optional cookies is recorded locally in your browser. Rejecting optional cookies does not affect core website functionality. You can reset your choice below at any time."],
] as const;

export default function CookiePolicyPage() {
  return <LegalLayout eyebrow="KYRGYZSTAN360 · LEGAL" title="Cookie" accent="policy." intro="A clear explanation of the cookies and local browser storage currently used by this website.">
    <section className="legal-content legal-document">
      {sections.map(([title, content], index) => <article key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{content}</p></div></article>)}
      <CookieSettings />
    </section>
  </LegalLayout>;
}
