"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import QuickInquiryModal from "./QuickInquiryModal";
import "./book-trip-button.css";

export default function BookTripButton() {
  const pathname = usePathname();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  if (pathname === "/guide-book") return null;

  const isWinterPage = pathname === "/winter-freeride";
  const source = isWinterPage ? "Winter Freeride" : "Website inquiry";
  const emailSubject = isWinterPage ? "[Kyrgyzstan360] Winter Freeride — Get More Info" : "[Kyrgyzstan360] Website — Get More Info";

  return <>
    <button className="book-trip-button" type="button" onClick={() => setIsInquiryOpen(true)}>GET MORE INFO <span aria-hidden="true">↗</span></button>
    {isInquiryOpen && <QuickInquiryModal source={source} page={pathname} emailSubject={emailSubject} eyebrow={isWinterPage ? "WINTER FREERIDE · KYRGYZSTAN360" : "KYRGYZSTAN360"} description={isWinterPage ? "Leave your details and I&apos;ll send you more information about the Winter Freeride experience, available dates and booking options." : "Leave your details and I&apos;ll send you more information and available booking options."} successMessage={isWinterPage ? "I&apos;ll send you the Winter Freeride details shortly." : "I&apos;ll send you the details shortly."} onClose={() => setIsInquiryOpen(false)} />}
  </>;
}
