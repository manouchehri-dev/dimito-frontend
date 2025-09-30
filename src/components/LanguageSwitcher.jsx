"use client";
import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ChevronDown, Globe } from "lucide-react";
import { setClientLocaleCookie } from "@/lib/locale-cookie-client";

export default function LanguageSwitcher({ isMobile = false }) {
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
      // Set locale cookie before navigation
      setClientLocaleCookie(newLocale);
      console.log(`🍪 Locale cookie set to: ${newLocale}`);

      router.push(pathname, { locale: newLocale });
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
        className={`flex items-center gap-1 lg:gap-1.5 xl:gap-2 px-2 lg:px-2.5 xl:px-3 py-1.5 lg:py-2 text-xs lg:text-xs xl:text-sm font-medium text-gray-700 bg-white border border-gray-200/70 rounded-full hover:bg-gray-100 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF5D1B] focus:ring-offset-1 ${isChanging ? "opacity-50 cursor-not-allowed" : "active:scale-95"
          }`}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3 lg:w-3.5 xl:w-4 h-3 lg:h-3.5 xl:h-4" />
        <span className="font-medium text-xs lg:text-xs">
          {languages[locale]?.code}
        </span>
        {isChanging ? (
          <div className="w-3 lg:w-3.5 xl:w-4 h-3 lg:h-3.5 xl:h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <ChevronDown
            className={`w-3 lg:w-3.5 xl:w-4 h-3 lg:h-3.5 xl:h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isChanging && (
        <div
          className={`absolute ${isMobile ? "right-0 bottom-full mb-2" : "right-0 mt-2"
            } w-44 xl:w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-[60] overflow-hidden backdrop-blur-sm`}
        >
          <div className="py-2">
            {routing.locales.map((lang) => (
              <button
                key={lang}
                onClick={() => switchLanguage(lang)}
                disabled={lang === locale}
                className={`w-full flex items-center gap-3 px-3 xl:px-4 py-2.5 xl:py-3 text-sm hover:bg-gray-50 transition-all duration-150 active:scale-98 ${locale === lang
                    ? "bg-gradient-to-r from-[#FF5D1B]/10 to-[#FF363E]/10 text-[#FF5D1B] font-medium cursor-default"
                    : "text-gray-700 cursor-pointer hover:text-[#FF5D1B]"
                  }`}
                role="menuitem"
              >
                <span className="text-base xl:text-lg">
                  {languages[lang].flag}
                </span>
                <div className="flex flex-col items-start flex-1">
                  <span className="font-medium text-sm xl:text-base">
                    {languages[lang].name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {languages[lang].code}
                  </span>
                </div>
                {locale === lang && (
                  <div className="w-2 h-2 bg-[#FF5D1B] rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
