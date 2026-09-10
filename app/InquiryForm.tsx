"use client";

import { FormEvent, useState } from "react";
import "./inquiry-form.css";

export default function InquiryForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = ["New Kyrgyzstan360 inquiry", "", `Name: ${form.get("name")}`, `WhatsApp: ${form.get("whatsapp")}`, `Email: ${form.get("email")}`].join("\n");
    setSent(true);
    window.location.href = `mailto:hello@kyrgyzstan360.com?subject=${encodeURIComponent("Kyrgyzstan360 inquiry")}&body=${encodeURIComponent(body)}`;
  }

  return <form className="inquiry-form inquiry-form-simple" onSubmit={handleSubmit}>
    <div className="form-grid">
      <label>Full name<input name="name" autoComplete="name" placeholder="Surname and name" required /></label>
      <label>WhatsApp number<input name="whatsapp" type="tel" autoComplete="tel" placeholder="+996 ..." required /></label>
      <label className="form-email">Your email<input name="email" type="email" autoComplete="email" placeholder="you@email.com" required /></label>
    </div>
    <div className="form-submit"><button type="submit">Send inquiry <span aria-hidden="true">{"\u2197"}</span></button><p>{sent ? "Your email app is opening with the completed inquiry." : "We will contact you shortly."}</p></div>
  </form>;
}
