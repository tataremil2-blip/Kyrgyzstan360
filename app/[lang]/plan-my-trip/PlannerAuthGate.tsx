"use client";

import { useState, type FormEvent } from "react";

export default function PlannerAuthGate({ locale, onReady }: { locale: "ru" | "en"; onReady: (profile: { email: string; firstName: string; lastName: string; whatsapp: string }) => void }) {
  const ru = locale === "ru";
  const [userEmail, setUserEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const email = userEmail.trim();
    if (!email) return;
    onReady({ email, firstName: firstName.trim(), lastName: "", whatsapp: whatsapp.trim() });
  }

  return <div className="planner-auth-gate">
    <form onSubmit={submit}><h3>{ru ? "Зарегистрируйтесь для получения маршрута" : "Register to receive your route"}</h3><p>{ru ? "Оставьте имя, email и WhatsApp — мы отправим PDF и передадим ваш запрос местным гидам." : "Leave your name, email and WhatsApp — we’ll send the PDF and share your request with local guides."}</p><div className="planner-auth-fields"><label>{ru ? "Имя" : "First name"}<input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" required /></label><label>{ru ? "Email" : "Email"}<input type="email" value={userEmail} onChange={(event) => setUserEmail(event.target.value)} autoComplete="email" required /></label><label>{ru ? "WhatsApp номер" : "WhatsApp number"}<input type="tel" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="+996 …" autoComplete="tel" required /></label></div><button className="planner-primary" type="submit">{ru ? "Получить маршрут и предложения" : "Get my route and offers"}</button></form>
  </div>;
}
