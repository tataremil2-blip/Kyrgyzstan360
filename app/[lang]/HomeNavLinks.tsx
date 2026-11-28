"use client";

import { LocalizedAnchor } from "@/app/LocalizedLink";
import { useTranslator } from "@/app/LocaleProvider";

const sections = [
  ["Activities", "styles"],
  ["Travel programs", "trips"],
  ["Travel stories", "journeys"],
  ["Meet Emil", "emil"],
] as const;

export default function HomeNavLinks({ onHomepage = false }: { onHomepage?: boolean }) {
  const t = useTranslator();
  return sections.map(([label, id]) => (
    <LocalizedAnchor key={id} href={`${onHomepage ? "" : "/"}#${id}`}>{t(label)}</LocalizedAnchor>
  ));
}
