"use client";

import { usePathname, useRouter } from "next/navigation";
import "./back-button.css";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") return null;

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <button className="back-button" type="button" onClick={handleBack} aria-label="Go back">
      <span aria-hidden="true">←</span>
      BACK
    </button>
  );
}
