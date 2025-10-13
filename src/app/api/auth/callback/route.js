import { NextResponse } from "next/server";
import { getLocaleFromCookies } from "@/lib/locale-cookie-server";
import { createRedirectUrl } from "@/lib/url-utils";

const DJANGO_API_BASE = process.env.DJANGO_API_BASE || "https://api.dimito.ir";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters from OIDC callback (these are in the URL, accessible across domains!)
    // Example: https://dimito.ir/api/auth/callback?code=xxx&state=yyy
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    console.log("OIDC Callback received:", { code: !!code, state, error });

    // Decode original domain and locale from state parameter
    // Format: randomString.base64(domain|locale)
    let originalDomain = null;
    let userLocale = null;

    if (state && state.includes(".")) {
      try {
        const parts = state.split(".");
        if (parts.length === 2) {
          const decoded = atob(parts[1]); // Base64 decode

          // Check format with pipe separator
          if (decoded.includes("|")) {
            const stateParts = decoded.split("|");
            [originalDomain, userLocale] = stateParts;
            console.log(`🌐 Original domain from state: ${originalDomain}`);
            console.log(`🗣️  User locale from state: ${userLocale}`);
          } else {
            // Legacy format (just domain)
            originalDomain = decoded;
            console.log(
              `🌐 Original domain from state (legacy format): ${originalDomain}`
            );
          }

          console.log(
            `✅ State parameter works cross-domain because it's in URL, not cookies!`
          );
        }
      } catch (decodeError) {
        console.warn("Failed to decode state:", decodeError);
      }
    }

    // Fallback for locale: cookie or default
    if (!userLocale) {
      userLocale = await getLocaleFromCookies();
      console.log(`🍪 User locale fallback from cookie: ${userLocale}`);
    }

    // Fallback for domain: current host
    if (!originalDomain) {
      const currentHost = request.headers.get("host");
      if (currentHost) {
        originalDomain = currentHost;
        console.log(
          `🌐 Domain fallback - Using current host: ${originalDomain}`
        );
      }
    }

    // Handle error from OIDC provider
    if (error) {
      console.error("OIDC Error:", error, errorDescription);
      return NextResponse.redirect(
        createRedirectUrl(
          request,
          "/auth/login",
          userLocale,
          {
            error,
            error_description: errorDescription || "Authentication failed",
          },
          originalDomain
        )
      );
    }

    // Validate required parameters
    if (!code) {
      console.error("No authorization code received");
      return NextResponse.redirect(
        createRedirectUrl(
          request,
          "/auth/login",
          userLocale,
          {
            error: "no_code",
            error_description: "No authorization code received",
          },
          originalDomain
        )
      );
    }

    // Get PKCE code_verifier from cookie (set on same domain)
    const codeVerifier = request.cookies.get("pkce_code_verifier")?.value;

    if (!codeVerifier) {
      console.error("❌ No PKCE code_verifier found in cookies");
      console.error("This usually means:");
      console.error("1. Cookie was not set during authorization");
      console.error("2. Cookie expired before callback");
      console.error(
        "3. Cross-domain issue - callback domain differs from login domain"
      );
      console.error(
        "4. SSO provider redirect URI not registered for this domain"
      );
      console.error("");
      console.error(
        "✅ Solution: Register both dimito.io and dimito.ir with SSO provider"
      );

      return NextResponse.redirect(
        createRedirectUrl(
          request,
          "/auth/login",
          userLocale,
          {
            error: "no_code_verifier",
            error_description:
              "PKCE code verifier not found. Please try logging in again.",
          },
          originalDomain
        )
      );
    }

    console.log(
      "🔐 PKCE verifier found in cookie:",
      codeVerifier.substring(0, 10) + "..."
    );

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
    console.log("Using redirect URI:", redirectUri);

    // Forward to Django backend for processing
    const djangoResponse = await fetch(
      `${DJANGO_API_BASE}/auth/oidc-callback/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          state,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier, // Send PKCE code_verifier to Django
        }),
      }
    );

    if (!djangoResponse.ok) {
      const errorData = await djangoResponse.text();
      console.error(
        "Django callback failed:",
        djangoResponse.status,
        errorData
      );

      return NextResponse.redirect(
        createRedirectUrl(
          request,
          "/auth/login",
          userLocale,
          {
            error: "backend_error",
            error_description: "Authentication processing failed",
          },
          originalDomain
        )
      );
    }

    const result = await djangoResponse.json();

    if (result.error) {
      console.error("Django returned error:", result.error);
      return NextResponse.redirect(
        createRedirectUrl(
          request,
          "/auth/login",
          userLocale,
          {
            error: result.error,
            error_description:
              result.error_description || "Authentication failed",
          },
          originalDomain
        )
      );
    }

    // Success - redirect to frontend callback with JWT token and expiry metadata
    if (result.token) {
      console.log(
        "Authentication successful, redirecting with token and expiry data"
      );
      console.log("Expiry metadata:", result.expiry);
      console.log(
        `🎯 Redirecting to original domain: ${
          originalDomain || "current domain"
        }`
      );

      // Prepare query parameters with token and expiry data
      const callbackParams = {
        token: result.token,
        // Pass expiry timestamp (Unix timestamp) - this is critical for frontend
        jwt_exp: result.expiry?.exp?.toString(),
        // Pass other metadata for completeness
        jwt_iat: result.expiry?.iat?.toString(),
        expires_in: result.expiry?.expires_in?.toString(),
      };

      // Add user data if available
      if (result.user) {
        callbackParams.user = JSON.stringify(result.user);
      }

      // Clear PKCE code_verifier cookie and store original domain for logout
      const response = NextResponse.redirect(
        createRedirectUrl(
          request,
          "/auth/callback",
          userLocale,
          callbackParams,
          originalDomain
        )
      );

      response.cookies.delete("pkce_code_verifier");

      // Store original domain on .ir domain for logout (if different from .ir)
      if (originalDomain && !originalDomain.includes(".ir")) {
        response.cookies.set("sso_original_domain", originalDomain, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
        console.log(
          "💾 Stored original domain cookie on .ir for future logout"
        );
      }

      return response;
    }

    // Fallback error
    console.error("No token received from Django");
    return NextResponse.redirect(
      createRedirectUrl(
        request,
        "/auth/login",
        userLocale,
        {
          error: "no_token",
          error_description: "No authentication token received",
        },
        originalDomain
      )
    );
  } catch (error) {
    console.error("Callback processing error:", error);

    // Try to decode original domain and locale from state if available
    let originalDomain = null;
    let userLocale = null;

    try {
      const { searchParams } = new URL(request.url);
      const state = searchParams.get("state");
      if (state && state.includes(".")) {
        const parts = state.split(".");
        if (parts.length === 2) {
          const decoded = atob(parts[1]);
          if (decoded.includes("|")) {
            const stateParts = decoded.split("|");
            // Can be domain|locale or domain|locale|verifier
            originalDomain = stateParts[0];
            userLocale = stateParts[1];
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
      createRedirectUrl(
        request,
        "/auth/login",
        userLocale,
        {
          error: "server_error",
          error_description: "Internal server error",
        },
        originalDomain
      )
    );
  }
}
