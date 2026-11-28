"use client";

import { useEffect, useRef, useState } from "react";

type Widget = {
  render: (node: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const scriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptLoad: Promise<Widget> | undefined;

function getWidget() {
  return (window as Window & { turnstile?: Widget }).turnstile;
}

function loadWidget() {
  const widget = getWidget();
  if (widget) return Promise.resolve(widget);

  scriptLoad ??= new Promise<Widget>((resolve, reject) => {
    const script = document.createElement("script");
    function fail() {
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      script.remove();
      reject(new Error("Turnstile script unavailable"));
    }
    const timeout = window.setTimeout(fail, 12_000);
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      const loaded = getWidget();
      if (!loaded) return fail();
      window.clearTimeout(timeout);
      resolve(loaded);
    };
    script.onerror = fail;
    document.head.append(script);
  }).catch((error: unknown) => {
    scriptLoad = undefined;
    throw error;
  });
  return scriptLoad;
}

const copy = {
  en: {
    unavailable: "Form verification is temporarily unavailable.",
    expired: "Verification expired. Please verify again.",
    retry: "Retry verification",
  },
  ru: {
    unavailable: "Проверка формы временно недоступна.",
    expired: "Срок проверки истёк. Пройдите её ещё раз.",
    retry: "Повторить проверку",
  },
};
type Failure = "unavailable" | "expired";

export default function Turnstile({ locale, reset, onToken }: {
  locale: "en" | "ru"; reset: number; onToken: (token: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [failure, setFailure] = useState<{ reset: number; reason: Failure } | null>(null);
  useEffect(() => {
    const node = host.current;
    if (!node || !siteKey) return;
    let active = true;
    let widget: Widget | undefined;
    let widgetId: string | undefined;
    let size: "compact" | "flexible" | undefined;
    let generation = 0;

    function reportFailure(reason: Failure) {
      if (!active) return;
      onToken("");
      setFailure({ reset, reason });
    }

    function renderWidget() {
      if (!active || !widget || node?.hidden || !node?.clientWidth) return;
      const nextSize = node.clientWidth < 300 ? "compact" : "flexible";
      if (size === nextSize) return;
      size = nextSize;

      // Switching layout replaces the widget. Only its current instance may update the form token.
      const instance = ++generation;
      if (widgetId !== undefined) {
        widget.remove(widgetId);
        widgetId = undefined;
        onToken("");
      }
      const fail = (reason: Failure) => {
        if (instance === generation) reportFailure(reason);
      };

      try {
        widgetId = widget.render(node, {
          sitekey: siteKey,
          action: "trip_request",
          language: locale,
          size,
          retry: "never",
          "refresh-expired": "never",
          "refresh-timeout": "never",
          callback: (token: string) => {
            if (!active || instance !== generation) return;
            setFailure(null);
            onToken(token);
          },
          "expired-callback": () => fail("expired"),
          "timeout-callback": () => fail("expired"),
          "error-callback": () => fail("unavailable"),
        });
      } catch {
        fail("unavailable");
      }
    }

    const observer = new ResizeObserver(renderWidget);
    observer.observe(node);

    void loadWidget().then((loaded) => {
      widget = loaded;
      renderWidget();
    }).catch(() => reportFailure("unavailable"));

    return () => {
      active = false;
      observer.disconnect();
      if (widgetId !== undefined) widget?.remove(widgetId);
    };
  }, [attempt, locale, onToken, reset]);

  const text = copy[locale];
  const problem = failure?.reset === reset ? failure.reason : null;
  if (!siteKey) return <p role="alert">{text.unavailable}</p>;
  return <>
    <div ref={host} hidden={problem !== null} />
    {problem && <div className="trip-verification-error">
      <p role="alert">{text[problem]}</p>
      <button type="button" onClick={() => {
        setFailure(null);
        setAttempt((previous) => previous + 1);
      }}>{text.retry}</button>
    </div>}
  </>;
}
