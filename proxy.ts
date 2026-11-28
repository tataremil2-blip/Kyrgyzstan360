import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "./lib/i18n";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const withoutLocale = path.replace(/^\/(en|ru)(?=\/|$)/, "");
  // Email-first release: prevent legacy API calls AND Next Server Action POST forwarding.
  if (path === "/api/email-leads") return NextResponse.next();
  if (withoutLocale === "/api" || withoutLocale.startsWith("/api/") ||
      /^\/(admin(?:-v2)?|account)(?:\/|$)/.test(withoutLocale)) {
    return new NextResponse("Not available in this release", { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  if (!["GET", "HEAD"].includes(request.method)) return new NextResponse(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  if (path.includes(".") || path.startsWith("/_next/")) return NextResponse.next();
  const first = path.split("/")[1];
  if (isLocale(first)) return NextResponse.next();
  if (/^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(first)) return NextResponse.next();
  const url = request.nextUrl.clone();
  const saved = request.cookies.get("k360-language")?.value;
  const locale = path === "/" && saved && isLocale(saved) ? saved : "en";
  url.pathname = `/${locale}${path === "/" ? "" : path}`;
  const response = NextResponse.redirect(url, path === "/" ? 307 : 308);
  if (path === "/") response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: ["/((?!_next(?:/|$)).*)", { source: "/:path*", has: [{ type: "header", key: "next-action" }] }],
};
