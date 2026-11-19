"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Widget = {
  render: (node: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function Turnstile({ locale, reset, onToken }: {
  locale: "en" | "ru"; reset: number; onToken: (token: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const widget = (window as Window & { turnstile?: Widget }).turnstile;
    if (!ready || !widget || !host.current || !siteKey) return;
    const id = widget.render(host.current, {
      sitekey: siteKey, action: "trip_request", language: locale, size: "flexible",
      callback: onToken, "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
    });
    return () => { widget.remove(id); onToken(""); };
  }, [locale, onToken, ready, reset]);
  if (!siteKey || failed) return <p role="alert">{locale === "ru" ? "Проверка формы временно недоступна." : "Form verification is temporarily unavailable."}</p>;
  return <>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      onReady={() => setReady(true)} onError={() => setFailed(true)} />
    <div ref={host} />
  </>;
}
