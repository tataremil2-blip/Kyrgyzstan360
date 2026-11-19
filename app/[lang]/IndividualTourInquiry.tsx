"use client";
import { useTranslator } from "@/app/LocaleProvider";


import { useState } from "react";
import InquiryForm from "./InquiryForm";
import "./tour-inquiry-modal.css";
import "./tour-inquiry-modal-compact.css";
import "./individual-tour-inquiry.css";

export default function IndividualTourInquiry({ className = "tour-detail-cta", label = "PLAN THIS TOUR" }: { className?: string; label?: string }) {
  const translate = useTranslator();
  const [open, setOpen] = useState(false);

  return <>
    <button className={className} type="button" onClick={() => setOpen(true)}>{translate(label)}</button>
    {translate(open && <div className="tour-modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <section className="tour-modal" role="dialog" aria-modal="true" aria-labelledby="individual-tour-inquiry-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="tour-modal-close" type="button" onClick={() => setOpen(false)} aria-label={translate("Close inquiry form")}>×</button>
        <p className="tour-modal-kicker">{translate("INDIVIDUAL TOUR")}</p>
        <h2 id="individual-tour-inquiry-title">{translate("Plan your")}<br /><em>{translate("own route.")}</em></h2>
        <InquiryForm compact tour="Individual tour" />
      </section>
    </div>)}
  </>;
}
