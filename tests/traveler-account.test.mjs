import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(new URL("../supabase/migrations/20261123000100_traveler_accounts.sql", import.meta.url), "utf8");
const updatesMigration = readFileSync(new URL("../supabase/migrations/20261123000200_traveler_request_updates.sql", import.meta.url), "utf8");
const activityMigration = readFileSync(new URL("../supabase/migrations/20261123000300_traveler_activity_and_notifications.sql", import.meta.url), "utf8");
const accountAuth = readFileSync(new URL("../lib/account/auth.ts", import.meta.url), "utf8");
const requestPage = readFileSync(new URL("../app/account/requests/[id]/page.tsx", import.meta.url), "utf8");
const editPage = readFileSync(new URL("../app/account/requests/[id]/edit/page.tsx", import.meta.url), "utf8");
const accountActions = readFileSync(new URL("../app/account/actions.ts", import.meta.url), "utf8");
const adminRequestPage = readFileSync(new URL("../app/admin/(protected)/requests/[id]/page.tsx", import.meta.url), "utf8");
const requestForm = readFileSync(new URL("../app/[lang]/plan-your-trip/TripRequestForm.tsx", import.meta.url), "utf8");
const notifications = readFileSync(new URL("../lib/travel-requests/notifications.ts", import.meta.url), "utf8");

test("traveler linking is nullable, indexed, and callable only by the server role", () => {
  assert.match(migration, /add column traveler_user_id uuid references auth\.users/);
  assert.match(migration, /create index travel_requests_traveler_user/);
  assert.match(migration, /revoke all on function public\.claim_traveler_requests/);
  assert.match(migration, /grant execute on function public\.claim_traveler_requests\(uuid, text\) to service_role/);
  assert.doesNotMatch(migration, /grant execute on function public\.claim_traveler_requests\(uuid, text\) to authenticated/);
});

test("only a confirmed Auth email can claim requests, and account details are owner-scoped", () => {
  assert.match(accountAuth, /if \(!user\.email \|\| !user\.email_confirmed_at\) return 0/);
  assert.match(accountAuth, /p_actor: user\.id, p_email: user\.email/);
  assert.match(requestPage, /\.eq\("traveler_user_id", user\.id\)\.maybeSingle\(\)/);
  assert.doesNotMatch(requestPage, /travel_request_notes|notification_jobs/);
});

test("anonymous request success keeps submission open and offers account creation", () => {
  assert.match(requestForm, /Your request has been received/);
  assert.match(requestForm, /Create your free account/);
  assert.match(requestForm, /href="\/account\/register"/);
});

test("traveler request updates use an owner-checked service-role allowlist", () => {
  assert.match(updatesMigration, /where id = p_id and traveler_user_id = p_actor for update/);
  assert.match(updatesMigration, /countries = next_countries/);
  assert.match(updatesMigration, /details = previous\.details \|\| jsonb_build_object\('interests', next_interests, 'preferences', next_preferences\)/);
  assert.match(updatesMigration, /'event', 'traveler_updated_request'/);
  assert.match(updatesMigration, /revoke all on function public\.update_traveler_request/);
  assert.match(updatesMigration, /grant execute on function public\.update_traveler_request\(uuid, uuid, jsonb\) to service_role/);
  assert.doesNotMatch(updatesMigration, /grant execute on function public\.update_traveler_request[^\n]*authenticated/);
  const updateStatement = updatesMigration.match(/update public\.travel_requests set([\s\S]*?)where id = p_id/);
  assert.ok(updateStatement);
  assert.doesNotMatch(updateStatement[1], /status|traveler_user_id/i);
});

test("edit action validates a whitelist and the account UI never exposes internal fields", () => {
  assert.match(accountActions, /const user = await requireTraveler\(\)/);
  assert.match(accountActions, /validateTravelerUpdate/);
  assert.match(accountActions, /update_traveler_request/);
  assert.match(editPage, /name="countries"/);
  assert.match(editPage, /name="interests"/);
  assert.match(editPage, /name="preferences"/);
  assert.doesNotMatch(editPage, /name="status"|name="manager"|name="traveler_user_id"|name="reference_number"/);
  assert.match(adminRequestPage, /Traveler updated request/);
});

test("traveler details are owner-checked, rate-limited, and stored as separate activity", () => {
  assert.match(activityMigration, /create function public\.add_traveler_request_details/);
  assert.match(activityMigration, /where id = p_id and traveler_user_id = p_actor for update/);
  assert.match(activityMigration, /traveler-details:/);
  assert.match(activityMigration, /if attempts > 5 then return 'rate_limited'/);
  assert.match(activityMigration, /'event', 'traveler_added_details'/);
  assert.match(activityMigration, /insert into public\.travel_request_events/);
  assert.match(activityMigration, /grant execute on function public\.add_traveler_request_details\(uuid, uuid, text\) to service_role/);
  assert.doesNotMatch(activityMigration, /grant execute on function public\.add_traveler_request_details[^\n]*authenticated/);
  assert.match(accountActions, /add_traveler_request_details/);
  assert.match(accountActions, /result\.data === "rate_limited"/);
  assert.match(requestPage, /changes->>event", "traveler_added_details"/);
  assert.doesNotMatch(requestPage, /travel_request_notes|notification_jobs/);
});

test("traveler progress is a presentation mapping and never grants status mutation", () => {
  for (const label of ["Request received", "Finding your local expert", "Preparing your trip", "Offer ready", "Trip confirmed"]) {
    assert.match(accountAuth, new RegExp(label));
    assert.match(requestPage, new RegExp(label));
  }
  assert.doesNotMatch(accountActions, /status\s*:/);
});

test("traveler activity queues Telegram-only operator notifications after data is saved", () => {
  assert.match(activityMigration, /'traveler_update_telegram'/);
  assert.match(activityMigration, /'traveler_details_telegram'/);
  assert.match(notifications, /Traveler updated request/);
  assert.match(notifications, /Traveler added information/);
  assert.match(notifications, /travelerChangeLines\(job\.payload\)/);
  assert.match(notifications, /job\.kind === "telegram" \|\| travelerUpdate \|\| travelerDetails/);
  assert.match(accountActions, /after\(async \(\) => \{ try \{ await deliverTripNotifications\(\);/);
  assert.match(adminRequestPage, /Traveler added information/);
});
