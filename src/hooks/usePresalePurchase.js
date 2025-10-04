import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useSimulateContract, usePublicClient } from 'wagmi';
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
      console.log('🔍 Simulating transaction before execution...');
      
      const result = await publicClient.simulateContract({
        address: PRESALE_CONTRACT_ADDRESS,
        abi: DimitoPreSaleAbi,
        functionName: 'purchasePresale',
        args: [BigInt(presaleId), amountWei],
        account: userAddress,
      });

      console.log('✅ Simulation successful:', result);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Simulation failed:', error);
      
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
    // Log function call parameters
    console.log('📞 purchasePresale called with:', {
      presaleId,
      presaleIdType: typeof presaleId,
      paymentAmount,
      paymentAmountType: typeof paymentAmount,
      paymentTokenDecimals,
      paymentTokenDecimalsType: typeof paymentTokenDecimals,
      timestamp: new Date().toISOString()
    });

    if (presaleId === null || presaleId === undefined || !paymentAmount || !paymentTokenDecimals) {
      console.error('❌ Missing purchase information:', {
        hasPresaleId: presaleId !== null && presaleId !== undefined,
        hasPaymentAmount: !!paymentAmount,
        hasPaymentTokenDecimals: !!paymentTokenDecimals
      });
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
        console.log('🔍 Running pre-transaction simulation...');
        const simulationResult = await simulateTransaction(presaleId, amountWei, userAddress);
        
        if (!simulationResult.success) {
          console.error('❌ Transaction simulation failed:', simulationResult);
          toast.error(simulationResult.userMessage);
          setIsPurchasing(false);
          return false;
        }
        
        console.log('✅ Simulation passed, proceeding with transaction');
      } else {
        console.warn('⚠️ No user address provided, skipping simulation');
      }

      // Prepare contract call data
      const contractCallData = {
        address: PRESALE_CONTRACT_ADDRESS,
        abi: DimitoPreSaleAbi,
        functionName: 'purchasePresale',
        args: [BigInt(presaleId), amountWei],
      };

      // Log everything being sent to writeContract
      console.log('🚀 writeContract call data:', {
        contractAddress: PRESALE_CONTRACT_ADDRESS,
        functionName: 'purchasePresale',
        args: {
          presaleId: presaleId,
          presaleIdBigInt: BigInt(presaleId),
          paymentAmount: paymentAmount,
          paymentTokenDecimals: paymentTokenDecimals,
          amountWei: amountWei.toString(),
          amountWeiFormatted: `${amountWei.toString()} wei`,
        },
        abiLength: DimitoPreSaleAbi.length,
        fullContractCallData: contractCallData
      });

      // Call purchasePresale function
      const result = await writeContract(contractCallData);
      
      console.log('✅ writeContract result:', {
        result,
        resultType: typeof result,
        timestamp: new Date().toISOString()
      });

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

  // Log transaction hash when available
  useEffect(() => {
    if (hash) {
      console.log('📝 Transaction hash received:', {
        hash,
        bscscanUrl: `https://bscscan.com/tx/${hash}`,
        timestamp: new Date().toISOString()
      });
    }
  }, [hash]);

  // Reset state when transaction is confirmed or failed
  useEffect(() => {
    if ((isSuccess || receiptError) && isPurchasing) {
      console.log('🏁 Transaction completed:', {
        isSuccess,
        receiptError,
        hash,
        timestamp: new Date().toISOString()
      });
      setIsPurchasing(false);
    }
  }, [isSuccess, receiptError, isPurchasing, hash]);

  // Reset state when write error occurs (user rejection, etc.)
  useEffect(() => {
    if (writeError && isPurchasing) {
      console.log('❌ Write error occurred:', {
        writeError,
        errorMessage: writeError?.message,
        errorCode: writeError?.code,
        timestamp: new Date().toISOString()
      });
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
