/**
 * Client-side Locale Cookie Management Utilities
 * 
 * Handles getting and setting locale preferences via cookies
 * for client-side components and browser operations.
 */

import { routing } from '@/i18n/routing';

// Cookie configuration
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Get locale from cookies (client-side)
 * @returns {string} The locale from cookie or default locale
 */
export function getClientLocaleFromCookies() {
  if (typeof document === 'undefined') {
    return routing.defaultLocale;
  }
  
  try {
    // Try cookie first
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${LOCALE_COOKIE_NAME}=`)
    );
    
    if (localeCookie) {
      const locale = localeCookie.split('=')[1];
      if (routing.locales.includes(locale)) {
        return locale;
      }
    }
    
    // Fallback to localStorage
    const localStorageLocale = localStorage.getItem(LOCALE_COOKIE_NAME);
    if (localStorageLocale && routing.locales.includes(localStorageLocale)) {
      return localStorageLocale;
    }
  } catch (error) {
    console.warn('Failed to read client locale:', error);
  }
  
  return routing.defaultLocale;
}

/**
 * Set locale cookie (client-side)
 * @param {string} locale - The locale to set
 */
export function setClientLocaleCookie(locale) {
  if (typeof document === 'undefined') {
    return;
  }
  
  if (!routing.locales.includes(locale)) {
    console.warn(`Invalid locale: ${locale}. Using default: ${routing.defaultLocale}`);
    locale = routing.defaultLocale;
  }
  
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1); // 1 year
  
  // Set cookie
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; expires=${expires.toUTCString()}; path=/; SameSite=Strict${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
  
  // Also set in localStorage as backup
  try {
    localStorage.setItem(LOCALE_COOKIE_NAME, locale);
  } catch (error) {
    console.warn('Failed to set locale in localStorage:', error);
  }
}

/**
 * Initialize locale cookie on page load (client-side)
 * Sets cookie based on current locale if not already set
 * @param {string} currentLocale - The current locale from next-intl
 */
export function initializeLocaleCookie(currentLocale) {
  if (typeof document === 'undefined') {
    return;
  }
  
  const existingLocale = getClientLocaleFromCookies();
  
  // If no cookie exists or it doesn't match current locale, set it
  if (!existingLocale || existingLocale !== currentLocale) {
    setClientLocaleCookie(currentLocale);
    console.log(`🍪 Locale cookie initialized: ${currentLocale}`);
  }
}
