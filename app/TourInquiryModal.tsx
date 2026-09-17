"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import InquiryForm from "./InquiryForm";
import "./tour-inquiry-modal.css";
import "./tour-inquiry-modal-refinement.css";
import "./tour-inquiry-modal-compact.css";
import "./tour-inquiry-modal-glass.css";
import "./tour-inquiry-modal-clear.css";
import "./tour-inquiry-modal-subtle-blur.css";

export default function TourInquiryModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
  }, [pathname]);

  if (!open) return null;

  return <div className="tour-modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
    <section className="tour-modal" role="dialog" aria-modal="true" aria-labelledby="tour-modal-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="tour-modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close inquiry form">×</button>
      <h2 id="tour-modal-title">Book your<br />tour now.</h2>
      <InquiryForm compact />
    </section>
  </div>;
}
