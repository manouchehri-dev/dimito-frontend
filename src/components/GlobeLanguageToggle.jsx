'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { setClientLocaleCookie } from '@/lib/locale-cookie-client';
import t from 'react-date-object/calendars/persian';

export default function GlobeLanguageToggle({ className = "", position = "floating" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const locale = useLocale();

    const router = useRouter();
    const pathname = usePathname();
    const dropdownRef = useRef(null);
    const isRTL = locale === "fa";

    const languages = {
        en: { flag: "🇺🇸", name: "English", code: "EN", nativeName: "English" },
        fa: { flag: "🇮🇷", name: "فارسی", code: "FA", nativeName: "فارسی" },
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

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on ESC key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const getStyles = () => {
        switch (position) {
            case 'floating':
                return {
                    container: `sticky bottom-4 sm:bottom-6 ${isRTL ? 'mr-3 sm:mr-6' : 'ml-3 sm:ml-6'} z-50`,
                    button: "w-11 h-11 sm:w-12 sm:h-12 shadow-lg hover:shadow-2xl",
                    dropdown: `bottom-full mb-3 ${isRTL ? "right-0" : "left-0"}`
                };
            case 'header':
                return {
                    container: "",
                    button: "w-10 h-10 shadow-md hover:shadow-lg",
                    dropdown: "top-full mt-2 right-0"
                };
            case 'compact':
                return {
                    container: "",
                    button: "w-9 h-9 shadow-sm hover:shadow-md",
                    dropdown: `bottom-full mb-2 ${isRTL ? "left-0" : "left-0"}`
                };
            default:
                return {
                    container: "",
                    button: "w-10 h-10 shadow-md hover:shadow-lg",
                    dropdown: "top-full mt-2 right-0"
                };
        }
    };

    const styles = getStyles();
    const currentLang = languages[locale];

    return (
        <div className={`relative ${styles.container} ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => !isChanging && setIsOpen(!isOpen)}
                disabled={isChanging}
                className={`${styles.button} relative bg-white border-2 border-gray-200 rounded-full transition-all duration-300 ease-out hover:border-[#FF5D1B] hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FF5D1B] focus:ring-offset-2 flex items-center justify-center group overflow-hidden ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } ${isOpen ? 'border-[#FF5D1B] shadow-xl' : ''}`}
                aria-label="Select language"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {/* Hover gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center">
                    {isChanging ? (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FF5D1B] rounded-full animate-spin" />
                    ) : (
                        <div className="relative">
                            <Globe className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-all duration-300 ${isOpen ? 'text-[#FF5D1B] scale-110' : 'text-gray-600 group-hover:text-white'}`} />

                        </div>
                    )}
                </div>

                {/* Tooltip */}
                <div className={`absolute opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap ${position === 'floating'
                    ? `${isRTL ? 'left-full ml-3' : 'right-full mr-3'} top-1/2 -translate-y-1/2`
                    : 'bottom-full mb-2 left-1/2 -translate-x-1/2'
                    }`}>
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md">
                        {currentLang.nativeName}
                        {position === 'floating' && (
                            <div className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 ${isRTL
                                ? 'right-full border-r-4 border-r-gray-900'
                                : 'left-full border-l-4 border-l-gray-900'
                                } border-t-4 border-b-4 border-transparent`}></div>
                        )}
                        {position !== 'floating' && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        )}
                    </div>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && !isChanging && (
                <div className={`absolute ${styles.dropdown} w-40 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                    <div className="p-2">
                        {/* Header */}
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            {isRTL ? "انتخاب زبان" : "Select Language"}
                        </div>

                        {/* Language Options */}
                        <div className="mt-1 space-y-1">
                            {routing.locales.map((lang) => {
                                const isActive = locale === lang;
                                return (
                                    <button
                                        key={lang}
                                        onClick={() => switchLanguage(lang)}
                                        disabled={isActive}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                                            ? "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white shadow-md cursor-default"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-[#FF5D1B] cursor-pointer active:scale-95"
                                            }`}
                                        role="menuitem"
                                        aria-current={isActive ? 'true' : 'false'}
                                    >
                                        <span className="text-lg flex-shrink-0">{languages[lang].flag}</span>
                                        <span className={`flex-1 text-left font-medium ${isActive ? 'text-white' : ''}`}>
                                            {languages[lang].nativeName}
                                        </span>
                                        {isActive && (
                                            <Check className="w-4 h-4 flex-shrink-0 text-white" strokeWidth={3} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}