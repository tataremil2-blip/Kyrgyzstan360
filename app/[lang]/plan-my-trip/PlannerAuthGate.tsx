"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase-browser";

export default function PlannerAuthGate({ locale, onReady }: { locale: "ru" | "en"; onReady: (profile: { email: string; firstName: string; lastName: string; whatsapp: string }) => void }) {
  const ru = locale === "ru";
  const [userEmail, setUserEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? ""));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user.email ?? ""));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn() {
    if (!supabase) { setError(ru ? "Авторизация пока не настроена на этом окружении." : "Authentication is not configured in this environment yet."); return; }
    setLoading(true); setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
    if (authError) { setError(authError.message); setLoading(false); }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const email = userEmail.trim();
    if (!email) return;
    onReady({ email, firstName: firstName.trim(), lastName: "", whatsapp: whatsapp.trim() });
  }

  return <div className="planner-auth-gate">
    <form onSubmit={submit}><h3>{ru ? "Зарегистрируйтесь для получения маршрута" : "Register to receive your route"}</h3><p>{ru ? "Оставьте имя, email и WhatsApp — мы отправим PDF и передадим ваш запрос местным гидам." : "Leave your name, email and WhatsApp — we’ll send the PDF and share your request with local guides."}</p><div className="planner-auth-fields"><label>{ru ? "Имя" : "First name"}<input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" required /></label><label>{ru ? "Email" : "Email"}<input type="email" value={userEmail} onChange={(event) => setUserEmail(event.target.value)} autoComplete="email" required /></label><label>{ru ? "WhatsApp номер" : "WhatsApp number"}<input type="tel" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="+996 …" autoComplete="tel" required /></label></div><button className="planner-primary" type="submit">{ru ? "Получить маршрут и предложения" : "Get my route and offers"}</button></form>
    <div className="planner-auth-divider"><span>{ru ? "или" : "or"}</span></div><button className="planner-primary" type="button" onClick={signIn} disabled={loading}>{loading ? (ru ? "Открываем Google…" : "Opening Google…") : (ru ? "Зарегистрироваться через Google" : "Sign up with Google")}</button>
    {error && <p className="planner-error" role="alert">{error}</p>}
  </div>;
}
