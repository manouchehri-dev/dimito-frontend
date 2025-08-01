"use client";
import { Button } from "../ui/button";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
export default function CustomConnectButton({
  className,
  label = "Connect Wallet",
}) {
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { address, isConnected } = useAccount();

  const handleClick = () => {
    if (isConnected) {
      openAccountModal?.();
    } else {
      openConnectModal?.();
    }
  };

  return (
    <Button className={`${className}`} onClick={handleClick}>
      {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : label}
    </Button>
  );
}
