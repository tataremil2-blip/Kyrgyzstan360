"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

export default function MobileNav({ children, className }: { children: ReactNode; className: string }) {
  const toggle = useRef<HTMLElement>(null);

  function selectLink(event: MouseEvent<HTMLDetailsElement>) {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      // Keep normal link behavior. Native hash navigation scrolls after the panel is closed.
      event.currentTarget.open = false;
    }
  }

  return (
    <details className={className} onClick={selectLink} onKeyDown={(event) => {
      if (event.key === "Escape" && event.currentTarget.open) {
        event.currentTarget.open = false;
        toggle.current?.focus();
      }
    }}>
      <summary aria-label="Open navigation" ref={toggle}>
        <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
      </summary>
      {children}
    </details>
  );
}
