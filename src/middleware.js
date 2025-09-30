import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_OPTIONS } from "./lib/locale-cookie-server";

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
      const redirectResponse = Response.redirect(url);
      // Set locale cookie for Farsi domain
      redirectResponse.cookies.set(LOCALE_COOKIE_NAME, "fa", {
        ...LOCALE_COOKIE_OPTIONS,
        httpOnly: false,
      });
      console.log(`🍪 Middleware: Setting locale cookie to "fa" for dimito.ir domain redirect`);
      return redirectResponse;
    } else if (hostname.endsWith("dimito.io")) {
      url.pathname = `/en${url.pathname}`;
      const redirectResponse = Response.redirect(url);
      // Set locale cookie for English domain
      redirectResponse.cookies.set(LOCALE_COOKIE_NAME, "en", {
        ...LOCALE_COOKIE_OPTIONS,
        httpOnly: false,
      });
      console.log(`🍪 Middleware: Setting locale cookie to "en" for dimito.io domain redirect`);
      return redirectResponse;
    }
    // For development (localhost) or other domains, let intl middleware handle default locale
  }

  // --- Fallback to intl middleware ---
  const response = intlMiddleware(req);
  
  // --- Update locale cookie based on current request locale ---
  if (response) {
    // Extract locale from URL path
    const pathSegments = url.pathname.split('/');
    const localeFromPath = pathSegments[1]; // First segment after /
    
    // Validate and set locale cookie if it's a valid locale
    if (routing.locales.includes(localeFromPath)) {
      const currentCookie = req.cookies.get(LOCALE_COOKIE_NAME);
      
      // Only update cookie if it's different from current value
      if (!currentCookie || currentCookie.value !== localeFromPath) {
        console.log(`🍪 Middleware: Updating locale cookie from "${currentCookie?.value || 'none'}" to "${localeFromPath}"`);
        
        response.cookies.set(LOCALE_COOKIE_NAME, localeFromPath, {
          ...LOCALE_COOKIE_OPTIONS,
          httpOnly: false, // Allow client-side access
        });
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    "/",
    "/(fa|en)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)", // Exclude /api/ routes from middleware
  ],
};
