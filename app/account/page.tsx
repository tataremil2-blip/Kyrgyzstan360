import Link from "next/link";
import { claimTravelerRequests, customerStatus, requireTraveler } from "@/lib/account/auth";
import { database } from "@/lib/travel-requests/database";
import { logoutTraveler } from "./actions";
import { formatCountries } from "@/lib/travel-requests/validation";

export default async function AccountHome() {
  const user = await requireTraveler();
  await claimTravelerRequests(user);
  const result = await database().from("travel_requests").select("id,reference_number,countries,start_date,end_date,flexible_dates,preferred_period,adults,children,budget,details,status,created_at").eq("traveler_user_id", user.id).order("created_at", { ascending: false });
  if (result.error) return <main><p role="alert">Unable to load your requests. Please try again.</p></main>;
  return <main><header className="account-header"><Link className="account-brand" href="/en">KYRGYZSTAN360</Link><nav className="account-nav"><Link href="/account">My Requests</Link><span className="account-muted">Saved Trips · coming later</span><span className="account-muted">Profile · coming later</span><form action={logoutTraveler}><button>Log out</button></form></nav></header>
    <h1>My requests</h1><p className="account-muted">Your request details and trip progress, in one place.</p>
    <section className="account-list">{result.data.length ? result.data.map((request) => <Link className="request-card" href={`/account/requests/${request.id}`} key={request.id}><div className="request-ref">{request.reference_number}</div><p><span className="request-status">{customerStatus(request.status)}</span></p><div className="request-grid"><div><span>Destinations</span>{formatCountries(request.countries)}</div><div><span>Dates</span>{request.start_date ? `${request.start_date} – ${request.end_date}` : request.preferred_period || "Flexible dates"}</div><div><span>Travelers</span>{request.adults + request.children}</div><div><span>Budget</span>{request.budget === null ? "Not specified" : `USD ${request.budget}`}</div></div></Link>) : <section className="account-card"><h2>No requests yet</h2><p>When you send a trip request with this confirmed email address, it will appear here.</p><Link href="/en/plan-your-trip">Plan my trip</Link></section>}</section></main>;
}
