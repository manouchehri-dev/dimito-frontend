"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAccount, useChainId } from "wagmi";
import toast from "react-hot-toast";
import {
    Wallet,
    Plus,
    CheckCircle,
    AlertCircle,
    Loader2,
    ExternalLink,
    Eye,
    Shield,
    Zap,
    X
} from "lucide-react";

export default function AddTokenToWallet({
    tokenAddress,
    tokenSymbol,
    tokenName,
    tokenDecimals = 18,
    onClose,
    onSkip
}) {
    const t = useTranslations("presaleBuy.addToWallet");
    const locale = useLocale();
    const isRTL = locale === "fa";

    const { address, isConnected } = useAccount();
    const chainId = useChainId();

    const [isAdding, setIsAdding] = useState(false);
    const [addStatus, setAddStatus] = useState(null); // null, 'success', 'error', 'already-added'

    // BSC Chain ID
    const BSC_CHAIN_ID = 56;

    const handleAddToken = async () => {
        if (!isConnected || !address) {
            toast.error(t("notSupported"));
            return;
        }

        // Check if user is on BSC network
        if (chainId !== BSC_CHAIN_ID) {
            toast.error(t("networkMismatch"));
            return;
        }

        setIsAdding(true);

        try {
            // Check if MetaMask is available
            if (!window.ethereum) {
                throw new Error("MetaMask not found");
            }

            // Add token to wallet using EIP-747
            const wasAdded = await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: tokenDecimals,
                        image: `https://via.placeholder.com/64x64/FF5D1B/FFFFFF?text=${tokenSymbol.charAt(0)}`, // Placeholder token image
                    },
                },
            });

            if (wasAdded) {
                setAddStatus('success');
                toast.success(t("successText"), {
                    duration: 4000,
                    style: {
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white',
                        fontWeight: '600'
                    },
                    icon: '🎉'
                });

                // Auto-close modal after showing success for 2 seconds
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setAddStatus('already-added');
                toast(t("alreadyAdded"), {
                    duration: 3000,
                    style: {
                        background: '#F3F4F6',
                        color: '#374151',
                        border: '1px solid #D1D5DB'
                    },
                    icon: 'ℹ️'
                });
            }
        } catch (error) {
            console.error("Error adding token to wallet:", error);

            let errorMessage = t("errorText");

            if (error.code === 4001) {
                errorMessage = t("userRejected");
                setAddStatus('error');
            } else if (error.message.includes("MetaMask")) {
                errorMessage = t("notSupported");
                setAddStatus('error');
            } else {
                setAddStatus('error');
            }

            toast.error(errorMessage, {
                duration: 4000,
                style: {
                    background: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FECACA'
                },
                icon: '❌'
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleTryAgain = () => {
        setAddStatus(null);
        handleAddToken();
    };

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Handle background click
    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 p-4"
            dir={isRTL ? "rtl" : "ltr"}
            onClick={handleBackgroundClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] p-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-white mb-1">
                            {t("title")}
                        </h2>
                        <p className="text-white/90 text-xs">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200 z-10 cursor-pointer"
                        type="button"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>

                    {/* Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                    {/* Description */}
                    <div className="text-center">
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {t("description")}
                        </p>
                    </div>

                    {/* Compact Token Info */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-700">{tokenSymbol}</span>
                            </div>
                            <span className="text-xs text-gray-500">{t("networkName")}</span>
                        </div>
                        <div className="text-xs text-gray-600 truncate">{tokenName}</div>
                        <a
                            href={`https://bscscan.com/token/${tokenAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#FF5D1B] hover:text-[#FF4A0F] mt-2"
                        >
                            {t("tokenDetails.viewOnBSCScan")} <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Quick Benefits */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-center gap-4 text-xs text-blue-700">
                            <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{t("benefits.tracking")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span>{t("benefits.management")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>{t("benefits.visibility")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {addStatus === 'success' ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-green-700 mb-1">
                                        {t("successText")}
                                    </h3>
                                    <p className="text-sm text-green-600">
                                        {t("successMessage", { tokenSymbol })}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
                                >
                                    {t("done")}
                                </button>
                            </div>
                        ) : addStatus === 'error' ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleTryAgain}
                                        className="w-full bg-[#FF5D1B] hover:bg-[#FF4A0F] text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        {t("tryAgain")}
                                    </button>
                                    <button
                                        onClick={onSkip}
                                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors duration-200"
                                    >
                                        {t("skip")}
                                    </button>
                                </div>
                            </div>
                        ) : addStatus === 'already-added' ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-700 mb-1">
                                        {t("alreadyAdded")}
                                    </h3>
                                    <p className="text-sm text-blue-600">
                                        {t("alreadyAddedMessage")}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
                                >
                                    {t("done")}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <button
                                    onClick={handleAddToken}
                                    disabled={isAdding || !isConnected}
                                    className="w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4A0F] hover:to-[#FF2A2A] text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                                >
                                    {isAdding ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {t("addingText")}
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            {t("buttonText")}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={onSkip}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors duration-200"
                                >
                                    {t("skip")}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Network Warning */}
                    {chainId !== BSC_CHAIN_ID && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">
                                        {t("networkMismatch")}
                                    </p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        {t("currentNetwork", { 
                                            networkName: chainId === 1 ? 'Ethereum' : chainId === 137 ? 'Polygon' : `Chain ${chainId}` 
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
