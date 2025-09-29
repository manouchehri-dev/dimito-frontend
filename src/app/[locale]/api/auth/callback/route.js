// Redirect handler for locale-prefixed callback URLs
// This handles: /fa/api/auth/callback → /api/auth/callback

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get the current URL with all query parameters
    const url = new URL(request.url);
    
    // Create new URL without locale prefix
    const redirectUrl = new URL('/api/auth/callback', url.origin);
    
    // Copy all query parameters (code, state, etc.)
    url.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    
    console.log('Redirecting from locale callback to main callback:', redirectUrl.toString());
    
    // Redirect to the main callback handler
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Error in locale callback redirect:', error);
    return NextResponse.redirect(new URL('/auth/login?error=redirect_error', request.url));
  }
}
