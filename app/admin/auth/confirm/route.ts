import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeAdminPath } from "@/lib/admin/auth";

const sensitiveHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow",
};

function loginError(request: NextRequest) {
  const destination = new URL("/admin/login", request.url);
  destination.searchParams.set("authError", "invalid_link");
  const response = NextResponse.redirect(destination, 303);
  for (const [name, value] of Object.entries(sensitiveHeaders)) response.headers.set(name, value);
  return response;
}

function recoveryConfirmationPage() {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <title>Confirm password reset | Kyrgyzstan360 CRM</title>
</head>
<body>
  <main>
    <h1>Confirm password reset</h1>
    <p id="status" role="status">Preparing your secure recovery link…</p>
    <form method="post" action="/admin/auth/confirm">
      <input type="hidden" name="type" value="recovery">
      <input type="hidden" name="token_hash" id="token-hash">
      <button type="submit" id="continue" disabled>Continue to set password</button>
    </form>
    <noscript><p>Enable JavaScript to continue, or request a new recovery email.</p></noscript>
    <p><a href="/admin/auth/recovery">Request a new recovery email</a></p>
  </main>
  <script>
    (() => {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("token_hash");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      const input = document.getElementById("token-hash");
      const button = document.getElementById("continue");
      const status = document.getElementById("status");
      if (token && token.length <= 2048 && /^[A-Za-z0-9_-]+$/.test(token)) {
        input.value = token;
        button.disabled = false;
        status.textContent = "Your link is ready. Continue to verify it and set a new password.";
      } else {
        status.textContent = "This recovery link is invalid or expired. Request a new recovery email.";
      }
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      ...sensitiveHeaders,
      "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");

  // The recovery token is kept in the URL fragment, so link scanners can fetch this
  // page without sending or consuming the one-time credential.
  if (type === "recovery") return recoveryConfirmationPage();

  // Preserve the existing code callback for invite and other non-recovery links.
  const code = request.nextUrl.searchParams.get("code");
  const next = safeAdminPath(request.nextUrl.searchParams.get("next"));
  if (!code || code.length > 4096 || !["invite", "signup", "email"].includes(type ?? "")) {
    return loginError(request);
  }

  const destination = new URL("/admin/auth/callback", request.url);
  destination.searchParams.set("code", code);
  destination.searchParams.set("next", next);
  destination.searchParams.set("type", type!);
  const response = NextResponse.redirect(destination, 303);
  for (const [name, value] of Object.entries(sensitiveHeaders)) response.headers.set(name, value);
  return response;
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return loginError(request);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return loginError(request);
  }

  const type = form.get("type");
  const tokenHash = form.get("token_hash");
  if (type !== "recovery" || typeof tokenHash !== "string" || tokenHash.length === 0 ||
      tokenHash.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(tokenHash)) {
    return loginError(request);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return loginError(request);

  const secure = request.nextUrl.protocol === "https:";
  const response = NextResponse.redirect(new URL("/admin/auth/complete", request.url), 303);
  let sessionCookieWritten = false;

  try {
    const supabase = createServerClient(url, key, {
      cookieOptions: { httpOnly: true, secure, sameSite: "lax", path: "/" },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            const cookieOptions = { ...options, httpOnly: true, secure, sameSite: "lax" as const, path: "/" };
            delete cookieOptions.domain;
            response.cookies.set(name, value, cookieOptions);
            if (name.includes("-auth-token")) sessionCookieWritten = true;
          });
        },
      },
    });

    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (error || !data?.user || !data?.session || !sessionCookieWritten) return loginError(request);
  } catch {
    return loginError(request);
  }

  for (const [name, value] of Object.entries(sensitiveHeaders)) response.headers.set(name, value);
  return response;
}
