import { NextRequest, NextResponse } from "next/server";
import {
  COUNTRY_COOKIE,
  SUPPORTED_COUNTRIES,
} from "@/lib/locale/countries";
import {
  isValidLocale,
  countryToLocale,
  localeToCountry,
} from "@/lib/locale/localeUtils";

/**
 * Locale middleware — single gate for URL-based locale routing.
 *
 * Valid locale in URL  → pass through, set cookie
 * Invalid locale       → 404
 * No locale in URL     → 308 redirect to geo-detected locale
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract first path segment to check for locale
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  // ── Valid locale in URL → pass through ──────────────────────────────
  if (firstSegment && isValidLocale(firstSegment)) {
    const response = NextResponse.next();

    // Remember locale preference for future bare-URL redirects
    response.cookies.set(COUNTRY_COOKIE, localeToCountry(firstSegment), {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
    });

    return response;
  }

  // ── Looks like a locale (en-xx pattern) but invalid → 404 ──────────
  if (firstSegment && /^en-[a-z]{2}$/.test(firstSegment)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // ── No locale in URL → redirect to geo-detected locale ─────────────
  // Priority: cookie > Vercel geo header > default (SE)
  const cookieCountry = request.cookies.get(COUNTRY_COOKIE)?.value;
  const geoCountry = request.headers.get("x-vercel-ip-country") || "SE";

  let country = "SE";
  if (cookieCountry && SUPPORTED_COUNTRIES.includes(cookieCountry)) {
    country = cookieCountry;
  } else if (SUPPORTED_COUNTRIES.includes(geoCountry)) {
    country = geoCountry;
  }

  const locale = countryToLocale(country);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;

  // 308 Permanent Redirect (preserves HTTP method)
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    // Match all paths except API, Next internals, Studio, and static assets
    "/((?!api|_next|studio|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.).*)",
  ],
};
