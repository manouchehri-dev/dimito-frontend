/**
 * Utility functions for unified login system
 */

/**
 * Generate login URL with redirect parameter
 * @param {string} redirectTo - Where to redirect after login
 * @param {string} locale - Current locale (optional)
 * @returns {string} Login URL with redirect parameter
 */
export const getLoginUrl = (redirectTo, locale = "") => {
  const baseUrl = locale ? `/${locale}/auth/login` : "/auth/login";

  if (!redirectTo) {
    return baseUrl;
  }

  // If redirectTo is already a full path, encode it
  if (redirectTo.startsWith("/")) {
    return `${baseUrl}?redirect=${encodeURIComponent(redirectTo)}`;
  }

  // Otherwise, use it as a redirect key
  return `${baseUrl}?redirect=${redirectTo}`;
};

/**
 * Predefined redirect destinations
 */
export const REDIRECT_DESTINATIONS = {
  TRANSPARENCY: "transparency",
  DASHBOARD: "dashboard",
  HOME: "home",
  CREATE_DMT: "create-dmt",
};

/**
 * Generate login URL for specific destinations
 */
export const getTransparencyLoginUrl = (locale) =>
  getLoginUrl(REDIRECT_DESTINATIONS.TRANSPARENCY, locale);
export const getDashboardLoginUrl = (locale) =>
  getLoginUrl(REDIRECT_DESTINATIONS.DASHBOARD, locale);
export const getCreateDMTLoginUrl = (locale) =>
  getLoginUrl(REDIRECT_DESTINATIONS.CREATE_DMT, locale);
export const getHomeLoginUrl = (locale) =>
  getLoginUrl(REDIRECT_DESTINATIONS.HOME, locale);
