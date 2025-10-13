/**
 * OIDC Configuration based on OpenID Connect Discovery Document
 * This configuration is derived from: https://lenoauth.com/o/.well-known/openid_configuration
 */

/**
 * Get the correct redirect URI for different environments
 * Always uses .ir domain for SSO callbacks since that's registered with the provider
 */
function getRedirectUri() {
  // Use environment variable for production (highest priority)
  if (process.env.DOT_REDIRECT_URI) {
    return process.env.DOT_REDIRECT_URI;
  }
  
  // Use public URL for Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/auth/callback`;
  }
  
  // Use custom domain if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  }
  
  // Client-side fallback (browser)
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const host = window.location.host;
    
    // Keep callback on same domain to preserve cookies
    // Both dimito.io and dimito.ir should be registered with SSO provider
    return `${protocol}//${host}/api/auth/callback`;
  }
  
  // Server-side fallback (development)
  return 'http://localhost:3000/api/auth/callback';
}

/**
 * Get the correct post-logout redirect URI for different environments
 * Always uses .ir domain for SSO callbacks since that's registered with the provider
 */
function getPostLogoutRedirectUri() {
  // Use environment variable for production (highest priority)
  if (process.env.DOT_POST_LOGOUT_REDIRECT_URI) {
    return process.env.DOT_POST_LOGOUT_REDIRECT_URI;
  }
  
  // Use public URL for Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/auth/sign-out`;
  }
  
  // Use custom domain if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/sign-out`;
  }
  
  // Client-side fallback (browser)
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const host = window.location.host;
    
    // Keep callback on same domain to preserve cookies
    // Both dimito.io and dimito.ir should be registered with SSO provider
    return `${protocol}//${host}/api/auth/sign-out`;
  }
  
  // Server-side fallback (development)
  return 'http://localhost:3000/api/auth/sign-out';
}

export const OIDC_CONFIG = {
  // Core endpoints
  issuer: 'https://lenoauth.com/o',
  authorizationEndpoint: 'https://lenoauth.com/o/authorize/',
  tokenEndpoint: 'https://lenoauth.com/o/token/',
  userinfoEndpoint: 'https://lenoauth.com/o/userinfo/',
  jwksUri: 'https://lenoauth.com/o/.well-known/jwks.json',
  endSessionEndpoint: 'https://lenoauth.com/o/logout/',
  
  // Client configuration
  clientId: process.env.DOT_CLIENT_ID || 'dimito-public',
  redirectUri: getRedirectUri(),
  
  // Supported scopes
  scopes: ['openid', 'profile', 'email'],
  
  // Response type for authorization code flow
  responseType: 'code',
  
  // Supported authentication methods
  tokenEndpointAuthMethod: 'client_secret_post', // or 'client_secret_basic'
  
  // PKCE support (recommended for security)
  codeChallengeMethod: 'S256', // SHA256 hashing
  
  // Token signing algorithms
  idTokenSigningAlg: ['RS256', 'HS256'],
};

/**
 * Generate authorization URL for OIDC login
 * @param {Object} options - Additional options
 * @param {string} options.state - Random state parameter for security
 * @param {string} options.nonce - Random nonce for ID token validation
 * @param {string} options.codeChallenge - PKCE code challenge
 * @param {string} options.codeChallengeMethod - PKCE method (S256 or plain)
 * @returns {string} Authorization URL
 */
export function generateAuthorizationUrl(options = {}) {
  const {
    state = generateRandomString(32),
    nonce = generateRandomString(32),
    codeChallenge,
    codeChallengeMethod = 'S256'
  } = options;

  const params = new URLSearchParams({
    client_id: OIDC_CONFIG.clientId,
    redirect_uri: OIDC_CONFIG.redirectUri,
    response_type: OIDC_CONFIG.responseType,
    scope: OIDC_CONFIG.scopes.join(' '),
    state,
    nonce,
  });

  // Add PKCE parameters if provided
  if (codeChallenge) {
    params.append('code_challenge', codeChallenge);
    params.append('code_challenge_method', codeChallengeMethod);
  }

  return `${OIDC_CONFIG.authorizationEndpoint}?${params.toString()}`;
}

/**
 * Generate logout URL for OIDC logout
 * @param {Object} options - Logout options
 * @param {string} options.postLogoutRedirectUri - Where to redirect after logout
 * @param {string} options.idTokenHint - ID token for logout hint
 * @returns {string} Logout URL with client_id and post_logout_redirect_uri
 */
export function generateLogoutUrl(options = {}) {
  const {
    postLogoutRedirectUri = getPostLogoutRedirectUri(),
    idTokenHint
  } = options;

  const params = new URLSearchParams({
    client_id: OIDC_CONFIG.clientId, // Required by your provider
    post_logout_redirect_uri: postLogoutRedirectUri,
  });
  if (idTokenHint) {
    params.append('id_token_hint', idTokenHint);
  }

  return `${OIDC_CONFIG.endSessionEndpoint}?${params.toString()}`;
}

/**
 * Generate random string for state/nonce parameters
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export function generateRandomString(length = 32) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return result;
}

/**
 * Generate PKCE code verifier and challenge
 * @returns {Object} Object with codeVerifier and codeChallenge
 */
export async function generatePKCE() {
  // Generate code verifier (43-128 characters)
  const codeVerifier = generateRandomString(128);
  
  // Generate code challenge (SHA256 hash of verifier, base64url encoded)
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64url
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return {
    codeVerifier,
    codeChallenge
  };
}

/**
 * Validate OIDC configuration
 * @returns {boolean} True if configuration is valid
 */
export function validateOIDCConfig() {
  const required = [
    'issuer',
    'authorizationEndpoint',
    'tokenEndpoint',
    'userinfoEndpoint',
    'clientId',
    'redirectUri'
  ];
  
  for (const field of required) {
    if (!OIDC_CONFIG[field]) {
      console.error(`Missing required OIDC configuration: ${field}`);
      return false;
    }
  }
  
  return true;
}

export default OIDC_CONFIG;
