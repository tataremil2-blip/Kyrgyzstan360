import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { database } from "@/lib/travel-requests/database";
import { formatCountries, statuses } from "@/lib/travel-requests/validation";

const metrics = [
  ["Total Requests", []], ["New Requests", ["new"]], ["In Progress", ["contacted", "planning", "negotiating"]],
  ["Proposals Sent", ["proposal_sent"]], ["Booked", ["booked"]], ["Cancelled / Lost", ["cancelled", "lost"]],
] as const;

const limit = 25;
function value(input: string | string[] | undefined) { return typeof input === "string" ? input : ""; }
function statusLabel(status: string) { return status.replaceAll("_", " "); }

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  await requireStaff();
  const db = database();
  const params = await searchParams;
  const search = value(params.q).trim().slice(0, 80);
  const status = value(params.status);
  const sort = value(params.sort);
  const page = Math.min(10000, Math.max(1, parseInt(value(params.page), 10) || 1));
  let query = db.from("travel_requests")
    .select("id,reference_number,customer_name,countries,start_date,end_date,preferred_period,adults,children,budget,status,created_at,manager_id", { count: "exact" });
  if (search) {
    const escaped = search.replace(/[\\%_"]/g, (char) => "\\" + char);
    query = query.or(["reference_number", "customer_name", "customer_email"]
      .map((field) => field + '.ilike."%' + escaped + '%"').join(","));
  }
  if (statuses.some((item) => item === status)) query = query.eq("status", status);
  const [requests, managers, counts] = await Promise.all([
    query.order(sort === "budget" ? "budget" : "created_at", { ascending: sort === "oldest" })
      .order("id").range((page - 1) * limit, page * limit - 1),
    db.from("staff_members").select("user_id,display_name"),
    Promise.all(metrics.map(([, group]) => {
      const count = db.from("travel_requests").select("id", { count: "exact", head: true });
      return group.length ? count.in("status", group) : count;
    })),
  ]);
  if (requests.error || managers.error || counts.some((count) => count.error)) return <p role="alert">Unable to load requests. Please try again.</p>;
  const names = new Map(managers.data.map((manager) => [manager.user_id, manager.display_name]));
  const pages = Math.max(1, Math.ceil((requests.count ?? 0) / limit));
  const href = (number: number) => "/admin?" + new URLSearchParams({ q: search, status, sort, page: String(number) });
  return <>
    <h1>Travel requests</h1>
    <div className="crm-metrics">{metrics.map(([label], index) => <div key={label}><span>{label}</span><strong>{counts[index].count}</strong></div>)}</div>
    <form className="crm-filters">
      <label>Search<input name="q" defaultValue={search} placeholder="ID, name or email" maxLength={80} /></label>
      <label>Status<select name="status" defaultValue={status}>
        <option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
      </select></label>
      <label>Sort<select name="sort" defaultValue={sort}>
        <option value="">Newest first</option><option value="oldest">Oldest first</option><option value="budget">Highest budget</option>
      </select></label><button>Apply</button>
    </form>
    <div className="crm-table" tabIndex={0} role="region" aria-label="Travel requests table"><table>
      <thead><tr>{["Request ID","Client","Countries","Dates","Travelers","Budget","Status","Created At","Assigned Manager"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
      <tbody>{requests.data.map((trip) => <tr key={trip.id}>
        <td><Link href={"/admin/requests/" + trip.id}>{trip.reference_number}</Link></td>
        <td>{trip.customer_name}</td><td>{formatCountries(trip.countries ?? [])}</td>
        <td>{trip.start_date ? trip.start_date + " – " + trip.end_date : trip.preferred_period || "Not specified"}</td>
        <td>{trip.adults ?? "Not specified"}</td><td>{trip.budget === null ? "Not specified" : "$" + trip.budget}</td><td className="crm-status">{statusLabel(trip.status)}</td>
        <td>{new Date(trip.created_at).toISOString().slice(0, 10)}</td><td>{names.get(trip.manager_id) ?? "Unassigned"}</td>
      </tr>)}</tbody>
    </table></div>
    {!requests.data.length && <p>No requests found.</p>}
    <nav className="crm-pages" aria-label="Request list pages">
      {page > 1 && <Link href={href(Math.min(page - 1, pages))}>Previous</Link>}
      <span>Page {page} of {pages}</span>
      {page < pages && <Link href={href(page + 1)}>Next</Link>}
    </nav>
  </>;
}
