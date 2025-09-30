/**
 * URL Utilities for Dynamic Base URL Detection
 * 
 * Handles proper base URL detection in different deployment environments
 * including AWS ECS, Kubernetes, Docker, and local development.
 */

/**
 * Get the correct base URL for redirects
 * Prioritizes headers and environment variables over request.url
 * 
 * @param {Request} request - The incoming request object
 * @returns {string} The correct base URL for redirects
 */
export function getBaseUrl(request) {
  // Priority 1: Environment variable (production override)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    console.log(`🌐 Using NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Priority 2: Custom domain environment variable
  if (process.env.APP_DOMAIN) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${process.env.APP_DOMAIN}`;
    console.log(`🌐 Using APP_DOMAIN: ${baseUrl}`);
    return baseUrl;
  }

  // Priority 3: Headers from load balancer/proxy (AWS ALB, CloudFront, etc.)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
  if (forwardedHost) {
    const baseUrl = `${forwardedProto}://${forwardedHost}`;
    console.log(`🌐 Using X-Forwarded-Host: ${baseUrl}`);
    return baseUrl;
  }

  // Priority 4: Host header (direct access)
  const host = request.headers.get('host');
  if (host) {
    // Determine protocol based on environment and host
    const protocol = process.env.NODE_ENV === 'production' || host.includes('dimito.') 
      ? 'https' 
      : 'http';
    const baseUrl = `${protocol}://${host}`;
    console.log(`🌐 Using Host header: ${baseUrl}`);
    return baseUrl;
  }

  // Priority 5: Vercel deployment URL
  if (process.env.VERCEL_URL) {
    const baseUrl = `https://${process.env.VERCEL_URL}`;
    console.log(`🌐 Using VERCEL_URL: ${baseUrl}`);
    return baseUrl;
  }

  // Priority 6: Fallback to request.url origin (development)
  const requestUrl = new URL(request.url);
  const baseUrl = requestUrl.origin;
  console.log(`🌐 Fallback to request origin: ${baseUrl}`);
  return baseUrl;
}

/**
 * Create a redirect URL with proper base URL and locale
 * 
 * @param {Request} request - The incoming request object
 * @param {string} path - The path to redirect to (e.g., '/auth/login')
 * @param {string} locale - The user's locale (e.g., 'en', 'fa')
 * @param {URLSearchParams|Object} params - Optional query parameters
 * @returns {URL} Complete URL object for redirect
 */
export function createRedirectUrl(request, path, locale, params = {}) {
  const baseUrl = getBaseUrl(request);
  const fullPath = `/${locale}${path}`;
  const url = new URL(fullPath, baseUrl);
  
  // Add query parameters
  if (params) {
    const searchParams = params instanceof URLSearchParams ? params : new URLSearchParams(params);
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }
  
  console.log(`🔗 Created redirect URL: ${url.toString()}`);
  return url;
}

/**
 * Environment detection utilities
 */
export const environment = {
  isProduction: process.env.NODE_ENV === 'production',
  isVercel: !!process.env.VERCEL_URL,
  isAWS: !!process.env.AWS_REGION || !!process.env.AWS_EXECUTION_ENV,
  isDocker: !!process.env.DOCKER_CONTAINER,
  
  // Check if running behind a load balancer/proxy
  isBehindProxy: (request) => {
    return !!(
      request.headers.get('x-forwarded-host') ||
      request.headers.get('x-forwarded-proto') ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-ray') // CloudFlare
    );
  }
};
