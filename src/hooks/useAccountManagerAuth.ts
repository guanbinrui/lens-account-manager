import { useState, useCallback } from "react";
import {
  LensProfile,
  LensAuthState,
  AuthenticationChallenge,
  AuthenticationResult,
  AuthenticationTokens,
  ChallengeRequest,
  SignedAuthChallenge,
  AccountManaged,
  AccountOwned,
} from "@/types/lens";
import {
  lensRequest,
  CHALLENGE_QUERY,
  AUTHENTICATE_MUTATION,
  ACCOUNTS_AVAILABLE_QUERY,
} from "@/lib/lens";
import { useLensLoginWithAccountManager } from "./useLensLogin";

const VERIFY_QUERY = `
  query Verify {
    me {
      loggedInAs {
        address
      }
      isSignless
      isSponsored
    }
  }
`;

export const useAccountManagerAuth = () => {
  const [authState, setAuthState] = useState<LensAuthState>({
    isAuthenticated: false,
    profile: null,
    tokens: null,
    loading: false,
    error: null,
  });

  const [managedAccounts, setManagedAccounts] = useState<LensProfile[]>([]);
  const [loadingManagedAccounts, setLoadingManagedAccounts] = useState(false);
  const [managedAccountsError, setManagedAccountsError] = useState<
    string | null
  >(null);

  // Use the new Lens login hook
  const {
    loginAsAccountManager,
    loginAsAccountOwner,
    isWalletConnected,
    walletAddress,
  } = useLensLoginWithAccountManager();

  // Helper function to convert AccountManaged to LensProfile format
  const convertAccountManagedToProfile = (
    accountManaged: AccountManaged,
    managerAddress: string,
  ): LensProfile => {
    const account = accountManaged.account;

    return {
      id: account.address,
      handle: {
        fullHandle: account.username?.value || "",
        localName: account.username?.localName || "",
      },
      metadata: {
        displayName: account.metadata?.name,
        bio: account.metadata?.bio,
        picture: account.metadata?.picture
          ? {
              optimized: {
                uri: account.metadata.picture,
                width: 200,
                height: 200,
              },
            }
          : undefined,
        coverPicture: account.metadata?.coverPicture
          ? {
              optimized: {
                uri: account.metadata.coverPicture,
                width: 800,
                height: 200,
              },
            }
          : undefined,
        attributes: account.metadata?.attributes?.map((attr) => ({
          key: attr.key,
          value: attr.value,
        })),
      },
      stats: {
        followers: 0, // Not available in this API
        following: 0, // Not available in this API
        posts: 0, // Not available in this API
      },
      operations: {
        isFollowedByMe: {
          value: account.operations?.isFollowedByMe || false,
        },
        isFollowingMe: {
          value: account.operations?.isFollowingMe || false,
        },
        canFollow: typeof account.operations?.canFollow === "object",
        canUnfollow: typeof account.operations?.canUnfollow === "object",
        canBlock: account.operations?.canBlock || false,
        canUnblock: account.operations?.canUnblock || false,
        canReport: account.operations?.hasReported || false,
      },
      createdAt: account.createdAt,
      accountManagerPermissions: accountManaged.permissions,
      isManagedAccount: true,
      accountManagerAddress: managerAddress,
    };
  };

  const fetchManagedAccounts = useCallback(async (managerAddress: string) => {
    if (!managerAddress) {
      setManagedAccounts([]);
      return;
    }

    setLoadingManagedAccounts(true);
    setManagedAccountsError(null);

    try {
      console.log("Fetching managed accounts for manager:", managerAddress);

      const data = await lensRequest(ACCOUNTS_AVAILABLE_QUERY, {
        request: {
          hiddenFilter: "ALL",
          includeOwned: false, // Only managed accounts
          managedBy: managerAddress,
          pageSize: "FIFTY",
        },
      });

      console.log("Managed accounts response:", data);

      // Filter only AccountManaged items and convert to LensProfile format
      const managedItems =
        (data.value?.items?.filter(
          (item: AccountManaged | AccountOwned) =>
            item.__typename === "AccountManaged",
        ) as AccountManaged[]) || [];

      const convertedProfiles = managedItems.map((item) =>
        convertAccountManagedToProfile(item, managerAddress),
      );

      setManagedAccounts(convertedProfiles);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch managed accounts";
      setManagedAccountsError(errorMessage);
      setManagedAccounts([]);
      console.error("Error fetching managed accounts:", err);
    } finally {
      setLoadingManagedAccounts(false);
    }
  }, []);

  // New method using Lens Protocol hooks (recommended approach)
  const signInWithLensProtocol = useCallback(
    async (profile: LensProfile, isAccountManager: boolean = false) => {
      if (!isWalletConnected) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: "Wallet not connected",
        }));
        return false;
      }

      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        console.log(
          `Starting ${isAccountManager ? "account manager" : "account owner"} authentication for profile:`,
          profile.id,
          "with wallet:",
          walletAddress,
        );

        const result = isAccountManager
          ? await loginAsAccountManager(profile.id)
          : await loginAsAccountOwner(profile.id);

        console.log("Lens Protocol authentication result:", result);

        // The Lens Protocol hooks handle token storage internally
        // We need to update our local state to reflect the authentication
        setAuthState({
          isAuthenticated: true,
          profile,
          tokens: {
            accessToken: "managed_by_lens_protocol", // Tokens are managed by Lens Protocol
            refreshToken: "managed_by_lens_protocol",
          },
          loading: false,
          error: null,
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Lens Protocol authentication failed";
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        console.error("Lens Protocol authentication error:", err);
        return false;
      }
    },
    [
      isWalletConnected,
      walletAddress,
      loginAsAccountManager,
      loginAsAccountOwner,
    ],
  );

  const signOut = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      profile: null,
      tokens: null,
      loading: false,
      error: null,
    });
  }, []);

  // Logout method to clear session and tokens
  const logout = useCallback(async () => {
    try {
      // Clear stored tokens
      localStorage.removeItem("lens_manager_access_token");
      localStorage.removeItem("lens_manager_refresh_token");

      // Reset auth state
      setAuthState({
        isAuthenticated: false,
        profile: null,
        tokens: null,
        loading: false,
        error: null,
      });

      console.log("Account manager logged out successfully");
      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      return false;
    }
  }, []);

  return {
    authState,
    managedAccounts,
    loadingManagedAccounts,
    managedAccountsError,
    signInWithLensProtocol, // New recommended method
    signOut,
    logout, // New logout method
    fetchManagedAccounts,
    isWalletConnected,
    walletAddress,
  };
};
