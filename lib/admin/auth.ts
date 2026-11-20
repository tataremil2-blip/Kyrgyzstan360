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

export async function authClient() {
  const { url, key } = configuration();
  const jar = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // Proxy persists token refresh when a Server Component cannot write cookies.
        }
      },
    },
  });
}

export async function requireStaff() {
  const supabase = await authClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/admin/login");
  const staff = await database().from("staff_members").select("user_id,display_name")
    .eq("user_id", data.user.id).eq("active", true).maybeSingle();
  if (staff.error || !staff.data) redirect("/admin/login");
  return { user_id: staff.data.user_id, display_name: staff.data.display_name };
}

export function isSafeAdminPath(value: string | null) {
  if (!value || value.startsWith("//") || value.includes("\\") || /[\r\n]/.test(value)) return false;
  const path = value.split(/[?#]/, 1)[0];
  return path === "/admin" || (path.startsWith("/admin/") &&
    (path !== "/admin/auth" && !path.startsWith("/admin/auth/") || path === "/admin/auth/complete"));
}

export function safeAdminPath(value: string | null) {
  return isSafeAdminPath(value) ? value! : "/admin";
}
