"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ChevronDown, Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const languages = {
    en: { name: "English", flag: "🇺🇸", code: "EN" },
    fa: { name: "فارسی", flag: "🇮🇷", code: "فا" },
  };

  const switchLanguage = async (newLocale) => {
    if (newLocale === locale || isChanging) return;

    setIsChanging(true);
    setIsOpen(false);

    try {
      // Remove current locale from pathname
      const pathWithoutLocale = pathname.replace(`/${locale}`, "");
      // Navigate to new locale
      await router.push(`/${newLocale}${pathWithoutLocale}`);
    } catch (error) {
      console.error("Error switching language:", error);
    } finally {
      // Reset changing state after a delay
      setTimeout(() => {
        setIsChanging(false);
      }, 500);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => !isChanging && setIsOpen(!isOpen)}
        disabled={isChanging}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF5D1B] focus:ring-offset-2 ${
          isChanging ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden lg:inline">{languages[locale]?.name}</span>
        <span className="lg:hidden">{languages[locale]?.code}</span>
        {isChanging ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isChanging && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {routing.locales.map((lang) => (
              <button
                key={lang}
                onClick={() => switchLanguage(lang)}
                disabled={lang === locale}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                  locale === lang
                    ? "bg-gradient-to-r from-[#FF5D1B]/10 to-[#FF363E]/10 text-[#FF5D1B] font-medium cursor-default"
                    : "text-gray-700 cursor-pointer"
                }`}
                role="menuitem"
              >
                <span className="text-lg">{languages[lang].flag}</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{languages[lang].name}</span>
                  <span className="text-xs text-gray-500">
                    {languages[lang].code}
                  </span>
                </div>
                {locale === lang && (
                  <div className="ml-auto w-2 h-2 bg-[#FF5D1B] rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
