"use client";

import { FormEvent, useState } from "react";
import "./review-form.css";

export default function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: form.get("firstName"), lastName: form.get("lastName"), review: form.get("review"), rating }) });
      if (!response.ok) throw new Error("Request failed");
      setStatus("sent");
      event.currentTarget.reset();
      setRating(5);
    } catch { setStatus("error"); }
  }

  return <form className="review-form" onSubmit={submit}><div className="review-name-fields"><label>First name<input name="firstName" required /></label><label>Last name<input name="lastName" required /></label></div><label>Your review<textarea name="review" rows={4} required /></label><div className="review-rating"><span>Your rating</span><div role="radiogroup" aria-label="Your rating">{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} className={star <= rating ? "is-selected" : ""} onClick={() => setRating(star)} role="radio" aria-checked={star === rating} aria-label={`${star} stars`}>★</button>)}</div></div><button className="review-submit" type="submit" disabled={status === "sending" || status === "sent"}>{status === "sending" ? "Sending..." : status === "sent" ? "Thank you ✓" : status === "error" ? "Try again" : "SEND REVIEW ↗"}</button><p role="status" aria-live="polite">{status === "sent" ? "Thank you for sharing your experience." : status === "error" ? "We could not send your review. Please try again." : "No account or registration needed."}</p></form>;
}
