import { NextResponse } from 'next/server';
import { getLocaleFromCookies } from '@/lib/locale-cookie-server';
import { createRedirectUrl } from '@/lib/url-utils';

const DJANGO_API_BASE = process.env.DJANGO_API_BASE || 'https://api.dimito.ir';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from OIDC callback (these are in the URL, accessible across domains!)
    // Example: https://dimito.ir/api/auth/callback?code=xxx&state=yyy
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('OIDC Callback received:', { code: !!code, state, error });
    
    // Decode original domain and locale from state parameter (URL query string)
    // This works cross-domain because state is in URL, not cookies
    // Format: randomString.base64(domain|locale)
    let originalDomain = null;
    let userLocale = null;
    
    if (state && state.includes('.')) {
      try {
        const parts = state.split('.');
        if (parts.length === 2) {
          const decoded = atob(parts[1]); // Base64 decode
          
          // Check if it contains locale (new format: "domain|locale" using pipe separator)
          if (decoded.includes('|')) {
            const [domain, locale] = decoded.split('|');
            originalDomain = domain;
            userLocale = locale;
            console.log(`🌐 Original domain from state: ${originalDomain}`);
            console.log(`🗣️  User locale from state: ${userLocale}`);
          } else {
            // Old format (just domain, or legacy colon format)
            originalDomain = decoded;
            console.log(`🌐 Original domain from state (legacy format): ${originalDomain}`);
          }
          
          console.log(`✅ State parameter works cross-domain because it's in URL, not cookies!`);
        }
      } catch (decodeError) {
        console.warn('Failed to decode state:', decodeError);
      }
    }
    
    // Fallback for locale: cookie or default
    if (!userLocale) {
      userLocale = await getLocaleFromCookies();
      console.log(`🍪 User locale fallback from cookie: ${userLocale}`);
    }
    
    // Fallback for domain: current host
    if (!originalDomain) {
      const currentHost = request.headers.get('host');
      if (currentHost) {
        originalDomain = currentHost;
        console.log(`🌐 Domain fallback - Using current host: ${originalDomain}`);
      }
    }

    // Handle error from OIDC provider
    if (error) {
      console.error('OIDC Error:', error, errorDescription);
      return NextResponse.redirect(
        createRedirectUrl(request, '/auth/login', userLocale, {
          error,
          error_description: errorDescription || 'Authentication failed'
        }, originalDomain)
      );
    }

    // Validate required parameters
    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(
        createRedirectUrl(request, '/auth/login', userLocale, {
          error: 'no_code',
          error_description: 'No authorization code received'
        }, originalDomain)
      );
    }

    // Get PKCE code_verifier from cookie
    const codeVerifier = request.cookies.get('pkce_code_verifier')?.value;
    
    // Debug: Log all cookies to help troubleshoot
    const cookieEntries = {};
    request.cookies.getAll().forEach(cookie => {
      cookieEntries[cookie.name] = cookie.value;
    });
    console.log('Available cookies:', cookieEntries);
    
    if (!codeVerifier) {
      console.error('No PKCE code_verifier found in cookies');
      console.error('This usually means:');
      console.error('1. Cookie was not set during authorization (check browser dev tools)');
      console.error('2. Cookie expired (max-age too short)');
      console.error('3. Cookie security settings prevent it from being sent');
      console.error('4. User cleared cookies between authorization and callback');
      
      return NextResponse.redirect(
        createRedirectUrl(request, '/auth/login', userLocale, {
          error: 'no_code_verifier',
          error_description: 'PKCE code verifier not found. Please try logging in again.'
        }, originalDomain)
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
        createRedirectUrl(request, '/auth/login', userLocale, {
          error: 'backend_error',
          error_description: 'Authentication processing failed'
        }, originalDomain)
      );
    }

    const result = await djangoResponse.json();
    
    if (result.error) {
      console.error('Django returned error:', result.error);
      return NextResponse.redirect(
        createRedirectUrl(request, '/auth/login', userLocale, {
          error: result.error,
          error_description: result.error_description || 'Authentication failed'
        }, originalDomain)
      );
    }

    // Success - redirect to frontend callback with JWT token
    if (result.token) {
      console.log('Authentication successful, redirecting with token');
      console.log(`🎯 Redirecting to original domain: ${originalDomain || 'current domain'}`);
      
      // Clear PKCE code_verifier cookie and store original domain for logout
      const response = NextResponse.redirect(
        createRedirectUrl(request, '/auth/callback', userLocale, {
          token: result.token
        }, originalDomain)
      );
      
      response.cookies.delete('pkce_code_verifier');
      
      // Store original domain on .ir domain for logout (if different from .ir)
      if (originalDomain && !originalDomain.includes('.ir')) {
        response.cookies.set('sso_original_domain', originalDomain, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        });
        console.log('💾 Stored original domain cookie on .ir for future logout');
      }
      
      return response;
    }

    // Fallback error
    console.error('No token received from Django');
    return NextResponse.redirect(
      createRedirectUrl(request, '/auth/login', userLocale, {
        error: 'no_token',
        error_description: 'No authentication token received'
      }, originalDomain)
    );

  } catch (error) {
    console.error('Callback processing error:', error);
    
    // Try to decode original domain and locale from state if available
    let originalDomain = null;
    let userLocale = null;
    
    try {
      const { searchParams } = new URL(request.url);
      const state = searchParams.get('state');
      if (state && state.includes('.')) {
        const parts = state.split('.');
        if (parts.length === 2) {
          const decoded = atob(parts[1]);
          if (decoded.includes('|')) {
            const [domain, locale] = decoded.split('|');
            originalDomain = domain;
            userLocale = locale;
          } else {
            originalDomain = decoded;
          }
        }
      }
    } catch (decodeError) {
      // Ignore decode errors in catch block
    }
    
    // Fallback for locale
    if (!userLocale) {
      userLocale = await getLocaleFromCookies();
    }
    
    return NextResponse.redirect(
      createRedirectUrl(request, '/auth/login', userLocale, {
        error: 'server_error',
        error_description: 'Internal server error'
      }, originalDomain)
    );
  }
}
