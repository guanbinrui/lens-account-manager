'use client';

import React from 'react';
import { useWallet } from '@/context/WalletContext';
import { WalletButton } from './WalletButton';

export const WalletDashboard: React.FC = () => {
  const {
    wallet,
    connecting,
    error,
    connectMetaMask,
    disconnect,
    getBalance,
    isMetaMaskInstalled
  } = useWallet();

  const refreshBalance = async () => {
    await getBalance();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        MetaMask Wallet Connector
      </h1>

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

      {wallet && (
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
      )}

      {!wallet && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No Wallet Connected
          </h2>
          <p className="text-gray-500">
            Connect your MetaMask wallet to get started
          </p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          This demo supports MetaMask wallet for Ethereum.
          Make sure you have MetaMask installed in your browser.
        </p>
      </div>
    </div>
  );
};