"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { travelerAuthClient } from "@/lib/account/auth";

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
