import LegalLayout from "../legal/LegalLayout";

const sections = [
  ["Who we are", "Kyrgyzstan360 is operated by Emil Zakirov in Bishkek, Kyrgyz Republic. For privacy questions, contact tataremil2@gmail.com."],
  ["Information we collect", "Inquiry forms may collect your first name, last name, email address and WhatsApp or telephone number. Booking-related forms may also collect information you choose to provide for planning your request."],
  ["Why we collect information", "We use this information to respond to inquiries, provide requested tour information, communicate about potential bookings, prepare requested itineraries or proposals, manage confirmed bookings and provide customer support."],
  ["Inquiry and booking forms", "Submitting an inquiry does not automatically subscribe you to marketing emails. We use form information for the inquiry or booking-related purpose for which you provide it."],
  ["How information is processed", "Information is processed by Kyrgyzstan360 to manage communications and requested travel services. Access is limited to what is reasonably needed for those purposes."],
  ["Service providers", "The website uses Resend to deliver inquiry and review emails to Kyrgyzstan360. Resend processes the information required to deliver those messages."],
  ["Cookies and technical information", "The website uses local browser storage to remember cookie consent and Winter promotional preferences. See the Cookie Policy for details."],
  ["Data retention", "Information is retained only for as long as reasonably necessary to respond to your inquiry, manage requested or confirmed services, meet applicable obligations or resolve related questions."],
  ["International data processing", "Using website forms and third-party services may involve processing outside your country. We use providers only where reasonably necessary to operate the website and respond to your request."],
  ["Your privacy rights", "You may contact us to ask about the personal information we hold about you or to request correction or deletion where applicable."],
  ["Data security", "We use reasonable measures to protect information, but no online transmission or storage method can be guaranteed completely secure."],
  ["Changes to this policy", "This policy may be updated when the website, services or applicable requirements change. The latest version is published on this page."],
  ["Contact", "Contact Emil Zakirov / Kyrgyzstan360 at tataremil2@gmail.com for privacy questions."],
] as const;

export default function PrivacyPage() { return <LegalLayout eyebrow="KYRGYZSTAN360 · LEGAL" title="Privacy" accent="policy." intro="How Kyrgyzstan360 handles the information you provide when contacting us."><section className="legal-content legal-document">{sections.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}</section></LegalLayout>; }
