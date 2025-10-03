"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePresales } from "@/lib/api";
import { Flame, X, TrendingUp, Clock } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

export default function FloatingPresaleButton() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const t = useTranslations("floatingPresale");
    const locale = useLocale();
    const isRTL = locale === "fa";
    const router = useRouter();

    const { data: presalesData } = usePresales();

    // Check if there are active presales
    const activePresales = presalesData?.results?.filter(presale => {
        const now = Date.now() / 1000;
        return presale.is_active &&
            now >= presale.start_unix_timestamp &&
            now <= presale.end_unix_timestamp;
    }) || [];

    // Show button only if there are active presales and not dismissed
    useEffect(() => {
        const dismissed = localStorage.getItem('presale-button-dismissed');
        if (activePresales.length > 0 && !dismissed) {
            const timer = setTimeout(() => setIsVisible(true), 3000); // Show after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [activePresales.length]);

    // Handle dismiss
    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem('presale-button-dismissed', Date.now().toString());
    };

    // Handle click
    const handleClick = () => {
        router.push('/presales');
    };

    if (!isVisible || isDismissed || activePresales.length === 0) {
        return null;
    }

    return (
        <div className={`fixed bottom-4 sm:bottom-6 ${isRTL ? 'left-3 sm:left-6' : 'right-3 sm:right-6'} z-50 animate-bounce`}>
            <div className="relative">
                {/* Dismiss button */}
                <button
                    onClick={handleDismiss}
                    className={`absolute -top-1 sm:-top-2 ${isRTL ? '-right-1 sm:-right-2' : '-left-1 sm:-left-2'} w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center text-xs transition-colors duration-200 z-10 cursor-pointer`}
                >
                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>

                {/* Main button */}
                <button
                    onClick={handleClick}
                    className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4A0F] hover:to-[#FF2A2A] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-2.5 sm:p-3 min-w-[200px] sm:min-w-[220px] group cursor-pointer"
                >
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Icon */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-left">
                            <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                <span className="text-xs sm:text-sm font-bold text-white/90">
                                    {t("title")}
                                </span>
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>

                            <div className="text-base sm:text-lg font-bold text-white mb-1">
                                {activePresales.length} {t("activePresales")}
                            </div>

                            <div className="flex items-center gap-2 sm:gap-4 text-xs text-white/80">
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    <span className="hidden sm:inline">{t("highReturns")}</span>
                                    <span className="sm:hidden">{t("highReturnsShort")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    <span className="hidden sm:inline">{t("limitedTime")}</span>
                                    <span className="sm:hidden">{t("limitedTimeShort")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className={`text-white/80 group-hover:text-white transition-colors duration-200 ${isRTL ? 'rotate-180' : ''}`}>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Pulse effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] opacity-75 animate-ping"></div>
                </button>

                {/* Tooltip */}
                <div className={`absolute bottom-full mb-2 ${isRTL ? 'right-0' : 'left-0'} bg-black text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none`}>
                    {t("tooltip")}
                </div>
            </div>
        </div>
    );
}
