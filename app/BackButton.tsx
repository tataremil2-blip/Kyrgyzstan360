"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./back-button.css";

export default function BackButton() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <Link className="back-button" href="/" aria-label="Back to homepage">
      <span aria-hidden="true">←</span>
      BACK
    </Link>
  );
}
