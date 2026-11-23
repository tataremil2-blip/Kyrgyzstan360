import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { database } from "@/lib/travel-requests/database";
import { statuses, uuidPattern } from "@/lib/travel-requests/validation";
import { retryNotification, updateRequest } from "../../../actions";

const travelerFieldLabels: Record<string, string> = {
  countries: "Destinations", dates: "Travel dates", travelers: "Travelers", budget: "Budget",
  interests: "Interests", preferences: "Trip preferences",
};

function travelerChangedFields(changes: Record<string, unknown>) {
  const fields = changes.fields;
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return [];
  return Object.keys(fields).flatMap((key) => travelerFieldLabels[key] ? [travelerFieldLabels[key]] : []);
}

export default async function RequestCard({ params, searchParams }: PageProps<"/admin/requests/[id]">) {
  await requireStaff();
  const { id } = await params;
  if (!uuidPattern.test(id)) notFound();
  const { result } = await searchParams;
  const db = database();
  const [request, managers, notes, history, jobs] = await Promise.all([
    db.from("travel_requests").select("id,reference_number,customer_name,customer_email,locale,countries,start_date,end_date,flexible_dates,adults,children,budget,details,status,manager_id,created_at,consent_at,source").eq("id", id).maybeSingle(),
    db.from("staff_members").select("user_id,display_name,active").order("display_name"),
    db.from("travel_request_notes").select("id,body,actor_id,created_at").eq("request_id", id).order("created_at", { ascending: false }),
    db.from("travel_request_events").select("id,changes,actor_id,created_at").eq("request_id", id).order("created_at", { ascending: false }),
    db.from("notification_jobs").select("id,kind,state,attempts,error_code").eq("request_id", id).order("kind"),
  ]);
  if ([request, managers, notes, history, jobs].some((query) => query.error)) {
    return <p role="alert">Unable to load the request. Please try again.</p>;
  }
  if (!request.data) notFound();
  const trip = request.data;
  const staff = managers.data ?? [];
  const people = new Map(staff.map((person) => [person.user_id, person.display_name]));
  const details = trip.details ?? {};
  const fields = [
    ["Client", trip.customer_name], ["Email", trip.customer_email], ["Preferred contact", details.contact],
    ["WhatsApp / phone", details.phone], ["Telegram", details.telegram], ["Country of residence", details.residence],
    ["Countries", trip.countries.join(", ")],
    ["Dates", (trip.start_date ? trip.start_date + " – " + trip.end_date : "Unspecified") + (trip.flexible_dates ? " (flexible)" : "")],
    ["Travelers", trip.adults + " adults, " + trip.children + " children"], ["Budget per person", "USD " + trip.budget],
    ["Interests", details.interests?.join(", ")], ["Travel preferences", details.preferences],
    ["Source", trip.source], ["Language", trip.locale], ["Created", new Date(trip.created_at).toISOString()],
    ["Consent recorded", new Date(trip.consent_at).toISOString()], ...Object.entries(details.utm ?? {}),
  ];
  return <>
    <Link href="/admin">Back to requests</Link>
    <h1>{trip.reference_number}</h1>
    {result && <p role="status">{result === "saved" ? "Changes saved." : result === "retry" ? "Retry scheduled." : "Unable to save changes."}</p>}
    <div className="crm-columns">
      <section className="crm-panel">
        <h2>Trip and customer details</h2>
        <dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{String(value || "—")}</dd></div>)}</dl>
      </section>
      <section className="crm-panel">
        <h2>Manage request</h2>
        <form action={updateRequest.bind(null, id)}>
          <label>Status<select name="status" defaultValue={trip.status}>
            {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
          </select></label>
          <label>Assigned manager<select name="manager" defaultValue={trip.manager_id ?? ""}>
            <option value="">Unassigned</option>
            {staff.filter((person) => person.active || person.user_id === trip.manager_id).map((person) =>
              <option key={person.user_id} value={person.user_id}>{person.display_name}{person.active ? "" : " (inactive)"}</option>)}
          </select></label>
          <label>New internal note<textarea name="note" rows={4} maxLength={3000} /></label>
          <button>Save changes</button>
        </form>
        <h2>Notifications</h2>
        <ul>{jobs.data?.map((job) => <li key={job.id}>
          {job.kind.replaceAll("_", " ")} · {job.state} · {job.attempts} attempts {job.error_code && " · " + job.error_code}
          {job.state === "failed" && <form action={retryNotification.bind(null, id, job.id)}><button>Retry</button></form>}
        </li>)}</ul>
      </section>
      <section className="crm-panel">
        <h2>Internal notes</h2>
        {notes.data?.length ? <ul>{notes.data.map((note) => <li key={note.id}>
          <p>{note.body}</p><small>{people.get(note.actor_id) ?? "Staff"} · {new Date(note.created_at).toISOString()}</small>
        </li>)}</ul> : <p>No internal notes.</p>}
      </section>
      <section className="crm-panel">
        <h2>Traveler activity and request history</h2>
        {history.data?.length ? <ul>{history.data.map((event) => <li key={event.id}>
          {event.changes.event === "traveler_updated_request" ? <>
            <p>Traveler updated request</p>
            {travelerChangedFields(event.changes).length > 0 && <p>{travelerChangedFields(event.changes).join(" · ")}</p>}
            <small>Traveler · {new Date(event.created_at).toISOString()}</small>
          </> : event.changes.event === "traveler_added_details" ? <>
            <p>Traveler added information</p>
            {typeof event.changes.body === "string" && <p>{event.changes.body}</p>}
            <small>Traveler · {new Date(event.created_at).toISOString()}</small>
          </> : <>
            {event.changes.status_from !== event.changes.status_to && <p>{event.changes.status_from} → {event.changes.status_to}</p>}
            {event.changes.manager_from !== event.changes.manager_to &&
              <p>{people.get(event.changes.manager_from) ?? "Unassigned"} → {people.get(event.changes.manager_to) ?? "Unassigned"}</p>}
            <small>{people.get(event.actor_id) ?? "Staff"} · {new Date(event.created_at).toISOString()}</small>
          </>}
        </li>)}</ul> : <p>No status or assignment changes.</p>}
      </section>
    </div>
  </>;
}
