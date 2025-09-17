import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // --- Skip health probes (kubelet requests via pod IP, not domain) ---
  if (!hostname.includes("dimito.ir") && !hostname.includes("dimito.io")) {
    return new Response("ok", { status: 200 });
  }

  // --- Domain-based locale redirect, only if no locale prefix ---
  if (!url.pathname.startsWith("/fa") && !url.pathname.startsWith("/en")) {
    if (hostname.endsWith("dimito.ir")) {
      url.pathname = `/fa${url.pathname}`;
    } else if (hostname.endsWith("dimito.io")) {
      url.pathname = `/en${url.pathname}`;
    }
    return Response.redirect(url);
  }

  // --- Fallback to intl middleware ---
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/",
    "/(fa|en)/:path*",
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
