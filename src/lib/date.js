import jalaali from "jalaali-js";
import { format } from "date-fns";
import { enUS, faIR } from "date-fns/locale";

// Persian month names
const persianMonths = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

// Persian month names (short)
const persianMonthsShort = [
  "فرو", "ارد", "خرد", "تیر", "مرد", "شهر",
  "مهر", "آبا", "آذر", "دی", "بهم", "اسف"
];

// Persian day names
const persianDays = [
  "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"
];

/**
 * Format date based on locale - Persian calendar for Farsi, Gregorian for others
 * @param {Date|string|number} date - The date to format
 * @param {string} locale - The locale ('fa' for Persian, others for Gregorian)
 * @param {string} formatType - The format type ('short', 'medium', 'long', 'full')
 * @returns {string} Formatted date string
 */
export function formatDateByLocale(date, locale, formatType = 'medium') {
  const dateObj = new Date(date);
  
  if (locale === 'fa') {
    return formatPersianDate(dateObj, formatType);
  } else {
    // Use date-fns for Gregorian dates
    const dateLocale = locale === "fa" ? faIR : enUS;
    
    switch (formatType) {
      case 'short':
        return format(dateObj, "MMM dd", { locale: dateLocale });
      case 'medium':
        return format(dateObj, "MMM dd, yyyy", { locale: dateLocale });
      case 'long':
        return format(dateObj, "MMMM dd, yyyy", { locale: dateLocale });
      case 'full':
        return format(dateObj, "EEEE, MMMM dd, yyyy", { locale: dateLocale });
      case 'time':
        return format(dateObj, "HH:mm", { locale: dateLocale });
      case 'datetime':
        return format(dateObj, "MMM dd, yyyy HH:mm", { locale: dateLocale });
      default:
        return format(dateObj, "MMM dd, yyyy", { locale: dateLocale });
    }
  }
}

/**
 * Format Persian date with various format options
 * @param {Date} date - The date to format
 * @param {string} formatType - The format type
 * @returns {string} Formatted Persian date string
 */
export function formatPersianDate(date, formatType = 'medium') {
  const g = new Date(date);
  const j = jalaali.toJalaali(g);
  
  switch (formatType) {
    case 'short':
      // "۱۵ مهر" format
      return `${convertToPersianNumbers(j.jd)} ${persianMonthsShort[j.jm - 1]}`;
    
    case 'medium':
      // "۱۵ مهر ۱۴۰۳" format
      return `${convertToPersianNumbers(j.jd)} ${persianMonths[j.jm - 1]} ${convertToPersianNumbers(j.jy)}`;
    
    case 'long':
      // "۱۵ مهر ۱۴۰۳" format (same as medium for Persian)
      return `${convertToPersianNumbers(j.jd)} ${persianMonths[j.jm - 1]} ${convertToPersianNumbers(j.jy)}`;
    
    case 'full':
      // "جمعه، ۱۵ مهر ۱۴۰۳" format
      const dayName = persianDays[g.getDay()];
      return `${dayName}، ${convertToPersianNumbers(j.jd)} ${persianMonths[j.jm - 1]} ${convertToPersianNumbers(j.jy)}`;
    
    case 'numeric':
      // "۱۴۰۳/۰۷/۱۵" format
      return `${convertToPersianNumbers(j.jy)}/${convertToPersianNumbers(j.jm.toString().padStart(2, "0"))}/${convertToPersianNumbers(j.jd.toString().padStart(2, "0"))}`;
    
    case 'time':
      // "۱۴:۳۰" format
      const hours = g.getHours().toString().padStart(2, "0");
      const minutes = g.getMinutes().toString().padStart(2, "0");
      return `${convertToPersianNumbers(hours)}:${convertToPersianNumbers(minutes)}`;
    
    case 'datetime':
      // "۱۵ مهر ۱۴۰۳ ۱۴:۳۰" format
      const hours2 = g.getHours().toString().padStart(2, "0");
      const minutes2 = g.getMinutes().toString().padStart(2, "0");
      return `${convertToPersianNumbers(j.jd)} ${persianMonths[j.jm - 1]} ${convertToPersianNumbers(j.jy)} ${convertToPersianNumbers(hours2)}:${convertToPersianNumbers(minutes2)}`;
    
    default:
      return `${convertToPersianNumbers(j.jd)} ${persianMonths[j.jm - 1]} ${convertToPersianNumbers(j.jy)}`;
  }
}

/**
 * Convert English numbers to Persian numbers
 * @param {string|number} input - The input to convert
 * @returns {string} String with Persian numbers
 */
export function convertToPersianNumbers(input) {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return input.toString().replace(/\d/g, (digit) => persianNumbers[parseInt(digit)]);
}

/**
 * Get current Persian date
 * @returns {object} Current Persian date object
 */
export function getCurrentPersianDate() {
  const now = new Date();
  return jalaali.toJalaali(now);
}

/**
 * Format date range based on locale
 * @param {Date|string|number} startDate - Start date
 * @param {Date|string|number} endDate - End date
 * @param {string} locale - The locale
 * @returns {string} Formatted date range
 */
export function formatDateRange(startDate, endDate, locale, formatType_start="short", formatType_end="medium") {
  const start = formatDateByLocale(startDate, locale, formatType_start);
  const end = formatDateByLocale(endDate, locale, formatType_end);
  
  if (locale === 'fa') {
    return `${start} - ${end}`;
  } else {
    return `${start} - ${end}`;
  }
}
