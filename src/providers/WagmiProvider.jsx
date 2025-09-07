"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { useEffect, useState, useRef } from "react";

import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http, createConfig } from "wagmi";
import { bsc } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import {
  trustWallet,
  walletConnectWallet,
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  binanceWallet,
  okxWallet,
  rabbyWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";

// Brand-aligned RainbowKit theme (light)
const brandTheme = {
  blurs: { modalOverlay: "blur(6px)" },
  colors: {
    accentColor: "#FF4135",
    accentColorForeground: "#ffffff",
    actionButtonBorder: "rgba(0,0,0,0.06)",
    actionButtonBorderMobile: "rgba(0,0,0,0.06)",
    actionButtonSecondaryBackground: "rgba(255,65,53,0.08)",
    closeButton: "#6B7280",
    closeButtonBackground: "rgba(0,0,0,0.04)",
    connectButtonBackground: "linear-gradient(90deg,#FF5D1B 0%,#FF363E 100%)",
    connectButtonBackgroundError: "#FEE2E2",
    connectButtonInnerBackground: "#ffffff",
    connectButtonText: "#ffffff",
    connectButtonTextError: "#EF4444",
    connectionIndicator: "#22C55E",
    downloadBottomCardBackground: "rgba(0,0,0,0.02)",
    downloadTopCardBackground: "rgba(255,65,53,0.08)",
    error: "#EF4444",
    generalBorder: "rgba(0,0,0,0.08)",
    generalBorderDim: "rgba(0,0,0,0.04)",
    menuItemBackground: "rgba(255,65,53,0.06)",
    modalBackdrop: "rgba(0,0,0,0.40)",
    modalBackground: "#ffffff",
    modalBorder: "rgba(0,0,0,0.06)",
    modalText: "#2D2D2D",
    modalTextDim: "#6B7280",
    modalTextSecondary: "#111827",
    profileAction: "rgba(255,65,53,0.08)",
    profileActionHover: "rgba(255,65,53,0.12)",
    profileForeground: "#F9FAFB",
    selectedOptionBorder: "rgba(255,65,53,0.45)",
    standby: "#FBBF24",
  },
  fonts: { body: '"IRANSansX", Poppins, Arial, sans-serif' },
  radii: {
    actionButton: "12px",
    connectButton: "14px",
    menuButton: "12px",
    modal: "20px",
    modalMobile: "16px",
  },
  shadows: {
    connectButton: "0 8px 20px rgba(255,65,53,0.20)",
    dialog: "0 10px 30px rgba(0,0,0,0.12)",
    profileDetailsAction: "0 8px 20px rgba(0,0,0,0.06)",
    selectedOption: "0 0 0 2px rgba(255,65,53,0.30)",
    selectedWallet: "0 8px 20px rgba(255,65,53,0.18)",
    walletLogo: "0 4px 12px rgba(0,0,0,0.08)",
  },
};

// Create stable singleton instances to prevent re-initialization
let globalConfig = null;
let globalQueryClient = null;
let isInitialized = false;

const getConfig = () => {
  if (!globalConfig && !isInitialized) {
    try {
      isInitialized = true;
      const connectors = connectorsForWallets(
        [
          {
            groupName: "Recommended",
            wallets: [
              trustWallet,
              metaMaskWallet,
              binanceWallet,
              injectedWallet,
              walletConnectWallet,
            ],
          },
          {
            groupName: "Others",
            wallets: [coinbaseWallet, okxWallet, rabbyWallet, ledgerWallet],
          },
        ],
        {
          appName: "DMT Token",
          projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
        }
      );

      globalConfig = createConfig({
        chains: [bsc],
        transports: {
          [bsc.id]: http("https://bsc-dataseed.binance.org"),
        },
        connectors,
        ssr: true,
      });
    } catch (error) {
      console.warn(
        "WalletConnect config already exists, reusing existing instance"
      );
      isInitialized = false;
    }
  }
  return globalConfig;
};

const getQueryClient = () => {
  if (!globalQueryClient) {
    globalQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return globalQueryClient;
};

const Provider = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      setMounted(true);
    }
    return () => {
      const queryClient = getQueryClient();
      if (queryClient) queryClient.removeQueries();
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const config = getConfig();
  const queryClient = getQueryClient();

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Failed to initialize Web3 provider</div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={brandTheme}
          showRecentTransactions
          initialChain={bsc} // ✅ ensure BSC is the default/initial chain
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Provider;
