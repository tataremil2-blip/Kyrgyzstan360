import LegalLayout from "./LegalLayout";
import Link from "next/link";

export default function LegalPage() {
  return <LegalLayout eyebrow="KYRGYZSTAN360 · LEGAL" title="Legal" accent="information." intro="Everything you need to know about using Kyrgyzstan360, booking our adventures and how we handle your information.">
    <section className="legal-content" id="operator">
      <article><span>01</span><div><h2>Kyrgyzstan360</h2><dl><dt>Operator / Owner</dt><dd>Emil Zakirov</dd><dt>Tax Number</dt><dd>20706199300911</dd><dt>Address</dt><dd>147 Imanaly Aidarbekov str.<br />Bishkek, Kyrgyzstan<br />720014</dd><dt>Email</dt><dd><a href="mailto:tataremil2@gmail.com">tataremil2@gmail.com</a></dd><dt>WhatsApp</dt><dd><a href="https://wa.me/996557444225" target="_blank" rel="noreferrer">+996 557 444 225</a></dd><dt>Website</dt><dd>kyrgyzstan360.com</dd><dt>Last updated</dt><dd>September 2026</dd></dl></div></article>
      <article><span>02</span><div><h2>Booking and payment</h2><p>You may pay 30% of the total tour price at booking, with the remaining 70% payable upon arrival in Kyrgyzstan before the booked tour or services begin. Alternatively, you may pay 100% of the total tour price at booking. After the required booking payment is received, Kyrgyzstan360 provides payment confirmation and a Tour Agreement or contract.</p></div></article>
      <article><span>03</span><div><h2>Cancellations and refunds</h2><p>Cancellation by the Customer at least three (3) months before the scheduled tour start date is eligible for a full refund of all amounts paid. For Cancellation by the Customer less than three (3) months before the scheduled tour start date, 30% of the total tour price is non-refundable. If Kyrgyzstan360 cancels a confirmed tour, all amounts paid are refunded in full. Applicable refunds are processed within thirty (30) calendar days. <Link href="/terms">Read the full Terms &amp; Conditions.</Link></p></div></article>
      <article><span>04</span><div><h2>Website information</h2><p>Kyrgyzstan360 presents private and adventure travel experiences in Kyrgyzstan. Tour availability, routes, accommodation and final pricing are confirmed directly with the guest before booking.</p></div></article>
      <article><span>05</span><div><h2>Intellectual property</h2><p>Unless otherwise stated, Kyrgyzstan360 branding, logo, website design, original written content and owned photographs or video may not be reproduced commercially without permission. Third-party materials remain the property of their respective rights holders.</p></div></article>
      <article><span>06</span><div><h2>Photography and media</h2><p>Photography and video may be created during tours only in line with any separate consent agreed with guests. Booking does not itself grant unrestricted commercial rights to a guest&apos;s image.</p></div></article>
    </section>
  </LegalLayout>;
}
