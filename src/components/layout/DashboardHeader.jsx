"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Menu, Bell, Search, User, ChevronDown } from "lucide-react";
import CustomConnectButton from "@/components/module/CustomConnectButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function DashboardHeader({
  onMenuClick,
  onToggleCollapse,
  isCollapsed,
}) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? t("expand") : t("collapse")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isCollapsed
                    ? isRTL
                      ? "M15 19l-7-7 7-7"
                      : "M9 5l7 7-7 7"
                    : isRTL
                    ? "M9 5l7 7-7 7"
                    : "M15 19l-7-7 7-7"
                }
              />
            </svg>
          </button>

          {/* Search bar - hidden on mobile */}
          <div className="hidden sm:block relative">
            <div className="relative">
              <Search
                className={`absolute ${
                  isRTL ? "right-3" : "left-3"
                } top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
              />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-64 lg:w-80 ${
                  isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                } py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5D1B] focus:border-transparent transition-colors`}
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Mobile search button */}
          <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">3</span>
            </span>
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Wallet Connection */}
          <CustomConnectButton className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4A0F] hover:to-[#FF2A2A] text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-sm" />
        </div>
      </div>
    </header>
  );
}
