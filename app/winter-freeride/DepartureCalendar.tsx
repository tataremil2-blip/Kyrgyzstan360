"use client";

import { useEffect, useRef, useState } from "react";
import InquiryForm from "../InquiryForm";

const departures = [
  { start: "2026-12-21", end: "2026-12-27", label: "21.12.2026 - 27.12.2026" },
  { start: "2026-12-28", end: "2027-01-03", label: "28.12.2026 - 03.01.2027" },
  { start: "2027-01-04", end: "2027-01-10", label: "04.01.2027 - 10.01.2027" },
  { start: "2027-01-11", end: "2027-01-17", label: "14.01.2027 - 17.01.2027 · FWT Qualifier / Silk Road Freeride" },
  { start: "2027-01-18", end: "2027-01-24", label: "18.01.2027 - 24.01.2027" },
  { start: "2027-01-25", end: "2027-01-31", label: "25.01.2027 - 31.01.2027" },
  { start: "2027-02-01", end: "2027-02-07", label: "01.02.2027 - 07.02.2027" },
  { start: "2027-02-08", end: "2027-02-14", label: "08.02.2027 - 14.02.2027" },
  { start: "2027-02-15", end: "2027-02-21", label: "15.02.2027 - 21.02.2027" },
  { start: "2027-02-22", end: "2027-02-28", label: "22.02.2027 - 28.02.2027" },
  { start: "2027-03-01", end: "2027-03-07", label: "01.03.2027 - 07.03.2027" },
  { start: "2027-03-08", end: "2027-03-14", label: "08.03.2027 - 14.03.2027" },
  { start: "2027-03-15", end: "2027-03-21", label: "15.03.2027 - 21.03.2027" },
  { start: "2027-03-22", end: "2027-03-28", label: "22.03.2027 - 28.03.2027" },
];

const departureMonths = [
  { key: "2026-12", name: "December", year: "2026" },
  { key: "2027-01", name: "January", year: "2027" },
  { key: "2027-02", name: "February", year: "2027" },
  { key: "2027-03", name: "March", year: "2027" },
];

const shortMonth = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });

export default function DepartureCalendar() {
  const [selected, setSelected] = useState<(typeof departures)[number] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!selected) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  return <>
      <div className="winter-calendar" id="calendar">
        <div className="winter-calendar-heading"><div><p className="winter-kicker">FIND YOUR WEEK</p><h3>One season. Fourteen adventures.</h3></div><span className="winter-season">WINTER 2026 / 27</span></div>
        <div className="winter-months">{departureMonths.map((month) => <section className="winter-month" key={month.key} aria-labelledby={`month-${month.key}`}>
          <h4 id={`month-${month.key}`}>{month.name}<span>{month.year}</span></h4>
          <ul>{departures.filter((departure) => departure.start.startsWith(month.key)).map((departure) => <li key={departure.start}>
            {departure.start === "2027-01-11" ? <button type="button" className="winter-date-card winter-competition-card" aria-haspopup="dialog" aria-label="Book competition transfer: 14–17 January 2027" onClick={() => setSelected(departure)}>
              <div className="winter-competition-labels"><span><b aria-hidden="true">△</b>FWT QUALIFIER</span><span><b aria-hidden="true">◇</b>SILK ROAD FREERIDE</span></div>
              <p>Transfer for competitions</p>
              <time dateTime="2027-01-14">14</time><span aria-hidden="true">–</span><time dateTime="2027-01-17">17 JAN 2027</time>
              <span className="winter-competition-book">BOOK &rarr;</span>
            </button> : <button type="button" className="winter-date-card" aria-haspopup="dialog" aria-label={`Book Winter freeride: ${departure.label}`} onClick={() => setSelected(departure)}>
              <span className="winter-date-range"><time dateTime={departure.start}><strong>{Number(departure.start.slice(8))}</strong><span>{shortMonth.format(new Date(departure.start))}</span></time><span className="winter-date-arrow" aria-hidden="true">&rarr;</span><span className="sr-only">to</span><time dateTime={departure.end}><strong>{Number(departure.end.slice(8))}</strong><span>{shortMonth.format(new Date(departure.end))}</span></time></span>
              <span className="winter-date-caption"><span>7 DAYS</span><span>BOOK &rarr;</span></span>
            </button>}
          </li>)}</ul>
        </section>)}</div>
        <p className="winter-calendar-note">All dates shown are arrival and departure dates. Select your week to send a booking request. We will contact you to confirm availability.</p>
      </div>
    <dialog ref={dialog} className="winter-booking-dialog" aria-labelledby="departure-booking-title" aria-describedby="departure-booking-dates" onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setSelected(null);
    }}>
      <button type="button" className="winter-dialog-close" aria-label="Close booking form" onClick={() => setSelected(null)}>&times;</button>
      <p className="winter-kicker">WINTER FREERIDE CAMP</p>
      <h2 id="departure-booking-title">Book your <em>week.</em></h2>
      <p id="departure-booking-dates" className="winter-selected-dates">{selected?.label}</p>
      {selected?.start !== "2027-01-11" && <p className="winter-dialog-price">7 days &middot; &euro;1,900 per person</p>}
      {selected && <InquiryForm key={selected.start} winter preferredDates={selected.label} />}
    </dialog>
  </>;
}
