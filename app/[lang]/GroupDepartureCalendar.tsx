"use client";
import { formatDepartureLabel } from "@/lib/formatting";
import { useLocale, useTranslator } from "@/app/LocaleProvider";


import { useState } from "react";
import InquiryForm from "./InquiryForm";
import "./tour-inquiry-modal.css";
import "./tour-inquiry-modal-compact.css";

type Departure = { month: string; dates: string[] };

export default function GroupDepartureCalendar({ departures }: { departures: Departure[] }) {
  const translate = useTranslator();
  const { locale } = useLocale();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return <>
    <section className="group-departures" aria-labelledby="group-departures-title">
      <div className="group-departures-heading"><p>{translate("2027 GROUP DEPARTURES")}</p><h2 id="group-departures-title">{translate("Pick your")}<br />{translate("week in the wild")}</h2><span>{translate("Every departure is an eight-day journey: arrival day, seven days on the road and one unforgettable group.")}</span></div>
      <div className="group-departures-list">{translate(departures.map((departure) => <div className="departure-month" key={departure.month}><h3>{translate(departure.month)}</h3><div>{translate(departure.dates.map((date) => <button type="button" key={date} onClick={() => setSelectedDate(`${date}${/[A-Za-z]/.test(date) ? "" : ` ${departure.month}`} 2027`)}><span>{translate(date)}</span><small>{translate("8 DAYS · GROUP EXPEDITION")}</small><b>↗</b></button>))}</div></div>))}</div>
    </section>
    {translate(selectedDate && <div className="tour-modal-backdrop" role="presentation" onMouseDown={() => setSelectedDate(null)}>
      <section className="tour-modal" role="dialog" aria-modal="true" aria-labelledby="group-booking-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="tour-modal-close" type="button" onClick={() => setSelectedDate(null)} aria-label={translate("Close booking form")}>×</button>
        <p className="tour-modal-kicker">{translate("GROUP EXPEDITION · ")}{formatDepartureLabel(selectedDate, locale)}</p>
        <h2 id="group-booking-title">{translate("Book this")}<br /><em>{translate("departure.")}</em></h2>
        <InquiryForm compact tour="Group expedition" preferredDates={selectedDate} groupBooking />
      </section>
    </div>)}
  </>;
}
