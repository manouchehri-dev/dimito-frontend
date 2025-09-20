"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePresales } from "@/lib/api";
import { X, Flame, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

export default function PresaleBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const t = useTranslations("presaleBanner");
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

  // Check if banner was dismissed recently (24 hours)
  useEffect(() => {
    const dismissed = localStorage.getItem('presale-banner-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (activePresales.length > 0 && (now - dismissedTime > twentyFourHours)) {
      setIsVisible(true);
      setIsDismissed(false);
    }
  }, [activePresales.length]);

  // Add/remove body class to adjust header position
  useEffect(() => {
    if (isVisible && !isDismissed) {
      document.body.classList.add('has-presale-banner');
    } else {
      document.body.classList.remove('has-presale-banner');
    }

    return () => {
      document.body.classList.remove('has-presale-banner');
    };
  }, [isVisible, isDismissed]);

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('presale-banner-dismissed', Date.now().toString());
  };

  // Handle click
  const handleClick = () => {
    router.push('/presales');
  };

  if (!isVisible || isDismissed || activePresales.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white shadow-lg animate-slideDown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-3">
          {/* Content */}
          <div className="flex items-center gap-4 flex-1">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center animate-pulse">
                <Flame className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <div className="font-bold text-sm sm:text-base">
                  {t("title")} {activePresales.length} {t("activePresales")}
                </div>
                <div className="text-xs sm:text-sm text-white/90">
                  {t("description")}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleClick}
              className="flex-shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 text-sm"
            >
              <span>{t("cta")}</span>
              {isRTL ? (
                <ArrowLeft className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] opacity-20 animate-pulse pointer-events-none"></div>
    </div>
  );
}
