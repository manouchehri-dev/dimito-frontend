/**
 * Sign-Out API Route
 * 
 * Handles the post-logout redirect from OIDC provider.
 * This is the endpoint specified in post_logout_redirect_uri.
 * 
 * GET /api/auth/sign-out
 */
import { NextResponse } from 'next/server';
import { getLocaleFromCookies } from '@/lib/locale-cookie-server';
import { createRedirectUrl } from '@/lib/url-utils';

export async function GET(request) {
  
  try {
    console.log('Post-logout callback received from OIDC provider');
    
    // Get user's preferred locale from cookie for redirect
    const userLocale = await getLocaleFromCookies();
    console.log(`🍪 User locale from cookie: ${userLocale}`);
    
    // Get original domain to redirect back to (stored during login on .ir domain)
    // This cookie was set during successful authentication in callback route
    const originalDomain = request.cookies.get('sso_original_domain')?.value;
    if (originalDomain) {
      console.log(`🌐 Original domain from cookie: ${originalDomain}`);
    }
    
    // Get any error parameters from OIDC provider
    console.log(request.url);
    const { searchParams } = new URL(request.url);
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      console.error('OIDC logout error:', error, errorDescription);
      // Redirect to home page with error (preserve user's locale and domain)
      const response = NextResponse.redirect(
        createRedirectUrl(request, '/', userLocale, {
          error,
          error_description: errorDescription || 'Logout failed'
        }, originalDomain)
      );
      clearAuthCookies(response);
      return response;
    }
    
    // Successful logout - redirect to home page with cleanup flag (preserve user's locale and domain)
    console.log(`🎯 Redirecting to original domain: ${originalDomain || 'current domain'}`);
    const response = NextResponse.redirect(
      createRedirectUrl(request, '/', userLocale, {
        logout: 'success',
        cleanup: 'true'
      }, originalDomain)
    );
    
    // Clear all authentication-related cookies
    clearAuthCookies(response);
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('User successfully logged out by provider, redirecting to home');
    return response;
  } catch (error) {
    console.error('Sign-out callback error:', error);
    
    // Fallback: redirect to home page with error (preserve user's locale and domain)
    const userLocale = await getLocaleFromCookies();
    const originalDomain = request.cookies.get('sso_original_domain')?.value;
    const response = NextResponse.redirect(
      createRedirectUrl(request, '/', userLocale, {
        error: 'sign_out_error'
      }, originalDomain)
    );
    clearAuthCookies(response);
    return response;
  }
}

/**
 * Clear all authentication-related cookies
 */
function clearAuthCookies(response) {
  const cookiesToClear = [
    'access_token',
    'refresh_token', 
    'id_token',
    'auth_token',
    'pkce_code_verifier',
    'oauth_state',
    'sso_original_domain'
  ];
  
  cookiesToClear.forEach(cookieName => {
    // Delete method
    response.cookies.delete(cookieName);
    
    // Set expired method (double-check)
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
      expires: new Date(0)
    });
  });
}

export async function POST(request) {
  // Handle POST requests if needed
  return GET(request);
}