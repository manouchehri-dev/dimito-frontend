import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { toast } from 'react-hot-toast';
import DimitoPreSaleAbi from '@/abi/DimitoPreSaleAbi.json';

const PRESALE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PRESALE_ADDRESS;

export function usePresalePurchase() {
  // Debug environment variables
  useEffect(() => {
    console.log('usePresalePurchase - Contract address check:', {
      PRESALE_CONTRACT_ADDRESS,
      hasAddress: !!PRESALE_CONTRACT_ADDRESS
    });
  }, []);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Write contract for purchase
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess, isError: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  // Purchase function
  const purchasePresale = async (presaleId, paymentAmount, paymentTokenDecimals) => {
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

      // Call purchasePresale function
      await writeContract({
        address: PRESALE_CONTRACT_ADDRESS,
        abi: DimitoPreSaleAbi,
        functionName: 'purchasePresale',
        args: [BigInt(presaleId), amountWei],
      }); 12

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
    isPurchasing: isPending || isConfirming || isPurchasing,
    isConfirming,
    isSuccess,
    isError: receiptError,
    hash,
  };
}
