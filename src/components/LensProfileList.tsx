'use client';

import React from 'react';
import { LensProfile } from '@/types/lens';

interface LensProfileListProps {
  profiles: LensProfile[];
  loading: boolean;
  error: string | null;
  onSelectProfile: (profile: LensProfile) => void;
  selectedProfileId?: string;
}

export const LensProfileList: React.FC<LensProfileListProps> = ({
  profiles,
  loading,
  error,
  onSelectProfile,
  selectedProfileId,
}) => {
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
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Lens Profiles ({profiles.length})
      </h3>
      
      <div className="space-y-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => onSelectProfile(profile)}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              selectedProfileId === profile.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
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
              </div>

              {/* Selection Indicator */}
              {selectedProfileId === profile.id && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};