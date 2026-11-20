import { timingSafeEqual } from "node:crypto";

const PREVIEW_PROJECT_HOST = "epyifhlwdhzlpfpnavkg.supabase.co";
const PREVIEW_BRANCH = "feature/travel-requests-mvp";

export function isAuthorizedPreviewDiagnostics(request: Request, env: NodeJS.ProcessEnv = process.env) {
  if (env.VERCEL_ENV !== "preview" || env.VERCEL_GIT_COMMIT_REF !== PREVIEW_BRANCH) return false;

  try {
    if (new URL(env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname !== PREVIEW_PROJECT_HOST) return false;
  } catch {
    return false;
  }

  const expected = env.CRON_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  const candidate = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!expected || !candidate) return false;

  const expectedBytes = Buffer.from(expected);
  const candidateBytes = Buffer.from(candidate);
  return expectedBytes.length === candidateBytes.length && timingSafeEqual(expectedBytes, candidateBytes);
}
