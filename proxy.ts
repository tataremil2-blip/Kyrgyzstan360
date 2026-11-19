import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "./lib/i18n";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const first = path.split("/")[1];
  if (isLocale(first)) return NextResponse.next();
  // Unknown language prefixes reach the locale layout and return 404.
  if (/^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(first)) return NextResponse.next();
  const url = request.nextUrl.clone();
  const saved = request.cookies.get("k360-language")?.value;
  const locale = path === "/" && saved && isLocale(saved) ? saved : "en";
  url.pathname = `/${locale}${path === "/" ? "" : path}`;
  const response = NextResponse.redirect(url, path === "/" ? 307 : 308);
  if (path === "/") response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: ["/((?!api(?:/|$)|_next(?:/|$)|.*\\..*).*)"] };
