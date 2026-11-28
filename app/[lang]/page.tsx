import Image from "next/image";
import { LocalizedAnchor } from "@/app/LocalizedLink";
import LanguageSwitcher from "@/app/LanguageSwitcher";
import { getTranslator } from "@/lib/server-translations";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import MobileNav from "./MobileNav";
import HomeNavLinks from "./HomeNavLinks";
import JourneySection from "./journeys/JourneySection";
import { activities, activityContent, type ActivityIcon } from "@/lib/activities";
import "./phase4-home.css";

const programs = [
  { title: "Private tour", text: "A route built around your interests.", href: "/tours/individual", image: "/individual-tour.jpg" },
  { title: "Group tour", text: "Explore Kyrgyzstan together by 4×4.", href: "/tours/group", image: "/group-tour.jpg" },
  { title: "Gear & vehicle rental", text: "Vehicles and equipment for independent travel.", href: "/rent", image: "/rent-service-camp.jpg" },
];

function ExperienceIcon({ kind }: { kind: ActivityIcon }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "mountain") return <svg aria-hidden="true" viewBox="0 0 24 24" {...common}><path d="m3 19 6-10 3 5 3-7 6 12" /><path d="M3 19h18" /></svg>;
  if (kind === "horse") return <svg aria-hidden="true" viewBox="0 0 24 24" {...common}><path d="M5 17V9l5-3 4 2 3-1 2 4-3 2v4" /><path d="M8 17v2m7-2v2M9 9l-2-2" /></svg>;
  if (kind === "jeep") return <svg aria-hidden="true" viewBox="0 0 24 24" {...common}><path d="M3 16v-5l2-4h10l3 4h3v5M5 16h14M7 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm14 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7 11h7" /></svg>;
  if (kind === "silk-road") return <svg aria-hidden="true" viewBox="0 0 24 24" {...common}><path d="M4 19 10 5l4 8 3-5 3 11M3 19h18" /><path d="M10 5 7 3" /></svg>;
  if (kind === "camera") return <svg aria-hidden="true" viewBox="0 0 24 24" {...common}><path d="M4 8h4l2-2h4l2 2h4v10H4z" /><circle cx="12" cy="13" r="3" /></svg>;
  if (kind === "snow") return <svg aria-hidden="true" viewBox="0 0 24 24" {...common}><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" /></svg>;
  if (kind === "water") return <svg aria-hidden="true" viewBox="0 0 24 24" {...common}><path d="M3 15c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0M3 19c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" {...common}><path d="M3 13c5-1 7-5 9-9 1 4 3 6 9 8-4 1-7 4-9 8-2-3-5-5-9-7Z" /><circle cx="15.5" cy="10" r=".7" fill="currentColor" stroke="none" /></svg>;
}

function InstagramIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" /><circle cx="17.4" cy="6.6" r="1" fill="currentColor" /></svg>; }

export default async function Home({ params }: PageProps<"/[lang]">) {
  const translate = await getTranslator();
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const cta = translate("Build Your Adventure");
  const story = lang === "ru" ? {
    title: "Почему путешествуют с нами", kicker: "ПОЧЕМУ ПУТЕШЕСТВУЮТ С НАМИ", link: "Моя история", instagram: "Instagram Kyrgyzstan360", emilInstagram: "Instagram Эмиля",
    paragraphs: ["Я Эмиль — гид и организатор путешествий по Центральной Азии. Я сам езжу по этим маршрутам и работаю с опытными местными гидами, которых знаю лично.", "Расскажите, что вам интересно. Я подберу гида и программу под ваши пожелания, темп и бюджет. В зависимости от поездки с вами поеду я или один из ребят, с которыми мы уже работали и путешествовали вместе.", "Вы общаетесь напрямую с нашей местной командой. До бронирования мы согласуем маршрут, стоимость и то, что в неё входит."],
  } : {
    title: "Why travel with us", kicker: "WHY TRAVEL WITH US", link: "My story", instagram: "Kyrgyzstan360 Instagram", emilInstagram: "Emil’s Instagram",
    paragraphs: ["I’m Emil, a guide and trip organizer from Kyrgyzstan. I travel across Central Asia myself and work with experienced local guides I know personally.", "Tell us what you have in mind. I’ll help choose the right guide and shape the trip around your interests, pace and budget. Depending on the journey, you’ll travel with me or one of the guides I’ve worked and travelled with.", "You’ll speak directly with the local team organizing your trip. Before you book, we’ll agree on the itinerary, the price and what’s included."],
  };
  return <main className="phase4-page">
    <div className="phase4-home">
      <header className="p4-header">
        <a className="p4-brand" href="#p4-top">KYRGYZSTAN360</a>
        <nav aria-label={translate("Primary navigation")}><HomeNavLinks onHomepage /><LanguageSwitcher inline /></nav>
        <div><LocalizedAnchor className="p4-button" href="/plan-your-trip" data-build-adventure>{cta}</LocalizedAnchor></div>
        <MobileNav className="p4-mobile-menu">
          <div><nav aria-label={translate("Mobile navigation")}>
            <HomeNavLinks onHomepage /><LanguageSwitcher inline />
            <LocalizedAnchor className="p4-button" href="/plan-your-trip" data-build-adventure>{cta}</LocalizedAnchor>
          </nav></div>
        </MobileNav>
      </header>
      <section className="p4-hero" id="p4-top">
        <Image src="/individual-tour.jpg" fill priority sizes="100vw" alt={translate("Travelers beside a mountain lake")} />
        <div className="p4-hero-copy">
          <p id="countries">{["Kyrgyzstan", "Kazakhstan", "Uzbekistan", "Tajikistan"].map(place => translate(place)).join(" · ")}</p>
          <h1>{translate("Your Central Asia adventure")}</h1>
          <span id="how-it-works">{translate("We’ll help you find a local guide and plan your trip.")}</span>
          <LocalizedAnchor className="p4-button" href="/plan-your-trip" data-build-adventure>{cta}</LocalizedAnchor>
        </div>
      </section>
      <section className="p4-section" id="styles">
        <h2>{translate("What you can experience")}</h2>
        <ul className="activity-list">{activities.map((activity) => {
          const copy = activityContent(activity, lang);
          return <li key={activity.slug}><LocalizedAnchor href={`/experiences/${activity.slug}`}><ExperienceIcon kind={activity.icon} /><span>{copy.title}</span></LocalizedAnchor></li>;
        })}</ul>
      </section>
      <section className="p4-section" id="trips">
        <h2 id="explore">{translate("Most popular travel programs")}</h2>
        <div className="program-grid">{programs.map(program => <article key={program.href}>
          <div className="program-photo"><Image src={program.image} fill sizes="(max-width:760px) 100px, 32vw" alt="" /></div>
          <div className="program-copy"><h3>{translate(program.title)}</h3><p>{translate(program.text)}</p>
            <LocalizedAnchor href={program.href}>{translate(program.href === "/rent" ? "View options" : "View trip")} →</LocalizedAnchor>
          </div>
        </article>)}</div>
      </section>
      <JourneySection />
      <section className="emil-home-story" id="why-travel-with-us">
        <div><p className="p4-kicker">{story.kicker}</p><h2>{story.title}</h2>
          {story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <LocalizedAnchor href="/about-emil">{story.link} →</LocalizedAnchor>
        </div>
        <Image src="/founder-kyrgyzstan.jpg" width={900} height={700} sizes="(max-width:760px) 90vw, 40vw" alt={translate("Emil in Kyrgyzstan")} />
      </section>
      <footer className="p4-footer" id="contact">
        <div className="p4-footer-grid">
          <div className="p4-footer-brand">
            <LocalizedAnchor className="p4-brand" href="#p4-top">KYRGYZSTAN360</LocalizedAnchor>
            <p>{translate("Adventure begins where the road ends.")}</p>
            <LocalizedAnchor className="p4-footer-email" href="mailto:tataremil2@gmail.com">tataremil2@gmail.com</LocalizedAnchor>
          </div>
          <div className="p4-footer-column"><p className="p4-footer-label">{translate("Explore the site")}</p><LocalizedAnchor href="/journeys">{translate("Journeys")}</LocalizedAnchor><LocalizedAnchor href="/about-emil">{translate("About Emil")}</LocalizedAnchor><LocalizedAnchor href="/plan-your-trip">{translate("Build Your Adventure")}</LocalizedAnchor></div>
          <div className="p4-footer-column"><p className="p4-footer-label">{translate("LEGAL")}</p><LocalizedAnchor href="/legal">{translate("Legal Information")}</LocalizedAnchor><LocalizedAnchor href="/terms">{translate("Terms & Conditions")}</LocalizedAnchor><LocalizedAnchor href="/privacy">{translate("Privacy Policy")}</LocalizedAnchor><LocalizedAnchor href="/cookies">{translate("Cookie Policy")}</LocalizedAnchor></div>
          <div className="p4-footer-column p4-footer-contact"><p className="p4-footer-label">{translate("CONTACT")}</p><p>{translate("Emil Zakirov")}</p><p>{translate("Bishkek, Kyrgyzstan")}</p><p>{translate("WhatsApp: +996 557 444 225")}</p><LocalizedAnchor className="p4-instagram-link" href="https://www.instagram.com/kyrgyzstan_360_adventures/" target="_blank" rel="noreferrer"><InstagramIcon /><span>{story.instagram}</span></LocalizedAnchor><LocalizedAnchor className="p4-instagram-link" href="https://www.instagram.com/zakirov_emil_trvl/" target="_blank" rel="noreferrer"><InstagramIcon /><span>{story.emilInstagram}</span></LocalizedAnchor></div>
        </div>
        <div className="p4-footer-bottom"><span>© {new Date().getFullYear()} Kyrgyzstan360</span><span>{translate("All rights reserved.")}</span><LocalizedAnchor href="/cookies">{translate("Cookie settings")}</LocalizedAnchor></div>
      </footer>
    </div>
  </main>;
}
