"use client";

import React, { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LensProvider } from "@lens-protocol/react-web";
import { lensConfig, wagmiConfig } from "@/lib/lens";
import { WalletSync } from "@/components/WalletSync";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LensProvider config={lensConfig}>
          <WalletSync />
          {children}
        </LensProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
