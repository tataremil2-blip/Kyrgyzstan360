import LegalLayout from "../legal/LegalLayout";

const sections = [
  ["About Kyrgyzstan360", "Kyrgyzstan360 provides private and adventure travel experiences primarily in Kyrgyzstan. Depending on the chosen trip, these may include private road trips, 4×4 expeditions, trekking, horseback riding, skiing and freeriding, snowcat-assisted freeriding, winter expeditions, cultural experiences and remote mountain travel."],
  ["Booking and payment options", "When booking a tour, you may choose either to pay 30% of the total tour price at booking and the remaining 70% upon arrival in Kyrgyzstan before the booked tour or services begin, or to pay 100% of the total tour price at booking."],
  ["Booking confirmation", "Once the required booking payment has been successfully received, Kyrgyzstan360 provides a payment receipt or payment confirmation and a Tour Agreement or contract. For the 30% deposit option, the booking is confirmed after the 30% deposit has been successfully received and the booking confirmation process is completed. The remaining 70% is payable upon arrival in Kyrgyzstan before the booked tour or services begin."],
  ["Cancellation by the Customer", "Cancellations made at least three (3) months before the scheduled tour start date are eligible for a full refund of all amounts paid for the tour. The refund will be processed within thirty (30) calendar days from confirmation of the cancellation. This means that a 30% deposit is fully refundable, and a 100% payment is fully refundable."],
  ["Cancellation by the Customer less than 3 months before tour start", "For cancellations made less than three (3) months before the scheduled tour start date, 30% of the total tour price is non-refundable. If only the 30% deposit was paid, it is retained and no remaining 70% balance is due. If the tour was paid in full, Kyrgyzstan360 retains 30% of the total tour price and refunds the remaining 70% within thirty (30) calendar days from confirmation of the cancellation."],
  ["Cancellation by Kyrgyzstan360", "If Kyrgyzstan360 cancels a confirmed tour, all amounts paid by the customer to Kyrgyzstan360 for that tour will be refunded in full. The refund will be processed within thirty (30) calendar days from the date the customer is notified of the cancellation. This applies whether the customer paid a 30% deposit or 100% of the total tour price."],
  ["Refund processing", "All refunds due under these Terms & Conditions are processed by Kyrgyzstan360 within thirty (30) calendar days from the applicable cancellation confirmation or cancellation notification. Bank, card or payment-provider settlement times may vary."],
  ["Changes to itineraries", "Itineraries may need to change where needed for safety, practical operations or the conditions described below. We will communicate material changes where reasonably possible."],
  ["Weather, snow and road conditions", "Mountain travel can involve rapidly changing weather, snowfall, avalanche conditions, road closures, border or permit restrictions, local authority restrictions, mechanical or transport issues and other circumstances outside reasonable control. Safety takes priority over following an original itinerary exactly."],
  ["Adventure travel and inherent risks", "Chosen activities may take place in mountains, at high altitude, in snow, on skis or snowboards, on foot, on horseback, off-road and in remote regions. Guests should consider their experience, fitness and the requirements communicated for their selected trip."],
  ["Travel insurance", "Guests should arrange appropriate travel insurance and ensure it covers the activities included in their chosen trip where applicable. Kyrgyzstan360 does not state that travel insurance is included unless confirmed for a specific booking."],
  ["Guest responsibilities", "Guests are responsible for providing accurate information relevant to planning their trip and for following reasonable safety guidance from guides and local operators."],
  ["Documents, visas and permits", "Guests are responsible for the travel documents, visas and personal permissions required for their journey, unless specific support is confirmed in writing."],
  ["Force majeure", "Events outside reasonable control may affect travel plans. Where this occurs, Kyrgyzstan360 will work with guests on practical next steps in line with the confirmed booking terms."],
  ["Photography and media", "Any photography or media arrangements are handled separately and do not grant unrestricted commercial image rights through booking alone."],
  ["Intellectual property", "Original Kyrgyzstan360 materials may not be reproduced commercially without permission. Third-party materials remain with their respective rights holders."],
  ["Website information", "Website information is provided for general guidance and may change. Confirmed booking information takes priority."],
  ["Governing law", "Kyrgyzstan360 is based in Bishkek, Kyrgyz Republic. This page does not create additional court-jurisdiction terms beyond the terms confirmed for an individual booking."],
  ["Contact", "For questions about these terms, contact Emil Zakirov / Kyrgyzstan360 using the contact details below."],
] as const;

export default function TermsPage() {
  return <LegalLayout eyebrow="KYRGYZSTAN360 · LEGAL" title="Terms &" accent="conditions." intro="Clear booking, payment and cancellation information for travelling with Kyrgyzstan360.">
    <section className="policy-summary" aria-labelledby="booking-summary-title">
      <div><p>BOOKING YOUR TRIP</p><h2 id="booking-summary-title">Simple payment<br /><em>options.</em></h2></div>
      <div className="policy-summary-items"><article><strong>30%</strong><span>Deposit at booking</span><small>70% payable upon arrival in Kyrgyzstan before the tour begins.</small></article><b>OR</b><article><strong>100%</strong><span>Pay the full tour price at booking</span><small>Choose full payment when booking your tour.</small></article></div>
    </section>
    <section className="legal-content legal-document">
      {sections.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}
    </section>
    <section className="policy-summary policy-summary-refunds" aria-labelledby="refund-summary-title">
      <div><p>CANCELLATION &amp; REFUNDS</p><h2 id="refund-summary-title">Clear terms.<br /><em>Clear next steps.</em></h2></div>
      <div className="policy-summary-items"><article><strong>3+ MONTHS</strong><span>Cancellation by the Customer</span><small>100% of amounts paid are refundable.</small></article><article><strong>LESS THAN 3 MONTHS</strong><span>Cancellation by the Customer</span><small>30% of the total tour price is non-refundable. If paid in full, the remaining 70% is refunded within 30 calendar days.</small></article><article><strong>100%</strong><span>Cancellation by Kyrgyzstan360</span><small>All amounts paid are refunded within 30 calendar days.</small></article></div>
    </section>
  </LegalLayout>;
}
