"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { usePlatformTokens } from "@/lib/api";
import { 
  Coins, 
  RefreshCw, 
  Eye, 
  EyeOff,
  TrendingUp,
  Wallet
} from "lucide-react";

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];

export default function UserTokenBalances() {
  const t = useTranslations("dashboard");
  const { address, isConnected } = useAccount();
  const { data: platformTokens, isLoading, error, refetch } = usePlatformTokens();
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [tokenBalances, setTokenBalances] = useState({});

  // Format large numbers with K, M, B suffixes
  const formatNumber = (num) => {
    const number = parseFloat(num);
    if (number >= 1e9) return (number / 1e9).toFixed(2) + "B";
    if (number >= 1e6) return (number / 1e6).toFixed(2) + "M";
    if (number >= 1e3) return (number / 1e3).toFixed(2) + "K";
    return number.toFixed(4);
  };

  // Format balance with proper decimals
  const formatBalance = (balance, decimals = 18) => {
    if (!balance) return "0";
    const balanceInEther = Number(balance) / Math.pow(10, decimals);
    return formatNumber(balanceInEther);
  };

  // Custom hook to get token balance
  const useTokenBalance = (tokenAddress, userAddress) => {
    return useReadContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [userAddress],
      enabled: !!tokenAddress && !!userAddress && isConnected,
      watch: true, // Watch for balance changes
    });
  };

  // Token Balance Component
  const TokenBalanceItem = ({ token }) => {
    const { data: balance, isLoading: balanceLoading } = useTokenBalance(
      token.token_address, 
      address
    );

    const balanceValue = balance ? formatBalance(balance.toString(), token.decimals || 18) : "0";
    const hasBalance = balance && Number(balance) > 0;

    // Don't show tokens with zero balance if showZeroBalances is false
    if (!showZeroBalances && !hasBalance) {
      return null;
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {token.token_symbol?.charAt(0) || 'T'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {token.token_name}
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                {token.token_symbol}
              </p>
            </div>
          </div>
          
          {hasBalance && (
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
              <Wallet className="w-3 h-3" />
              {t("tokenBalances.owned")}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{t("tokenBalances.balance")}</span>
            {balanceLoading ? (
              <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
            ) : (
              <span className={`font-semibold text-sm ${hasBalance ? 'text-gray-900' : 'text-gray-400'}`}>
                {balanceValue} {token.token_symbol}
              </span>
            )}
          </div>

          {token.current_price && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{t("tokenBalances.price")}</span>
              <span className="text-xs text-gray-600">
                ${parseFloat(token.current_price).toFixed(4)}
              </span>
            </div>
          )}

          {hasBalance && token.current_price && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">{t("tokenBalances.value")}</span>
              <span className="font-semibold text-sm text-green-600">
                ${(parseFloat(balanceValue.replace(/[KMB]/, '')) * parseFloat(token.current_price)).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-orange-500" />
            {t("tokenBalances.title")}
          </h2>
        </div>
        <div className="text-center py-8">
          <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t("tokenBalances.connectWallet")}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-orange-500" />
            {t("tokenBalances.title")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-orange-500" />
            {t("tokenBalances.title")}
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{t("tokenBalances.error")}</p>
          <button
            onClick={refetch}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  const tokens = platformTokens?.results || platformTokens || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Coins className="w-5 h-5 text-orange-500" />
          {t("tokenBalances.title")}
        </h2>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowZeroBalances(!showZeroBalances)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            {showZeroBalances ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showZeroBalances ? t("tokenBalances.hideZero") : t("tokenBalances.showAll")}
          </button>
          
          <button
            onClick={refetch}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tokens Grid */}
      {tokens.length === 0 ? (
        <div className="text-center py-8">
          <Coins className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t("tokenBalances.noTokens")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokens.map((token) => (
            <TokenBalanceItem key={token.id} token={token} />
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {t("tokenBalances.totalTokens", { count: tokens.length })}
          </span>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>{t("tokenBalances.platformTokens")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
