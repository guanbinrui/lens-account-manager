import { useCallback } from "react";
import { useEthereumWallet } from "./useEthereumWallet";
import { useLensAuth } from "./useLensAuth";
import { LensProfile } from "@/types/lens";

export function useLensLogin(isAccountManager = false) {
  const { wallet } = useEthereumWallet();
  const { signInWithLens } = useLensAuth();
  
  const address = wallet?.address;
  
  return useCallback(
    async (accountAddress: string, profileId?: string) => {
      if (!wallet || !address) {
        console.warn("No wallet or address available");
        return Promise.reject(new Error("No wallet or address available"));
      }

      // Create a mock profile for the authentication
      const mockProfile: LensProfile = {
        id: accountAddress,
        handle: {
          fullHandle: profileId || "",
          localName: profileId || "",
        },
        metadata: {
          displayName: `Account ${accountAddress.slice(0, 6)}...`,
          bio: "",
        },
        stats: {
          followers: 0,
          following: 0,
          posts: 0,
        },
        operations: {
          isFollowedByMe: { value: false },
          isFollowingMe: { value: false },
          canFollow: false,
          canUnfollow: false,
          canBlock: false,
          canUnblock: false,
          canReport: false,
        },
        createdAt: new Date().toISOString(),
        isManagedAccount: false,
      };

      console.log("Lens login request:", { accountAddress, profileId, address });

      try {
        const result = await signInWithLens(mockProfile, address, async (message: string) => {
          if (!wallet?.provider) {
            throw new Error("Wallet provider not available");
          }
          const signer = await wallet.provider.getSigner();
          return await signer.signMessage(message);
        }, isAccountManager);
        
        if (result) {
          console.log("Login successful");
          return { success: true, profile: mockProfile };
        } else {
          throw new Error("Authentication failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    [wallet, address, signInWithLens]
  );
}

// Extended hook that provides additional functionality for account manager authentication
export function useLensLoginWithAccountManager() {
  const lensLogin = useLensLogin(true);
  const { wallet } = useEthereumWallet();
  const address = wallet?.address;

  const loginAsAccountManager = useCallback(
    async (accountAddress: string, profileId?: string) => {
      if (!wallet || !address) {
        throw new Error("Wallet not connected");
      }

      // For account manager login, we use the wallet address as the signer
      // and the account address as the profile to manage
      return lensLogin(accountAddress, profileId);
    },
    [lensLogin, wallet, address]
  );

  const loginAsAccountOwner = useCallback(
    async (accountAddress: string, profileId?: string) => {
      if (!wallet || !address) {
        throw new Error("Wallet not connected");
      }

      // For account owner login, we use the wallet address as both signer and profile owner
      return lensLogin(accountAddress, profileId);
    },
    [lensLogin, wallet, address]
  );

  return {
    loginAsAccountManager,
    loginAsAccountOwner,
    lensLogin,
    isWalletConnected: !!wallet && !!address,
    walletAddress: address,
  };
}
