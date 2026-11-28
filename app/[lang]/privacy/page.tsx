import { getTranslator } from "@/lib/server-translations";
import LegalLayout from "../legal/LegalLayout";

const sections = [
  ["Who we are", "Kyrgyzstan360 is operated by Emil Zakirov in Bishkek, Kyrgyz Republic. For privacy questions, contact tataremil2@gmail.com."],
  ["Information we collect", "Inquiry forms may collect your first name, last name, email address and WhatsApp or telephone number. Booking-related forms may also collect information you choose to provide for planning your request."],
  ["Why we collect information", "We use this information to respond to inquiries, provide requested tour information, communicate about potential bookings, prepare requested itineraries or proposals, manage confirmed bookings and provide customer support."],
  ["Inquiry and booking forms", "Submitting an inquiry does not automatically subscribe you to marketing emails. We use form information for the inquiry or booking-related purpose for which you provide it."],
  ["How information is processed", "Information is processed by Kyrgyzstan360 to manage communications and requested travel services. Access is limited to what is reasonably needed for those purposes."],
  ["Service providers", "The website uses Resend to deliver travel inquiries to Kyrgyzstan360. Resend processes the information required to deliver those messages."],
  ["Cookies and technical information", "The website uses local browser storage to remember cookie consent and Winter promotional preferences, and a cookie to remember your language. See the Cookie Policy for details."],
  ["Data retention", "Information is retained only for as long as reasonably necessary to respond to your inquiry, manage requested or confirmed services, meet applicable obligations or resolve related questions."],
  ["International data processing", "Using website forms and third-party services may involve processing outside your country. We use providers only where reasonably necessary to operate the website and respond to your request."],
  ["Your privacy rights", "You may contact us to ask about the personal information we hold about you or to request correction or deletion where applicable."],
  ["Data security", "We use reasonable measures to protect information, but no online transmission or storage method can be guaranteed completely secure."],
  ["Changes to this policy", "This policy may be updated when the website, services or applicable requirements change. The latest version is published on this page."],
  ["Contact", "Contact Emil Zakirov / Kyrgyzstan360 at tataremil2@gmail.com for privacy questions."],
] as const;

const analyticsPolicy = {
  en: ["Optional analytics", "If you opt in, Google Analytics 4 helps us understand visits and accepted requests. You can also independently opt in to ad attribution using Google click identifiers. Names, email addresses, phone numbers and request text are never sent to Analytics. You can change your choice in the Cookie Policy."],
  ru: ["Необязательная аналитика", "С вашего согласия Google Analytics 4 помогает учитывать посещения и принятые заявки. Отдельно можно разрешить учёт переходов из рекламы по идентификаторам клика Google. Имя, email, телефон и текст заявки не передаются в аналитику. Изменить решение можно в политике cookies."],
} as const;

const requestPolicy = {
  en: ["Travel requests", "Travel requests are sent to our operator by email using Resend. Cloudflare Turnstile helps protect the form from automated abuse."],
  ru: ["Заявки на путешествия", "Мы отправляем заявки оператору по электронной почте через Resend. Cloudflare Turnstile защищает форму от автоматических отправок."],
} as const;

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const translate = await getTranslator(); const locale = (await params).lang === "ru" ? "ru" : "en"; const [requestTitle, requestBody] = requestPolicy[locale]; const [analyticsTitle, analyticsBody] = analyticsPolicy[locale]; return <LegalLayout eyebrow={translate("KYRGYZSTAN360 · LEGAL")} title={translate("Privacy")} accent={translate("")} intro={translate("How Kyrgyzstan360 handles the information you provide when contacting us.")}><section className="legal-content legal-document">{translate(sections.map(([title, body], index) => <article key={title}><span>{translate(String(index + 1).padStart(2, "0"))}</span><div><h2>{translate(title)}</h2><p>{translate(body)}</p></div></article>))}<article><div><h2>{requestTitle}</h2><p>{requestBody}</p></div></article><article><div><h2>{analyticsTitle}</h2><p>{analyticsBody}</p></div></article></section></LegalLayout>; }
