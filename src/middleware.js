import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // --- Skip API routes from locale handling ---
  if (url.pathname.startsWith("/api/")) {
    return; // Let API routes pass through without locale handling
  }

  // --- Skip health probes (kubelet requests via pod IP, not domain) ---
  // Only skip for production health checks (IP addresses without domain names)
  const isHealthProbe = /^\d+\.\d+\.\d+\.\d+/.test(hostname) && 
                       !hostname.includes("dimito.ir") && 
                       !hostname.includes("dimito.io") &&
                       !hostname.includes("localhost") &&
                       !hostname.includes("127.0.0.1");
  
  if (isHealthProbe) {
    return new Response("ok", { status: 200 });
  }

  // --- Domain-based locale redirect, only if no locale prefix ---
  if (!url.pathname.startsWith("/fa") && !url.pathname.startsWith("/en")) {
    if (hostname.endsWith("dimito.ir")) {
      url.pathname = `/fa${url.pathname}`;
      return Response.redirect(url);
    } else if (hostname.endsWith("dimito.io")) {
      url.pathname = `/en${url.pathname}`;
      return Response.redirect(url);
    }
    // For development (localhost) or other domains, let intl middleware handle default locale
  }

  // --- Fallback to intl middleware ---
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/",
    "/(fa|en)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)", // Exclude /api/ routes from middleware
  ],
};
