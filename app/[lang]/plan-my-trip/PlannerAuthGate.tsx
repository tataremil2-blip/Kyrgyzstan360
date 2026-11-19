"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase-browser";

export default function PlannerAuthGate({ locale, onReady }: { locale: "ru" | "en"; onReady: (profile: { email: string; firstName: string; lastName: string; whatsapp: string }) => void }) {
  const ru = locale === "ru";
  const [userEmail, setUserEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
    if (!userEmail) return;
    onReady({ email: userEmail, firstName: firstName.trim(), lastName: lastName.trim(), whatsapp: whatsapp.trim() });
  }

  return <div className="planner-auth-gate">
    {!userEmail ? <><h3>{ru ? "Войдите, чтобы получить PDF" : "Sign in to receive your PDF"}</h3><p>{ru ? "Маршрут уже собран. Войдите через Google — затем мы попросим имя, фамилию и WhatsApp." : "Your route is ready. Sign in with Google, then add your name and WhatsApp number."}</p><button className="planner-primary" type="button" onClick={signIn} disabled={loading}>{loading ? (ru ? "Открываем Google…" : "Opening Google…") : (ru ? "Войти через Google" : "Continue with Google")}</button></> : <form onSubmit={submit}><h3>{ru ? "Данные для PDF" : "Details for your PDF"}</h3><p>{userEmail}</p><div className="planner-auth-fields"><label>{ru ? "Имя" : "First name"}<input value={firstName} onChange={(event) => setFirstName(event.target.value)} required /></label><label>{ru ? "Фамилия" : "Last name"}<input value={lastName} onChange={(event) => setLastName(event.target.value)} required /></label><label>{ru ? "WhatsApp" : "WhatsApp"}<input type="tel" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="+996 …" required /></label></div><button className="planner-primary" type="submit">{ru ? "Продолжить к PDF" : "Continue to PDF"}</button></form>}
    {error && <p className="planner-error" role="alert">{error}</p>}
  </div>;
}
