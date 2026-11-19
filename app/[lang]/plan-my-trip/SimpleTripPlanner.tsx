"use client";

import Link from "@/app/LocalizedLink";
import { useLocale } from "@/app/LocaleProvider";
import InquiryForm from "../InquiryForm";

export default function SimpleTripPlanner() {
  const { locale } = useLocale();
  const ru = locale === "ru";
  return <main className="planner-page simple-planner-page">
    <header className="planner-header"><Link className="brand" href="/">KYRGYZSTAN<span>360</span></Link><Link href="/#explore">{ru ? "Все путешествия" : "All adventures"}</Link></header>
    <div className="simple-planner-shell">
      <p className="planner-eyebrow">{ru ? "РАССКАЖИТЕ О СВОЁМ ПУТЕШЕСТВИИ" : "TELL US ABOUT YOUR JOURNEY"}</p>
      <h1>{ru ? "Соберём маршрут под вас." : "We’ll shape the journey around you."}</h1>
      <p className="simple-planner-intro">{ru ? "Напишите, каким вы видите путешествие. Гид изучит заявку, предложит маршрут и рассчитает стоимость." : "Tell us what you have in mind. A local guide will review your request, suggest a route and prepare a price."}</p>
      <InquiryForm compact tour="Custom trip planner" showDescription submitLabel={ru ? "Отправить запрос" : "Send my request"} successMessage={ru ? "Заявка принята. В ближайшее время с вами свяжется гид с предложением маршрута и цены." : "Your request is received. A guide will contact you shortly with a route proposal and price."} />
      <p className="simple-planner-note">{ru ? "Заявка ни к чему вас не обязывает. После отправки мы проверим пожелания, сезонность и доступность маршрута." : "There is no obligation. After you send the request, we will check your wishes, seasonality and route availability."}</p>
    </div>
  </main>;
}
