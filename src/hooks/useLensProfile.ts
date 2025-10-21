import { useState, useCallback } from 'react';
import { LensProfile, LensProfileResponse } from '@/types/lens';
import { lensRequest, GET_PROFILE_DETAILS } from '@/lib/lens';

export const useLensProfile = () => {
  const [profile, setProfile] = useState<LensProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (profileId: string) => {
    if (!profileId) return;

    setLoading(true);
    setError(null);

    try {
      const data: LensProfileResponse = await lensRequest(GET_PROFILE_DETAILS, {
        profileId,
      });

      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile details');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    clearProfile,
  };
};