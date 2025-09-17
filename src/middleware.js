import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

export default function middleware(request) {
  const { pathname, hostname } = request.nextUrl;
  
  // Only handle root path redirects, let next-intl handle everything else
  if (pathname === "/") {
    let locale = "fa"; // default
    
    // Domain-based locale detection
    if (hostname === "dimito.io") {
      locale = "en";
    } else if (hostname === "dimito.ir") {
      locale = "fa";
    }
    
    // Redirect to locale-specific path
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }
  
  // Let next-intl handle all other routing
  const handleI18nRouting = createMiddleware(routing);
  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
