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
  WrongSignerError,
  ExpiredChallengeError,
  ForbiddenError,
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
  const [managedAccountsError, setManagedAccountsError] = useState<string | null>(null);

  // Use the new Lens login hook
  const { loginAsAccountManager, loginAsAccountOwner, isWalletConnected, walletAddress } = useLensLoginWithAccountManager();

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
      const managedItems = data.value?.items?.filter(
        (item: AccountManaged | AccountOwned) => item.__typename === "AccountManaged"
      ) as AccountManaged[] || [];

      const convertedProfiles = managedItems.map((item) =>
        convertAccountManagedToProfile(item, managerAddress)
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
          err instanceof Error ? err.message : "Lens Protocol authentication failed";
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        console.error("Lens Protocol authentication error:", err);
        return false;
      }
    },
    [isWalletConnected, walletAddress, loginAsAccountManager, loginAsAccountOwner],
  );

  // Legacy method for backward compatibility
  // Resume session from stored tokens
  const resumeSession = useCallback(async () => {
    const accessToken = localStorage.getItem("lens_manager_access_token");
    const refreshToken = localStorage.getItem("lens_manager_refresh_token");
    
    if (!accessToken || !refreshToken) {
      return false;
    }

    try {
      // Verify the session is still valid by making a test request
      const verifyResponse = await lensRequest(VERIFY_QUERY, {});
      
      if (verifyResponse.me?.loggedInAs?.address) {
        setAuthState({
          isAuthenticated: true,
          profile: null, // We don't store the full profile in localStorage
          tokens: {
            accessToken,
            refreshToken,
          },
          loading: false,
          error: null,
        });
        return true;
      }
    } catch (error) {
      console.error("Failed to resume session:", error);
      // Clear invalid tokens
      localStorage.removeItem("lens_manager_access_token");
      localStorage.removeItem("lens_manager_refresh_token");
    }
    
    return false;
  }, []);

  const signInAsAccountManager = useCallback(
    async (
      profile: LensProfile,
      managerAddress: string,
      signMessage: (message: string) => Promise<string>,
    ) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        console.log(
          "Starting account manager authentication for profile:",
          profile.id,
          "with manager wallet:",
          managerAddress,
        );

        // Step 1: Get challenge using the account manager authentication format
        // Using the official Lens Protocol test app for mainnet
        const challengeRequest: ChallengeRequest = {
          accountManager: {
            account: profile.id, // The account being managed
            app: "0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE", // Official Lens test app for mainnet
            manager: managerAddress, // The account manager's wallet address
          },
        };

        console.log("Account manager challenge request:", challengeRequest);
        const challengeResponse = await lensRequest(CHALLENGE_QUERY, {
          request: challengeRequest,
        });

        console.log("Account manager challenge response:", challengeResponse);
        const challenge: AuthenticationChallenge = challengeResponse.challenge;

        // Step 2: Sign the challenge with the manager's wallet
        console.log("Signing challenge text:", challenge.text);
        const signature = await signMessage(challenge.text);
        console.log("Generated signature:", signature);

        // Step 3: Authenticate with signed challenge
        const authenticateRequest: SignedAuthChallenge = {
          id: challenge.id,
          signature,
        };

        console.log("Account manager authentication request:", authenticateRequest);
        const authResponse = await lensRequest(AUTHENTICATE_MUTATION, {
          request: authenticateRequest,
        });

        console.log("Account manager authentication response:", authResponse);
        const result: AuthenticationResult = authResponse.authenticate;

        // Check if authentication was successful
        if (result.__typename === "AuthenticationTokens") {
          const tokens = result as AuthenticationTokens;

          // Store tokens (in production, consider secure storage)
          localStorage.setItem("lens_manager_access_token", tokens.accessToken);
          localStorage.setItem("lens_manager_refresh_token", tokens.refreshToken);

          setAuthState({
            isAuthenticated: true,
            profile,
            tokens: {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            },
            loading: false,
            error: null,
          });

          return true;
        } else {
          // Handle authentication errors
          const errorMessage =
            result.__typename === "WrongSignerError"
              ? `Wrong signer: ${(result as WrongSignerError).reason}`
              : result.__typename === "ExpiredChallengeError"
                ? `Expired challenge: ${(result as ExpiredChallengeError).reason}`
                : result.__typename === "ForbiddenError"
                  ? `Forbidden: ${(result as ForbiddenError).reason}`
                  : "Account manager authentication failed";

          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Account manager authentication failed";
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return false;
      }
    },
    [],
  );

  const signOut = useCallback(() => {
    localStorage.removeItem("lens_manager_access_token");
    localStorage.removeItem("lens_manager_refresh_token");

    setAuthState({
      isAuthenticated: false,
      profile: null,
      tokens: null,
      loading: false,
      error: null,
    });
  }, []);

  const checkAuthStatus = useCallback(async () => {
    const accessToken = localStorage.getItem("lens_manager_access_token");
    const refreshToken = localStorage.getItem("lens_manager_refresh_token");

    if (!accessToken || !refreshToken) {
      return false;
    }

    try {
      // Verify the token is still valid
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await fetch("https://api.lens.xyz/graphql", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: VERIFY_QUERY,
        }),
      });

      const result = await response.json();

      if (result.data?.me?.loggedInAs) {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          tokens: { accessToken, refreshToken },
        }));
        return true;
      }
    } catch (err) {
      console.error("Account manager auth verification failed:", err);
    }

    return false;
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
    resumeSession, // New session resume method
    checkAuthStatus,
    fetchManagedAccounts,
    isWalletConnected,
    walletAddress,
  };
};
