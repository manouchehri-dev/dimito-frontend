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
      // Clear force-disconnected flag when user manually tries to connect
      try {
        localStorage.removeItem('force-disconnected');
        localStorage.removeItem('wagmi.rabby.disconnected');
        localStorage.removeItem('wagmi.metaMask.disconnected');
        localStorage.removeItem('wagmi.walletConnect.disconnected');
        localStorage.removeItem('wagmi.coinbaseWallet.disconnected');
        localStorage.removeItem('wagmi.trustWallet.disconnected');
        localStorage.removeItem('wagmi.injected.disconnected');
      } catch (error) {
        console.warn("Error clearing disconnection flags:", error);
      }

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

    // Enhanced cleanup for manual disconnect as well
    try {
      // Clear wagmi store to prevent reconnection
      localStorage.removeItem('wagmi.store');

      // Clear RainbowKit recent connections
      localStorage.removeItem('rk-recent');
      localStorage.removeItem('rk-latest-id');

      // Clear all disconnection flags (don't set new ones)
      localStorage.removeItem('wagmi.rabby.disconnected');
      localStorage.removeItem('wagmi.metaMask.disconnected');
      localStorage.removeItem('wagmi.walletConnect.disconnected');
      localStorage.removeItem('wagmi.coinbaseWallet.disconnected');
      localStorage.removeItem('wagmi.trustWallet.disconnected');
      localStorage.removeItem('wagmi.injected.disconnected');

      // Set flag to prevent auto-reconnection (same as force disconnect)
      localStorage.setItem('force-disconnected', 'true');
    } catch (error) {
      console.warn("Error during manual disconnect cleanup:", error);
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

  // Handle force-disconnected flag on page load/reconnection attempts
  useEffect(() => {
    const isForceDisconnected = localStorage.getItem('force-disconnected') === 'true';

    if (isForceDisconnected && (isConnected || isConnecting || isReconnecting)) {
      // Force disconnect if wagmi is trying to reconnect
      try {
        disconnect();
      } catch (error) {
        console.warn("Error force disconnecting on page load:", error);
      }
    }
  }, [isConnected, isConnecting, isReconnecting, disconnect]);

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
    setShowForceDisconnect(false);

    // Clear authentication tracking
    if (address) {
      walletAuthManager.removeWallet(address);
    }

    // COMPLETE LOCALSTORAGE CLEANUP - Remove ALL wagmi and wallet related keys
    const keysToRemove = [
      // Core wagmi keys
      'wagmi.store',
      'wagmi.connected',
      'wagmi.recentConnectorId',
      'wagmi.cache',
      'wagmi.config',
      'wagmi.injected.shimDisconnect',
      'wagmi.walletConnect.requestedChains',

      // RainbowKit keys
      'rainbowkit.recentConnectorId',
      'rainbowkit.wallet',
      'rainbowkit.connectionStatus',
      'rainbowkit.walletconnect',
      'rk-latest-id',
      'rk-recent',
      'rk-version',

      // AppKit/WalletConnect v2 keys
      '@appkit/active_caip_network_id',
      '@appkit/active_namespace',
      '@appkit/connection_status',

      // Coinbase Wallet SDK keys
      'cbwsdk.store',

      // Wallet-specific keys
      'wagmi.wallet',
      'wagmi.walletconnect',
      'wagmi.injected',
      'wagmi.safe',
      'wagmi.ledger',

      // WalletConnect keys
      'walletconnect',
      'wc@2:core:0.3//keychain',
      'wc@2:client:0.3//session',
      'wc@2:core:0.3//messages',
      'wc@2:core:0.3//subscription',
      'wc@2:core:0.3//history',
      'wc@2:core:0.3//expirer',
      'wc@2:universal_provider:/optionalNamespaces',
      'wc@2:universal_provider:/namespaces',

      // MetaMask keys
      'metamask-provider',
      'metamask.selectedAddress',

      // Coinbase keys
      'coinbaseWallet.addresses',
      'coinbaseWallet.walletUsername',

      // Trust Wallet keys
      'trustwallet',

      // Other wallet keys
      'ethereum-provider',
      'walletlink',
      '-walletlink:https://www.walletlink.org:version',
      '-walletlink:https://www.walletlink.org:session:id',
      '-walletlink:https://www.walletlink.org:session:secret',
      '-walletlink:https://www.walletlink.org:session:linked'
    ];

    // Remove all identified keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove ${key}:`, error);
      }
    });


    // Clear any remaining wagmi-related keys with pattern matching
    try {
      const allKeys = Object.keys(localStorage);
      const wagmiKeys = allKeys.filter(key =>
        key.includes('wagmi') ||
        key.includes('rainbowkit') ||
        key.includes('walletconnect') ||
        key.includes('metamask') ||
        key.includes('coinbase') ||
        key.includes('wallet') ||
        key.includes('wc@2')
      );

      // Remove all wagmi-related keys (no exceptions)
      wagmiKeys.forEach(key => {
        localStorage.removeItem(key);
      });

    } catch (error) {
      console.warn("Error during pattern matching cleanup:", error);
    }

    // Clear sessionStorage as well (some wallets use it)
    try {
      const sessionKeys = Object.keys(sessionStorage);
      const walletSessionKeys = sessionKeys.filter(key =>
        key.includes('wagmi') ||
        key.includes('rainbowkit') ||
        key.includes('walletconnect') ||
        key.includes('metamask') ||
        key.includes('coinbase') ||
        key.includes('wallet')
      );

      walletSessionKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });

    } catch (error) {
      console.warn("Error clearing sessionStorage:", error);
    }

    // Force disconnect from wagmi
    try {
      disconnect();
    } catch (error) {
      console.warn("Error during wagmi disconnect:", error);
    }

    // Clear any cached provider instances (if accessible)
    try {
      if (window.ethereum) {
        // Reset ethereum provider state if possible
        if (typeof window.ethereum.removeAllListeners === 'function') {
          window.ethereum.removeAllListeners();
        }
      }
    } catch (error) {
      console.warn("Error clearing ethereum provider:", error);
    }

    console.log("✅ FORCE DISCONNECT COMPLETED - ALL WALLET DATA CLEARED");

    // Optional: Double-check cleanup after a short delay (no page reload)
    setTimeout(() => {
      // Double-check and clear any remaining wallet keys that might have been recreated
      const finalKeys = Object.keys(localStorage);
      const remainingWalletKeys = finalKeys.filter(key =>
        key.includes('wagmi') ||
        key.includes('rainbowkit') ||
        key.includes('walletconnect') ||
        key.includes('metamask') ||
        key.includes('coinbase') ||
        key.includes('@appkit') ||
        key.includes('cbwsdk') ||
        key.includes('rk-') ||
        key.includes('wc@2')
      );

      // Remove ALL remaining wallet keys (no exceptions)
      if (remainingWalletKeys.length > 0) {
        remainingWalletKeys.forEach(key => {
          localStorage.removeItem(key);
        });
      }
    }, 1000); // Reduced delay to 1 second, no page reload

    // Force disconnect from wagmi
    try {
      disconnect();
    } catch (error) {
      console.warn("Error during wagmi disconnect:", error);
    }

    // Clear any cached provider instances (if accessible)
    try {
      if (window.ethereum) {
        // Reset ethereum provider state if possible
        if (typeof window.ethereum.removeAllListeners === 'function') {
          window.ethereum.removeAllListeners();
        }
      }
    } catch (error) {
      console.warn("Error clearing ethereum provider:", error);
    }

    // Set a simple flag to prevent auto-reconnection
    localStorage.setItem('force-disconnected', 'true');
  };

  // Check if user force disconnected - if so, don't show reconnecting state
  const isForceDisconnected = localStorage.getItem('force-disconnected') === 'true';

  // Show loading state when connecting or reconnecting with force disconnect option
  if ((isConnecting || isReconnecting) && !isForceDisconnected) {
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
