"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { 
  X, 
  ShoppingCart, 
  Wallet, 
  DollarSign, 
  Calculator, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  TrendingUp,
  Clock,
  Shield,
  ExternalLink
} from "lucide-react";
import { formatUnits, parseUnits } from "viem";

export default function PresaleBuyModal({ 
  isOpen, 
  onClose, 
  presale, 
  token 
}) {
  const t = useTranslations("presaleBuy");
  const locale = useLocale();
  const isRTL = locale === "fa";
  
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("0");
  const [step, setStep] = useState("input"); // input, confirm, processing, success, error
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  // Get user's payment token balance
  const { data: balance } = useBalance({
    address,
    token: presale?.payment_token?.address, // Assuming payment token has address
  });

  // Contract write hook for presale purchase
  const { 
    writeContract, 
    data: hash, 
    error: writeError, 
    isPending: isWritePending 
  } = useWriteContract();

  // Wait for transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    error: confirmError 
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Calculate payment amount when token amount changes
  useEffect(() => {
    if (amount && presale?.price_per_token) {
      const tokenAmount = parseFloat(amount);
      const price = parseFloat(presale.price_per_token);
      const payment = (tokenAmount * price).toFixed(6);
      setPaymentAmount(payment);
    } else {
      setPaymentAmount("0");
    }
  }, [amount, presale?.price_per_token]);

  // Handle transaction states
  useEffect(() => {
    if (hash) {
      setTxHash(hash);
      setStep("processing");
    }
  }, [hash]);

  useEffect(() => {
    if (isConfirmed) {
      setStep("success");
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (writeError || confirmError) {
      setError(writeError?.message || confirmError?.message || "Transaction failed");
      setStep("error");
    }
  }, [writeError, confirmError]);

  const handleAmountChange = (value) => {
    // Only allow positive numbers with up to 6 decimals
    const regex = /^\d*\.?\d{0,6}$/;
    if (regex.test(value) || value === "") {
      setAmount(value);
      setError("");
    }
  };

  const validatePurchase = () => {
    if (!isConnected) {
      setError(t("errors.walletNotConnected"));
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError(t("errors.invalidAmount"));
      return false;
    }

    if (balance && parseFloat(paymentAmount) > parseFloat(formatUnits(balance.value, balance.decimals))) {
      setError(t("errors.insufficientBalance"));
      return false;
    }

    const remainingSupply = parseFloat(presale.total_supply) - parseFloat(presale.total_sold);
    if (parseFloat(amount) > remainingSupply) {
      setError(t("errors.exceedsSupply"));
      return false;
    }

    return true;
  };

  const handleBuy = async () => {
    if (!validatePurchase()) return;

    setStep("confirm");
  };

  const handleConfirmPurchase = async () => {
    try {
      setError("");
      
      // This would be the actual contract call
      // For now, we'll simulate it
      await writeContract({
        address: presale.contract_address, // Presale contract address
        abi: [
          {
            name: "buyTokens",
            type: "function",
            inputs: [
              { name: "amount", type: "uint256" },
            ],
            outputs: [],
            stateMutability: "payable",
          },
        ],
        functionName: "buyTokens",
        args: [parseUnits(amount, 18)], // Convert to wei
        value: parseUnits(paymentAmount, balance?.decimals || 18),
      });
    } catch (err) {
      setError(err.message || "Transaction failed");
      setStep("error");
    }
  };

  const resetModal = () => {
    setAmount("");
    setPaymentAmount("0");
    setStep("input");
    setTxHash("");
    setError("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (num === 0) return "0";
    if (num < 0.001) return num.toExponential(2);
    return num.toFixed(6);
  };

  const formatLargeNumber = (num) => {
    const number = parseFloat(num);
    if (number >= 1e9) return (number / 1e9).toFixed(1) + "B";
    if (number >= 1e6) return (number / 1e6).toFixed(1) + "M";
    if (number >= 1e3) return (number / 1e3).toFixed(1) + "K";
    return number.toFixed(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
              <p className="text-sm text-gray-600">{token?.token_name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "input" && (
            <div className="space-y-6">
              {/* Presale Info */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">{t("presaleInfo.price")}</p>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(presale.price_per_token)} {presale.payment_token.symbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">{t("presaleInfo.remaining")}</p>
                    <p className="font-semibold text-gray-900">
                      {formatLargeNumber(parseFloat(presale.total_supply) - parseFloat(presale.total_sold))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("input.tokenAmount")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.000000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5D1B] focus:border-transparent text-lg font-semibold"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    {token?.token_symbol}
                  </div>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t("input.paymentAmount")}</span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {paymentAmount} {presale.payment_token.symbol}
                    </p>
                    {balance && (
                      <p className="text-xs text-gray-500">
                        {t("input.balance")}: {parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} {presale.payment_token.symbol}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <p className="text-sm text-gray-600 mb-2">{t("input.quickAmounts")}</p>
                <div className="grid grid-cols-4 gap-2">
                  {["100", "500", "1000", "5000"].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount)}
                      className="py-2 px-3 text-sm border border-gray-200 rounded-lg hover:border-[#FF5D1B] hover:text-[#FF5D1B] transition-colors"
                    >
                      {quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Buy Button */}
              <button
                onClick={handleBuy}
                disabled={!amount || parseFloat(amount) <= 0 || !isConnected}
                className="w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {!isConnected ? t("buttons.connectWallet") : t("buttons.buyNow")}
              </button>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("confirm.title")}</h3>
                <p className="text-gray-600">{t("confirm.subtitle")}</p>
              </div>

              {/* Transaction Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("confirm.tokenAmount")}</span>
                  <span className="font-semibold">{amount} {token?.token_symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("confirm.paymentAmount")}</span>
                  <span className="font-semibold">{paymentAmount} {presale.payment_token.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("confirm.pricePerToken")}</span>
                  <span className="font-semibold">{formatPrice(presale.price_per_token)} {presale.payment_token.symbol}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>{t("confirm.total")}</span>
                  <span>{paymentAmount} {presale.payment_token.symbol}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("input")}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {t("buttons.back")}
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={isWritePending}
                  className="flex-1 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isWritePending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("buttons.confirming")}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t("buttons.confirm")}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("processing.title")}</h3>
                <p className="text-gray-600 mb-4">{t("processing.subtitle")}</p>
                {txHash && (
                  <a
                    href={`https://bscscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#FF5D1B] hover:underline"
                  >
                    {t("processing.viewTransaction")}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("success.title")}</h3>
                <p className="text-gray-600 mb-4">{t("success.subtitle")}</p>
                <div className="bg-green-50 rounded-xl p-4 text-left">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{t("success.purchased")}</span>
                    <span className="font-semibold">{amount} {token?.token_symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("success.paid")}</span>
                    <span className="font-semibold">{paymentAmount} {presale.payment_token.symbol}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {txHash && (
                  <a
                    href={`https://bscscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t("buttons.viewTransaction")}
                  </a>
                )}
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  {t("buttons.close")}
                </button>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("error.title")}</h3>
                <p className="text-gray-600 mb-4">{t("error.subtitle")}</p>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("input")}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {t("buttons.tryAgain")}
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  {t("buttons.close")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
