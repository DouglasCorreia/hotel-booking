import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, localeCookie } from "@/lib/i18n/routing";

const pagePath =
  /^\/(?:search\/?|checkout\/?|(?:hotel|confirmation)\/[^/]+\/?|)$/;

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const english = /^\/en-US(?:\/|$)/.test(url.pathname);
  const path = english
    ? url.pathname.slice("/en-US".length) || "/"
    : url.pathname;
  if (
    !english &&
    path === "/" &&
    url.searchParams.get("lang") !== defaultLocale &&
    request.cookies.get(localeCookie)?.value === "en-US"
  ) {
    url.pathname = "/en-US";
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const knownPage = pagePath.test(path);
  if (english && knownPage) return NextResponse.next();

  url.pathname = `/${english ? "en-US" : defaultLocale}${knownPage ? path : "/missing-page"}`;
  const response = NextResponse.rewrite(
    url,
    knownPage ? undefined : { status: 404 }
  );
  if (path === "/" && url.searchParams.get("lang") !== defaultLocale) {
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/|api/|icons/|offline\\.html$|sw\\.js$|(?:en-US/)?manifest\\.webmanifest$|favicon\\.ico$|apple-icon\\.png$|(?:file|globe|next|vercel|window)\\.svg$).*)",
  ],
};
