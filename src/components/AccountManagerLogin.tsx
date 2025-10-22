"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { useAccountManagerAuth } from "@/hooks/useAccountManagerAuth";
import { LensProfile } from "@/types/lens";

export const AccountManagerLogin: React.FC = () => {
  const {
    wallet,
    connecting,
    error: walletError,
    connectMetaMask,
    disconnect,
    signMessage,
    isMetaMaskInstalled,
  } = useWallet();

  const {
    authState,
    managedAccounts,
    loadingManagedAccounts,
    managedAccountsError,
    signInWithLensProtocol, // New recommended method
    signOut,
    fetchManagedAccounts,
    isWalletConnected,
  } = useAccountManagerAuth();

  const [isLoading, setIsLoading] = useState(false);

  // Fetch managed accounts when wallet is connected
  useEffect(() => {
    if (wallet?.address) {
      fetchManagedAccounts(wallet.address);
    }
  }, [wallet?.address, fetchManagedAccounts]);

  // New method using Lens Protocol hooks (recommended)
  const handleSignInWithLensProtocol = async (profile: LensProfile) => {
    if (!isWalletConnected) {
      console.error("Wallet not connected");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithLensProtocol(profile, true); // Always sign in as account manager
    } catch (error) {
      console.error("Lens Protocol sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Login with Account Manager
        </h2>
        <p className="text-gray-600">
          Connect your wallet to sign in as an account manager for Lens profiles
        </p>
      </div>

      {/* Wallet Connection Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Connect Your Wallet
        </h3>
        
        <div className="flex items-center justify-center">
          <button
            onClick={wallet ? disconnect : connectMetaMask}
            disabled={connecting || !isMetaMaskInstalled}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              wallet
                ? "bg-red-500 hover:bg-red-600 text-white"
                : connecting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : !isMetaMaskInstalled
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {connecting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </div>
            ) : wallet ? (
              "Disconnect Wallet"
            ) : !isMetaMaskInstalled ? (
              "MetaMask Not Installed"
            ) : (
              "Connect MetaMask"
            )}
          </button>
        </div>

        {wallet && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-green-800">Connected</span>
                <span className="ml-2 text-green-600 font-mono text-sm">
                  {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-800">
                  {wallet.balance?.toFixed(4)} ETH
                </div>
              </div>
            </div>
          </div>
        )}

        {walletError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{walletError}</p>
          </div>
        )}
      </div>

      {/* Account Manager Authentication Status */}
      {authState.isAuthenticated && authState.profile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
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
            <div className="flex-1">
              <h3 className="text-green-800 font-semibold">
                Signed in as Account Manager
              </h3>
              <p className="text-green-600 text-sm">
                Managing @{authState.profile.handle.localName}
              </p>
            </div>
            <button
              onClick={signOut}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Managed Accounts Section */}
      {wallet && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Managed Accounts ({managedAccounts.length})
          </h3>

          {loadingManagedAccounts ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading managed accounts...</span>
            </div>
          ) : managedAccountsError ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">⚠️ Error loading accounts</div>
              <p className="text-gray-600 text-sm">{managedAccountsError}</p>
            </div>
          ) : managedAccounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">👥</div>
              <p className="text-gray-600">
                No managed accounts found for this wallet.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                This wallet is not an account manager for any Lens profiles.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {managedAccounts.map((profile) => (
                <div
                  key={profile.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md"
                >
                  <div className="flex items-start space-x-4">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                      {profile.metadata?.picture?.optimized?.uri ? (
                        <img
                          src={profile.metadata.picture.optimized.uri}
                          alt={
                            profile.metadata?.displayName || profile.handle.localName
                          }
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                          {(profile.metadata?.displayName || profile.handle.localName)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-base font-semibold text-gray-900 truncate">
                          {profile.metadata?.displayName || profile.handle.localName}
                        </h4>
                        <span className="text-sm text-gray-500">
                          @{profile.handle.localName}
                        </span>
                      </div>

                      {profile.metadata?.bio && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {profile.metadata.bio}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatNumber(profile.stats.followers)} followers</span>
                        <span>{formatNumber(profile.stats.following)} following</span>
                        <span>{formatNumber(profile.stats.posts)} posts</span>
                        <span>Created {formatDate(profile.createdAt)}</span>
                      </div>

                      {/* Account Manager Information */}
                      {profile.isManagedAccount && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">
                            <span className="font-medium">Account Manager:</span>{" "}
                            <span className="font-mono text-gray-700">
                              {profile.accountManagerAddress?.slice(0, 6)}...
                              {profile.accountManagerAddress?.slice(-4)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                      {/* Sign In Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSignInWithLensProtocol(profile);
                        }}
                        disabled={isLoading || authState.loading || !isWalletConnected}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          isLoading || authState.loading || !isWalletConnected
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : authState.isAuthenticated &&
                                authState.profile?.id === profile.id
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                      >
                        {isLoading || authState.loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500 mr-1"></div>
                            Signing in...
                          </div>
                        ) : authState.isAuthenticated &&
                          authState.profile?.id === profile.id ? (
                          "✓ Signed In"
                        ) : (
                          "Sign In as Manager"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Wallet Connected */}
      {!wallet && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-500 mb-4">
            Connect your MetaMask wallet to view managed accounts
          </p>
          <div className="text-sm text-gray-400">
            🌿 Account Manager authentication enabled
          </div>
        </div>
      )}

      {/* Error Display */}
      {authState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Authentication Error:</h3>
          <p className="text-red-600 text-sm">{authState.error}</p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Connect your wallet to sign in as an account manager for Lens Protocol profiles.
        </p>
      </div>
    </div>
  );
};
