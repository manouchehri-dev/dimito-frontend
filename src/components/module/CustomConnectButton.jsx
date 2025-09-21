"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import {
  ChevronDown,
  User,
  LogOut,
  Copy,
  Check,
  Wallet,
  Wallet2Icon,
} from "lucide-react";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useWalletAuth } from "@/lib/api";
import walletAuthManager from "@/lib/walletAuth";

export default function CustomConnectButton({ className, isMobile = false }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasAuthenticated, setHasAuthenticated] = useState(false);
  const [showForceDisconnect, setShowForceDisconnect] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const t = useTranslations("wallet");
  const locale = useLocale();
  const isRTL = locale === "fa";

  // Wallet authentication mutation
  const walletAuthMutation = useWalletAuth();

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
    setHasAuthenticated(false);
    // Clear authentication tracking when manually disconnecting
    if (address) {
      walletAuthManager.removeWallet(address);
    }
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

  // Show force disconnect button after 5-8 seconds of connecting/reconnecting
  useEffect(() => {
    let timer;

    if (isConnecting || isReconnecting) {
      // Random delay between 5-8 seconds (5000-8000ms)
      const delay = Math.floor(Math.random() * 3000) + 5000;

      timer = setTimeout(() => {
        setShowForceDisconnect(true);
      }, delay);
    } else {
      // Reset when not connecting/reconnecting
      setShowForceDisconnect(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isConnecting, isReconnecting]);

  // Handle wallet authentication when connected
  useEffect(() => {
    if (
      isConnected &&
      address &&
      !walletAuthMutation.isPending &&
      walletAuthManager.canAuthenticate(address)
    ) {
      console.log("🔐 Authenticating wallet:", address);

      // Mark as pending in global manager
      walletAuthManager.markAsPending(address);

      walletAuthMutation.mutate(
        { wallet_address: address },
        {
          onSuccess: (data) => {
            console.log("✅ Wallet authentication successful:", data);
            walletAuthManager.markAsAuthenticated(address);
            setHasAuthenticated(true);
          },
          onError: (error) => {
            console.error("❌ Wallet authentication failed:", error);
            walletAuthManager.markAsFailed(address);
          },
        }
      );
    }

    // Update local state based on global manager
    if (address && walletAuthManager.isAuthenticated(address)) {
      setHasAuthenticated(true);
    }

    // Reset authentication state when wallet disconnects
    if (!isConnected && address) {
      setHasAuthenticated(false);
      walletAuthManager.removeWallet(address);
    }
  }, [isConnected, address, walletAuthMutation]);

  const formatAddress = (addr, short = false) => {
    if (!addr) return "";
    if (short) return `${addr.slice(0, 4)}...`;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Different styling for mobile vs desktop
  const buttonBaseClass = isMobile
    ? "w-full justify-center py-3 text-sm font-medium"
    : "px-4 lg:px-4 xl:px-6 py-1.5 lg:py-2 xl:py-2.5 text-xs lg:text-xs xl:text-sm font-medium";

  // Force disconnect function for stuck connections
  const handleForceDisconnect = () => {
    // Clear all React states
    setIsDropdownOpen(false);
    setHasAuthenticated(false);

    // Clear authentication tracking
    if (address) {
      walletAuthManager.removeWallet(address);
    }

    // COMPLETE LOCALSTORAGE CLEANUP
    localStorage.removeItem('wagmi.store'); // Clear wagmi connection state

    // Set all disconnection flags to true (explicit disconnection)
    localStorage.setItem('wagmi.rabby.disconnected', 'true');
    localStorage.setItem('wagmi.metaMask.disconnected', 'true');
    localStorage.setItem('wagmi.walletConnect.disconnected', 'true');
    localStorage.setItem('wagmi.coinbaseWallet.disconnected', 'true');

    // Clear other wagmi/RainbowKit keys
    localStorage.removeItem('wagmi.connected');
    localStorage.removeItem('wagmi.recentConnectorId');
    localStorage.removeItem('rainbowkit.recentConnectorId');
    localStorage.removeItem('rainbowkit.wallet');

    // Force disconnect
    disconnect();

    console.log("✅ FORCE DISCONNECT COMPLETED - All states cleared");
  };

  // Show loading state when connecting or reconnecting with force disconnect option
  if (isConnecting || isReconnecting) {
    return (
      <div className="flex items-center gap-2">
        <Button
          className={`${className} ${buttonBaseClass} whitespace-nowrap flex items-center gap-2 opacity-75`}
          onClick={handleConnectClick}
          title={isConnecting ? t("connecting") : t("reconnecting")}
        >
          {/* Loading spinner */}
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />

          <span className={`${isMobile ? "inline" : "hidden xl:inline"}`}>
            {isConnecting ? t("connecting") : t("reconnecting")}
          </span>
          {!isMobile && (
            <span className="xl:hidden">
              {isConnecting
                ? (isRTL ? "اتصال..." : "Connecting...")
                : (isRTL ? "اتصال مجدد..." : "Reconnecting...")
              }
            </span>
          )}
        </Button>

        {/* Force Disconnect Button - Only show after delay */}
        {showForceDisconnect && (
          <Button
            onClick={handleForceDisconnect}
            className="px-2 py-1.5 lg:px-3 lg:py-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-1 animate-in fade-in slide-in-from-right-2"
            title={isRTL ? "قطع اتصال اجباری" : "Force Disconnect"}
          >
            <LogOut className="w-3 h-3 lg:w-4 lg:h-4" />
            {!isMobile && (
              <span className="hidden lg:inline">
                {isRTL ? "قطع" : "Stop"}
              </span>
            )}
          </Button>
        )}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Button
        className={`${className} ${buttonBaseClass} whitespace-nowrap flex items-center gap-2 cursor-pointer`}
        onClick={handleConnectClick}
        title={t("connect")}
      >
        {/* Universal wallet icon */}
        <Wallet2Icon className="w-4 h-4" />

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
              className={`w-3 xl:w-3.5 h-3 xl:h-3.5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </span>
        )}

        {/* Mobile view */}
        {isMobile && (
          <span className="flex items-center justify-center gap-2">
            <Wallet className="w-5 h-5" />
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </span>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          className={`absolute ${isRTL ? "left-0" : "right-0"} ${isMobile ? "bottom-full mb-2" : "mt-2"
            } w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-[70] overflow-hidden backdrop-blur-sm`}
        >
          {/* Address Display */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-[#FF5D1B]" />
              <p className="text-xs text-gray-500 font-medium">
                {isRTL ? "آدرس کیف پول" : "Wallet Address"}
              </p>
              {/* Authentication status indicator */}
              {(walletAuthMutation.isPending ||
                (address && walletAuthManager.isPending(address))) && (
                  <div
                    className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
                    title="Authenticating..."
                  />
                )}
              {(hasAuthenticated ||
                (address && walletAuthManager.isAuthenticated(address))) && (
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    title="Authenticated"
                  />
                )}
              {walletAuthMutation.isError &&
                address &&
                !walletAuthManager.isAuthenticated(address) && (
                  <div
                    className="w-2 h-2 bg-red-500 rounded-full"
                    title="Authentication failed"
                  />
                )}
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
