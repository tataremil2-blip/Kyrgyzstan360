import Link from "next/link";
import { notFound } from "next/navigation";
import { customerProgress, requireTraveler, travelerDateLabel, travelerTripTitle } from "@/lib/account/auth";
import { database } from "@/lib/travel-requests/database";
import { formatCountries, uuidPattern } from "@/lib/travel-requests/validation";
import { addTravelerDetails } from "@/app/account/actions";

const progressSteps = ["Request received", "Finding your local expert", "Preparing your trip", "Offer ready", "Trip confirmed"];

export default async function AccountRequest({ params, searchParams }: PageProps<"/account/requests/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const user = await requireTraveler();
  if (!uuidPattern.test(id)) notFound();
  const db = database();
  const [result, activity] = await Promise.all([
    db.from("travel_requests").select("reference_number,countries,start_date,end_date,flexible_dates,preferred_period,adults,children,budget,details,status,created_at").eq("id", id).eq("traveler_user_id", user.id).maybeSingle(),
    db.from("travel_request_events").select("id,changes,created_at").eq("request_id", id).eq("actor_id", user.id)
      .eq("changes->>event", "traveler_added_details").order("created_at", { ascending: false }),
  ]);
  if (result.error || !result.data) notFound();
  const request = result.data;
  const details = request.details && typeof request.details === "object" ? request.details as Record<string, unknown> : {};
  const interests = Array.isArray(details.interests) ? details.interests.filter((item): item is string => typeof item === "string").join(", ") : "—";
  const progress = customerProgress(request.status);
  const addDetails = addTravelerDetails.bind(null, id);
  const date = travelerDateLabel(request.start_date, request.end_date, request.preferred_period, request.flexible_dates);
  return <main><header className="account-header"><Link className="account-brand" href="/en">KYRGYZSTAN360</Link><Link href="/account">← My trips</Link></header><section className="account-card request-detail"><p className="request-kicker">{request.countries?.length ? formatCountries(request.countries) : "CENTRAL ASIA"}</p><h1>{travelerTripTitle(request.countries ?? [])}</h1><p className="request-status-line"><span className="request-status">{progress.label}</span></p>
    {query.result === "saved" && <p className="account-success" role="status">Your request has been updated.</p>}
    {query.details === "added" && <p className="account-success" role="status">Your additional details have been added.</p>}
    {query.details === "invalid" && <p className="account-alert" role="alert">Please enter up to 3,000 characters.</p>}
    {query.details === "rate" && <p className="account-alert" role="alert">Please wait a few minutes before adding more details.</p>}
    <section className="account-progress" aria-label="Trip progress"><h2>What happens next</h2><p>{progress.description} We&apos;ll continue the conversation with you by email as we shape the trip together.</p><ol>{progressSteps.map((label, index) => <li key={label} className={index + 1 < progress.step ? "complete" : index + 1 === progress.step ? "current" : ""}><span>{index + 1 < progress.step ? "✓" : index + 1 === progress.step ? "●" : "○"}</span>{label}</li>)}</ol></section>
    <section className="request-trip-data"><h2>Your trip</h2><div className="request-grid">{date && <div><span>Dates</span>{date}</div>}{request.adults && <div><span>Travelers</span>{request.adults}</div>}{request.countries?.length ? <div><span>Destinations</span>{formatCountries(request.countries)}</div> : null}{request.budget !== null && request.budget !== undefined && <div><span>Budget per person</span>USD {request.budget}</div>}{interests !== "—" && <div><span>Interests</span>{interests}</div>}</div></section>
    {request.details && <section className="request-message"><h2>Your message</h2><p>{typeof request.details === "object" && typeof (request.details as Record<string, unknown>).preferences === "string" ? String((request.details as Record<string, unknown>).preferences) : "Your original trip preferences are saved with this request."}</p></section>}
    <div className="account-actions"><Link className="account-primary" href={`/account/requests/${id}/edit`}>Edit request</Link></div>
    <section className="account-details"><h2>Anything else you&apos;d like us to know?</h2><p className="account-muted">Add new information to your request without changing the original trip details.</p><form action={addDetails}><label>Additional details<textarea name="details" rows={5} maxLength={3000} placeholder="For example: We'd love to spend a night in a yurt, one traveler is vegetarian, and we'd like to include horse riding." required /></label><button type="submit">ADD DETAILS</button></form></section>
    <section className="account-updates"><h2>Updates</h2>{activity.error ? <p role="alert">Unable to load your updates.</p> : activity.data?.length ? <ul>{activity.data.map((event) => <li key={event.id}><strong>You added more details</strong><small>{new Date(event.created_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</small><blockquote>{typeof event.changes.body === "string" ? event.changes.body : ""}</blockquote></li>)}</ul> : <p className="account-muted">Your additional messages will appear here.</p>}</section>
    </section></main>;
}
