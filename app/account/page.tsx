import Link from "next/link";
import { claimTravelerRequests, customerStatus, requireTraveler, travelerDateLabel, travelerTripTitle } from "@/lib/account/auth";
import { database } from "@/lib/travel-requests/database";
import { logoutTraveler } from "./actions";
import { formatCountries } from "@/lib/travel-requests/validation";

export default async function AccountHome() {
  const user = await requireTraveler();
  await claimTravelerRequests(user);
  const result = await database().from("travel_requests").select("id,reference_number,countries,start_date,end_date,flexible_dates,preferred_period,adults,children,budget,details,status,created_at").eq("traveler_user_id", user.id).order("created_at", { ascending: false });
  if (result.error) return <main><p role="alert">Unable to load your requests. Please try again.</p></main>;
  return <main><header className="account-header"><Link className="account-brand" href="/en">KYRGYZSTAN360</Link><nav className="account-nav"><Link href="/account">My Trips</Link><Link className="account-new-trip" href="/en/plan-your-trip">Create a new trip</Link><form action={logoutTraveler}><button>Sign out</button></form></nav></header>
    <section className="account-intro"><p className="account-eyebrow">KYRGYZSTAN360 · TRAVELER ACCOUNT</p><h1>My Trips</h1><p>Your travel requests and upcoming adventures in one place.</p></section>
    <section className="account-list">
      {result.data.length ? result.data.map((request) => {
        const countries = request.countries ?? [];
        const date = travelerDateLabel(request.start_date, request.end_date, request.preferred_period, request.flexible_dates);
        const travelers = (request.adults ?? 0) + (request.children ?? 0);
        const message = typeof request.details?.preferences === "string" ? request.details.preferences.trim() : "";
        const summary = [
          date,
          travelers ? `${travelers} ${travelers === 1 ? "traveler" : "travelers"}` : null,
          request.budget != null ? `USD ${request.budget} per person` : null,
        ].filter(Boolean).join(" · ");

        return <Link className="request-card" href={`/account/requests/${request.id}`} key={request.id}>
          <div className="request-card-main">
            <p className="request-kicker">{countries.length ? formatCountries(countries) : "CENTRAL ASIA"}</p>
            <h2>{travelerTripTitle(countries)}</h2>
            {summary && <p className="request-summary">{summary}</p>}
            {message && <p className="request-message-preview">{message}</p>}
          </div>
          <div className="request-card-status">
            <span className="request-status">{customerStatus(request.status)}</span>
            <p>We&apos;re reviewing what you&apos;ve shared and will continue the conversation with you by email.</p>
            <span className="request-link">View request →</span>
          </div>
          <span className="request-technical">{request.reference_number}</span>
        </Link>;
      }) : <section className="account-card account-empty"><p className="account-eyebrow">MY TRIPS</p><h2>No trips yet</h2><p>Your next Central Asia adventure can start with a simple idea.</p><p>Tell us where you want to go — or even if you don&apos;t know yet.</p><Link className="account-primary" href="/en/plan-your-trip">Plan my trip →</Link></section>}
    </section></main>;
}
