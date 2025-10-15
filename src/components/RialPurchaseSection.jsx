"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import {
  Banknote,
  Loader2,
  AlertCircle,
  Info,
  ArrowRight,
  RefreshCw,
  X,
  CheckCircle,
} from "lucide-react";
import { NumericFormat } from "react-number-format";
import toast from "react-hot-toast";
import useAuthStore from "@/stores/useAuthStore";
import {
  useAssetPrices,
  useCalculateTax,
  useChargeWallet,
  usePurchaseToken,
  useRialBalance,
  getAssetId,
} from "@/hooks/useRialPurchase";

export default function RialPurchaseSection({ presale }) {
  const t = useTranslations("presaleBuy");
  const tRial = useTranslations("presaleBuy.rialPurchase");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const { isAuthenticated, authMethod } = useAuthStore();
  const [rialAmount, setRialAmount] = useState("");
  const [rawRialAmount, setRawRialAmount] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [useWalletBalance, setUseWalletBalance] = useState(true); // Use wallet balance when available
  const [purchaseDetails, setPurchaseDetails] = useState(null); // Stores complete purchase breakdown with tax
  const [showAdvanced, setShowAdvanced] = useState(false); // Show advanced options
  const [customSlippage, setCustomSlippage] = useState(0.2); // User-selected price tolerance (slippage)

  // Get asset ID from presale data or use default
  const assetId = getAssetId(
    presale?.mine_token?.asset_id || "b0bbfeb5-dd77-4e44-ba2c-22e84ff9ea4a"
  );
  const assetType = presale?.mine_token?.asset_type || 53; // Default to 53 for USDT

  // Price tolerance configuration - use user's custom tolerance or default
  const slippagePercent = customSlippage; // User-selected or default 0.2%
  const slippageMultiplier = 1 - slippagePercent / 100; // 0.998 for 0.2%
  const slippageBuffer = 1 + slippagePercent / 100; // 1.002 for 0.2% - extra charged, refunded if not needed

  // Gateway minimum charge amount
  const GATEWAY_MINIMUM = 10000; // 10,000 Rial minimum for gateway payments

  // Hooks
  const {
    assets,
    loading: pricesLoading,
    error: pricesError,
    calculateTokens,
    refetch,
  } = useAssetPrices(0.5); // Update every 30 seconds
  const { calculateTax } = useCalculateTax();
  const { chargeWallet, charging, error: chargeError } = useChargeWallet();
  const {
    purchaseToken,
    purchasing,
    error: purchaseError,
  } = usePurchaseToken();
  const {
    balance: rialBalance,
    loading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useRialBalance();

  // Calculate max spendable amount (accounting for price tolerance buffer)
  const maxSpendableAmount = useMemo(() => {
    if (!rialBalance || rialBalance <= 0) return 0;
    // Max amount = balance / tolerance buffer
    // Example: 130 Rial / 1.01 = 128.71 Rial (safe to spend)
    // The difference is reserved for price tolerance and refunded if not needed
    return Math.floor(rialBalance / slippageBuffer);
  }, [rialBalance, slippageBuffer]);

  // Get current asset data
  const currentAsset = useMemo(() => {
    return assets.find((a) => a.asset_id === assetId);
  }, [assets, assetId]);

  /**
   * Round amount to clean increments
   * Always rounds to nearest 1,000 Rial
   * Minimum: 10,000 Rial
   * Always rounds UP to ensure user pays enough
   */
  const roundToCleanAmount = (amount) => {
    // Round up to nearest 1,000
    const rounded = Math.ceil(amount / 1000) * 1000;
    // Enforce minimum of 10,000 Rial
    return Math.max(rounded, 10000);
  };

  /**
   * Calculate purchase details with tax
   * IMPORTANT: User pays the amount they enter (rounded to clean increment)
   * Tax and price tolerance REDUCE the tokens received, not increase the price
   * Extra amount from price tolerance is refunded if actual price is lower
   */
  useEffect(() => {
    if (!rawRialAmount || !currentAsset || parseFloat(rawRialAmount) <= 0) {
      setPurchaseDetails(null);
      return;
    }

    const calculatePurchaseWithTax = async () => {
      const rialInput = parseFloat(rawRialAmount);
      const currentPrice = currentAsset.buy_unit_price;

      // Step 1: Round user's input to clean amount (what user pays - CONSTANT!)
      const totalCostRial = roundToCleanAmount(rialInput);

      // Step 2: Calculate base token amount from Rial cost
      const baseTokenAmount = totalCostRial / currentPrice;

      // Step 3: Get tax percentage (we need percent, not Rial amount)
      let taxInfo = await calculateTax(assetType, assetId, baseTokenAmount);
      let taxPercent = taxInfo.percent;

      // Step 4: Calculate tax amount in Rials (reverse calculation from total)
      // total_cost includes tax, so we need to extract it
      // Formula: tax_amount = (total * tax_percent) / (100 + tax_percent)
      const taxAmountRial = (totalCostRial * taxPercent) / (100 + taxPercent);
      const baseCostRial = totalCostRial - taxAmountRial;

      // Step 5: Sum tax and price tolerance percentages
      const totalReductionPercent = taxPercent + slippagePercent;

      // Step 6: Apply total reduction to tokens (NOT to Rial!)
      const reductionMultiplier = 1 - totalReductionPercent / 100;
      const finalTokenAmount = baseTokenAmount * reductionMultiplier;

      // Step 7: Prepare breakdown for display and backend
      const details = {
        token_amount: finalTokenAmount.toFixed(18), // 18 decimals for web3
        token_price_rial: Math.ceil(currentPrice), // No decimals
        total_cost: totalCostRial, // What user pays (includes tax)
        base_cost_rial: Math.floor(baseCostRial), // Base cost before tax (rounded down)
        tax_amount_rial: Math.ceil(taxAmountRial), // Tax amount in Rials (rounded up)
        tax_percent: taxPercent,
        slippage_percent: slippagePercent,
        total_reduction_percent: totalReductionPercent, // Combined reduction
      };

      setPurchaseDetails(details);
    };

    calculatePurchaseWithTax();
  }, [
    rawRialAmount,
    currentAsset,
    assetType,
    assetId,
    slippagePercent,
    calculateTax,
  ]);

  // Calculate tokens to receive from purchase details (includes tax adjustment)
  const tokensToReceive = useMemo(() => {
    if (!purchaseDetails) return 0;
    return parseFloat(purchaseDetails.token_amount);
  }, [purchaseDetails]);

  // Check if user has enough balance
  const hasEnoughBalance = useMemo(() => {
    if (!purchaseDetails || rialBalance === null) return false;
    // Use the actual calculated total cost
    return purchaseDetails.total_cost <= rialBalance;
  }, [purchaseDetails, rialBalance]);

  // Calculate payment breakdown based on user choice
  const paymentBreakdown = useMemo(() => {
    if (!purchaseDetails || rialBalance === null) return null;

    // Use the ACTUAL calculated total cost (includes tax, adjusted for price tolerance)
    const totalCost = purchaseDetails.total_cost;
    const walletBalance = rialBalance; // Use actual balance (with decimals)

    // User wants to use wallet balance
    if (useWalletBalance && walletBalance > 0) {
      // Calculate what will actually be charged
      const walletBalanceToUse = Math.min(walletBalance, totalCost);
      const chargeAmount = Math.max(0, totalCost - walletBalance);

      return {
        totalCost, // ACTUAL cost (not user's raw input)
        walletBalanceUsed: walletBalanceToUse,
        chargeAmount,
        needsGateway: chargeAmount > 0,
        gatewayBelowMinimum: chargeAmount > 0 && chargeAmount < GATEWAY_MINIMUM,
      };
    }

    // User doesn't want to use wallet balance
    return {
      totalCost,
      walletBalanceUsed: 0,
      chargeAmount: totalCost,
      needsGateway: true,
      gatewayBelowMinimum: totalCost < GATEWAY_MINIMUM,
    };
  }, [purchaseDetails, rialBalance, useWalletBalance]);

  // Handle purchase - show confirmation dialog first
  const handlePurchase = async () => {
    const amount = parseFloat(rawRialAmount);

    if (!rawRialAmount || amount <= 0) {
      toast.error(t("errors.invalidAmount"));
      return;
    }

    // Validate minimum amount
    if (amount < 10000) {
      toast.error(
        locale === "fa"
          ? "حداقل مبلغ ۱۰,۰۰۰ ریال است"
          : "Minimum amount is 10,000 Rials"
      );
      return;
    }

    // Validate multiples of 1,000
    if (amount % 1000 !== 0) {
      toast.error(
        locale === "fa"
          ? "مبلغ باید مضربی از ۱,۰۰۰ ریال باشد"
          : "Amount must be a multiple of 1,000 Rials"
      );
      return;
    }

    if (!isAuthenticated || authMethod !== "sso") {
      toast.error(tRial("errorSSO"));
      return;
    }

    // Check if gateway charge is below minimum
    if (paymentBreakdown?.gatewayBelowMinimum && useWalletBalance) {
      // Calculate max safe amount user can purchase with their balance
      const maxSafeRial = Math.floor(rialBalance || 0);

      // Auto-adjust the amount to max purchasable from balance
      const formatted = maxSafeRial.toLocaleString("en-US");
      setRialAmount(formatted);
      setRawRialAmount(maxSafeRial.toString());

      toast.success(
        tRial("amountAdjusted", {
          amount: maxSafeRial.toLocaleString(
            locale === "fa" ? "fa-IR" : "en-US"
          ),
        }),
        { duration: 5000 }
      );
      return;
    }

    // Fetch latest prices before showing confirmation
    toast.loading(tRial("fetchingPrices"), { id: "fetch-price" });
    await refetch();
    toast.dismiss("fetch-price");

    // Get latest asset data
    const latestAsset = assets.find((a) => a.asset_id === assetId);
    if (!latestAsset) {
      toast.error(tRial("errorFetchPrice"));
      return;
    }

    // Calculate tokens with latest price using effective Rial (with price tolerance applied)
    const effectiveRialAmount = parseFloat(rawRialAmount) * slippageMultiplier;
    const tokensWithLatestPrice = calculateTokens(assetId, effectiveRialAmount);

    // Show confirmation dialog
    setConfirmData({
      rialAmount: parseFloat(rawRialAmount), // User's entered amount (no buffer in display)
      tokenAmount: tokensWithLatestPrice,
      pricePerToken: latestAsset.buy_unit_price,
      tokensPerThousand: latestAsset.tokens_per_1000_rial,
    });
    setShowConfirmDialog(true);
  };

  // Handle confirmed purchase
  const handleConfirmedPurchase = async () => {
    setShowConfirmDialog(false);

    if (!paymentBreakdown || !purchaseDetails) return;

    // Direct purchase from wallet (no gateway needed) - must have enough balance
    if (
      hasEnoughBalance &&
      useWalletBalance &&
      !paymentBreakdown.needsGateway
    ) {
      toast.loading(tRial("purchasing"), {
        id: "rial-purchase",
        duration: Infinity,
      });

      // Use purchase details with tax already calculated
      const result = await purchaseToken(
        parseFloat(purchaseDetails.token_amount), // 18-decimal precision token amount
        assetType,
        assetId,
        presale?.mine_token?.token_symbol?.toLowerCase() || "usdt",
        purchaseDetails.total_cost, // Total cost including tax
        purchaseDetails.slippage_percent // Price tolerance for backend validation
      );

      if (result && result.success) {
        toast.dismiss("rial-purchase");
        toast.success(tRial("purchaseSuccess"), {
          duration: 5000,
        });
        refetchBalance();
        setRialAmount("");
        setRawRialAmount("");
      } else {
        toast.dismiss("rial-purchase");

        // Check if error is about insufficient balance
        const errorMessage = purchaseError || tRial("errorPurchase");
        if (
          errorMessage.includes("Not enough Rial") ||
          errorMessage.includes("need")
        ) {
          // Extract the required amount if possible
          const match = errorMessage.match(/(\d+\.?\d*)\s*Rial/);
          const requiredRial = match ? parseFloat(match[1]) : null;

          if (requiredRial && rialBalance) {
            const shortfall = requiredRial - rialBalance;
            toast.error(
              locale === "fa"
                ? `موجودی کافی نیست. ${shortfall.toFixed(
                    2
                  )} ریال کم دارید. لطفاً مقدار کمتری وارد کنید یا کیف پول را شارژ کنید.`
                : `Insufficient balance. You need ${shortfall.toFixed(
                    2
                  )} more Rials. Please reduce the amount or charge your wallet.`,
              { duration: 7000 }
            );
          } else {
            toast.error(
              locale === "fa"
                ? "موجودی کافی نیست. لطفاً مقدار کمتری وارد کنید یا کیف پول را شارژ کنید."
                : "Insufficient balance. Please reduce the amount or charge your wallet.",
              { duration: 7000 }
            );
          }
        } else {
          toast.error(errorMessage);
        }
      }
      return;
    }

    // Gateway payment - ALWAYS includes purchase_intent for auto-purchase on callback
    toast.loading(tRial("redirecting"), {
      id: "rial-purchase",
      duration: Infinity,
    });

    // Use the payment breakdown (already calculated correctly)
    const chargeAmount = Math.ceil(paymentBreakdown.chargeAmount);
    const walletUsed = Math.floor(paymentBreakdown.walletBalanceUsed);

    // Create complete purchase intent with all new fields from documentation
    const purchaseIntent = {
      token_amount: purchaseDetails.token_amount, // 18-decimal precision string
      token_symbol: presale?.mine_token?.token_symbol,
      asset_type: assetType,
      asset_id: assetId,
      unit: presale?.mine_token?.token_symbol?.toLowerCase() || "usdt",
      token_price_rial: purchaseDetails.token_price_rial, // Price snapshot
      rial_amount: chargeAmount, // Amount to charge via gateway (for backend compatibility)
      total_cost: purchaseDetails.total_cost, // Total cost of purchase (base + tax)
      base_cost_rial: purchaseDetails.base_cost_rial, // Base cost without tax
      tax_amount_rial: purchaseDetails.tax_amount_rial, // Tax amount in Rials
      tax_percent: purchaseDetails.tax_percent, // Tax percentage
      slippage_percent: purchaseDetails.slippage_percent, // Price tolerance used
      wallet_balance_used: walletUsed,
      charge_amount: chargeAmount,
    };

    const result = await chargeWallet(
      assetType,
      assetId,
      chargeAmount, // Gateway charge amount (matches what UI shows)
      purchaseIntent // Complete purchase intent with all fields
    );

    if (result) {
      toast.success(tRial("redirectSuccess"), {
        id: "rial-purchase",
      });
    } else {
      toast.dismiss("rial-purchase");
      toast.error(chargeError || tRial("errorPayment"));
    }
  };

  // Quick amount buttons (Rial amounts) - 1M, 10M, 100M
  const quickAmounts = [1000000, 10000000, 100000000];

  // Check if feature is available
  const isAvailable = isAuthenticated && authMethod === "sso";

  if (pricesLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className={`${isRTL ? "mr-3" : "ml-3"} text-gray-600`}>
            {tRial("loading")}
          </span>
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="p-4 sm:p-6 lg:p-8" dir={isRTL ? "rtl" : "ltr"}>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 ${isRTL ? "ml-4" : "mr-4"}`}>
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                {tRial("loginRequired")}
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                {tRial("loginDescription")}
              </p>
              <button
                onClick={() => (window.location.href = "/auth/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {tRial("loginButton")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pricesError || !currentAsset) {
    return (
      <div className="p-4 sm:p-6 lg:p-8" dir={isRTL ? "rtl" : "ltr"}>
        <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
          <div className="flex items-center gap-4 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="font-semibold">{tRial("errorTitle")}</p>
              <p className="text-sm text-red-700">
                {tRial("errorDescription")}
              </p>
            </div>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {tRial("retryButton")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Amount Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            {tRial("amountLabel")}
          </span>
          {rialBalance !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full truncate max-w-[100px] sm:max-w-none">
                {t("sections.balance")}:{" "}
                {balanceLoading
                  ? tRial("loadingBalance")
                  : Math.floor(rialBalance).toLocaleString(
                      locale === "fa" ? "fa-IR" : "en-US"
                    )}
              </span>
              {maxSpendableAmount > 0 && (
                <button
                  onClick={() => {
                    const formatted =
                      maxSpendableAmount.toLocaleString("en-US");
                    setRialAmount(formatted);
                    setRawRialAmount(maxSpendableAmount.toString());
                  }}
                  className="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-full transition-colors border border-green-200 hover:border-green-300"
                >
                  {locale === "fa" ? "حداکثر" : "MAX"}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 border-2 border-gray-200 focus-within:border-green-600 focus-within:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <NumericFormat
              value={rialAmount}
              onValueChange={(values) => {
                const { formattedValue, value } = values;
                setRialAmount(formattedValue || "");
                setRawRialAmount(value || "");
              }}
              thousandSeparator={true}
              decimalScale={0}
              allowNegative={false}
              placeholder="10,000"
              className="bg-transparent text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 placeholder-gray-400 outline-none flex-1"
            />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm sm:text-lg font-bold text-white">
                  ﷼
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 text-sm sm:text-lg">
                  IRR
                </div>
              </div>
            </div>
          </div>
          {/* Hint for 1,000 increment */}
          <p className="text-xs text-gray-500 mt-2 px-1">
            {tRial("amountHint")}
          </p>
          {/* Validation Error */}
          {rawRialAmount && parseFloat(rawRialAmount) > 0 && (
            <>
              {parseFloat(rawRialAmount) < 10000 && (
                <p className="text-xs text-red-600 mt-1 px-1 font-semibold">
                  {locale === "fa"
                    ? "حداقل مبلغ ۱۰,۰۰۰ ریال است"
                    : "Minimum amount is 10,000 Rials"}
                </p>
              )}
              {parseFloat(rawRialAmount) >= 10000 &&
                parseFloat(rawRialAmount) % 1000 !== 0 && (
                  <p className="text-xs text-red-600 mt-1 px-1 font-semibold">
                    {locale === "fa"
                      ? "مبلغ باید مضربی از ۱,۰۰۰ ریال باشد"
                      : "Amount must be a multiple of 1,000 Rials"}
                  </p>
                )}
            </>
          )}
        </div>
      </div>

      {/* Quick Amounts - 1M, 10M, 100M Rial */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              const formatted = amount.toLocaleString("en-US");
              setRialAmount(formatted);
              setRawRialAmount(amount.toString());
            }}
            className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base font-bold text-green-700 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 hover:from-green-100 hover:via-green-200 hover:to-emerald-200 rounded-xl transition-all duration-200 hover:shadow-lg border-2 border-green-300 hover:border-green-400 cursor-pointer transform hover:scale-105"
          >
            <div className="text-center">
              <div className="font-bold text-lg">{amount / 1000000}</div>
              <div className="text-xs text-green-600 mt-0.5">
                {locale === "fa" ? "میلیون ریال" : "M Rials"}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Advanced Options - Price Tolerance Selector */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {locale === "fa" ? "تنظیمات پیشرفته" : "Advanced Settings"}
          </span>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${
              showAdvanced ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showAdvanced && (
          <div className="p-4 bg-white space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                {tRial("priceToleranceLabel")}
                <Info className="w-3 h-3 text-gray-400" />
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0.1, 0.2, 0.5, 1.0].map((value) => (
                  <button
                    key={value}
                    onClick={() => setCustomSlippage(value)}
                    className={`py-2 px-3 text-sm font-semibold rounded-lg transition-all ${
                      customSlippage === value
                        ? "bg-green-600 text-white border-2 border-green-600"
                        : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-green-400"
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {tRial("priceToleranceExplanation")}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">💡 </span>
                  {tRial("priceToleranceDetail")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tokens to Receive & Cost Breakdown */}
      {rawRialAmount && purchaseDetails && (
        <div className="space-y-3">
          {/* Token Amount */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300">
            <div className="text-sm text-green-700 mb-2 font-medium">
              {tRial("youWillReceive")}
            </div>
            <div
              className="text-2xl sm:text-3xl font-bold text-green-900"
              dir="ltr"
            >
              {tokensToReceive.toFixed(6)} {presale?.mine_token?.token_symbol}
            </div>
          </div>

          {/* Cost Breakdown with Tax */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">
                {locale === "fa" ? "جزئیات هزینه" : "Cost Breakdown"}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              {/* Total Cost (What user pays) */}
              <div className="flex items-center justify-between pb-2">
                <span className="text-blue-700 font-semibold">
                  {locale === "fa" ? "مبلغ پرداختی" : "Amount to Pay"}
                </span>
                <span className="font-bold text-blue-900 text-lg" dir="ltr">
                  {Math.ceil(purchaseDetails.total_cost).toLocaleString(
                    locale === "fa" ? "fa-IR" : "en-US"
                  )}{" "}
                  {locale === "fa" ? "ریال" : "Rials"}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-blue-300"></div>

              {/* Token Reductions Header */}
              <div className="text-xs text-blue-700 font-semibold pt-1">
                {locale === "fa" ? "کاهش توکن دریافتی:" : "Token Reductions:"}
              </div>

              {/* Tax Percentage */}
              {purchaseDetails.tax_percent > 0 && (
                <div className="flex items-center justify-between text-orange-700">
                  <span className="text-xs">
                    {locale === "fa" ? "مالیات" : "Tax"}
                  </span>
                  <span className="font-semibold" dir="ltr">
                    -{purchaseDetails.tax_percent.toFixed(2)}%
                  </span>
                </div>
              )}

              {/* Price Tolerance Percentage */}
              <div className="flex items-center justify-between text-orange-700">
                <span className="text-xs">{tRial("priceTolerance")}</span>
                <span className="font-semibold" dir="ltr">
                  -{purchaseDetails.slippage_percent.toFixed(2)}%
                </span>
              </div>

              {/* Total Reduction */}
              <div className="flex items-center justify-between text-red-700 font-bold pt-1 border-t border-blue-200">
                <span className="text-xs">
                  {locale === "fa" ? "کل کاهش" : "Total Reduction"}
                </span>
                <span className="font-semibold" dir="ltr">
                  -{purchaseDetails.total_reduction_percent.toFixed(2)}%
                </span>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-1 text-xs text-blue-600 pt-2 border-t border-blue-200">
                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>
                    {tRial("priceToleranceProtection", {
                      percent: slippagePercent,
                    })}
                  </p>
                  <p className="text-blue-500">
                    {tRial("priceToleranceFailInfo", {
                      percent: slippagePercent,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Max Balance Info */}
      {rialBalance !== null &&
        rialBalance > 0 &&
        maxSpendableAmount < rialBalance &&
        !rawRialAmount && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-semibold mb-1">
                  {locale === "fa"
                    ? `💡 حداکثر مبلغ قابل خرج: ${maxSpendableAmount.toLocaleString(
                        "fa-IR"
                      )} ریال`
                    : `💡 Max spendable: ${maxSpendableAmount.toLocaleString(
                        "en-US"
                      )} Rials`}
                </p>
                <p>
                  {locale === "fa"
                    ? `${(rialBalance - maxSpendableAmount).toFixed(
                        0
                      )} ریال (${slippagePercent}%) برای تلورانس قیمت رزرو شده است. اگر قیمت کمتر باشد، به موجودی شما برمی‌گردد.`
                    : `${(rialBalance - maxSpendableAmount).toFixed(
                        0
                      )} Rials (${slippagePercent}%) reserved for price tolerance. Will be refunded if price is lower.`}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Use Wallet Balance Checkbox (always show when there's balance) */}
      {rawRialAmount && rialBalance !== null && rialBalance > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useWalletBalance}
              onChange={(e) => setUseWalletBalance(e.target.checked)}
              className="w-5 h-5 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer mt-0.5"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {tRial("useMyWalletBalance")}
              </p>
              <p className="text-xs text-gray-600 mb-2">
                {hasEnoughBalance
                  ? tRial("instantPurchase")
                  : tRial("combineBalanceDescription")}
              </p>
              <div className="text-xs font-bold text-gray-700" dir="ltr">
                {tRial("availableBalance")}:{" "}
                {Math.floor(rialBalance).toLocaleString(
                  locale === "fa" ? "fa-IR" : "en-US"
                )}{" "}
                {locale === "fa" ? "ریال" : "Rials"}
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Payment Breakdown */}
      {rawRialAmount && paymentBreakdown && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-semibold text-blue-900">
              {tRial("paymentBreakdown")}
            </p>
          </div>
          <div className="space-y-2">
            {paymentBreakdown.walletBalanceUsed > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700">{tRial("fromWallet")}</span>
                <span className="font-bold text-blue-900" dir="ltr">
                  {Math.floor(
                    paymentBreakdown.walletBalanceUsed
                  ).toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}{" "}
                  {locale === "fa" ? "ریال" : "Rials"}
                </span>
              </div>
            )}
            {paymentBreakdown.chargeAmount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700">{tRial("viaGateway")}</span>
                <span className="font-bold text-orange-600" dir="ltr">
                  {Math.ceil(paymentBreakdown.chargeAmount).toLocaleString(
                    locale === "fa" ? "fa-IR" : "en-US"
                  )}{" "}
                  {locale === "fa" ? "ریال" : "Rials"}
                </span>
              </div>
            )}
            <div className="border-t border-blue-300 pt-2 mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-900 font-semibold">
                  {tRial("total")}
                </span>
                <span className="font-bold text-blue-900" dir="ltr">
                  {Math.floor(paymentBreakdown.totalCost).toLocaleString(
                    locale === "fa" ? "fa-IR" : "en-US"
                  )}{" "}
                  {locale === "fa" ? "ریال" : "Rials"}
                </span>
              </div>
            </div>
          </div>

          {/* Gateway Minimum Warning */}
          {paymentBreakdown.gatewayBelowMinimum && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-700">
                  <p className="font-semibold mb-1">
                    {locale === "fa"
                      ? "⚠️ مبلغ شارژ کمتر از حداقل است"
                      : "⚠️ Charge amount below minimum"}
                  </p>
                  <p>
                    {locale === "fa"
                      ? `حداقل مبلغ شارژ کیف پول ${GATEWAY_MINIMUM.toLocaleString(
                          "fa-IR"
                        )} ریال است. لطفاً مبلغ بیشتری وارد کنید.`
                      : `Minimum gateway charge is ${GATEWAY_MINIMUM.toLocaleString(
                          "en-US"
                        )} Rials. Please increase the amount.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={
          !rawRialAmount ||
          parseFloat(rawRialAmount) <= 0 ||
          parseFloat(rawRialAmount) < 10000 ||
          parseFloat(rawRialAmount) % 1000 !== 0 ||
          purchasing ||
          charging ||
          paymentBreakdown?.gatewayBelowMinimum
        }
        className={`w-full font-bold py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg transform hover:scale-[1.02] cursor-pointer ${
          hasEnoughBalance
            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
        }`}
      >
        {purchasing || charging ? (
          <>
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            {tRial("processing")}
          </>
        ) : hasEnoughBalance ? (
          <>
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            {tRial("purchaseNow")}
          </>
        ) : (
          <>
            <Banknote className="w-5 h-5 sm:w-6 sm:h-6" />
            {tRial("buyNow")}
            <ArrowRight
              className={`w-5 h-5 sm:w-6 sm:h-6 ${isRTL ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info
            className={`w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0 ${
              isRTL ? "ml-2" : "mr-2"
            }`}
          />
          <div className="text-xs text-blue-700 space-y-1">
            <p>
              {tRial("paymentInfo")} {tRial("priceUpdate")}
            </p>
            <p className="font-semibold">
              {locale === "fa"
                ? `حداقل مبلغ شارژ کیف پول: ${GATEWAY_MINIMUM.toLocaleString(
                    "fa-IR"
                  )} ریال`
                : `Minimum gateway charge: ${GATEWAY_MINIMUM.toLocaleString(
                    "en-US"
                  )} Rials`}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog - Using Portal for full page coverage */}
      {showConfirmDialog &&
        confirmData &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            dir={isRTL ? "rtl" : "ltr"}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowConfirmDialog(false);
              }
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 sm:p-5 text-center relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    {useWalletBalance && hasEnoughBalance ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Banknote className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white mb-1">
                    {tRial("confirmPurchase")}
                  </h2>
                  <p className="text-white/90 text-xs">
                    {tRial("confirmPurchaseSubtitle")}
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirmDialog(false);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200 z-10 cursor-pointer"
                  type="button"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                {/* Complete Transaction Summary with Tax Breakdown */}
                <div className="space-y-3">
                  {/* Token Amount */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">
                      {tRial("youReceive")}
                    </span>
                    <span
                      className="text-lg font-bold text-green-600"
                      dir="ltr"
                    >
                      {confirmData.tokenAmount.toFixed(6)}{" "}
                      {presale?.mine_token?.token_symbol}
                    </span>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <div className="text-xs font-semibold text-blue-900 mb-2">
                      {locale === "fa" ? "جزئیات هزینه" : "Cost Breakdown"}
                    </div>

                    {/* Total Cost */}
                    <div className="flex items-center justify-between py-1 bg-blue-100 px-2 rounded">
                      <span className="font-bold text-blue-900 text-sm">
                        {locale === "fa" ? "مبلغ پرداختی" : "Amount to Pay"}
                      </span>
                      <span
                        className="font-bold text-blue-900 text-base"
                        dir="ltr"
                      >
                        {purchaseDetails
                          ? Math.ceil(
                              purchaseDetails.total_cost
                            ).toLocaleString(
                              locale === "fa" ? "fa-IR" : "en-US"
                            )
                          : Math.ceil(confirmData.rialAmount).toLocaleString(
                              locale === "fa" ? "fa-IR" : "en-US"
                            )}{" "}
                        {locale === "fa" ? "ریال" : "Rials"}
                      </span>
                    </div>

                    {/* Token Reductions */}
                    {purchaseDetails && (
                      <>
                        <div className="text-xs text-blue-700 font-semibold pt-1 border-t border-blue-200">
                          {locale === "fa"
                            ? "کاهش توکن دریافتی:"
                            : "Token Reductions:"}
                        </div>

                        {/* Tax */}
                        {purchaseDetails.tax_percent > 0 && (
                          <div className="flex items-center justify-between text-xs text-orange-700">
                            <span>{locale === "fa" ? "مالیات" : "Tax"}</span>
                            <span className="font-semibold" dir="ltr">
                              -{purchaseDetails.tax_percent.toFixed(2)}%
                            </span>
                          </div>
                        )}

                        {/* Price Tolerance */}
                        <div className="flex items-center justify-between text-xs text-orange-700">
                          <span>{tRial("priceTolerance")}</span>
                          <span className="font-semibold" dir="ltr">
                            -{purchaseDetails.slippage_percent.toFixed(2)}%
                          </span>
                        </div>

                        {/* Total Reduction */}
                        <div className="flex items-center justify-between text-xs text-red-700 font-bold pt-1 border-t border-blue-200">
                          <span>
                            {locale === "fa" ? "کل کاهش" : "Total Reduction"}
                          </span>
                          <span dir="ltr">
                            -
                            {purchaseDetails.total_reduction_percent.toFixed(2)}
                            %
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Payment Method */}
                  {paymentBreakdown && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="text-xs font-semibold text-gray-900 mb-1">
                        {locale === "fa" ? "روش پرداخت" : "Payment Method"}
                      </div>
                      {paymentBreakdown.walletBalanceUsed > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {locale === "fa" ? "از کیف پول" : "From Wallet"}
                          </span>
                          <span
                            className="font-semibold text-gray-900"
                            dir="ltr"
                          >
                            {Math.floor(
                              paymentBreakdown.walletBalanceUsed
                            ).toLocaleString(
                              locale === "fa" ? "fa-IR" : "en-US"
                            )}{" "}
                            {locale === "fa" ? "ریال" : "Rials"}
                          </span>
                        </div>
                      )}
                      {paymentBreakdown.chargeAmount > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {locale === "fa" ? "از درگاه" : "Via Gateway"}
                          </span>
                          <span
                            className="font-semibold text-orange-600"
                            dir="ltr"
                          >
                            {Math.ceil(
                              paymentBreakdown.chargeAmount
                            ).toLocaleString(
                              locale === "fa" ? "fa-IR" : "en-US"
                            )}{" "}
                            {locale === "fa" ? "ریال" : "Rials"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Tolerance Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-green-700 space-y-1">
                      <p className="font-semibold">
                        {tRial("priceToleranceProtection", {
                          percent: slippagePercent,
                        })}
                      </p>
                      <p>
                        {tRial("priceToleranceFailInfo", {
                          percent: slippagePercent,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleConfirmedPurchase}
                    disabled={purchasing || charging}
                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                  >
                    {purchasing || charging ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {tRial("processing")}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {tRial("confirmPurchaseButton")}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                  >
                    {tRial("cancelButton")}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
