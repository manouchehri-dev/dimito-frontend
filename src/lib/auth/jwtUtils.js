/**
 * JWT Token Management Utilities
 * Implements best practices from the backend JWT token management guide
 *
 * Key principles:
 * 1. Use stored expiry timestamp (exp) - never decode JWT unnecessarily
 * 2. Proactively refresh tokens 5 minutes before expiry
 * 3. Handle refresh failures gracefully
 */

const DJANGO_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.dimito.ir";
const REFRESH_BUFFER_MINUTES = 5; // Refresh token 5 minutes before expiry

/**
 * Check if JWT token is expired
 * Uses stored expiry timestamp (BEST PRACTICE - no JWT decoding!)
 * @returns {boolean} True if token is expired
 */
export function isTokenExpired() {
  if (typeof window === "undefined") return true;

  const expTimestamp = localStorage.getItem("jwt_exp");
  if (!expTimestamp) return true;

  const exp = parseInt(expTimestamp);
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp

  return now >= exp;
}

/**
 * Check if token should be refreshed (within buffer time before expiry)
 * @param {number} bufferMinutes - Minutes before expiry to trigger refresh (default: 5)
 * @returns {boolean} True if token should be refreshed
 */
export function shouldRefreshToken(bufferMinutes = REFRESH_BUFFER_MINUTES) {
  if (typeof window === "undefined") return true;

  const expTimestamp = localStorage.getItem("jwt_exp");
  if (!expTimestamp) return true;

  const exp = parseInt(expTimestamp);
  const now = Math.floor(Date.now() / 1000);
  const bufferSeconds = bufferMinutes * 60;

  // Refresh if token expires within buffer time
  const shouldRefresh = exp - now <= bufferSeconds;

  if (shouldRefresh) {
    const minutesLeft = Math.floor((exp - now) / 60);
    console.log(`⏰ Token expires in ${minutesLeft} minutes, should refresh`);
  }

  return shouldRefresh;
}

/**
 * Get time until token expiry in seconds
 * @returns {number} Seconds until expiry (0 if expired or no token)
 */
export function getTimeUntilExpiry() {
  if (typeof window === "undefined") return 0;

  const expTimestamp = localStorage.getItem("jwt_exp");
  if (!expTimestamp) return 0;

  const exp = parseInt(expTimestamp);
  const now = Math.floor(Date.now() / 1000);

  return Math.max(0, exp - now);
}

/**
 * Get formatted time until expiry
 * @returns {string} Human-readable time until expiry
 */
export function getFormattedTimeUntilExpiry() {
  const seconds = getTimeUntilExpiry();

  if (seconds === 0) return "Expired";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Refresh JWT token using OIDC JWT refresh endpoint
 * This uses the server-stored OIDC refresh token (not visible to frontend)
 * @returns {Promise<Object|null>} New token data or null if refresh failed
 */
export async function refreshJWTToken() {
  if (typeof window === "undefined") return null;

  try {
    const currentToken = localStorage.getItem("auth_token");
    if (!currentToken) {
      console.error("❌ No current token to refresh");
      return null;
    }

    console.log("🔄 Refreshing JWT token via OIDC...");

    const response = await fetch(`${DJANGO_API_BASE}/auth/token/jwt-refresh/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${currentToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ JWT refresh failed:", errorData);

      // If refresh failed, user needs to re-login
      return null;
    }

    const data = await response.json();

    console.log("✅ JWT token refreshed successfully");
    console.log("New expiry:", data.expiry);

    // Update stored token and expiry
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("jwt_exp", data.expiry.exp.toString());
    localStorage.setItem("jwt_iat", data.expiry.iat.toString());

    // Update user data if provided
    if (data.user) {
      localStorage.setItem("auth_user", JSON.stringify(data.user));
    }

    return {
      token: data.token,
      expiry: data.expiry,
      user: data.user,
    };
  } catch (error) {
    console.error("❌ Token refresh error:", error);
    return null;
  }
}

/**
 * Introspect JWT token to get all claims including expiry
 * Useful for debugging or getting token metadata
 * @param {string} token - Optional token to introspect (defaults to stored token)
 * @returns {Promise<Object|null>} Token introspection data
 */
export async function introspectToken(token = null) {
  if (typeof window === "undefined") return null;

  try {
    const tokenToIntrospect = token || localStorage.getItem("auth_token");
    if (!tokenToIntrospect) {
      console.error("❌ No token to introspect");
      return null;
    }

    const response = await fetch(`${DJANGO_API_BASE}/auth/token/introspect/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenToIntrospect}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("❌ Token introspection failed");
      return null;
    }

    const data = await response.json();
    console.log("🔍 Token introspection:", data);

    return data;
  } catch (error) {
    console.error("❌ Token introspection error:", error);
    return null;
  }
}

/**
 * Clear all JWT-related data from storage
 */
export function clearJWTData() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("jwt_exp");
  localStorage.removeItem("jwt_iat");

  console.log("🧹 Cleared all JWT data from storage");
}

/**
 * Get JWT token info summary
 * @returns {Object} Token information summary
 */
export function getTokenInfo() {
  if (typeof window === "undefined") {
    return {
      hasToken: false,
      isExpired: true,
      timeUntilExpiry: 0,
      shouldRefresh: true,
      expiresAt: null,
    };
  }

  const token = localStorage.getItem("auth_token");
  const exp = localStorage.getItem("jwt_exp");

  if (!token || !exp) {
    return {
      hasToken: false,
      isExpired: true,
      timeUntilExpiry: 0,
      shouldRefresh: true,
      expiresAt: null,
    };
  }

  const expTimestamp = parseInt(exp);
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = Math.max(0, expTimestamp - now);

  return {
    hasToken: true,
    isExpired: timeLeft === 0,
    timeUntilExpiry: timeLeft,
    shouldRefresh: shouldRefreshToken(),
    expiresAt: new Date(expTimestamp * 1000).toISOString(),
    expiresAtFormatted: new Date(expTimestamp * 1000).toLocaleString(),
  };
}

export default {
  isTokenExpired,
  shouldRefreshToken,
  getTimeUntilExpiry,
  getFormattedTimeUntilExpiry,
  refreshJWTToken,
  introspectToken,
  clearJWTData,
  getTokenInfo,
};
