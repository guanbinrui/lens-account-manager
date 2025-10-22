"use client";

import React from "react";
import { useLensLoginWithAccountManager } from "@/hooks/useLensLogin";
import { useAccount, useWalletClient } from "wagmi";

/**
 * Example component demonstrating how to use the new Lens Protocol authentication
 * with account manager support, following the pattern from your provided example.
 */
export const LensLoginExample: React.FC = () => {
  const { loginAsAccountManager, loginAsAccountOwner, isWalletConnected, walletAddress } = useLensLoginWithAccountManager();

  const handleLoginAsManager = async () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Example: Login as account manager for a specific account
      const accountAddress = "0x1234567890123456789012345678901234567890"; // Replace with actual account address
      const profileId = "0x01"; // Replace with actual profile ID if available
      const result = await loginAsAccountManager(accountAddress, profileId);
      console.log("Login as account manager result:", result);
    } catch (error) {
      console.error("Failed to login as account manager:", error);
    }
  };

  const handleLoginAsOwner = async () => {
    if (!isWalletConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Example: Login as account owner for a specific account
      const accountAddress = "0x1234567890123456789012345678901234567890"; // Replace with actual account address
      const profileId = "0x01"; // Replace with actual profile ID if available
      const result = await loginAsAccountOwner(accountAddress, profileId);
      console.log("Login as account owner result:", result);
    } catch (error) {
      console.error("Failed to login as account owner:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Lens Protocol Login Example</h2>
      
      <div className="space-y-4">
        {/* Wallet Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Wallet Status</h3>
          <p className="text-sm text-gray-600">
            Connected: {isWalletConnected ? "Yes" : "No"}
          </p>
          {walletAddress && (
            <p className="text-sm text-gray-600 font-mono">
              Address: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </p>
          )}
        </div>

        {/* Login Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleLoginAsManager}
            disabled={!isWalletConnected}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              !isWalletConnected
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Login as Account Manager
          </button>

          <button
            onClick={handleLoginAsOwner}
            disabled={!isWalletConnected}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              !isWalletConnected
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-600 text-white"
            }`}
          >
            Login as Account Owner
          </button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Connect your wallet using wagmi</li>
            <li>• Use the Lens Protocol hooks for authentication</li>
            <li>• Choose between account manager or account owner login</li>
            <li>• The hooks handle challenge generation and signing automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
