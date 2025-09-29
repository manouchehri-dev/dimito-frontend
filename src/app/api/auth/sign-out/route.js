/**
 * Sign-Out API Route
 * 
 * Handles the post-logout redirect from OIDC provider.
 * This is the endpoint specified in post_logout_redirect_uri.
 * 
 * GET /api/auth/sign-out
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('Post-logout callback received from OIDC provider');

    // Get any error parameters from OIDC provider
    const { searchParams } = new URL(request.url);
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.error('OIDC logout error:', error, errorDescription);
      // Redirect to login with error
      const response = NextResponse.redirect(
        new URL(`/auth/login?error=${error}&error_description=${encodeURIComponent(errorDescription || 'Logout failed')}`, request.url)
      );
      clearAuthCookies(response);
      return response;
    }
    
    // Successful logout - redirect to login page with success message
    const response = NextResponse.redirect(new URL('/auth/login?logout=success', request.url));
    
    // Clear all authentication-related cookies
    clearAuthCookies(response);
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('User successfully logged out by provider, redirecting to login');
    return response;

  } catch (error) {
    console.error('Sign-out callback error:', error);
    
    // Fallback: redirect to login page with error
    const response = NextResponse.redirect(new URL('/auth/login?error=sign_out_error', request.url));
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
    'oauth_state'
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
