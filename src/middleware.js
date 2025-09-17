import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

// Custom middleware with domain-based locale detection
export default function middleware(request) {
  const { pathname, hostname } = request.nextUrl;
  
  // Domain-based locale detection
  let locale = "fa"; // default
  if (hostname === "dimito.io") {
    locale = "en";
  } else if (hostname === "dimito.ir") {
    locale = "fa";
  }
  
  // If accessing root path, redirect to locale-specific path
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }
  
  // Handle other paths with next-intl middleware
  const handleI18nRouting = createMiddleware(routing);
  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
