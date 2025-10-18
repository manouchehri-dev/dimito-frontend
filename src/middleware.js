import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
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
    // Check existing locale cookie first
    const existingLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
    let targetLocale = null;
    
    if (existingLocale && existingLocale !== 'none' && routing.locales.includes(existingLocale)) {
      // Respect user's existing locale preference (if valid and not "none")
      targetLocale = existingLocale;
      console.log(`🍪 Middleware: Using existing locale cookie: ${existingLocale}`);
    } else if (!existingLocale || existingLocale === 'none') {
      // First visit or invalid cookie - set based on domain
      if (hostname.endsWith("dimito.ir")) {
        targetLocale = "fa";
        console.log(`🌐 Middleware: First visit or invalid cookie ("${existingLocale || 'none'}"), setting to "fa" for dimito.ir domain`);
      } else if (hostname.endsWith("dimito.io")) {
        targetLocale = "en";
        console.log(`🌐 Middleware: First visit or invalid cookie ("${existingLocale || 'none'}"), setting to "en" for dimito.io domain`);
      } else {
        // For localhost/development, default to "en"
        targetLocale = "en";
        console.log(`🌐 Middleware: First visit or invalid cookie ("${existingLocale || 'none'}"), defaulting to "en" for development`);
      }
    }
    
    if (targetLocale) {
      url.pathname = `/${targetLocale}${url.pathname}`;
      const redirectResponse = NextResponse.redirect(url);
      // Always update cookie if it's different from existing or if it was "none"
      if (!existingLocale || existingLocale === 'none' || existingLocale !== targetLocale) {
        redirectResponse.cookies.set(LOCALE_COOKIE_NAME, targetLocale, {
          ...LOCALE_COOKIE_OPTIONS,
          httpOnly: false,
        });
        console.log(`🍪 Middleware: Setting locale cookie to "${targetLocale}"`);
      }
      return redirectResponse;
    }
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
      const currentCookieValue = currentCookie?.value;
      
      // Determine target locale based on domain when cookie is "none" or empty
      let targetLocale = localeFromPath;
      
      if (!currentCookieValue || currentCookieValue === 'none') {
        // First visit or invalid cookie - set based on domain
        if (hostname.endsWith("dimito.ir")) {
          targetLocale = "fa";
          console.log(`🍪 Middleware: Cookie is "${currentCookieValue || 'none'}", setting to "fa" for .ir domain`);
        } else if (hostname.endsWith("dimito.io")) {
          targetLocale = "en";
          console.log(`🍪 Middleware: Cookie is "${currentCookieValue || 'none'}", setting to "en" for .io domain`);
        } else {
          // For localhost/development, use the path locale
          targetLocale = localeFromPath;
          console.log(`🍪 Middleware: Cookie is "${currentCookieValue || 'none'}", setting to "${localeFromPath}" from URL`);
        }
      }
      
      // Update cookie if it's different from current value or was "none"
      if (!currentCookie || currentCookieValue === 'none' || currentCookieValue !== targetLocale) {
        console.log(`🍪 Middleware: Updating locale cookie from "${currentCookieValue || 'none'}" to "${targetLocale}"`);
        
        response.cookies.set(LOCALE_COOKIE_NAME, targetLocale, {
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
