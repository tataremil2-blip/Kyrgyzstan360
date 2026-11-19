"use client";
import { useTranslator } from "@/app/LocaleProvider";

import { LocalizedAnchor } from "@/app/LocalizedLink";


import { useLocale } from "@/app/LocaleProvider";
import { stripLocale } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import { useState } from "react";
import QuickInquiryModal from "./QuickInquiryModal";
import "./book-trip-button.css";

export default function BookTripButton() {
  const translate = useTranslator();
  const pathname = stripLocale(usePathname());
  const { dictionary } = useLocale();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  if (pathname === "/guide-book") {
    return <LocalizedAnchor className="book-trip-button book-trip-guide-button" href="#purchase">{translate(dictionary.guide)}</LocalizedAnchor>;
  }

  const isWinterPage = pathname === "/winter-freeride";
  const source = isWinterPage ? "Winter Freeride" : "Website inquiry";
  const emailSubject = isWinterPage ? "[Kyrgyzstan360] Winter Freeride — Get More Info" : "[Kyrgyzstan360] Website — Get More Info";

  return <>
    <button className="book-trip-button" type="button" onClick={() => setIsInquiryOpen(true)}>{translate(dictionary.info)}</button>
    {translate(isInquiryOpen && <QuickInquiryModal source={source} page={pathname} emailSubject={emailSubject} eyebrow={translate(isWinterPage ? "WINTER FREERIDE · KYRGYZSTAN360" : "KYRGYZSTAN360")} description={translate(isWinterPage ? "Leave your details and I&apos;ll send you more information about the Winter Freeride experience, available dates and booking options." : "Leave your details and I&apos;ll send you more information and available booking options.")} successMessage={translate(isWinterPage ? "I&apos;ll send you the Winter Freeride details shortly." : "I&apos;ll send you the details shortly.")} onClose={() => setIsInquiryOpen(false)} />)}
  </>;
}
