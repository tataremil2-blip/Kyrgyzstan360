import { createClient } from "@supabase/supabase-js";
import { database } from "@/lib/travel-requests/database";

export function diagnosticsEnabled(env = process.env) {
  return env.VERCEL_ENV === "preview" && env.VERCEL_GIT_COMMIT_REF === "feature/travel-requests-mvp" &&
    env.NEXT_PUBLIC_SUPABASE_URL === "https://epyifhlwdhzlpfpnavkg.supabase.co";
}

const codes = new Set(["ENOTFOUND", "EAI_AGAIN", "ECONNRESET", "ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT", "ERR_INVALID_CHAR", "ERR_HTTP_INVALID_HEADER_VALUE"]);
export async function diagnosePreviewConnection() {
  if (!diagnosticsEnabled()) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) { clearTimeout(timer); return; }
  const id = "1f6e89ca-09f1-4d2c-a9ee-06bec72c8ac6";
  async function probe(stage: string, run: () => PromiseLike<{ status: number; error?: unknown }>) {
    const start = Date.now();
    let deadline: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        Promise.resolve().then(run),
        new Promise<never>((_, reject) => { deadline = setTimeout(() => reject({ code: "ETIMEDOUT" }), 6000); }),
      ]);
      console.info("CRM Preview connection probe", { stage, status: result.status, durationMs: Date.now() - start,
        code: result.error ? "sdk_error" : "ok" });
    } catch (error) {
      const candidate = error as { code?: string; cause?: { code?: string } };
      const code = candidate?.cause?.code ?? candidate?.code;
      console.info("CRM Preview connection probe", { stage, status: 0, durationMs: Date.now() - start,
        code: code && codes.has(code) ? code : "transport_error" });
    } finally { clearTimeout(deadline); }
  }
  try {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const query = (db: ReturnType<typeof database>) => db.from("staff_members").select("user_id")
      .abortSignal(controller.signal).eq("user_id", id).eq("active", true).maybeSingle();
    await Promise.all([
      probe("auth_api", async () => { const r = await fetch(url + "/auth/v1/health", { signal: controller.signal, cache: "no-store" }); await r.body?.cancel(); return r; }),
      probe("standard_fetch", async () => { const r = await fetch(url + "/rest/v1/staff_members?select=user_id&user_id=eq." + id + "&active=eq.true&limit=1", { signal: controller.signal, cache: "no-store", headers: key.startsWith("sb_secret_") ? { apikey: key } : { apikey: key, Authorization: "Bearer " + key } }); await r.body?.cancel(); return r; }),
      probe("standard_sdk", () => query(client)),
      probe("current_database", () => query(database())),
    ]);
  } catch { /* Diagnostics must never affect authorization. */ }
  finally { controller.abort(); clearTimeout(timer); }
}
