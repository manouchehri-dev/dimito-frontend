import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Only redirect if no locale prefix is present
  if (!url.pathname.startsWith("/fa") && !url.pathname.startsWith("/en")) {
    if (hostname.endsWith("dimito.ir")) {
      url.pathname = `/fa${url.pathname}`;
    } else if (hostname.endsWith("dimito.io")) {
      url.pathname = `/en${url.pathname}`;
    }
    return Response.redirect(url);
  }

  // Let next-intl handle requests with a locale
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/",
    "/(fa|en)/:path*",
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
