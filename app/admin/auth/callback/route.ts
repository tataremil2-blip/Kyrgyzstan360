import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { safeAdminPath } from "@/lib/admin/auth";

function callbackError(request: NextRequest, message: string) {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("authError", message);
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const type = request.nextUrl.searchParams.get("type");
  const requestedNext = request.nextUrl.searchParams.get("next");
  const next = ["invite", "recovery"].includes(type ?? "")
    ? "/admin/auth/complete"
    : safeAdminPath(requestedNext);
  if (!code || code.length > 4096) return callbackError(request, "invalid_link");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return callbackError(request, "unavailable");

  try {
    const response = NextResponse.redirect(new URL(next, request.url));
    const supabase = createServerClient(url, key, {
      cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, headers) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          for (const name of ["cache-control", "expires", "pragma"]) {
            const value = headers[name];
            if (value) response.headers.set(name, value);
          }
        },
      },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return callbackError(request, "invalid_link");
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch {
    return callbackError(request, "invalid_link");
  }
}

