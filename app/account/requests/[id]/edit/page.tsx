import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTravelerRequest } from "@/app/account/actions";
import { requireTraveler } from "@/lib/account/auth";
import { database } from "@/lib/travel-requests/database";
import { countries, interests, uuidPattern } from "@/lib/travel-requests/validation";

const countryLabels: Record<string, string> = {
  KG: "Kyrgyzstan", KZ: "Kazakhstan", UZ: "Uzbekistan", TJ: "Tajikistan", AF: "Afghanistan",
};
const interestLabels: Record<string, string> = {
  nature: "Nature & Mountains", road: "Road Trips & 4×4 Adventures", hiking: "Hiking & Trekking",
  horses: "Horse Riding", nomadic: "Nomadic Culture", history: "Historical Cities & Silk Road",
  lakes: "Lakes & Canyons", winter: "Winter Adventures & Freeride", photo: "Photography",
  family: "Family Travel", culture: "Cultural Experiences",
};

export default async function EditAccountRequest({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, query, user] = await Promise.all([params, searchParams, requireTraveler()]);
  if (!uuidPattern.test(id)) notFound();
  const result = await database().from("travel_requests")
    .select("id,reference_number,countries,start_date,end_date,flexible_dates,preferred_period,adults,children,budget,details")
    .eq("id", id).eq("traveler_user_id", user.id).maybeSingle();
  if (result.error || !result.data) notFound();
  const request = result.data;
  const details = request.details && typeof request.details === "object" ? request.details as Record<string, unknown> : {};
  const selectedInterests = Array.isArray(details.interests)
    ? details.interests.filter((value): value is string => typeof value === "string") : [];
  const preferences = typeof details.preferences === "string" ? details.preferences : "";
  const dateMode = request.start_date ? "exact" : request.preferred_period ? "approximate" : "flexible";
  const save = updateTravelerRequest.bind(null, id);
  return <main>
    <header className="account-header"><Link className="account-brand" href="/en">KYRGYZSTAN360</Link><Link href={`/account/requests/${id}`}>← Back to request</Link></header>
    <section className="account-card account-edit">
      <p className="request-ref">{request.reference_number}</p><h1>Edit request</h1>
      <p className="account-muted">Update your trip preferences. Our team will see the changes in your request.</p>
      {query.error && <p className="account-alert" role="alert">Please review the highlighted trip details and try again.</p>}
      <form action={save}>
        <fieldset><legend>Destinations</legend><div className="account-options">{countries.map((country) => <label key={country}>
          <input name="countries" type="checkbox" value={country} defaultChecked={request.countries.includes(country)} disabled={country === "KG"} />
          {countryLabels[country]}{country === "KG" && <small> Included in every trip</small>}
        </label>)}<input type="hidden" name="countries" value="KG" /></div></fieldset>
        <fieldset><legend>Travel details</legend>
          <label>Date flexibility<select name="dateMode" defaultValue={dateMode}><option value="exact">I know my exact dates</option><option value="approximate">I have approximate dates</option><option value="flexible">My dates are flexible</option></select></label>
          <div className="account-pair"><label>Start date<input name="startDate" type="date" defaultValue={request.start_date ?? ""} /></label>
          <label>End date<input name="endDate" type="date" defaultValue={request.end_date ?? ""} /></label></div>
          <label>Preferred month / period<input name="preferredPeriod" type="month" defaultValue={request.preferred_period ?? ""} /></label>
          <div className="account-pair"><label>Adults<input name="adults" type="number" min="1" max="100" defaultValue={request.adults} required /></label>
          <label>Children<input name="children" type="number" min="0" max="100" defaultValue={request.children} required /></label></div>
          <label>Budget per person (USD) <small>Optional</small><input name="budget" type="number" min="0.01" max="99999999.99" step="0.01" defaultValue={request.budget ?? ""} /></label>
        </fieldset>
        <fieldset><legend>Interests</legend><div className="account-options">{interests.map((interest) => <label key={interest}>
          <input name="interests" type="checkbox" value={interest} defaultChecked={selectedInterests.includes(interest)} />{interestLabels[interest]}
        </label>)}</div></fieldset>
        <label>Trip preferences and additional wishes<textarea name="preferences" rows={6} maxLength={3000} defaultValue={preferences} /></label>
        <div className="account-actions"><button type="submit">Save changes</button><Link className="account-secondary" href={`/account/requests/${id}`}>Cancel</Link></div>
      </form>
    </section>
  </main>;
}
