import { getTranslator } from "@/lib/server-translations";
import { LocalizedAnchor } from "@/app/LocalizedLink";
import LegalLayout from "./LegalLayout";
import Link from "@/app/LocalizedLink";

export default async function LegalPage() {
  const translate = await getTranslator();
  return <LegalLayout eyebrow={translate("KYRGYZSTAN360 · LEGAL")} title={translate("Legal")} accent={translate("information")} intro={translate("Everything you need to know about using Kyrgyzstan360, booking our adventures and how we handle your information.")}>
    <section className="legal-content" id="operator">
      <article><span>01</span><div><h2>{translate("Kyrgyzstan360")}</h2><dl><dt>{translate("Operator / Owner")}</dt><dd>{translate("Emil Zakirov")}</dd><dt>{translate("Tax Number")}</dt><dd>20706199300911</dd><dt>{translate("Address")}</dt><dd>{translate("147 Imanaly Aidarbekov str.")}<br />{translate("Bishkek, Kyrgyzstan")}<br />720014</dd><dt>{translate("Email")}</dt><dd><LocalizedAnchor href="mailto:tataremil2@gmail.com">{translate("tataremil2@gmail.com")}</LocalizedAnchor></dd><dt>{translate("WhatsApp")}</dt><dd><LocalizedAnchor href="https://wa.me/996557444225" target="_blank" rel="noreferrer">+996 557 444 225</LocalizedAnchor></dd><dt>{translate("Website")}</dt><dd>{translate("kyrgyzstan360.com")}</dd><dt>{translate("Last updated")}</dt><dd>{translate("September 2026")}</dd></dl></div></article>
      <article><span>02</span><div><h2>{translate("Booking and payment")}</h2><p>{translate("You may pay 30% of the total tour price at booking, with the remaining 70% payable upon arrival in Kyrgyzstan before the booked tour or services begin. Alternatively, you may pay 100% of the total tour price at booking. After the required booking payment is received, Kyrgyzstan360 provides payment confirmation and a Tour Agreement or contract.")}</p></div></article>
      <article><span>03</span><div><h2>{translate("Cancellations and refunds")}</h2><p>{translate("Cancellation by the Customer at least three (3) months before the scheduled tour start date is eligible for a full refund of all amounts paid. For Cancellation by the Customer less than three (3) months before the scheduled tour start date, 30% of the total tour price is non-refundable. If Kyrgyzstan360 cancels a confirmed tour, all amounts paid are refunded in full. Applicable refunds are processed within thirty (30) calendar days. ")}<Link href="/terms">{translate("Read the full Terms & Conditions.")}</Link></p></div></article>
      <article><span>04</span><div><h2>{translate("Website information")}</h2><p>{translate("Kyrgyzstan360 presents private and adventure travel experiences in Kyrgyzstan. Tour availability, routes, accommodation and final pricing are confirmed directly with the guest before booking.")}</p></div></article>
      <article><span>05</span><div><h2>{translate("Intellectual property")}</h2><p>{translate("Unless otherwise stated, Kyrgyzstan360 branding, logo, website design, original written content and owned photographs or video may not be reproduced commercially without permission. Third-party materials remain the property of their respective rights holders.")}</p></div></article>
      <article><span>06</span><div><h2>{translate("Photography and media")}</h2><p>{translate("Photography and video may be created during tours only in line with any separate consent agreed with guests. Booking does not itself grant unrestricted commercial rights to a guest's image.")}</p></div></article>
    </section>
  </LegalLayout>;
}
