import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useSimulateContract, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { toast } from 'react-hot-toast';
import DimitoPreSaleAbi from '@/abi/DimitoPreSaleAbi.json';

const PRESALE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PRESALE_ADDRESS;

export function usePresalePurchase() {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [simulationArgs, setSimulationArgs] = useState(null);
  const publicClient = usePublicClient();

  // Write contract for purchase
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess, isError: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  // Simulate contract call to check if it will succeed
  const simulateTransaction = async (presaleId, amountWei, userAddress) => {
    try {
      const result = await publicClient.simulateContract({
        address: PRESALE_CONTRACT_ADDRESS,
        abi: DimitoPreSaleAbi,
        functionName: 'purchasePresale',
        args: [BigInt(presaleId), amountWei],
        account: userAddress,
      });

      return { success: true, result };
    } catch (error) {
      
      // Parse common revert reasons
      let userFriendlyMessage = 'Transaction will fail';
      
      if (error?.message?.includes('Presale not active')) {
        userFriendlyMessage = 'Presale is not currently active';
      } else if (error?.message?.includes('Insufficient allowance')) {
        userFriendlyMessage = 'Token allowance is insufficient. Please approve tokens first';
      } else if (error?.message?.includes('Exceeds remaining supply')) {
        userFriendlyMessage = 'Purchase amount exceeds remaining presale supply';
      } else if (error?.message?.includes('Minimum purchase')) {
        userFriendlyMessage = 'Purchase amount is below minimum required';
      } else if (error?.message?.includes('Maximum purchase')) {
        userFriendlyMessage = 'Purchase amount exceeds maximum allowed';
      } else if (error?.message?.includes('insufficient funds')) {
        userFriendlyMessage = 'Insufficient balance to complete purchase';
      } else if (error?.message?.includes('Presale ended')) {
        userFriendlyMessage = 'Presale has already ended';
      } else if (error?.message?.includes('Presale not started')) {
        userFriendlyMessage = 'Presale has not started yet';
      }

      return { 
        success: false, 
        error: error.message, 
        userMessage: userFriendlyMessage,
        rawError: error 
      };
    }
  };

  // Purchase function
  const purchasePresale = async (presaleId, paymentAmount, paymentTokenDecimals, userAddress) => {
    if (presaleId === null || presaleId === undefined || !paymentAmount || !paymentTokenDecimals) {
      toast.error('Missing purchase information');
      return false;
    }

    // Validate contract address
    if (!PRESALE_CONTRACT_ADDRESS) {
      toast.error('Presale contract address not configured. Please check NEXT_PUBLIC_PRESALE_ADDRESS environment variable.');
      return false;
    }

    try {
      setIsPurchasing(true);

      // Convert payment amount to wei using the payment token's decimals
      const amountWei = parseUnits(paymentAmount.toString(), paymentTokenDecimals);

      // Simulate transaction first to check if it will succeed
      if (userAddress) {
        const simulationResult = await simulateTransaction(presaleId, amountWei, userAddress);
        
        if (!simulationResult.success) {
          toast.error(simulationResult.userMessage);
          setIsPurchasing(false);
          return false;
        }
      }

      // Prepare contract call data
      const contractCallData = {
        address: PRESALE_CONTRACT_ADDRESS,
        abi: DimitoPreSaleAbi,
        functionName: 'purchasePresale',
        args: [BigInt(presaleId), amountWei],
      };

      // Call purchasePresale function
      await writeContract(contractCallData);

      return true;
    } catch (error) {
      console.error('Purchase error:', error);
      setIsPurchasing(false);

      // Handle specific error types
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user');
      } else if (error?.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas fees');
      } else if (error?.message?.includes('execution reverted')) {
        // Handle contract-specific errors
        if (error?.message?.includes('Presale not active')) {
          toast.error('Presale is not currently active');
        } else if (error?.message?.includes('Insufficient allowance')) {
          toast.error('Token allowance insufficient. Please approve again');
        } else if (error?.message?.includes('Exceeds remaining supply')) {
          toast.error('Purchase amount exceeds remaining supply');
        } else {
          toast.error('Transaction failed. Please try again');
        }
      } else if (error?.message?.includes('network')) {
        toast.error('Network error. Please check your connection');
      } else {
        toast.error('Failed to purchase presale tokens');
      }

      return false;
    }
  };

  // Reset state when transaction is confirmed or failed
  useEffect(() => {
    if ((isSuccess || receiptError) && isPurchasing) {
      setIsPurchasing(false);
    }
  }, [isSuccess, receiptError, isPurchasing]);

  // Reset state when write error occurs (user rejection, etc.)
  useEffect(() => {
    if (writeError && isPurchasing) {
      setIsPurchasing(false);
    }
  }, [writeError, isPurchasing]);

  return {
    purchasePresale,
    simulateTransaction, // Export simulation function for external use
    isPurchasing: isPending || isConfirming || isPurchasing,
    isConfirming,
    isSuccess,
    isError: receiptError,
    hash,
  };
}
