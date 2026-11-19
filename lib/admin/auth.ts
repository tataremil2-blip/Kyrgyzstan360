import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { database } from "@/lib/travel-requests/database";

export const sessionCookie = "k360-admin-session";

export function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Staff login is unavailable");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function requireStaff() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/admin/login");
  let staff;
  try {
    const auth = await authClient().auth.getUser(token);
    if (!auth.error && auth.data.user) {
      const result = await database().from("staff_members").select("user_id,display_name")
        .eq("user_id", auth.data.user.id).eq("active", true).maybeSingle();
      if (!result.error) staff = result.data;
    }
  } catch {
    console.error("Staff authentication unavailable");
  }
  if (!staff) redirect("/admin/login");
  return staff;
}
