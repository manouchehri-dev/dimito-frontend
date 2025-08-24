"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { ChevronDown, User, LogOut, Copy, Check, Wallet } from "lucide-react";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

export default function CustomConnectButton({ className, isMobile = false }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const t = useTranslations("wallet");
  const locale = useLocale();
  const isRTL = locale === "fa";

  const handleConnectClick = () => {
    if (isConnected) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      openConnectModal?.();
    }
  };

  const handleDashboard = () => {
    setIsDropdownOpen(false);
    router.push("/dashboard");
  };

  const handleDisconnect = () => {
    setIsDropdownOpen(false);
    disconnect();
  };

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy address:", err);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatAddress = (addr, short = false) => {
    if (!addr) return "";
    if (short) return `${addr.slice(0, 4)}...`;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Different styling for mobile vs desktop
  const buttonBaseClass = isMobile
    ? "w-full justify-center py-3 text-sm font-medium"
    : "px-4 lg:px-4 xl:px-6 py-1.5 lg:py-2 xl:py-2.5 text-xs lg:text-xs xl:text-sm font-medium";

  if (!isConnected) {
    return (
      <Button
        className={`${className} ${buttonBaseClass} whitespace-nowrap`}
        onClick={handleConnectClick}
        title={t("connect")}
      >
        <span className={`${isMobile ? "inline" : "hidden xl:inline"}`}>
          {t("connect")}
        </span>
        {!isMobile && (
          <span className="xl:hidden">{isRTL ? "کیف پول" : "Wallet"}</span>
        )}
      </Button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef} dir={isRTL ? "rtl" : "ltr"}>
      <Button
        className={`${className} ${buttonBaseClass} whitespace-nowrap relative flex items-center gap-1 lg:gap-1.5 xl:gap-2`}
        onClick={handleConnectClick}
        title={address}
      >
        {/* Desktop view */}
        {!isMobile && (
          <span className="flex items-center gap-1.5 xl:gap-2">
            <Wallet className="w-4 xl:w-5 h-4 xl:h-5" />
            <ChevronDown
              className={`w-3 xl:w-3.5 h-3 xl:h-3.5 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        )}

        {/* Mobile view */}
        {isMobile && (
          <span className="flex items-center justify-center gap-2">
            <Wallet className="w-5 h-5" />
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          className={`absolute ${isRTL ? "left-0" : "right-0"} ${
            isMobile ? "bottom-full mb-2" : "mt-2"
          } w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-[70] overflow-hidden backdrop-blur-sm`}
        >
          {/* Address Display */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-[#FF5D1B]" />
              <p className="text-xs text-gray-500 font-medium">
                {isRTL ? "آدرس کیف پول" : "Wallet Address"}
              </p>
            </div>
            <p className="font-mono text-sm text-gray-800">
              {formatAddress(address)}
            </p>
          </div>

          <div className="py-2">
            {/* Copy Address */}
            <button
              onClick={handleCopyAddress}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-all duration-150 text-gray-700 hover:text-[#FF5D1B] cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span className="font-medium">
                {copied ? t("copied") : t("copyAddress")}
              </span>
            </button>

            {/* Dashboard */}
            <button
              onClick={handleDashboard}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-all duration-150 text-gray-700 hover:text-[#FF5D1B] cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span className="font-medium">{t("dashboard")}</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            {/* Disconnect */}
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 transition-all duration-150 text-gray-700 hover:text-red-600 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">{t("disconnect")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
