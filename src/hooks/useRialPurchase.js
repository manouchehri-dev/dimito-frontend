"use client";

import { useState, useEffect, useCallback } from "react";
import useAuthStore from "@/stores/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.dimito.ir";
const DEFAULT_ASSET_ID = "ab8acf5f-2e61-499d-aa37-f0e8ac65ea16";

/**
 * Hook to fetch asset prices from iCart
 * Auto-updates every 5 minutes
 */
export function useAssetPrices(updateIntervalMinutes = 5) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isAuthenticated, authMethod } = useAuthStore();

  const fetchPrices = useCallback(async () => {
    // Only fetch for authenticated SSO users
    if (!isAuthenticated || authMethod !== "sso" || !token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/presale/asset-prices/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch asset prices");
      }

      const data = await response.json();

      if (data.success && data.assets) {
        setAssets(data.assets);
        setError(null);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to fetch asset prices:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated, authMethod]);

  // Fetch immediately and set up interval
  useEffect(() => {
    fetchPrices();

    const interval = setInterval(
      fetchPrices,
      updateIntervalMinutes * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [fetchPrices, updateIntervalMinutes]);

  /**
   * Calculate tokens for a given Rial amount
   * ✅ NEW: Uses currency symbol instead of asset_id
   * Backend assets have unit field (e.g., "usdt") - we match with lowercase symbol
   */
  const calculateTokens = useCallback(
    (currency, rialAmount) => {
      // Find asset by unit - matches token_symbol (lowercased) from presale
      // E.g., "USDT" -> "usdt" matches asset.unit
      const asset = assets.find((a) => a.unit === currency.toLowerCase());
      if (!asset || asset.buy_unit_price <= 0) return 0;

      return rialAmount / asset.buy_unit_price;
    },
    [assets]
  );

  /**
   * Get asset by currency symbol
   * ✅ NEW: Uses currency symbol instead of asset_id
   * Backend assets have unit field (e.g., "usdt") - we match with lowercase symbol
   */
  const getAsset = useCallback(
    (currency) => {
      // Find asset by unit - matches token_symbol (lowercased) from presale
      // E.g., "USDT" -> "usdt" matches asset.unit
      return assets.find((a) => a.unit === currency.toLowerCase());
    },
    [assets]
  );

  return {
    assets,
    loading,
    error,
    calculateTokens,
    getAsset,
    refetch: fetchPrices,
  };
}

/**
 * Hook to calculate tokens for a specific amount (calls backend)
 */
export function useCalculateTokens() {
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();

  const calculate = useCallback(
    async (assetId, amount) => {
      if (!token) {
        setError("Not authenticated");
        return null;
      }

      setCalculating(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/presale/calculate-tokens/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            asset_id: assetId,
            amount: amount,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error_description || "Failed to calculate tokens"
          );
        }

        const data = await response.json();

        if (data.success) {
          setResult(data);
          return data;
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        console.error("Calculate tokens error:", err);
        setError(err.message);
        return null;
      } finally {
        setCalculating(false);
      }
    },
    [token]
  );

  return {
    calculate,
    calculating,
    result,
    error,
    clearResult: () => setResult(null),
  };
}

/**
 * Hook to calculate tax for a token purchase (via backend proxy to iCart)
 * Frontend does NOT have access to iCart OIDC tokens, so we call backend
 */
export function useCalculateTax() {
  const [calculating, setCalculating] = useState(false);
  const [taxInfo, setTaxInfo] = useState(null);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();

  const calculateTax = useCallback(
    async (currency, tokenAmount) => {
      if (!token) {
        setError("Not authenticated");
        return { percent: 0, amountInRial: 0 };
      }

      setCalculating(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/presale/calculate-tax/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currency: currency, // ✅ NEW: Just currency name (e.g., "USDT")
            amount: tokenAmount,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Tax calculation failed:", errorData);
          // Return 0% tax on error - graceful degradation
          return { percent: 0, amountInRial: 0 };
        }

        const data = await response.json();

        if (data.success && data.tax_info) {
          const taxResult = {
            percent: data.tax_info.percent_of_tax || 0,
            amountInRial: data.tax_info.value_of_tax || 0,
          };
          setTaxInfo(taxResult);
          return taxResult;
        } else {
          throw new Error("Invalid tax response");
        }
      } catch (err) {
        console.error("Calculate tax error:", err);
        setError(err.message);
        // Return 0% tax on error - graceful degradation
        return { percent: 0, amountInRial: 0 };
      } finally {
        setCalculating(false);
      }
    },
    [token]
  );

  return {
    calculateTax,
    calculating,
    taxInfo,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook to charge wallet with Rial (via iCart payment gateway)
 * Redirects user to payment gateway to add funds to their wallet
 */
export function useChargeWallet() {
  const [charging, setCharging] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated, authMethod } = useAuthStore();

  const chargeWallet = useCallback(
    async (currency, amount, purchaseIntent = null) => {
      // Validate authentication
      if (!isAuthenticated || authMethod !== "sso" || !token) {
        setError("Please login with SSO to charge wallet");
        return null;
      }

      // Validate inputs
      if (!currency || !amount || amount <= 0) {
        setError("Invalid charge parameters");
        return null;
      }

      setCharging(true);
      setError(null);

      try {
        // Construct redirect URL for payment callback
        // In production: use current domain
        // In development: use env variable or staging URL
        // Note: Token is stored in PaymentIntent, not in URL ✅
        const redirectUrl =
          process.env.NEXT_PUBLIC_PAYMENT_CALLBACK_URL ||
          (typeof window !== "undefined"
            ? `${window.location.origin}/api/payment/callback`
            : "https://dimito.ir/api/payment/callback");

        // Build request body - NEW API structure
        const requestBody = {
          currency: currency, // ✅ NEW: Just currency name (e.g., "Yen")
          amount: amount,
          redirect_url: redirectUrl,
        };

        // Add purchase intent if provided
        if (purchaseIntent) {
          requestBody.purchase_intent = purchaseIntent;
        }

        // Debug: Log what we're sending
        console.log(
          "🔍 Sending to backend:",
          JSON.stringify(requestBody, null, 2)
        );

        const response = await fetch(`${API_URL}/presale/charge-wallet/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error_description || "Failed to create payment"
          );
        }

        const data = await response.json();

        // Debug: Log backend response
        console.log("✅ Backend response:", JSON.stringify(data, null, 2));

        // Payment URL can be in data.payment.payment_url or data.payment.message
        const paymentUrl = data.payment?.payment_url || data.payment?.message;

        if (data.success && paymentUrl) {
          // Redirect to payment gateway
          window.location.href = paymentUrl;
          return data;
        } else {
          throw new Error("Invalid payment response - no payment URL");
        }
      } catch (err) {
        console.error("Charge wallet error:", err);
        setError(err.message);
        return null;
      } finally {
        setCharging(false);
      }
    },
    [token, isAuthenticated, authMethod]
  );

  return {
    chargeWallet,
    charging,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook to purchase tokens directly using iCart wallet balance
 * Uses the balance already in user's iCart wallet
 */
export function usePurchaseToken() {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  const { token, isAuthenticated, authMethod } = useAuthStore();

  const purchaseToken = useCallback(
    async (
      amount,
      currency,
      rialAmount = null,
      slippagePercent = 0.2
    ) => {
      // Validate authentication
      if (!isAuthenticated || authMethod !== "sso" || !token) {
        setError("Please login with SSO to purchase tokens");
        return null;
      }

      // Validate amount
      if (!amount || amount <= 0) {
        setError("Invalid amount");
        return null;
      }

      // Validate currency
      if (!currency) {
        setError("Currency is required");
        return null;
      }

      setPurchasing(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/presale/purchase-token/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currency: currency, // ✅ NEW: Just currency name (e.g., "USDT")
            amount,
            rial_amount: rialAmount,
            slippage_percent: slippagePercent,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error_description || "Failed to purchase token"
          );
        }

        const data = await response.json();

        if (data.success) {
          return data;
        } else {
          throw new Error("Purchase failed");
        }
      } catch (err) {
        console.error("Purchase token error:", err);
        setError(err.message);
        return null;
      } finally {
        setPurchasing(false);
      }
    },
    [token, isAuthenticated, authMethod]
  );

  return {
    purchaseToken,
    purchasing,
    error,
    clearError: () => setError(null),
  };
}

/**
 * @deprecated This function is no longer needed. Use currency names (token symbols) directly instead.
 * The backend now handles asset_id lookups internally based on currency names.
 * 
 * Get asset ID from token data or use default
 */
export function getAssetId(tokenData) {
  // Try to get from token metadata
  const assetId = tokenData?.asset_id || tokenData?.icart_asset_id;

  // Return asset ID or default
  return assetId || DEFAULT_ASSET_ID;
}

/**
 * Fetch user's Rial balance
 */
export function useRialBalance() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("Not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/presale/user-balance/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      const data = await response.json();

      if (data.success) {
        setBalance(data.rial_balance);
      } else {
        throw new Error("Invalid balance response");
      }
    } catch (err) {
      console.error("Rial balance fetch error:", err);
      setError(err.message);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}

export default {
  useAssetPrices,
  useCalculateTokens,
  useCalculateTax,
  useChargeWallet,
  usePurchaseToken,
  useRialBalance,
  getAssetId,
};
