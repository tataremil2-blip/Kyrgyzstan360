"use server";

import { cookies } from "next/headers";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTraveler, travelerAuthClient } from "@/lib/account/auth";
import { database } from "@/lib/travel-requests/database";
import { deliverTripNotifications } from "@/lib/travel-requests/notifications";
import { uuidPattern, validateTravelerUpdate } from "@/lib/travel-requests/validation";

function validEmail(value: string) { return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function validPassword(value: string) { return value.length >= 12 && value.length <= 128; }
function baseUrl() { return process.env.APP_BASE_URL; }

export async function registerTraveler(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!validEmail(email) || !validPassword(password)) redirect("/account/register?error=validation");
  const configured = baseUrl();
  if (!configured) redirect("/account/register?error=unavailable");
  const supabase = await travelerAuthClient();
  const result = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: new URL("/account/auth/callback", configured).href } });
  if (result.error) redirect("/account/register?error=signup");
  redirect("/account/login?checkEmail=1");
}

export async function loginTraveler(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!validEmail(email) || !password || password.length > 1024) redirect("/account/login?error=1");
  const supabase = await travelerAuthClient();
  const result = await supabase.auth.signInWithPassword({ email, password });
  if (result.error || !result.data.user) redirect("/account/login?error=1");
  redirect("/account");
}

export async function logoutTraveler() {
  const supabase = await travelerAuthClient();
  await supabase.auth.signOut({ scope: "local" });
  const jar = await cookies();
  for (const cookie of jar.getAll()) if (cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")) jar.delete(cookie.name);
  redirect("/account/login");
}

export async function updateTravelerRequest(id: string, form: FormData) {
  const user = await requireTraveler();
  if (!uuidPattern.test(id)) redirect("/account");
  const path = `/account/requests/${id}`;
  const dateMode = String(form.get("dateMode") ?? "flexible");
  const { errors, data } = validateTravelerUpdate({
    countries: form.getAll("countries"),
    startDate: dateMode === "exact" ? String(form.get("startDate") ?? "") : "",
    endDate: dateMode === "exact" ? String(form.get("endDate") ?? "") : "",
    dateMode,
    preferredPeriod: dateMode === "approximate" ? String(form.get("preferredPeriod") ?? "") : "",
    flexible: dateMode !== "exact",
    adults: Number(form.get("adults")),
    children: Number(form.get("children")),
    budget: String(form.get("budget") ?? "") === "" ? null : Number(form.get("budget")),
    interests: form.getAll("interests"),
    preferences: String(form.get("preferences") ?? ""),
  });
  if (errors.length) redirect(`${path}/edit?error=validation`);
  const result = await database().rpc("update_traveler_request", {
    p_actor: user.id,
    p_id: id,
    p_data: data,
  });
  // The RPC returns false for a foreign or missing request. Keep the response
  // indistinguishable from a regular missing account resource.
  if (result.error || result.data !== true) redirect("/account");
  after(async () => { try { await deliverTripNotifications(); } catch { /* Queued changes remain saved. */ } });
  revalidatePath("/account");
  revalidatePath(path);
  revalidatePath(`/admin/requests/${id}`);
  redirect(`${path}?result=saved`);
}

export async function addTravelerDetails(id: string, form: FormData) {
  const user = await requireTraveler();
  if (!uuidPattern.test(id)) redirect("/account");
  const path = `/account/requests/${id}`;
  const body = String(form.get("details") ?? "").trim();
  if (!body || body.length > 3000) redirect(`${path}?details=invalid`);
  const result = await database().rpc("add_traveler_request_details", { p_actor: user.id, p_id: id, p_body: body });
  if (result.error || result.data === "not_found") redirect("/account");
  if (result.data === "rate_limited") redirect(`${path}?details=rate`);
  if (result.data !== "saved") redirect(`${path}?details=invalid`);
  after(async () => { try { await deliverTripNotifications(); } catch { /* Queued changes remain saved. */ } });
  revalidatePath(path);
  revalidatePath(`/admin/requests/${id}`);
  redirect(`${path}?details=added`);
}
