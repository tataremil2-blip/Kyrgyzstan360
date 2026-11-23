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
  return customerProgress(status).label;
}

export function customerProgress(status: string) {
  return ({
    new: { step: 1, label: "Request received", description: "We've received your trip request." },
    contacted: { step: 2, label: "Finding your local expert", description: "We're matching your trip with the right local expert." },
    planning: { step: 3, label: "Preparing your trip", description: "Your itinerary and trip details are being prepared." },
    negotiating: { step: 3, label: "Preparing your trip", description: "Your itinerary and trip details are being prepared." },
    proposal_sent: { step: 4, label: "Offer ready", description: "Your personalized trip option is ready." },
    booked: { step: 5, label: "Trip confirmed", description: "Your adventure is confirmed." },
    completed: { step: 5, label: "Trip confirmed", description: "Your adventure is confirmed." },
    lost: { step: 1, label: "Request received", description: "We've received your trip request." },
    cancelled: { step: 1, label: "Request received", description: "We've received your trip request." },
  } as Record<string, { step: number; label: string; description: string }>)[status]
    ?? { step: 1, label: "Request received", description: "We've received your trip request." };
}
