import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isAuthorizedPreviewDiagnostics } from "@/lib/admin/preview-diagnostics-guard";

export const dynamic = "force-dynamic";
export const maxDuration = 25;

const PREVIEW_URL = "https://epyifhlwdhzlpfpnavkg.supabase.co";
const ADMIN_ID = "1f6e89ca-09f1-4d2c-a9ee-06bec72c8ac6";
const ADMIN_EMAIL = "Kyrgyzstan360.tour@gmail.com".toLowerCase();
const SAFE_CODES = new Set([
  "EAI_AGAIN", "EADDRNOTAVAIL", "ECONNABORTED", "ECONNREFUSED", "ECONNRESET",
  "EHOSTUNREACH", "ENETUNREACH", "ENOTFOUND", "EPIPE", "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_HEADERS_TIMEOUT", "UND_ERR_SOCKET",
]);

type Check = {
  status: number | null;
  durationMs: number;
  errorName?: string;
  errorCode?: string;
};

function safeErrorName(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const name = (value as { name?: unknown }).name;
  return typeof name === "string" && /^[A-Za-z][A-Za-z0-9]{0,31}$/.test(name) ? name : "unknown";
}

function safeErrorCode(value: unknown) {
  return typeof value === "string" && SAFE_CODES.has(value) ? value : undefined;
}

function codeFromMessage(value: unknown) {
  if (typeof value !== "string") return undefined;
  const name = value.match(/^([A-Za-z][A-Za-z0-9]{0,31}):/)?.[1];
  return name && /^[A-Za-z][A-Za-z0-9]{0,31}$/.test(name) ? name : undefined;
}

function networkFailure(startedAt: number, error: unknown): Check {
  const cause = error && typeof error === "object" ? (error as { cause?: unknown }).cause : undefined;
  const rawCode = cause && typeof cause === "object" ? (cause as { code?: unknown }).code : undefined;
  return {
    status: null,
    durationMs: Date.now() - startedAt,
    errorName: safeErrorName(error) ?? codeFromMessage(error && typeof error === "object" ? (error as { message?: unknown }).message : undefined) ?? "unknown",
    ...(safeErrorCode(rawCode) ? { errorCode: safeErrorCode(rawCode) } : {}),
  };
}

async function authAdminCheck(client: SupabaseClient): Promise<Check & { userMatches?: boolean }> {
  const startedAt = Date.now();
  try {
    const result = await client.auth.admin.getUserById(ADMIN_ID);
    const status = result.error ? result.error.status ?? null : 200;
    const cause = result.error && "cause" in result.error ? result.error.cause : undefined;
    const causeCode = cause && typeof cause === "object" ? (cause as { code?: unknown }).code : undefined;
    return {
      status,
      durationMs: Date.now() - startedAt,
      ...(result.error && (status === null || status === 0) ? { errorName: codeFromMessage(result.error.message) ?? "unknown" } : {}),
      ...(result.error?.code && /^[A-Z0-9_]{1,24}$/.test(result.error.code) ? { errorCode: result.error.code } : {}),
      ...(safeErrorCode(causeCode) ? { errorCode: safeErrorCode(causeCode) } : {}),
      userMatches: !result.error && result.data.user?.id === ADMIN_ID && result.data.user.email?.toLowerCase() === ADMIN_EMAIL,
    };
  } catch (error) {
    return { ...networkFailure(startedAt, error), userMatches: false };
  }
}

async function staffCheck(client: SupabaseClient): Promise<Check & { activeStaffFound?: boolean }> {
  const startedAt = Date.now();
  try {
    const result = await client.from("staff_members").select("user_id")
      .eq("user_id", ADMIN_ID).eq("active", true).maybeSingle();
    const status = typeof result.status === "number" ? result.status : null;
    return {
      status,
      durationMs: Date.now() - startedAt,
      ...(result.error && (status === null || status === 0) ? { errorName: codeFromMessage(result.error.message) ?? "unknown" } : {}),
      ...(result.error?.code && /^[A-Z0-9_]{1,24}$/.test(result.error.code) ? { errorCode: result.error.code } : {}),
      activeStaffFound: !result.error && !!result.data,
    };
  } catch (error) {
    return { ...networkFailure(startedAt, error), activeStaffFound: false };
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedPreviewDiagnostics(request)) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (url !== PREVIEW_URL || !key) {
    return Response.json({ previewConfigurationMatches: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const [authAdminResult, staffResult] = await Promise.all([
    authAdminCheck(client),
    staffCheck(client),
  ]);
  const connected = authAdminResult.status === 200 && authAdminResult.userMatches === true &&
    staffResult.status === 200 && staffResult.activeStaffFound === true;

  return Response.json({
    previewConfigurationMatches: true,
    authAdmin: authAdminResult,
    postgrestStaffRead: staffResult,
    connected,
  }, { headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
}
