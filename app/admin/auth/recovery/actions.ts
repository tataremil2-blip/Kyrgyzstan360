"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/admin/auth-service";
export async function sendRecovery(form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/admin/auth/recovery?error=1");
  const origin = (await headers()).get("origin");
  const configured = process.env.APP_BASE_URL;
  let sameOrigin = false;
  try { sameOrigin = !!origin && !!configured && new URL(origin).origin === new URL(configured).origin; }
  catch { sameOrigin = false; }
  if (sameOrigin) {
    try {
      const result = await createAdminClient().auth.resetPasswordForEmail(email, {
        redirectTo: new URL("/admin/auth/confirm?type=recovery&next=%2Fadmin%2Fauth%2Fcomplete", configured).href,
      });
      if (result.error) console.error("Password recovery request failed");
    } catch { console.error("Password recovery unavailable"); }
  }
  redirect("/admin/auth/recovery?sent=1");
}
