import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { database } from "@/lib/travel-requests/database";

function configuration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  return { url, key };
}

export async function travelerAuthClient() {
  const { url, key } = configuration();
  const jar = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); }
        catch { /* The proxy persists refreshed cookies during Server Component rendering. */ }
      },
    },
  });
}

export async function requireTraveler() {
  const supabase = await travelerAuthClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;
  if (error || !user) redirect("/account/login");
  return user;
}

export async function claimTravelerRequests(user: { id: string; email?: string | null; email_confirmed_at?: string | null }) {
  // A verified Auth identity is the proof of mailbox ownership. A raw form email
  // is never sufficient to attach an existing request.
  if (!user.email || !user.email_confirmed_at) return 0;
  const claimed = await database().rpc("claim_traveler_requests", { p_actor: user.id, p_email: user.email });
  return claimed.error ? 0 : Number(claimed.data ?? 0);
}

export function customerStatus(status: string) {
  return ({
    new: "Request received", contacted: "Finding your local expert", planning: "Preparing your trip",
    proposal_sent: "Offer ready", negotiating: "Preparing your trip", booked: "Trip confirmed",
    completed: "Trip confirmed", lost: "Request received", cancelled: "Request received",
  } as Record<string, string>)[status] ?? "Request received";
}
