import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE_KEY,
  localizedPath,
} from "@/lib/i18n/locale";

// English keeps the unprefixed URLs; other locales live under /<locale>.
// Every page is rendered from the static [locale] segment.
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const [, firstSegment] = url.pathname.split("/");

  // Internal rewrites can re-enter the proxy as /en/..., so a prefixed path always passes through;
  // /en/... pages canonicalise to the unprefixed URL instead of redirecting.
  if (isLocale(firstSegment)) return NextResponse.next();

  // A saved preference only redirects people; crawlers carry no cookie and see English.
  const preferred = request.cookies.get(LOCALE_COOKIE_KEY)?.value;
  if (isLocale(preferred) && preferred !== DEFAULT_LOCALE) {
    url.pathname = localizedPath(url.pathname, preferred);
    return NextResponse.redirect(url);
  }

  url.pathname = `/${DEFAULT_LOCALE}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|opengraph-image|twitter-image|.*\\..*).*)"],
};
