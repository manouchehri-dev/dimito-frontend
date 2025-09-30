/**
 * Server-side Locale Cookie Management Utilities
 * 
 * Handles getting and setting locale preferences via cookies
 * for server-side components and API routes.
 */

import { cookies } from 'next/headers';
import { routing } from '@/i18n/routing';

// Cookie configuration
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const LOCALE_COOKIE_OPTIONS = {
  httpOnly: false, // Allow client-side access for language switcher
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 365, // 1 year
  path: '/',
};

/**
 * Get locale from cookies (server-side)
 * @returns {Promise<string>} The locale from cookie or default locale
 */
export async function getLocaleFromCookies() {
  try {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME);
    
    if (localeCookie && routing.locales.includes(localeCookie.value)) {
      return localeCookie.value;
    }
  } catch (error) {
    console.warn('Failed to read locale cookie:', error);
  }
  
  return routing.defaultLocale;
}

/**
 * Set locale cookie (server-side)
 * @param {string} locale - The locale to set
 * @param {Response} response - The response object to set cookie on
 */
export async function setLocaleCookie(locale, response) {
  if (!routing.locales.includes(locale)) {
    console.warn(`Invalid locale: ${locale}. Using default: ${routing.defaultLocale}`);
    locale = routing.defaultLocale;
  }
  
  response.cookies.set(LOCALE_COOKIE_NAME, locale, LOCALE_COOKIE_OPTIONS);
}
