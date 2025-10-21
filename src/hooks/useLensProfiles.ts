import { useState, useEffect, useCallback } from 'react';
import { LensProfile, LensProfilesResponse } from '@/types/lens';
import { lensRequest, GET_PROFILES_BY_ADDRESS } from '@/lib/lens';

export const useLensProfiles = (address: string | null) => {
  const [profiles, setProfiles] = useState<LensProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async (walletAddress: string) => {
    if (!walletAddress) {
      setProfiles([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: LensProfilesResponse = await lensRequest(GET_PROFILES_BY_ADDRESS, {
        address: walletAddress,
      });

      setProfiles(data.profiles?.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Lens profiles');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetchProfiles(address);
    } else {
      setProfiles([]);
      setError(null);
    }
  }, [address, fetchProfiles]);

  const refetch = useCallback(() => {
    if (address) {
      fetchProfiles(address);
    }
  }, [address, fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    refetch,
  };
};