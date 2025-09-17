"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { DateObject } from "react-multi-date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConnect, useConfig } from 'wagmi';
import { getTransactionReceipt } from 'wagmi/actions';
import { parseEventLogs } from 'viem';
import DimitoFactoryAbi from '@/abi/DimitoFactoryAbi.json';
import toast, { Toaster } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { httpClient, presaleEndpoints } from '@/lib/auth/httpClient';

const CreateDMTForm = () => {
  const t = useTranslations("createDMT");
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const { connectors, connect } = useConnect();
  const config = useConfig();

  // Smart contract configuration
  const CONTRACT_ADDRESS = "0xaeB19290C236653BA17Bf829D4416d9b0d4eDC71";
  const PRESALE_CONTRACT_ADDRESS = "0x4c64cbe581cd251cf7ab42f68f7aea15ae2f8faf";

  // Mock mode for testing (set to true to avoid gas fees)
  const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

  // Predefined payment tokens
  const paymentTokens = [
    { name: "USDT_FAKE", address: "0x2adFDf2354116a09c7dA522070e47f66d7717C57", symbol: "USDTF" },
    { name: "USDT", address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT" },
  ];

  const [formData, setFormData] = useState({
    paymentToken: "0x2adFDf2354116a09c7dA522070e47f66d7717C57", // Default to USDT_FAKE
    pricePerToken: "",
    startDate: new DateObject(),
    endDate: new DateObject().add(7, "days"), // Default to 7 days from now
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null); // 'pending', 'success', 'error'
  const [mockHash, setMockHash] = useState(null); // For mock transactions
  const [createdTokenAddress, setCreatedTokenAddress] = useState(null); // Store created token address
  const [loadingStep, setLoadingStep] = useState(null); // Track current loading step
  const [progress, setProgress] = useState(0); // Progress percentage

  // Loading steps configuration
  const loadingSteps = {
    PREPARING: { key: 'preparing', progress: 10, message: t("preparingTransaction") || "Preparing transaction..." },
    SUBMITTING: { key: 'submitting', progress: 25, message: t("submittingTransaction") || "Submitting to blockchain..." },
    CONFIRMING: { key: 'confirming', progress: 50, message: t("confirmingTransaction") || "Confirming transaction..." },
    EXTRACTING: { key: 'extracting', progress: 70, message: t("extractingTokenAddress") || "Extracting token address..." },
    CREATING_PRESALE: { key: 'creatingPresale', progress: 85, message: t("creatingPresale") || "Creating presale..." },
    COMPLETED: { key: 'completed', progress: 100, message: t("transactionSuccess") || "Transaction completed!" }
  };

  // Update loading step with progress
  const updateLoadingStep = (step) => {
    setLoadingStep(step.key);
    setProgress(step.progress);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate payment token selection
    if (!formData.paymentToken) {
      newErrors.paymentToken = t("paymentTokenRequired");
    }

    // Validate price per token
    if (!formData.pricePerToken) {
      newErrors.pricePerToken = t("pricePerTokenRequired");
    } else if (isNaN(formData.pricePerToken) || parseFloat(formData.pricePerToken) <= 0) {
      newErrors.pricePerToken = t("pricePerTokenInvalid");
    }

    // Validate dates
    if (!formData.startDate) {
      newErrors.startDate = t("startDateRequired");
    }

    if (!formData.endDate) {
      newErrors.endDate = t("endDateRequired");
    }

    if (formData.startDate && formData.endDate) {
      if (formData.endDate.toUnix() <= formData.startDate.toUnix()) {
        newErrors.endDate = t("endDateInvalid");
      }
    }

    setErrors(newErrors);

    // Show validation errors as toast
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError, {
        duration: 4000,
        position: 'top-center',
      });
    }

    return Object.keys(newErrors).length === 0;
  };

  // React Query mutation for creating presale from token
  const createPresaleMutation = useMutation({
    mutationFn: async (tokenAddress) => {
      try {
        const response = await httpClient.post(presaleEndpoints.createFromToken, {
          tokenAddress,
        });
        return response.data;
      } catch (error) {
        // httpClient already handles error transformation
        throw new Error(error.data?.error || error.message || 'Failed to create presale');
      }
    },
    onSuccess: (data) => {
      console.log('✅ Presale created successfully:', data);
      
      // Step 6: Completed
      updateLoadingStep(loadingSteps.COMPLETED);
      
      toast.success(
        `${t("presaleCreatedSuccess") || "Presale created successfully!"}\n${data.tokenInfo.name} (${data.tokenInfo.symbol})`,
        {
          duration: 6000,
          position: 'top-center',
          icon: '🎉',
        }
      );

      // Reset loading state after completion
      setTimeout(() => {
        setTransactionStatus('success');
        setIsSubmitting(false);
        setLoadingStep(null);
        setProgress(0);
      }, 2000);
    },
    onError: (error) => {
      console.error('❌ Presale creation failed:', error);
      
      // Reset loading state on error
      setLoadingStep(null);
      setProgress(0);
      setTransactionStatus('error');
      setIsSubmitting(false);
      
      toast.error(
        t("presaleCreationFailed") || error.message || "Failed to create presale",
        {
          duration: 5000,
          position: 'top-center',
        }
      );
    },
  });

  // Mock function to simulate smart contract interaction
  const mockCreateDMT = async (submissionData) => {
    // Generate a fake transaction hash and token address
    const fakeHash = '0x' + Math.random().toString(16).substr(2, 64);
    const fakeTokenAddress = '0x' + Math.random().toString(16).substr(2, 40);
    setMockHash(fakeHash);
    setCreatedTokenAddress(fakeTokenAddress);

    try {
      // Step 1: Preparing
      updateLoadingStep(loadingSteps.PREPARING);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Submitting
      updateLoadingStep(loadingSteps.SUBMITTING);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Confirming
      updateLoadingStep(loadingSteps.CONFIRMING);
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Step 4: Extracting token address
      updateLoadingStep(loadingSteps.EXTRACTING);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 5: Creating presale
      updateLoadingStep(loadingSteps.CREATING_PRESALE);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 6: Completed
      updateLoadingStep(loadingSteps.COMPLETED);

      const mockPresaleData = {
        message: "Presale created successfully from token address",
        tokenAddress: fakeTokenAddress,
        presaleContractAddress: PRESALE_CONTRACT_ADDRESS,
        tokenInfo: {
          name: "Mock Digital Mine Token",
          symbol: "MDMT",
          decimals: 18,
          address: fakeTokenAddress
        }
      };

      console.log('🧪 Mock: Presale created successfully:', mockPresaleData);
      toast.success(
        `🧪 ${t("mockPresaleCreatedSuccess") || "Mock: Presale created successfully!"}\n${mockPresaleData.tokenInfo.name} (${mockPresaleData.tokenInfo.symbol})`,
        {
          duration: 6000,
          position: 'top-center',
          icon: '🎉',
        }
      );

      return { success: true, hash: fakeHash, tokenAddress: fakeTokenAddress };
    } catch (error) {
      console.error('Mock API error:', error);
      toast.error(`🧪 ${t("mockBackendFailed") || "Mock: Backend simulation failed"}`, {
        duration: 4000,
      });
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isConnected) {
      // Try to connect wallet first
      try {
        // Connect with the first available connector (usually MetaMask/Injected)
        const injectedConnector = connectors.find(connector => connector.type === 'injected');
        if (injectedConnector) {
          toast.loading(t("connectingWallet") || 'Connecting wallet...', { duration: 2000 });
          await connect({ connector: injectedConnector });
          toast.success(t("walletConnectedSuccess") || 'Wallet connected successfully!', { duration: 3000 });
          // After connection, the form will re-render and this function will be called again
          return;
        } else {
          toast.error(t("pleaseConnectWallet") || "Please connect your wallet first to create DMT tokens", {
            duration: 4000,
            position: 'top-center',
          });
          return;
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        toast.error(t("walletConnectionFailed") || "Failed to connect wallet. Please try again.", {
          duration: 4000,
          position: 'top-center',
        });
        return;
      }
    }

    // Get selected token details
    const selectedToken = paymentTokens.find(token => token.address === formData.paymentToken);

    // Convert dates to Unix timestamps and price to 18 decimals
    const submissionData = {
      paymentToken: selectedToken?.address, // Only send the address
      pricePerToken: BigInt(Math.floor(parseFloat(formData.pricePerToken) * 10 ** 18)), // Convert to 18 decimals
      startDate: formData.startDate.toUnix(),
      endDate: formData.endDate.toUnix(),
    };

    console.log("Form submitted with data:", submissionData);

    try {
      setIsSubmitting(true);
      setTransactionStatus('pending');

      if (MOCK_MODE) {
        // Mock mode - simulate transaction without gas fees
        console.log('🧪 Mock mode: Simulating transaction...');
        const result = await mockCreateDMT(submissionData);

        // Reset loading state and form
        setTimeout(() => {
          setTransactionStatus('success');
          setIsSubmitting(false);
          setLoadingStep(null);
          setProgress(0);

          // Reset form after successful transaction
          setFormData({
            paymentToken: "0x2adFDf2354116a09c7dA522070e47f66d7717C57", // Reset to USDT_FAKE
            pricePerToken: "",
            startDate: new DateObject(),
            endDate: new DateObject().add(7, "days"),
          });
        }, 1500);

      } else {
        // Real blockchain transaction
        // Step 1: Preparing
        updateLoadingStep(loadingSteps.PREPARING);

        try {
          // Step 2: Submitting
          updateLoadingStep(loadingSteps.SUBMITTING);
          
          // Call the smart contract
          writeContract({
            address: CONTRACT_ADDRESS,
            abi: DimitoFactoryAbi,
            functionName: 'createDMT',
            args: [
              submissionData.paymentToken, // _paymentToken (address)
              submissionData.pricePerToken, // _pricePerToken (already in 18 decimals)
              BigInt(submissionData.startDate), // _startTime
              BigInt(submissionData.endDate), // _endTime
            ],
          });

        } catch (contractError) {
          console.error('Smart contract error:', contractError);
          setLoadingStep(null);
          setProgress(0);
          toast.error(t("failedToSubmitTransaction") || 'Failed to submit transaction. Please try again.', {
            duration: 4000,
          });
          throw contractError;
        }
      }
    } catch (err) {
      console.error('Transaction failed:', err);
      setTransactionStatus('error');
      setIsSubmitting(false);

      // Enhanced error handling
      let errorMessage = t("transactionFailed") || "Transaction failed. Please try again.";

      if (err?.message?.includes('User rejected')) {
        errorMessage = t("transactionRejected") || 'Transaction was rejected by user';
      } else if (err?.message?.includes('insufficient funds')) {
        errorMessage = t("insufficientFunds") || 'Insufficient funds for transaction';
      } else if (err?.message?.includes('gas')) {
        errorMessage = t("gasEstimationFailed") || 'Gas estimation failed. Please try again.';
      }

      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });
    }
  };

  // Handle transaction status changes
  React.useEffect(() => {
    if (isConfirmed && hash) {
      handleSuccessfulTransaction(hash);
    }
  }, [isConfirmed, hash, t]);

  // Handle successful transaction - extract token address and get presale data
  const handleSuccessfulTransaction = async (transactionHash) => {
    try {
      // Step 3: Confirming (transaction confirmed)
      updateLoadingStep(loadingSteps.CONFIRMING);
      
      // Show initial success toast
      toast.success(t("transactionSuccess") || "DMT Token created successfully!", {
        duration: 5000,
        position: 'top-center',
        icon: '🎉',
      });

      // Step 4: Extracting token address
      updateLoadingStep(loadingSteps.EXTRACTING);

      // Get transaction receipt to extract token address from logs
      const receipt = await getTransactionReceipt(config, {
        hash: transactionHash,
      });

      // Extract token address from DMTCreated event logs
      let tokenAddress = null;

      // Use viem's parseEventLogs to parse the events
      const logs = parseEventLogs({
        abi: DimitoFactoryAbi,
        logs: receipt.logs,
      });

      // Find DMTCreated event
      const dmtCreatedEvent = logs.find(log => log.eventName === 'DMTCreated');
      if (dmtCreatedEvent) {
        tokenAddress = dmtCreatedEvent.args.dmt;
      }

      if (tokenAddress) {
        setCreatedTokenAddress(tokenAddress);

        // Step 5: Creating presale
        updateLoadingStep(loadingSteps.CREATING_PRESALE);

        // Use React Query mutation to create presale
        createPresaleMutation.mutate(tokenAddress);
      } else {
        setLoadingStep(null);
        setProgress(0);
        toast.error(t("tokenAddressNotFound") || "Could not extract token address from transaction", {
          duration: 4000,
        });
      }

      // Reset form after successful transaction
      setFormData({
        paymentToken: "0x2adFDf2354116a09c7dA522070e47f66d7717C57", // Reset to USDT_FAKE
        pricePerToken: "",
        startDate: new DateObject(),
        endDate: new DateObject().add(7, "days"),
      });

    } catch (error) {
      console.error('Error handling successful transaction:', error);
      toast.error(t("errorProcessingTransaction") || "Error processing transaction data", {
        duration: 4000,
      });
    }
  };

  React.useEffect(() => {
    if (error) {
      setTransactionStatus('error');
      setIsSubmitting(false);
      console.error('Contract write error:', error);

      let errorMessage = t("transactionFailed") || "Transaction failed";

      // Enhanced error message based on error type
      if (error.shortMessage) {
        errorMessage = error.shortMessage;
      } else if (error.message?.includes('User rejected')) {
        errorMessage = t("transactionRejected") || 'Transaction was rejected by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = t("insufficientFunds") || 'Insufficient funds for transaction';
      }

      toast.error(errorMessage, {
        duration: 6000,
        position: 'top-center',
      });
    }
  }, [error, t]);

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Default options for specific types
          success: {
            duration: 4000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
          error: {
            duration: 5000,
          },
        }}
      />

      <div className="min-h-screen bg-background py-8 px-4 lg:px-[72px]">
        <div className="max-w-4xl mx-auto pt-[100px] lg:pt-[140px]">

          {/* Form Card */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl lg:rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl lg:text-2xl font-bold text-center text-primary">
                {t("title")}
                {MOCK_MODE && (
                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    🧪 Mock Mode
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-gray-500 text-center mt-2">
                {t("required")}
              </p>

              {/* Loading Progress */}
              {loadingStep && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">
                      {loadingSteps[loadingStep.toUpperCase()]?.message || 'Processing...'}
                    </span>
                    <span className="text-sm text-blue-600">{progress}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  {/* Step Indicators */}
                  <div className="flex justify-between mt-3 text-xs">
                    <div className={`flex flex-col items-center ${progress >= 10 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mb-1 ${progress >= 10 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <span>{t("preparing") || "Prepare"}</span>
                    </div>
                    <div className={`flex flex-col items-center ${progress >= 25 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mb-1 ${progress >= 25 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <span>{t("submit") || "Submit"}</span>
                    </div>
                    <div className={`flex flex-col items-center ${progress >= 50 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mb-1 ${progress >= 50 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <span>{t("confirm") || "Confirm"}</span>
                    </div>
                    <div className={`flex flex-col items-center ${progress >= 70 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mb-1 ${progress >= 70 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <span>{t("extract") || "Extract"}</span>
                    </div>
                    <div className={`flex flex-col items-center ${progress >= 85 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mb-1 ${progress >= 85 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <span>{t("presale") || "Presale"}</span>
                    </div>
                    <div className={`flex flex-col items-center ${progress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full mb-1 ${progress >= 100 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      <span>{t("done") || "Done"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Status */}
              {transactionStatus && !loadingStep && (
                <div className={`mt-4 p-3 rounded-lg text-center ${transactionStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  transactionStatus === 'success' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {transactionStatus === 'pending' && (isConfirming ? t("confirmingTransaction") || 'Confirming transaction...' : t("transactionPending") || 'Transaction pending...')}
                  {transactionStatus === 'success' && (t("transactionSuccess") || 'DMT Token created successfully!')}
                  {transactionStatus === 'error' && (t("transactionFailed") || 'Transaction failed. Please try again.')}
                </div>
              )}

              {/* Transaction Hash */}
              {(hash || mockHash) && (
                <div className="mt-2 text-center">
                  <a
                    href={MOCK_MODE ? '#' : `https://bscscan.com/tx/${hash || mockHash}`}
                    target={MOCK_MODE ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className={`text-sm ${MOCK_MODE ? 'text-gray-500 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'} underline`}
                    onClick={MOCK_MODE ? (e) => e.preventDefault() : undefined}
                  >
                    {MOCK_MODE ? `${t("mockTransaction") || "Mock TX"}: ${mockHash?.substring(0, 10)}...` : t("viewOnBSCScan") || 'View on BSCScan'}
                  </a>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                {/* Payment Token Selection */}
                <div className="space-y-3">
                  <Label
                    htmlFor="paymentToken"
                    className="text-base lg:text-lg font-semibold text-primary flex items-center gap-2"
                  >
                    {t("paymentToken")}
                    <span className="text-[#FF4135]">*</span>
                  </Label>
                  <Select
                    value={formData.paymentToken}

                    onValueChange={(value) => handleInputChange("paymentToken", value)}
                    className={`h-12 lg:h-14 text-base lg:text-lg rounded-xl border-2 transition-all duration-200 ${errors.paymentToken
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-[#FF4135] focus:ring-[#FF4135]/20"
                      }`}
                  >
                    <SelectItem value="USDT_FAKE_PLACEHOLDER" disabled>
                      {t("paymentTokenPlaceholder")}
                    </SelectItem>
                    {paymentTokens.map((token) => (
                      <SelectItem key={token.address} value={token.address}>
                        {token.name} ({token.symbol})
                      </SelectItem>
                    ))}
                  </Select>
                  {errors.paymentToken && (
                    <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
                      {errors.paymentToken}
                    </p>
                  )}
                </div>

                {/* Price Per Token */}
                <div className="space-y-3">
                  <Label
                    htmlFor="pricePerToken"
                    className="text-base lg:text-lg font-semibold text-primary flex items-center gap-2"
                  >
                    {t("pricePerToken")}
                    <span className="text-[#FF4135]">*</span>
                  </Label>
                  <Input
                    id="pricePerToken"
                    type="number"
                    step="0.000000000000000001"
                    placeholder={t("pricePerTokenPlaceholder")}
                    value={formData.pricePerToken}
                    onChange={(e) => handleInputChange("pricePerToken", e.target.value)}
                    className={`h-12 lg:h-14 text-base lg:text-lg rounded-xl border-2 transition-all duration-200 ${errors.pricePerToken
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-[#FF4135] focus:ring-[#FF4135]/20"
                      }`}
                  />
                  {errors.pricePerToken && (
                    <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
                      {errors.pricePerToken}
                    </p>
                  )}
                </div>

                {/* Date Selection Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Start Date */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="startDate"
                      className="text-base lg:text-lg font-semibold text-primary flex items-center gap-2"
                    >
                      {t("startDate")}
                      <span className="text-[#FF4135]">*</span>
                    </Label>
                    <div className="relative">
                      <DatePicker
                        value={formData.startDate}
                        onChange={(date) => handleInputChange("startDate", date)}
                        format="YYYY-MM-DD HH:mm"
                        plugins={[
                          <TimePicker key="time" position="bottom" />
                        ]}
                        render={(value, openCalendar) => (
                          <Input
                            value={value}
                            onClick={openCalendar}
                            readOnly
                            placeholder={t("startDatePlaceholder")}
                            className={`h-12 lg:h-14 text-base lg:text-lg rounded-xl border-2 cursor-pointer transition-all duration-200 ${errors.startDate
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : "border-gray-200 focus:border-[#FF4135] focus:ring-[#FF4135]/20"
                              }`}
                          />
                        )}
                      />
                    </div>
                    {errors.startDate && (
                      <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                        <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="endDate"
                      className="text-base lg:text-lg font-semibold text-primary flex items-center gap-2"
                    >
                      {t("endDate")}
                      <span className="text-[#FF4135]">*</span>
                    </Label>
                    <div className="relative">
                      <DatePicker
                        value={formData.endDate}
                        onChange={(date) => handleInputChange("endDate", date)}
                        format="YYYY-MM-DD HH:mm"
                        plugins={[
                          <TimePicker key="time" position="bottom" />
                        ]}
                        render={(value, openCalendar) => (
                          <Input
                            value={value}
                            onClick={openCalendar}
                            readOnly
                            placeholder={t("endDatePlaceholder")}
                            className={`h-12 lg:h-14 text-base lg:text-lg rounded-xl border-2 cursor-pointer transition-all duration-200 ${errors.endDate
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : "border-gray-200 focus:border-[#FF4135] focus:ring-[#FF4135]/20"
                              }`}
                          />
                        )}
                      />
                    </div>
                    {errors.endDate && (
                      <p className="text-sm text-red-500 flex items-center gap-2 mt-2">
                        <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">!</span>
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 lg:pt-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isPending || isConfirming}
                    className="w-full bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] hover:from-[#FF4135] hover:to-[#FF2D1B] text-white font-semibold text-base lg:text-lg h-12 lg:h-16 rounded-xl lg:rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {!isConnected ? (t("connectWalletAndCreate") || "Connect Wallet & Create Token") :
                      isSubmitting || isPending ? (t("submitting") || "Creating Token...") :
                        isConfirming ? (t("confirming") || "Confirming...") :
                          t("createToken")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreateDMTForm;
