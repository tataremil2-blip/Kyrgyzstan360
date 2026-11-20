import { createClient } from "@supabase/supabase-js";

const DATABASE_FETCH_TIMEOUT_MS = 12_000;

export function databaseFetchOptions(
  init?: RequestInit,
  timeoutSignal = AbortSignal.timeout(DATABASE_FETCH_TIMEOUT_MS),
) {
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;
  return { ...init, cache: "no-store" as RequestCache, signal };
}

export function databaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, databaseFetchOptions(init));
}

export function database() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Trip request storage is unavailable");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: databaseFetch },
  });
}
