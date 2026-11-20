import { createClient } from "@supabase/supabase-js";
import { isAuthorizedPreviewDiagnostics } from "@/lib/admin/preview-diagnostics-guard";
import { databaseFetch } from "@/lib/travel-requests/database";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ADMIN_USER_ID = "1f6e89ca-09f1-4d2c-a9ee-06bec72c8ac6";
const SAFE_TRANSPORT_CODES = new Set([
  "EAI_AGAIN", "EADDRNOTAVAIL", "ECONNABORTED", "ECONNREFUSED", "ECONNRESET",
  "EHOSTUNREACH", "ENETUNREACH", "ENOTFOUND", "EPIPE", "ETIMEDOUT",
  "ERR_HTTP_INVALID_HEADER_VALUE", "ERR_INVALID_CHAR", "ERR_TLS_CERT_ALTNAME_INVALID",
  "UND_ERR_BODY_TIMEOUT", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_HEADERS_TIMEOUT", "UND_ERR_SOCKET",
]);

type ProbeResult = {
  status: number | null;
  durationMs: number;
  errorName?: string;
  causeName?: string;
  causeCode?: string;
  responseCode?: string;
  activeStaffFound?: boolean;
  fetchStarted?: boolean;
  attempts?: number;
};

function safeName(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const name = (value as { name?: unknown }).name;
  return typeof name === "string" && /^[A-Za-z][A-Za-z0-9]{0,31}$/.test(name) ? name : "unknown";
}

function safeCode(value: unknown) {
  return typeof value === "string" && SAFE_TRANSPORT_CODES.has(value) ? value : undefined;
}

function errorCause(error: unknown) {
  return error && typeof error === "object" ? (error as { cause?: unknown }).cause : undefined;
}

function safePostgrestCode(value: unknown) {
  return typeof value === "string" && /^[A-Z0-9_]{1,24}$/.test(value) ? value : undefined;
}

function requestUrl(baseUrl: string) {
  const url = new URL("rest/v1/staff_members", baseUrl);
  url.search = new URLSearchParams({
    select: "user_id",
    user_id: `eq.${ADMIN_USER_ID}`,
    active: "eq.true",
    limit: "1",
  }).toString();
  return url;
}

async function readStaffResponse(response: Response) {
  try {
    const payload: unknown = await response.json();
    if (Array.isArray(payload)) return { activeStaffFound: response.ok && payload.length > 0 };
    const code = payload && typeof payload === "object" ? (payload as { code?: unknown }).code : undefined;
    return { activeStaffFound: false, ...(safePostgrestCode(code) ? { responseCode: safePostgrestCode(code) } : {}) };
  } catch {
    return { activeStaffFound: false };
  }
}

async function fetchProbe(
  url: URL,
  key: string,
  fetcher: typeof fetch,
): Promise<ProbeResult> {
  const startedAt = Date.now();
  let fetchStarted = false;
  const observedFetcher: typeof fetch = async (...args) => {
    fetchStarted = true;
    return fetcher(...args);
  };
  try {
    const response = await observedFetcher(url, {
      method: "GET",
      headers: { apikey: key, authorization: `Bearer ${key}`, accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const body = await readStaffResponse(response);
    return {
      status: response.status,
      durationMs: Date.now() - startedAt,
      ...body,
      fetchStarted,
    };
  } catch (error) {
    const cause = errorCause(error);
    return {
      status: null,
      durationMs: Date.now() - startedAt,
      errorName: safeName(error) ?? "unknown",
      causeName: safeName(cause) ?? "unknown",
      causeCode: safeCode(cause && typeof cause === "object" ? (cause as { code?: unknown }).code : undefined) ?? "other",
      fetchStarted,
    };
  }
}

async function authHealthProbe(baseUrl: string): Promise<ProbeResult> {
  const startedAt = Date.now();
  let fetchStarted = false;
  try {
    fetchStarted = true;
    const response = await fetch(new URL("auth/v1/health", baseUrl), {
      method: "GET", cache: "no-store", signal: AbortSignal.timeout(8_000),
    });
    await response.body?.cancel().catch(() => undefined);
    return { status: response.status, durationMs: Date.now() - startedAt, fetchStarted };
  } catch (error) {
    const cause = errorCause(error);
    return {
      status: null,
      durationMs: Date.now() - startedAt,
      errorName: safeName(error) ?? "unknown",
      causeName: safeName(cause) ?? "unknown",
      causeCode: safeCode(cause && typeof cause === "object" ? (cause as { code?: unknown }).code : undefined) ?? "other",
      fetchStarted,
    };
  }
}

async function authAdminProbe(baseUrl: string, key: string): Promise<ProbeResult & { userMatches?: boolean }> {
  const startedAt = Date.now();
  const transportFailures: Array<Pick<ProbeResult, "errorName" | "causeName" | "causeCode">> = [];
  let fetchAttempts = 0;
  const observedFetch: typeof fetch = async (...args) => {
    fetchAttempts += 1;
    try {
      return await fetch(...args);
    } catch (error) {
      const cause = errorCause(error);
      transportFailures.push({
        errorName: safeName(error) ?? "unknown",
        causeName: safeName(cause) ?? "unknown",
        causeCode: safeCode(cause && typeof cause === "object" ? (cause as { code?: unknown }).code : undefined) ?? "other",
      });
      throw error;
    }
  };
  try {
    const client = createClient(baseUrl, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: observedFetch },
    });
    const result = await client.auth.admin.getUserById(ADMIN_USER_ID);
    return {
      status: result.error?.status ?? 200,
      durationMs: Date.now() - startedAt,
      ...(result.error ? { responseCode: safePostgrestCode(result.error.code) } : {}),
      userMatches: !result.error && result.data.user?.id === ADMIN_USER_ID,
      fetchStarted: fetchAttempts > 0,
      attempts: fetchAttempts,
      ...(transportFailures.at(-1) ?? {}),
    };
  } catch (error) {
    const cause = errorCause(error);
    return {
      status: null,
      durationMs: Date.now() - startedAt,
      errorName: safeName(error) ?? "unknown",
      causeName: safeName(cause) ?? "unknown",
      causeCode: safeCode(cause && typeof cause === "object" ? (cause as { code?: unknown }).code : undefined) ?? "other",
      userMatches: false,
      fetchStarted: fetchAttempts > 0,
      attempts: fetchAttempts,
      ...(transportFailures.at(-1) ?? {}),
    };
  }
}

async function sdkStaffProbe(): Promise<ProbeResult> {
  const startedAt = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return { status: null, durationMs: 0, errorName: "ConfigurationError", fetchStarted: false, attempts: 0 };

  let fetchAttempts = 0;
  const observedDatabaseFetch: typeof fetch = (...args) => {
    fetchAttempts += 1;
    return databaseFetch(...args);
  };
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: observedDatabaseFetch },
    });
    const result = await client.from("staff_members").select("user_id")
      .abortSignal(AbortSignal.timeout(9_000))
      .eq("user_id", ADMIN_USER_ID).eq("active", true).maybeSingle();
    return {
      status: result.status,
      durationMs: Date.now() - startedAt,
      ...(result.error ? { responseCode: safePostgrestCode(result.error.code) } : {}),
      activeStaffFound: !result.error && !!result.data,
      fetchStarted: fetchAttempts > 0,
      attempts: fetchAttempts,
    };
  } catch (error) {
    const cause = errorCause(error);
    return {
      status: null,
      durationMs: Date.now() - startedAt,
      errorName: safeName(error) ?? "unknown",
      causeName: safeName(cause) ?? "unknown",
      causeCode: safeCode(cause && typeof cause === "object" ? (cause as { code?: unknown }).code : undefined) ?? "other",
      activeStaffFound: false,
      fetchStarted: fetchAttempts > 0,
      attempts: fetchAttempts,
    };
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedPreviewDiagnostics(request)) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY;
  const projectMatches = new URL(baseUrl).hostname === "epyifhlwdhzlpfpnavkg.supabase.co";
  if (!projectMatches || !key) {
    return Response.json({ projectMatches, configurationAvailable: !!key }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const staffUrl = requestUrl(baseUrl);
  const [authHealth, authAdmin, standardPostgrest, customPostgrest, sdkPostgrest] = await Promise.all([
    authHealthProbe(baseUrl),
    authAdminProbe(baseUrl, key),
    fetchProbe(staffUrl, key, fetch),
    fetchProbe(staffUrl, key, databaseFetch),
    sdkStaffProbe(),
  ]);

  const healthy = authHealth.status === 200 && authAdmin.userMatches === true &&
    standardPostgrest.activeStaffFound === true && customPostgrest.activeStaffFound === true &&
    sdkPostgrest.activeStaffFound === true;
  return Response.json({
    projectMatches,
    branchMatches: process.env.VERCEL_GIT_COMMIT_REF === "feature/travel-requests-mvp",
    authHealth,
    authAdmin,
    standardPostgrest,
    customPostgrest,
    sdkPostgrest,
    healthy,
  }, { headers: { "Cache-Control": "no-store", "Pragma": "no-cache" } });
}
