import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getLocaleFromCookies } from "@/lib/locale-cookie-server";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // If no locale from URL, try to get from cookies
  if (!locale || !routing.locales.includes(locale)) {
    try {
      const cookieLocale = await getLocaleFromCookies();
      if (cookieLocale && routing.locales.includes(cookieLocale)) {
        locale = cookieLocale;
        console.log(`Using locale from cookie: ${locale}`);
      }
    } catch (error) {
      console.warn('Failed to read locale from cookies:', error);
    }
  }

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
