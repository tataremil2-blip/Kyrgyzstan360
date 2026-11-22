import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(new URL("../supabase/migrations/20261123000100_traveler_accounts.sql", import.meta.url), "utf8");
const accountAuth = readFileSync(new URL("../lib/account/auth.ts", import.meta.url), "utf8");
const requestPage = readFileSync(new URL("../app/account/requests/[id]/page.tsx", import.meta.url), "utf8");
const requestForm = readFileSync(new URL("../app/[lang]/plan-your-trip/TripRequestForm.tsx", import.meta.url), "utf8");

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
