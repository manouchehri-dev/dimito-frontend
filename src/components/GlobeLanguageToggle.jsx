'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function GlobeLanguageToggle({ className = "", position = "floating" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const locale = useLocale();

    const router = useRouter();
    const pathname = usePathname();
    const dropdownRef = useRef(null);
    const isRTL = locale === "fa";

    console.log

    const languages = {
        en: { flag: "🇺🇸", name: "English", code: "EN" },
        fa: { flag: "🇮🇷", name: "فارسی", code: "فا" },
    };

    const switchLanguage = async (newLocale) => {
        if (newLocale === locale || isChanging) return;

        setIsChanging(true);
        setIsOpen(false);

        try {
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

    const getStyles = () => {
        switch (position) {
            case 'floating':
                return {
                    container: `sticky bottom-4 sm:bottom-6 ${isRTL ? 'mr-3 sm:mr-6' : 'ml-3 sm:ml-6'} z-50`,
                    button: "w-10 h-10 sm:w-12 sm:h-12 shadow-lg",
                    dropdown: `bottom-full mb-2 ${isRTL ? "right-0" : "left-0"}`
                };
            case 'header':
                return {
                    container: "",
                    button: "w-9 h-9 shadow-md",
                    dropdown: "top-full mt-2 right-0"
                };
            case 'compact':
                return {
                    container: "",
                    button: "w-8 h-8 shadow-sm",
                    dropdown: "top-full mt-1 right-0"
                };
            default:
                return {
                    container: "",
                    button: "w-9 h-9 shadow-md",
                    dropdown: "top-full mt-2 right-0"
                };
        }
    };

    const styles = getStyles();

    return (
        <div className={`relative ${styles.container} ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => !isChanging && setIsOpen(!isOpen)}
                disabled={isChanging}
                className={`${styles.button} bg-white border-2 border-gray-200 rounded-full transition-all duration-300 ease-in-out hover:border-orange-300 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-center ${isChanging ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                aria-label="Select language"
                aria-expanded={isOpen}
            >
                {isChanging ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
                ) : (
                    <Globe className="w-5 h-5 text-gray-600" />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && !isChanging && (
                <div className={`absolute ${styles.dropdown} w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] overflow-hidden`}>
                    <div className="py-1">
                        {routing.locales.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => switchLanguage(lang)}
                                disabled={lang === locale}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-all duration-150 ${locale === lang
                                    ? "bg-orange-50 text-orange-600 font-medium cursor-default"
                                    : "text-gray-700 cursor-pointer hover:text-orange-600"
                                    }`}
                                role="menuitem"
                            >
                                <span className="text-base">{languages[lang].flag}</span>
                                <span className="font-medium">{languages[lang].code}</span>
                                {locale === lang && (
                                    <div className="w-2 h-2 bg-orange-500 rounded-full ml-auto"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
