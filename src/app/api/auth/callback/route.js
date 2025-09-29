import { NextResponse } from 'next/server';

const DJANGO_API_BASE = process.env.DJANGO_API_BASE || 'https://api.dimito.ir';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from OIDC callback
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('OIDC Callback received:', { code: !!code, state, error });

    // Handle error from OIDC provider
    if (error) {
      console.error('OIDC Error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${error}&error_description=${encodeURIComponent(errorDescription || 'Authentication failed')}`, request.url)
      );
    }

    // Validate required parameters
    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(
        new URL('/auth/login?error=no_code&error_description=No authorization code received', request.url)
      );
    }

    // Get PKCE code_verifier from cookie
    const codeVerifier = request.cookies.get('pkce_code_verifier')?.value;
    
    // Debug: Log all cookies to help troubleshoot
    console.log('Available cookies:', Object.fromEntries(
      Array.from(request.cookies.entries()).map(([key, cookie]) => [key, cookie.value])
    ));
    
    if (!codeVerifier) {
      console.error('No PKCE code_verifier found in cookies');
      console.error('This usually means:');
      console.error('1. Cookie was not set during authorization (check browser dev tools)');
      console.error('2. Cookie expired (max-age too short)');
      console.error('3. Cookie security settings prevent it from being sent');
      console.error('4. User cleared cookies between authorization and callback');
      
      return NextResponse.redirect(
        new URL('/auth/login?error=no_code_verifier&error_description=PKCE code verifier not found. Please try logging in again.', request.url)
      );
    }
    
    console.log('PKCE code_verifier found:', codeVerifier.substring(0, 10) + '...');

    // Get the correct redirect URI for production
    const getRedirectUri = () => {
      // Use environment variable for production
      if (process.env.DOT_REDIRECT_URI) {
        return process.env.DOT_REDIRECT_URI;
      }
      
      // Use public URL for production deployment
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}/api/auth/callback`;
      }
      
      // Use custom domain if set
      if (process.env.NEXT_PUBLIC_APP_URL) {
        return `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
      }
      
      // Fallback to request origin (development)
      return `${new URL(request.url).origin}/api/auth/callback`;
    };

    const redirectUri = getRedirectUri();
    console.log('Using redirect URI:', redirectUri);

    // Forward to Django backend for processing
    const djangoResponse = await fetch(`${DJANGO_API_BASE}/auth/oidc-callback/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier  // Send PKCE code_verifier to Django
      })
    });

    if (!djangoResponse.ok) {
      const errorData = await djangoResponse.text();
      console.error('Django callback failed:', djangoResponse.status, errorData);
      
      return NextResponse.redirect(
        new URL('/auth/login?error=backend_error&error_description=Authentication processing failed', request.url)
      );
    }

    const result = await djangoResponse.json();
    
    if (result.error) {
      console.error('Django returned error:', result.error);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${result.error}&error_description=${encodeURIComponent(result.error_description || 'Authentication failed')}`, request.url)
      );
    }

    // Success - redirect to frontend callback with JWT token
    if (result.token) {
      console.log('Authentication successful, redirecting with token');
      
      // Clear PKCE code_verifier cookie after successful authentication
      const response = NextResponse.redirect(
        new URL(`/auth/callback?token=${result.token}`, request.url)
      );
      response.cookies.delete('pkce_code_verifier');
      
      return response;
    }

    // Fallback error
    console.error('No token received from Django');
    return NextResponse.redirect(
      new URL('/auth/login?error=no_token&error_description=No authentication token received', request.url)
    );

  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=server_error&error_description=Internal server error', request.url)
    );
  }
}
