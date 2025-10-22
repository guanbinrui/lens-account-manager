import { useState, useCallback } from "react";
import {
  LensProfile,
  LensAuthState,
  AuthenticationChallenge,
  AuthenticationResult,
  AuthenticationTokens,
  ChallengeRequest,
  SignedAuthChallenge,
} from "@/types/lens";
import {
  lensRequest,
  CHALLENGE_QUERY,
  AUTHENTICATE_MUTATION,
} from "@/lib/lens";

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

export const useLensAuth = () => {
  const [authState, setAuthState] = useState<LensAuthState>({
    isAuthenticated: false,
    profile: null,
    tokens: null,
    loading: false,
    error: null,
  });

  const signInWithLens = useCallback(
    async (
      profile: LensProfile,
      walletAddress: string,
      signMessage: (message: string) => Promise<string>,
      isAccountManager: boolean,
    ) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        console.log(
          "Starting Lens authentication for profile:",
          profile.id,
          "with wallet:",
          walletAddress,
        );

        // Step 1: Get challenge using the new API format
        // Using the official Lens Protocol test app for mainnet
        const challengeRequest: ChallengeRequest = isAccountManager ? {
          accountManager: {
            account: profile.id,
            app: "0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE",
            manager: walletAddress,
          },
        } : {
          accountOwner: {
            account: profile.id, // Use the profile's account address
            app: "0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE", // Official Lens test app for mainnet
            owner: walletAddress, // The wallet owner
          },
        };

        console.log("Challenge request:", challengeRequest);
        const challengeResponse = await lensRequest(CHALLENGE_QUERY, {
          request: challengeRequest,
        });

        console.log("Challenge response:", challengeResponse);
        const challenge: AuthenticationChallenge = challengeResponse.challenge;

        // Step 2: Sign the challenge with wallet
        console.log("Signing challenge text:", challenge.text);
        const signature = await signMessage(challenge.text);
        console.log("Generated signature:", signature);

        // Step 3: Authenticate with signed challenge
        const authenticateRequest: SignedAuthChallenge = {
          id: challenge.id,
          signature,
        };

        console.log("Authentication request:", authenticateRequest);
        const authResponse = await lensRequest(AUTHENTICATE_MUTATION, {
          request: authenticateRequest,
        });

        console.log("Authentication response:", authResponse);
        const result: AuthenticationResult = authResponse.authenticate;

        // Check if authentication was successful
        if (result.__typename === "AuthenticationTokens") {
          const tokens = result as AuthenticationTokens;

          // Store tokens (in production, consider secure storage)
          localStorage.setItem("lens_access_token", tokens.accessToken);
          localStorage.setItem("lens_refresh_token", tokens.refreshToken);

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
              ? `Wrong signer: ${(result as any).reason}`
              : result.__typename === "ExpiredChallengeError"
                ? `Expired challenge: ${(result as any).reason}`
                : result.__typename === "ForbiddenError"
                  ? `Forbidden: ${(result as any).reason}`
                  : "Authentication failed";

          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Authentication failed";
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
    localStorage.removeItem("lens_access_token");
    localStorage.removeItem("lens_refresh_token");

    setAuthState({
      isAuthenticated: false,
      profile: null,
      tokens: null,
      loading: false,
      error: null,
    });
  }, []);

  const checkAuthStatus = useCallback(async () => {
    const accessToken = localStorage.getItem("lens_access_token");
    const refreshToken = localStorage.getItem("lens_refresh_token");

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
      console.error("Auth verification failed:", err);
    }

    return false;
  }, []);

  // Resume session from stored tokens
  const resumeSession = useCallback(async () => {
    const accessToken = localStorage.getItem("lens_access_token");
    const refreshToken = localStorage.getItem("lens_refresh_token");
    
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
      localStorage.removeItem("lens_access_token");
      localStorage.removeItem("lens_refresh_token");
    }
    
    return false;
  }, []);

  // Logout method to clear session and tokens
  const logout = useCallback(async () => {
    try {
      // Clear stored tokens
      localStorage.removeItem("lens_access_token");
      localStorage.removeItem("lens_refresh_token");
      
      // Reset auth state
      setAuthState({
        isAuthenticated: false,
        profile: null,
        tokens: null,
        loading: false,
        error: null,
      });
      
      console.log("Lens user logged out successfully");
      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      return false;
    }
  }, []);

  return {
    authState,
    signInWithLens,
    signOut,
    logout, // New logout method
    resumeSession, // New session resume method
    checkAuthStatus,
  };
};
