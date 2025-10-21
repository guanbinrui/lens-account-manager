import { useState, useCallback } from 'react';
import { LensProfile, LensAuthState, LensAuthChallenge, LensAuthTokens } from '@/types/lens';
import { lensRequest } from '@/lib/lens';

const CHALLENGE_QUERY = `
  query Challenge($address: EthereumAddress!) {
    challenge(request: { signedBy: $address }) {
      id
      text
    }
  }
`;

const AUTHENTICATE_MUTATION = `
  mutation Authenticate($challengeId: ChallengeId!, $signature: Signature!) {
    authenticate(request: { id: $challengeId, signature: $signature }) {
      accessToken
      refreshToken
    }
  }
`;

const VERIFY_QUERY = `
  query Verify {
    verify {
      ... on AuthenticationResult {
        accessToken
        refreshToken
      }
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

  const signInWithLens = useCallback(async (
    profile: LensProfile,
    walletAddress: string,
    signMessage: (message: string) => Promise<string>
  ) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Step 1: Get challenge
      const challengeResponse = await lensRequest(CHALLENGE_QUERY, {
        address: walletAddress,
      });

      const challenge: LensAuthChallenge = challengeResponse.challenge;

      // Step 2: Sign the challenge with wallet
      const signature = await signMessage(challenge.text);

      // Step 3: Authenticate with signed challenge
      const authResponse = await lensRequest(AUTHENTICATE_MUTATION, {
        challengeId: challenge.id,
        signature,
      });

      const tokens: LensAuthTokens = authResponse.authenticate;

      // Store tokens (in production, consider secure storage)
      localStorage.setItem('lens_access_token', tokens.accessToken);
      localStorage.setItem('lens_refresh_token', tokens.refreshToken);

      setAuthState({
        isAuthenticated: true,
        profile,
        tokens,
        loading: false,
        error: null,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('lens_access_token');
    localStorage.removeItem('lens_refresh_token');
    
    setAuthState({
      isAuthenticated: false,
      profile: null,
      tokens: null,
      loading: false,
      error: null,
    });
  }, []);

  const checkAuthStatus = useCallback(async () => {
    const accessToken = localStorage.getItem('lens_access_token');
    const refreshToken = localStorage.getItem('lens_refresh_token');

    if (!accessToken || !refreshToken) {
      return false;
    }

    try {
      // Verify the token is still valid
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      };

      const response = await fetch('https://api.lens.xyz/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: VERIFY_QUERY,
        }),
      });

      const result = await response.json();

      if (result.data?.verify) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          tokens: { accessToken, refreshToken },
        }));
        return true;
      }
    } catch (err) {
      console.error('Auth verification failed:', err);
    }

    return false;
  }, []);

  return {
    authState,
    signInWithLens,
    signOut,
    checkAuthStatus,
  };
};