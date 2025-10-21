'use client';

import React from 'react';

interface WalletButtonProps {
  walletName: string;
  icon: string;
  isInstalled: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  onClick: () => void;
  address?: string;
  balance?: number;
}

export const WalletButton: React.FC<WalletButtonProps> = ({
  walletName,
  icon,
  isInstalled,
  isConnecting,
  isConnected,
  onClick,
  address,
  balance
}) => {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: number) => {
    return bal.toFixed(4);
  };

  const getButtonText = () => {
    if (!isInstalled) return `Install ${walletName}`;
    if (isConnecting) return 'Connecting...';
    if (isConnected) return `Connected to ${walletName}`;
    return `Connect ${walletName}`;
  };

  const getButtonStyle = () => {
    if (!isInstalled) return 'bg-gray-400 cursor-not-allowed';
    if (isConnecting) return 'bg-blue-400 cursor-wait';
    if (isConnected) return 'bg-green-500 hover:bg-green-600';
    return 'bg-blue-500 hover:bg-blue-600';
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center space-x-3 mb-3">
        <img src={icon} alt={walletName} className="w-8 h-8" />
        <span className="font-semibold text-gray-800">{walletName}</span>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
          ETHEREUM
        </span>
      </div>
      
      <button
        onClick={onClick}
        disabled={!isInstalled || isConnecting}
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${getButtonStyle()}`}
      >
        {getButtonText()}
      </button>

      {isConnected && address && (
        <div className="mt-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Address:</span>
            <span className="font-mono">{formatAddress(address)}</span>
          </div>
          {balance !== undefined && (
            <div className="flex justify-between mt-1">
              <span>Balance:</span>
              <span className="font-mono">
                {formatBalance(balance)} ETH
              </span>
            </div>
          )}
        </div>
      )}

      {!isInstalled && (
        <div className="mt-2 text-xs text-gray-500">
          Please install {walletName} to continue
        </div>
      )}
    </div>
  );
};