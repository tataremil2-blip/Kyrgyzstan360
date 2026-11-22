import Link from "next/link";
import { notFound } from "next/navigation";
import { customerStatus, requireTraveler } from "@/lib/account/auth";
import { database } from "@/lib/travel-requests/database";
import { uuidPattern } from "@/lib/travel-requests/validation";

export default async function AccountRequest({ params, searchParams }: PageProps<"/account/requests/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const user = await requireTraveler();
  if (!uuidPattern.test(id)) notFound();
  const result = await database().from("travel_requests").select("reference_number,countries,start_date,end_date,flexible_dates,adults,children,budget,details,status,created_at").eq("id", id).eq("traveler_user_id", user.id).maybeSingle();
  if (result.error || !result.data) notFound();
  const request = result.data;
  const details = request.details && typeof request.details === "object" ? request.details as Record<string, unknown> : {};
  const interests = Array.isArray(details.interests) ? details.interests.filter((item): item is string => typeof item === "string").join(", ") : "—";
  return <main><header className="account-header"><Link className="account-brand" href="/en">KYRGYZSTAN360</Link><Link href="/account">← My requests</Link></header><section className="account-card"><p className="request-ref">{request.reference_number}</p><h1>{customerStatus(request.status)}</h1>
    {query.result === "saved" && <p className="account-success" role="status">Your request has been updated.</p>}
    <div className="request-grid"><div><span>Destinations</span>{request.countries.join(", ")}</div><div><span>Dates</span>{request.flexible_dates ? "Flexible dates" : `${request.start_date} – ${request.end_date}`}</div><div><span>Travelers</span>{request.adults} adults, {request.children} children</div><div><span>Budget</span>USD {request.budget} per person</div><div><span>Interests</span>{interests}</div></div>
    <div className="account-actions"><Link className="account-primary" href={`/account/requests/${id}/edit`}>Edit request</Link></div>
    <h2>What happens next</h2><p>Our local travel team is reviewing your preferences. We will contact you with the next step for your trip.</p></section></main>;
}
