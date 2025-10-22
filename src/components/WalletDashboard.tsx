"use client";

import React from "react";
import { useWallet } from "@/context/WalletContext";
import { WalletButton } from "./WalletButton";
import { LensProfileList } from "./LensProfileList";
import { useLensProfiles } from "@/hooks/useLensProfiles";
import { useLensAuth } from "@/hooks/useLensAuth";

export const WalletDashboard: React.FC = () => {
  const {
    wallet,
    connecting,
    error,
    connectMetaMask,
    disconnect,
    getBalance,
    isMetaMaskInstalled,
  } = useWallet();

  // Lens hooks
  const {
    profiles,
    loading: profilesLoading,
    error: profilesError,
  } = useLensProfiles(wallet?.address || null);
  const { authState } = useLensAuth();

  const refreshBalance = async () => {
    await getBalance();
  };

  return (
    <div>

      {/* Wallet Connection Section */}
      <div className="mb-8">
        <WalletButton
          walletName="MetaMask"
          icon="/metamask-logo.svg"
          isInstalled={isMetaMaskInstalled}
          isConnecting={connecting}
          isConnected={!!wallet}
          onClick={wallet ? disconnect : connectMetaMask}
          address={wallet?.address}
          balance={wallet?.balance}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">Connection Error:</h3>
          <p className="text-red-600 text-sm">MetaMask: {error}</p>
        </div>
      )}

      {/* Lens Authentication Status */}
      {authState.isAuthenticated && authState.profile && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-green-800 font-semibold">
                Signed in to Lens Protocol
              </h3>
              <p className="text-green-600 text-sm">
                Connected as @{authState.profile.handle.localName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connected - Show Lens Profiles */}
      {wallet && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-green-800 mb-4">
              Connected Wallet
            </h2>

            <div className="bg-white p-4 rounded border mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">ETHEREUM</span>
                  <span className="ml-2 text-gray-600 font-mono text-sm">
                    {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {wallet.balance?.toFixed(4)} ETH
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={refreshBalance}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Refresh Balance
              </button>
              <button
                onClick={disconnect}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Lens Profiles Section */}
          <LensProfileList
            profiles={profiles}
            loading={profilesLoading}
            error={profilesError}
          />
        </div>
      )}

      {/* No Wallet Connected */}
      {!wallet && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No Wallet Connected
          </h2>
          <p className="text-gray-500 mb-4">
            Connect your MetaMask wallet to view your Lens profiles
          </p>
          <div className="text-sm text-gray-400">
            🌿 Lens Protocol integration enabled
          </div>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Connect your MetaMask wallet to discover and sign in to your Lens
          Protocol profiles.
        </p>
      </div>
    </div>
  );
};
