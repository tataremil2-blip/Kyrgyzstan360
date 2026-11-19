"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authClient, requireStaff, sessionCookie } from "@/lib/admin/auth";
import { database } from "@/lib/travel-requests/database";
import { deliverTripNotifications } from "@/lib/travel-requests/notifications";
import { statuses, uuidPattern } from "@/lib/travel-requests/validation";

export async function login(form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  let authorized = false;
  if (email && email.length <= 254 && password && password.length <= 1024) {
    try {
      const result = await authClient().auth.signInWithPassword({ email, password });
      const session = result.data.session;
      if (!result.error && session) {
        const staff = await database().from("staff_members").select("user_id")
          .eq("user_id", session.user.id).eq("active", true).maybeSingle();
        if (!staff.error && staff.data) {
          (await cookies()).set(sessionCookie, session.access_token, {
            httpOnly: true, secure: process.env.NODE_ENV === "production",
            sameSite: "lax", path: "/", maxAge: session.expires_in,
          });
          authorized = true;
        }
      }
    } catch {
      console.error("Staff login unavailable");
    }
  }
  redirect(authorized ? "/admin" : "/admin/login?error=1");
}

export async function logout() {
  await requireStaff();
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  jar.delete(sessionCookie);
  if (token) {
    try { await authClient().auth.admin.signOut(token, "local"); }
    catch { /* Browser session was cleared. */ }
  }
  redirect("/admin/login");
}

export async function updateRequest(id: string, form: FormData) {
  const staff = await requireStaff();
  if (!uuidPattern.test(id)) return;
  const status = String(form.get("status") ?? "");
  const manager = String(form.get("manager") ?? "");
  const note = String(form.get("note") ?? "").trim();
  const path = "/admin/requests/" + id;
  if (!statuses.some((value) => value === status) || (manager && !uuidPattern.test(manager)) || note.length > 3000) {
    redirect(path + "?result=error");
  }
  const result = await database().rpc("update_travel_request", {
    p_actor: staff.user_id, p_id: id, p_status: status, p_manager: manager || null, p_note: note,
  });
  if (result.error) redirect(path + "?result=error");
  revalidatePath("/admin");
  redirect(path + "?result=saved");
}

export async function retryNotification(requestId: string, jobId: string) {
  await requireStaff();
  if (!uuidPattern.test(requestId) || !uuidPattern.test(jobId)) return;
  const db = database();
  const path = "/admin/requests/" + requestId;
  const card = await db.from("travel_requests").select("reference_number").eq("id", requestId).single();
  if (card.error || !card.data) redirect(path + "?result=error");
  const retry = await db.from("notification_jobs").update({
    state: "pending", attempts: 0, available_at: new Date().toISOString(), error_code: null,
  }).eq("id", jobId).eq("request_id", requestId).eq("state", "failed").select("id").maybeSingle();
  if (retry.error || !retry.data) redirect(path + "?result=error");
  try { await deliverTripNotifications(card.data.reference_number); }
  catch { console.error("Manual notification processing failed"); }
  redirect(path + "?result=retry");
}
