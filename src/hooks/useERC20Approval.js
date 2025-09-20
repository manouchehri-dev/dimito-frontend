import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'react-hot-toast';

// Standard ERC20 ABI for approve and allowance functions
const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export function useERC20Approval(tokenAddress, spenderAddress) {
  const { address: userAddress } = useAccount();
  const [isApproving, setIsApproving] = useState(false);

  // Read current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: userAddress && spenderAddress ? [userAddress, spenderAddress] : undefined,
    enabled: !!userAddress && !!spenderAddress && !!tokenAddress,
  });

  // Read token decimals
  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    enabled: !!tokenAddress,
  });

  // Write contract for approval
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess, isError: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if approval is needed
  const needsApproval = (amount) => {
    if (!allowance || !decimals || !amount) return true;
    
    try {
      const amountWei = parseUnits(amount.toString(), decimals);
      return allowance < amountWei;
    } catch (error) {
      console.error('Error checking approval:', error);
      return true;
    }
  };

  // Approve function
  const approve = async (amount) => {
    if (!tokenAddress || !spenderAddress || !decimals) {
      toast.error('Missing contract information');
      return false;
    }

    try {
      setIsApproving(true);
      
      // Convert amount to wei
      const amountWei = parseUnits(amount.toString(), decimals);
      
      // Call approve function
      await writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, amountWei],
      });

      return true;
    } catch (error) {
      console.error('Approval error:', error);
      setIsApproving(false);
      
      // Handle specific error types
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user');
      } else if (error?.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas fees');
      } else if (error?.message?.includes('network')) {
        toast.error('Network error. Please check your connection');
      } else {
        toast.error('Failed to approve token spending');
      }
      
      return false;
    }
  };

  // Reset state when transaction is confirmed or failed
  useEffect(() => {
    if (isSuccess && isApproving) {
      setIsApproving(false);
      refetchAllowance();
    }
  }, [isSuccess, isApproving, refetchAllowance]);

  // Reset state when write error occurs (user rejection, etc.)
  useEffect(() => {
    if (writeError && isApproving) {
      setIsApproving(false);
    }
  }, [writeError, isApproving]);

  // Reset state when receipt error occurs
  useEffect(() => {
    if (receiptError && isApproving) {
      setIsApproving(false);
    }
  }, [receiptError, isApproving]);

  return {
    allowance,
    decimals,
    needsApproval,
    approve,
    isApproving: isPending || isConfirming || isApproving,
    isConfirming,
    isSuccess,
    refetchAllowance,
  };
}
