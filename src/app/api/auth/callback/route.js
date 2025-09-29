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
    
    if (!codeVerifier) {
      console.error('No PKCE code_verifier found in cookies');
      return NextResponse.redirect(
        new URL('/auth/login?error=no_code_verifier&error_description=PKCE code verifier not found', request.url)
      );
    }

    // Forward to Django backend for processing
    const djangoResponse = await fetch(`${DJANGO_API_BASE}/auth/oidc-callback/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
        redirect_uri: `${new URL(request.url).origin}/api/auth/callback`,
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
