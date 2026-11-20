import { NextResponse, type NextRequest } from "next/server";
import { safeAdminPath } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const type = request.nextUrl.searchParams.get("type");
  const next = safeAdminPath(request.nextUrl.searchParams.get("next"));
  if (!code || code.length > 4096 || !["invite", "recovery", "signup", "email"].includes(type ?? "")) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("authError", "invalid_link");
    const response = NextResponse.redirect(url);
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }
  const destination = new URL("/admin/auth/callback", request.url);
  destination.searchParams.set("code", code);
  destination.searchParams.set("next", next);
  destination.searchParams.set("type", type!);
  const response = NextResponse.redirect(destination);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
