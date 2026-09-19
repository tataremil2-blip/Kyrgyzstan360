"use client";

import { useState } from "react";
import InquiryForm from "./InquiryForm";
import "./tour-inquiry-modal.css";
import "./tour-inquiry-modal-compact.css";

type Departure = { month: string; dates: string[] };

export default function GroupDepartureCalendar({ departures }: { departures: Departure[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return <>
    <section className="group-departures" aria-labelledby="group-departures-title">
      <div className="group-departures-heading"><p>2027 GROUP DEPARTURES</p><h2 id="group-departures-title">Pick your<br /><em>week in the wild.</em></h2><span>Every departure is an eight-day journey: arrival day, seven days on the road and one unforgettable group.</span></div>
      <div className="group-departures-list">{departures.map((departure) => <div className="departure-month" key={departure.month}><h3>{departure.month}</h3><div>{departure.dates.map((date) => <button type="button" key={date} onClick={() => setSelectedDate(`${date} ${departure.month} 2027`)}><span>{date}</span><small>8 DAYS · GROUP EXPEDITION</small><b>↗</b></button>)}</div></div>)}</div>
    </section>
    {selectedDate && <div className="tour-modal-backdrop" role="presentation" onMouseDown={() => setSelectedDate(null)}>
      <section className="tour-modal" role="dialog" aria-modal="true" aria-labelledby="group-booking-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="tour-modal-close" type="button" onClick={() => setSelectedDate(null)} aria-label="Close booking form">×</button>
        <p className="tour-modal-kicker">GROUP EXPEDITION · {selectedDate}</p>
        <h2 id="group-booking-title">Book this<br /><em>departure.</em></h2>
        <InquiryForm compact tour="Group expedition" preferredDates={selectedDate} groupBooking />
      </section>
    </div>}
  </>;
}
