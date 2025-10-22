"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useEthereumWallet } from "@/hooks/useEthereumWallet";
import { ConnectedWallet } from "@/types/wallet";

interface WalletContextType {
  // Ethereum wallet
  wallet: ConnectedWallet | null;
  connecting: boolean;
  error: string | null;
  connectMetaMask: () => Promise<void>;
  disconnect: () => void;
  getBalance: () => Promise<number | null>;
  signMessage: (message: string) => Promise<string>;
  isMetaMaskInstalled: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const {
    wallet,
    connecting,
    error,
    connectMetaMask,
    disconnect,
    getBalance,
    signMessage,
    isMetaMaskInstalled,
  } = useEthereumWallet();

  const value: WalletContextType = {
    wallet,
    connecting,
    error,
    connectMetaMask,
    disconnect,
    getBalance,
    signMessage,
    isMetaMaskInstalled,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
