import { useCallback } from "react";
import { useLogin, LoginRequest } from "@lens-protocol/react";
import { useAccount, useWalletClient } from "wagmi";
import { EvmAddress } from "@lens-protocol/shared-kernel";
import { ProfileId } from "@lens-protocol/domain/entities";

export function useLensLogin() {
  const { address } = useAccount();
  const { data: signer } = useWalletClient();
  const { execute: login } = useLogin();

  return useCallback(
    async (accountAddress: string, profileId?: string) => {
      if (!signer || !address) {
        console.warn("No wallet signer or address available");
        return Promise.reject(new Error("No wallet signer or address available"));
      }

      const loginRequest: LoginRequest = {
        address: address as EvmAddress,
        ...(profileId && { profileId: profileId as ProfileId }), // ProfileId type from lens protocol
      };

      console.log("Lens login request:", loginRequest);

      try {
        const result = await login(loginRequest);
        
        if (result.isFailure()) {
          console.error("Login failed:", result.error);
          throw new Error(result.error.message);
        }

        console.log("Login successful:", result.value);
        return result.value;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    [signer, address, login]
  );
}

// Extended hook that provides additional functionality for account manager authentication
export function useLensLoginWithAccountManager() {
  const lensLogin = useLensLogin();
  const { address } = useAccount();
  const { data: signer } = useWalletClient();

  const loginAsAccountManager = useCallback(
    async (accountAddress: string, profileId?: string) => {
      if (!signer || !address) {
        throw new Error("Wallet not connected");
      }

      // For account manager login, we use the wallet address as the signer
      // and the account address as the profile to manage
      return lensLogin(accountAddress, profileId);
    },
    [lensLogin, signer, address]
  );

  const loginAsAccountOwner = useCallback(
    async (accountAddress: string, profileId?: string) => {
      if (!signer || !address) {
        throw new Error("Wallet not connected");
      }

      // For account owner login, we use the wallet address as both signer and profile owner
      return lensLogin(accountAddress, profileId);
    },
    [lensLogin, signer, address]
  );

  return {
    loginAsAccountManager,
    loginAsAccountOwner,
    lensLogin,
    isWalletConnected: !!signer && !!address,
    walletAddress: address,
  };
}
