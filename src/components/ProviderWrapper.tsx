"use client";

import { WalletProvider } from "@/context/WalletContext";
import { LensProvider } from "@lens-protocol/react-web";
import { lensConfig } from "@/lib/lens";

interface ProviderWrapperProps {
  children: React.ReactNode;
}

export function ProviderWrapper({ children }: ProviderWrapperProps) {
  return (
    <LensProvider config={lensConfig}>
      <WalletProvider>{children}</WalletProvider>
    </LensProvider>
  );
}
