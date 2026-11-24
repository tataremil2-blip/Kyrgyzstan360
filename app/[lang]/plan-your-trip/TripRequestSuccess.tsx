import Link from "next/link";
import { useEffect, useRef } from "react";

const copy = {
  en: {
    received: "Request received",
    title: "Your adventure starts here!",
    confirmation: "We've received your request and will get back to you by email.",
    accountHeading: "Want to keep track of your trip?",
    accountDescription: "Create a traveler account with the same email to view your request and follow the planning process.",
    create: "Create my account",
    existing: "Already have an account?",
    signIn: "Sign in",
    continue: "Continue without an account",
  },
  ru: {
    received: "Заявка получена",
    title: "Ваше приключение начинается здесь!",
    confirmation: "Мы получили вашу заявку и свяжемся с вами по электронной почте.",
    accountHeading: "Хотите следить за планированием поездки?",
    accountDescription: "Создайте аккаунт с тем же адресом электронной почты, чтобы открыть заявку и следить за её статусом.",
    create: "Создать аккаунт",
    existing: "Уже есть аккаунт?",
    signIn: "Войти",
    continue: "Продолжить без аккаунта",
  },
};

export default function TripRequestSuccess({ locale, reference }: { locale: "en" | "ru"; reference: string }) {
  const text = copy[locale];
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  return <section className="trip-form-shell trip-success" id="trip-form" aria-labelledby="trip-success-heading">
    <p className="trip-success-kicker">{text.received} · {reference}</p>
    <h2 id="trip-success-heading" ref={heading} tabIndex={-1}>{text.title}</h2>
    <p>{text.confirmation}</p>
    <div className="trip-success-account">
      <h3>{text.accountHeading}</h3>
      <p>{text.accountDescription}</p>
      <Link className="trip-success-primary" href="/account/register">{text.create} <span aria-hidden="true">→</span></Link>
      <p className="trip-success-sign-in">{text.existing} <Link href="/account" prefetch={false}>{text.signIn}</Link></p>
    </div>
    <Link className="trip-success-continue" href={`/${locale}`}>{text.continue}</Link>
  </section>;
}
