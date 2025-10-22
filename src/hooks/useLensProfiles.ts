import { useState, useEffect, useCallback } from 'react';
import { LensProfile, AccountsAvailableResponse, AccountManaged, AccountOwned } from '@/types/lens';
import { lensRequest, ACCOUNTS_AVAILABLE_QUERY } from '@/lib/lens';

export const useLensProfiles = (address: string | null) => {
  const [profiles, setProfiles] = useState<LensProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to convert new API response to legacy LensProfile format
  const convertToLensProfile = (accountItem: AccountManaged | AccountOwned, managerAddress?: string): LensProfile => {
    const account = accountItem.account;
    const isManagedAccount = accountItem.__typename === 'AccountManaged';
    
    return {
      id: account.address,
      handle: {
        fullHandle: account.username?.value || '',
        localName: account.username?.localName || '',
      },
      metadata: {
        displayName: account.metadata?.name,
        bio: account.metadata?.bio,
        picture: account.metadata?.picture ? {
          optimized: {
            uri: account.metadata.picture,
            width: 200,
            height: 200,
          }
        } : undefined,
        coverPicture: account.metadata?.coverPicture ? {
          optimized: {
            uri: account.metadata.coverPicture,
            width: 800,
            height: 200,
          }
        } : undefined,
        attributes: account.metadata?.attributes?.map(attr => ({
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
        canFollow: typeof account.operations?.canFollow === 'object',
        canUnfollow: typeof account.operations?.canUnfollow === 'object',
        canBlock: account.operations?.canBlock || false,
        canUnblock: account.operations?.canUnblock || false,
        canReport: account.operations?.hasReported || false,
      },
      createdAt: account.createdAt,
      accountManagerPermissions: isManagedAccount ? (accountItem as AccountManaged).permissions : undefined,
      isManagedAccount,
      accountManagerAddress: isManagedAccount ? managerAddress : undefined,
    };
  };

  const fetchProfiles = useCallback(async (walletAddress: string) => {
    if (!walletAddress) {
      setProfiles([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: AccountsAvailableResponse = await lensRequest(ACCOUNTS_AVAILABLE_QUERY, {
        request: {
          hiddenFilter: 'ALL',
          includeOwned: true,
          managedBy: walletAddress,
          pageSize: 'FIFTY',
        },
      });

      // Convert the new API response to legacy format
      const convertedProfiles = data.value?.items?.map(item => convertToLensProfile(item, walletAddress)) || [];
      setProfiles(convertedProfiles);
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