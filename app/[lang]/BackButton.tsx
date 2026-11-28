"use client";

import { useLocale } from "@/app/LocaleProvider";
import { stripLocale } from "@/lib/i18n";
import Link from "@/app/LocalizedLink";
import { usePathname } from "next/navigation";
import "./back-button.css";

export default function BackButton() {
  const pathname = stripLocale(usePathname());
  const { dictionary } = useLocale();

  if (pathname === "/" || pathname === "/plan-your-trip") return null;

  return (
    <Link className="back-button" href="/" aria-label={dictionary.home}>
      <span aria-hidden="true">←</span>
      {dictionary.back}
    </Link>
  );
}
