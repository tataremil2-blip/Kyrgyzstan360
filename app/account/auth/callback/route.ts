import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function failure(request: NextRequest) { return NextResponse.redirect(new URL("/account/login?error=1", request.url)); }

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!code || code.length > 4096 || !url || !key) return failure(request);
  try {
    const response = NextResponse.redirect(new URL("/account", request.url));
    const supabase = createServerClient(url, key, { cookieOptions: { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax", path: "/" }, cookies: {
      getAll: () => request.cookies.getAll(), setAll(values) { values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); },
    } });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return failure(request);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch { return failure(request); }
}
