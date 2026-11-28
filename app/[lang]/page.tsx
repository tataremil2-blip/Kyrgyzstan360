import Image from "next/image";
import { LocalizedAnchor } from "@/app/LocalizedLink";
import LanguageSwitcher from "@/app/LanguageSwitcher";
import { getTranslator } from "@/lib/server-translations";
import MobileNav from "./MobileNav";
import HomeNavLinks from "./HomeNavLinks";
import JourneySection from "./journeys/JourneySection";
import "./phase4-home.css";

const programs = [
  { title: "Private tour", text: "A route built around your interests.", href: "/tours/individual", image: "/individual-tour.jpg" },
  { title: "Group tour", text: "Explore Kyrgyzstan together by 4×4.", href: "/tours/group", image: "/group-tour.jpg" },
  { title: "Gear & vehicle rental", text: "Vehicles and equipment for independent travel.", href: "/rent", image: "/rent-service-camp.jpg" },
];

const activities = [
  ["Mountain hiking", "M2 19 9 6l4 7 3-5 6 11H2Zm4-7 3 1 2-3"],
  ["Horse riding & nomadic life", "M5 20c0-5 1-8 5-11L9 4l4 2 3-2 1 5 4 4-2 3-5-2-2 6M15 10h.1"],
  ["4×4 expeditions", "M2 16V9l3-3h10l4 5h3v5h-3M6 16h8M4 11h13M8 6v5M7 17a2 2 0 1 1-4 0 2 2 0 1 1 4 0Zm12 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0Z"],
  ["Silk Road culture", "M3 20h18M5 20v-9l7-7 7 7v9M9 20v-5c0-2 3-4 3-4s3 2 3 4v5"],
  ["Nature & photography", "M2 8h5l2-3h6l2 3h5v12H2V8Zm14 6a4 4 0 1 1-8 0 4 4 0 1 1 8 0Z"],
  ["Skiing & freeride", "M14 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 1 1 3 0Zm-3 3-3 5 5 2-2 4M10 10l5 2h4M17 12l2 6M3 17l14 4 4-1"],
] as const;

const countries = [
  ["KYRGYZSTAN", "Wild Mountains", "Tian Shan · Yurts · Horses · Alpine Lakes · Hiking · 4×4", "/hero-kyrgyzstan.jpg"],
  ["KAZAKHSTAN", "Epic Landscapes", "Canyons · Steppe · Lakes · Almaty · Road Trips", "/rent-service-camp.jpg"],
  ["UZBEKISTAN", "The Silk Road", "Samarkand · Bukhara · Khiva · Architecture · Food", "/guide-book-hiker-map.png"],
  ["TAJIKISTAN", "Remote Adventure", "Pamir Highway · Fann Mountains · Trekking · Expeditions", "/individual-tour.jpg"],
] as const;

export default async function Home() {
  const translate = await getTranslator();
  const cta = translate("Build Your Adventure");
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
        <ul className="activity-list">{activities.map(([label, path]) => <li key={label}>
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d={path} /></svg><span>{translate(label)}</span>
        </li>)}</ul>
      </section>
      <section className="p4-section desktop-geography">
        <h2>{translate("Four countries. One incredible region.")}</h2>
        <div className="p4-countries">{countries.map(([country, title, text, image]) => <LocalizedAnchor href="/plan-your-trip" key={country}>
          <Image src={image} fill sizes="25vw" alt="" /><div><small>{translate(country)}</small><h3>{translate(title)}</h3><p>{translate(text)}</p></div>
        </LocalizedAnchor>)}</div>
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
      <section className="emil-home-story" id="emil">
        <div><h2 id="why-local">{translate("Meet Emil")}</h2>
          <p>{translate("I used to spend my days in the city, running businesses. Then the mountains pulled me in.")}</p>
          <p>{translate("Today I travel the roads of Central Asia and share the places I love with the people who come here.")}</p>
          <LocalizedAnchor href="/about-emil">{translate("My story")} →</LocalizedAnchor>
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
          <div className="p4-footer-column p4-footer-contact"><p className="p4-footer-label">{translate("CONTACT")}</p><p>{translate("Emil Zakirov")}</p><p>{translate("Bishkek, Kyrgyzstan")}</p><p>{translate("WhatsApp: +996 557 444 225")}</p><LocalizedAnchor href="https://www.instagram.com/kyrgyzstan_360_adventures/" target="_blank" rel="noreferrer">Kyrgyzstan360 Instagram ↗</LocalizedAnchor><LocalizedAnchor href="https://www.instagram.com/zakirov_emil_trvl/" target="_blank" rel="noreferrer">{translate("Emil’s Instagram")} ↗</LocalizedAnchor></div>
        </div>
        <div className="p4-footer-bottom"><span>© {new Date().getFullYear()} Kyrgyzstan360</span><span>{translate("All rights reserved.")}</span><LocalizedAnchor href="/cookies">{translate("Cookie settings")}</LocalizedAnchor></div>
      </footer>
    </div>
  </main>;
}
