import { getTranslator } from "@/lib/server-translations";
import LegalLayout from "../legal/LegalLayout";
import CookieSettings from "./CookieSettings";
import "./cookie-settings.css";

const sections = [
  ["Trip planner draft", "The planner stores your travel preferences locally under kyrgyzstan360-trip-draft-v1 until you clear them or your browser storage. Contact details are not saved in this draft."],
  ["Language preference", "The k360-language cookie remembers your selected website language for up to one year. It is used only for this preference."],
  ["What this website uses", "Kyrgyzstan360 uses browser local storage for consent and small on-site experience preferences."],
  ["Necessary storage", "The cookie-choice setting is stored locally as kyrgyzstan360-cookie-consent-v2 so the banner is not shown repeatedly. This setting is necessary to remember your choice."],
  ["Experience preferences", "The home page may store kyrgyzstan360-winter-promo-dismissed-at for 24 hours when the Winter 2026/27 promotional window is dismissed. A session-only marker, kyrgyzstan360-winter-promo-cta-clicked, avoids showing the promotion again after its CTA is selected."],
  ["Third-party media", "The winter page includes YouTube videos using YouTube's privacy-enhanced youtube-nocookie.com embed. Interacting with embedded media is also subject to the provider's own policies."],
  ["Your choice", "Accepting or rejecting optional cookies is recorded locally in your browser. Rejecting optional cookies does not affect core website functionality. You can reset your choice below at any time."],
] as const;

export default async function CookiePolicyPage({ params }: PageProps<"/[lang]/cookies">) {
  const ru = (await params).lang === "ru";
  const optional = ru
    ? "На странице заявки мы можем использовать Google Analytics 4 для измерения посещений и отправок. Аналитика включается только после согласия. Изменить решение можно ниже."
    : "We may use Google Analytics 4 on the travel request page to measure visits and submissions. Analytics only runs after you consent. You can change your choice below.";
  const translate = await getTranslator();
  return <LegalLayout eyebrow={translate("KYRGYZSTAN360 · LEGAL")} title={translate("Cookie")} accent={translate("policy")} intro={translate("A clear explanation of the cookies and local browser storage currently used by this website.")}>
    <section className="legal-content legal-document">
      {translate(sections.map(([title, content], index) => <article key={title}><span>0{translate(index + 1)}</span><div><h2>{translate(title)}</h2><p>{translate(content)}</p></div></article>))}
      <article><div><h2>{ru ? "Аналитика" : "Analytics"}</h2><p>{optional}</p></div></article>
      <CookieSettings />
    </section>
  </LegalLayout>;
}
