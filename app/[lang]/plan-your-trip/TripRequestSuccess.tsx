import Link from "next/link";
import { useEffect, useRef } from "react";

export default function TripRequestSuccess({ locale, reference }: { locale: "en" | "ru"; reference: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const ru = locale === "ru";
  return <section className="trip-form-shell trip-success" id="trip-form" aria-labelledby="trip-success-heading">
    <p className="trip-success-kicker">{ru ? "Заявка отправлена" : "Request sent"} · {reference}</p>
    <h2 id="trip-success-heading" ref={heading} tabIndex={-1}>{ru ? "Ваше приключение начинается здесь!" : "Your adventure starts here!"}</h2>
    <p>{ru ? "Заявка принята для отправки Эмилю. Ответ придёт на указанную вами электронную почту." : "Your enquiry has been accepted for email delivery to Emil. We'll reply to the email address you provided."}</p>
    <p>{ru ? "Повторно отправлять заявку не нужно." : "You don't need to send it again."}</p>
    <Link className="trip-success-continue" href={`/${locale}`}>{ru ? "На главную" : "Back to the homepage"} →</Link>
  </section>;
}
