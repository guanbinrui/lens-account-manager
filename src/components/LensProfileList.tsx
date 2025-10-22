'use client';

import React, { useState, useEffect } from 'react';
import { LensProfile } from '@/types/lens';
import { useLensAuth } from '@/hooks/useLensAuth';
import { useEthereumWallet } from '@/hooks/useEthereumWallet';
import { useAccountManager } from '@/hooks/useAccountManager';

interface LensProfileListProps {
  profiles: LensProfile[];
  loading: boolean;
  error: string | null;
}

export const LensProfileList: React.FC<LensProfileListProps> = ({
  profiles,
  loading,
  error,
}) => {
  const { authState, signInWithLens, signOut } = useLensAuth();
  const { wallet, signMessage } = useEthereumWallet();
  const [managerAddress, setManagerAddress] = useState('');
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [selectedManagerAddress, setSelectedManagerAddress] = useState('');
  const [showPermissionsForm, setShowPermissionsForm] = useState(false);
  const [permissions, setPermissions] = useState({
    canExecuteTransactions: true,
    canSetMetadataUri: true,
    canTransferNative: false,
    canTransferTokens: false,
  });
  const { 
    loading: managerLoading, 
    error: managerError, 
    success: managerSuccess,
    accountManagers,
    managersLoading,
    managersError,
    addAccountManager,
    removeAccountManager,
    updateAccountManagerPermissions,
    enableSignless,
    fetchAccountManagers,
    clearMessages 
  } = useAccountManager();

  // Automatically load account managers when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.tokens?.accessToken) {
      fetchAccountManagers(authState.tokens.accessToken, {});
    }
  }, [authState.isAuthenticated, authState.tokens?.accessToken, fetchAccountManagers]);

  const handleSignIn = async (profile: LensProfile) => {
    if (!wallet?.address || !signMessage) {
      return;
    }

    try {
      await signInWithLens(profile, wallet.address, signMessage);
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!managerAddress.trim() || !authState.tokens?.accessToken) {
      return;
    }

    // Basic Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(managerAddress.trim())) {
      return;
    }

    const success = await addAccountManager({
      address: managerAddress.trim(),
      permissions: {
        canExecuteTransactions: true,
        canSetMetadataUri: true,
        canTransferNative: false,
        canTransferTokens: false,
      }
    }, authState.tokens.accessToken);

    if (success) {
      setManagerAddress('');
      setShowManagerForm(false);
      // Refresh the managers list
      await fetchAccountManagers(authState.tokens.accessToken, {});
    }
  };

  const handleRemoveManager = async (address: string) => {
    if (!authState.tokens?.accessToken) {
      return;
    }

    const success = await removeAccountManager({
      address,
    }, authState.tokens.accessToken);

    if (success) {
      // Refresh the managers list
      await fetchAccountManagers(authState.tokens.accessToken, {});
    }
  };

  const handleUpdatePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedManagerAddress.trim() || !authState.tokens?.accessToken) {
      return;
    }

    const success = await updateAccountManagerPermissions({
      address: selectedManagerAddress.trim(),
      permissions,
    }, authState.tokens.accessToken);

    if (success) {
      setSelectedManagerAddress('');
      setShowPermissionsForm(false);
      // Refresh the managers list
      await fetchAccountManagers(authState.tokens.accessToken, {});
    }
  };

  const handleEnableSignless = async () => {
    if (!authState.tokens?.accessToken) {
      return;
    }

    const success = await enableSignless(authState.tokens.accessToken);
    if (success) {
      // Refresh the managers list
      await fetchAccountManagers(authState.tokens.accessToken, {});
    }
  };

  const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lens Profiles</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading Lens profiles...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lens Profiles</h3>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️ Error loading profiles</div>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lens Profiles</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">🌿</div>
          <p className="text-gray-600">No Lens profiles found for this wallet address.</p>
          <p className="text-gray-500 text-sm mt-2">
            Create a profile on{' '}
            <a
              href="https://lens.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              lens.xyz
            </a>{' '}
            to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Lens Profiles ({profiles.length})
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Manager Account Button */}
          {authState.isAuthenticated && authState.tokens?.accessToken && (
            <button
              onClick={() => {
                setShowManagerForm(!showManagerForm);
                clearMessages();
              }}
              className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md transition-colors"
            >
              {showManagerForm ? 'Cancel Manager' : 'Add Manager'}
            </button>
          )}
          
          
          {/* Signless Experience Button */}
          {authState.isAuthenticated && authState.tokens?.accessToken && (
            <button
              onClick={handleEnableSignless}
              className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
            >
              Enable Signless
            </button>
          )}
          
          {/* Authentication Status */}
          {authState.isAuthenticated && authState.profile && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Signed in as @{authState.profile.handle.localName}</span>
              </div>
              <button
                onClick={signOut}
                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md"
          >
            <div className="flex items-start space-x-4">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {profile.metadata?.picture?.optimized?.uri ? (
                  <img
                    src={profile.metadata.picture.optimized.uri}
                    alt={profile.metadata?.displayName || profile.handle.localName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                    {(profile.metadata?.displayName || profile.handle.localName).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-base font-semibold text-gray-900 truncate">
                    {profile.metadata?.displayName || profile.handle.localName}
                  </h4>
                  <span className="text-sm text-gray-500">@{profile.handle.localName}</span>
                </div>
                
                {profile.metadata?.bio && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {profile.metadata.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{formatNumber(profile.stats.followers)} followers</span>
                  <span>{formatNumber(profile.stats.following)} following</span>
                  <span>{formatNumber(profile.stats.posts)} posts</span>
                  <span>Created {formatDate(profile.createdAt)}</span>
                </div>

                {/* Account Manager Information */}
                {profile.isManagedAccount && (
                  <div className="mt-2">
                    {profile.accountManagerAddress && (
                      <div className="text-xs text-gray-500 mb-1">
                        <span className="font-medium">Account Manager:</span>{' '}
                        <span 
                          className="font-mono text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                          title={profile.accountManagerAddress}
                          onClick={() => navigator.clipboard?.writeText(profile.accountManagerAddress!)}
                        >
                          {profile.accountManagerAddress.slice(0, 6)}...{profile.accountManagerAddress.slice(-4)}
                        </span>
                      </div>
                    )}
                    {profile.accountManagerPermissions && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Account Manager Permissions:</div>
                        <div className="flex flex-wrap gap-1">
                          {profile.accountManagerPermissions.canExecuteTransactions && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              Execute Transactions
                            </span>
                          )}
                          {profile.accountManagerPermissions.canSetMetadataUri && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              Set Metadata URI
                            </span>
                          )}
                          {profile.accountManagerPermissions.canTransferNative && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              Transfer Native Tokens
                            </span>
                          )}
                          {profile.accountManagerPermissions.canTransferTokens && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                              Transfer Tokens
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                {/* Sign In Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignIn(profile);
                  }}
                  disabled={authState.loading || !wallet?.address}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    authState.loading || !wallet?.address
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : authState.isAuthenticated && authState.profile?.id === profile.id
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {authState.loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500 mr-1"></div>
                      Signing in...
                    </div>
                  ) : authState.isAuthenticated && authState.profile?.id === profile.id ? (
                    '✓ Signed In'
                  ) : (
                    'Sign In'
                  )}
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Account Manager Form */}
      {showManagerForm && authState.isAuthenticated && authState.tokens?.accessToken && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Account Manager Management
            </h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <form onSubmit={handleAddManager} className="space-y-4">
              <div>
                <label htmlFor="managerAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Ethereum Wallet Address
                </label>
                <input
                  type="text"
                  id="managerAddress"
                  value={managerAddress}
                  onChange={(e) => setManagerAddress(e.target.value)}
                  placeholder="0x..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                    managerAddress && !isValidEthereumAddress(managerAddress) 
                      ? 'border-red-300' 
                      : 'border-gray-300'
                  }`}
                  required
                />
                {managerAddress && !isValidEthereumAddress(managerAddress) && (
                  <p className="text-red-500 text-xs mt-1">Please enter a valid Ethereum address</p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Default Permissions</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Execute Transactions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Set Metadata URI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Transfer Native Tokens (disabled)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Transfer Tokens (disabled)</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={managerLoading || !isValidEthereumAddress(managerAddress)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {managerLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Manager...
                    </div>
                  ) : (
                    'Set Account Manager'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowManagerForm(false);
                    setManagerAddress('');
                    clearMessages();
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>

              {managerError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{managerError}</p>
                </div>
              )}

              {managerSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm">{managerSuccess}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Account Managers List */}
      {authState.isAuthenticated && authState.tokens?.accessToken && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Account Managers ({accountManagers.length})
            </h3>
          </div>

          {managersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading account managers...</span>
            </div>
          ) : managersError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{managersError}</p>
            </div>
          ) : accountManagers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">👥</div>
              <p className="text-gray-600">No account managers found.</p>
              <p className="text-gray-500 text-sm mt-2">
                Add an account manager to delegate social operations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {accountManagers.map((manager) => (
                <div
                  key={manager.manager}
                  className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          Account Manager
                        </h4>
                        <span 
                          className="font-mono text-xs text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                          title={manager.manager}
                          onClick={() => navigator.clipboard?.writeText(manager.manager)}
                        >
                          {manager.manager.slice(0, 6)}...{manager.manager.slice(-4)}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-2">
                        Added: {new Date(manager.addedAt).toLocaleDateString()}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {manager.permissions.canExecuteTransactions && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            Execute Transactions
                          </span>
                        )}
                        {manager.permissions.canSetMetadataUri && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            Set Metadata URI
                          </span>
                        )}
                        {manager.permissions.canTransferNative && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            Transfer Native Tokens
                          </span>
                        )}
                        {manager.permissions.canTransferTokens && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                            Transfer Tokens
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedManagerAddress(manager.manager);
                          setPermissions(manager.permissions);
                          setShowPermissionsForm(true);
                        }}
                        className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                      >
                        Edit Permissions
                      </button>
                      <button
                        onClick={() => handleRemoveManager(manager.manager)}
                        className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Update Permissions Form */}
      {showPermissionsForm && authState.isAuthenticated && authState.tokens?.accessToken && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Update Account Manager Permissions
            </h3>
            <button
              onClick={() => {
                setShowPermissionsForm(false);
                setSelectedManagerAddress('');
                clearMessages();
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <form onSubmit={handleUpdatePermissions} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Address
                </label>
                <div className="font-mono text-sm text-gray-600 bg-white p-2 rounded border">
                  {selectedManagerAddress}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions.canExecuteTransactions}
                      onChange={(e) => setPermissions(prev => ({ ...prev, canExecuteTransactions: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Execute Transactions</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions.canSetMetadataUri}
                      onChange={(e) => setPermissions(prev => ({ ...prev, canSetMetadataUri: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Set Metadata URI</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions.canTransferNative}
                      onChange={(e) => setPermissions(prev => ({ ...prev, canTransferNative: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Transfer Native Tokens</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions.canTransferTokens}
                      onChange={(e) => setPermissions(prev => ({ ...prev, canTransferTokens: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Transfer Tokens</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={managerLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {managerLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Permissions'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPermissionsForm(false);
                    setSelectedManagerAddress('');
                    clearMessages();
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>

              {managerError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{managerError}</p>
                </div>
              )}

              {managerSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm">{managerSuccess}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};