"use client";

import React, { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useWallet } from "@/context/WalletContext";

/**
 * Component that syncs wagmi wallet state with your custom wallet context
 * This ensures both systems stay in sync
 */
export const WalletSync: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { wallet, connectMetaMask, disconnect: customDisconnect } = useWallet();

  // Sync wagmi disconnect with custom wallet context
  useEffect(() => {
    if (!isConnected && wallet) {
      customDisconnect();
    }
  }, [isConnected, wallet, customDisconnect]);

  // Sync custom wallet connect with wagmi
  useEffect(() => {
    if (wallet && !isConnected && connectors.length > 0) {
      // If custom wallet is connected but wagmi isn't, connect wagmi
      connect({ connector: connectors[0] });
    }
  }, [wallet, isConnected, connect, connectors]);

  return null; // This component doesn't render anything
};
