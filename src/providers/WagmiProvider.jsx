"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { useEffect, useState, useRef } from "react";

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// Create stable singleton instances to prevent re-initialization
let globalConfig = null;
let globalQueryClient = null;
let isInitialized = false;

const getConfig = () => {
  if (!globalConfig && !isInitialized) {
    try {
      isInitialized = true;
      globalConfig = getDefaultConfig({
        appName: "DMT Token",
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID, // WalletConnect projectId
        chains: [bsc], // ✅ BSC only
        ssr: true, // ✅ SSR
        // ✅ Optional: use your own RPC(s) for reliability (recommended)
        // transports: {
        //   [bsc.id]: http("https://bsc-dataseed.binance.org"),
        //   // or a provider like Ankr/NodeReal/Alchemy/QuickNode
        // },
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
          theme={darkTheme()}
          modalSize="compact"
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
