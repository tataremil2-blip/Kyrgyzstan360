"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import QuickInquiryModal from "./QuickInquiryModal";
import "./book-trip-button.css";

export default function BookTripButton() {
  const pathname = usePathname();
  const [isWinterInquiryOpen, setIsWinterInquiryOpen] = useState(false);

  if (pathname === "/guide-book") return null;

  if (pathname === "/winter-freeride") {
    return <>
      <button className="book-trip-button" type="button" onClick={() => setIsWinterInquiryOpen(true)}>GET MORE INFO <span aria-hidden="true">↗</span></button>
      {isWinterInquiryOpen && <QuickInquiryModal source="Winter Freeride" page="/winter-freeride" emailSubject="[Kyrgyzstan360] Winter Freeride — Get More Info" onClose={() => setIsWinterInquiryOpen(false)} />}
    </>;
  }

  return <Link className="book-trip-button" href="/#contact">GET MORE INFO <span aria-hidden="true">↗</span></Link>;
}
