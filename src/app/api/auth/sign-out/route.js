import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('Post-logout callback received from OIDC provider');
    
    // Create response with logout success page that will handle cleanup
    const response = NextResponse.redirect(new URL('/?logout=success&cleanup=true', request.url));
    
    // Clear any auth cookies on server side
    response.cookies.delete('auth_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('pkce_code_verifier');
    
    // Clear any other potential auth cookies
    response.cookies.set('auth_token', '', { expires: new Date(0), path: '/' });
    response.cookies.set('refresh_token', '', { expires: new Date(0), path: '/' });
    response.cookies.set('pkce_code_verifier', '', { expires: new Date(0), path: '/' });
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('User successfully logged out by provider, redirecting to home with cleanup flag');
    return response;

  } catch (error) {
    console.error('Logout callback error:', error);
    
    // Even if there's an error, clear cookies and redirect with cleanup
    const response = NextResponse.redirect(new URL('/?logout=error&cleanup=true', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('pkce_code_verifier');
    
    return response;
  }
}

export async function POST(request) {
  // Handle POST requests if needed
  return GET(request);
}
