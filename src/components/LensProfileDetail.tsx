'use client';

import React from 'react';
import { LensProfile } from '@/types/lens';

interface LensProfileDetailProps {
  profile: LensProfile;
  loading: boolean;
  onSignIn: (profile: LensProfile) => void;
  onBack: () => void;
  isAuthenticated: boolean;
  authLoading: boolean;
}

export const LensProfileDetail: React.FC<LensProfileDetailProps> = ({
  profile,
  loading,
  onSignIn,
  onBack,
  isAuthenticated,
  authLoading,
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
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading profile details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header with Back Button */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to profiles
        </button>
        
        {!isAuthenticated && (
          <button
            onClick={() => onSignIn(profile)}
            disabled={authLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {authLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Sign in with Lens
              </>
            )}
          </button>
        )}
        
        {isAuthenticated && (
          <div className="flex items-center text-green-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Signed in
          </div>
        )}
      </div>

      {/* Cover Image */}
      {profile.metadata?.coverPicture?.optimized?.uri && (
        <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500 relative">
          <img
            src={profile.metadata.coverPicture.optimized.uri}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Profile Content */}
      <div className="p-6">
        {/* Profile Picture and Basic Info */}
        <div className="flex items-start space-x-6 mb-6">
          <div className="flex-shrink-0">
            {profile.metadata?.picture?.optimized?.uri ? (
              <img
                src={profile.metadata.picture.optimized.uri}
                alt={profile.metadata?.displayName || profile.handle.localName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg">
                {(profile.metadata?.displayName || profile.handle.localName).charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {profile.metadata?.displayName || profile.handle.localName}
            </h1>
            <p className="text-lg text-gray-600 mb-2">@{profile.handle.fullHandle}</p>
            
            {profile.metadata?.bio && (
              <p className="text-gray-700 leading-relaxed mb-4">
                {profile.metadata.bio}
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {formatNumber(profile.stats.followers)}
                </div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {formatNumber(profile.stats.following)}
                </div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {formatNumber(profile.stats.posts)}
                </div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {formatNumber(profile.stats.comments || 0)}
                </div>
                <div className="text-sm text-gray-600">Comments</div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Joined {formatDate(profile.createdAt)}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {profile.metadata?.attributes && profile.metadata.attributes.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.metadata.attributes.map((attr, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 capitalize">
                    {attr.key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-gray-900 mt-1">{attr.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Operations */}
        {profile.operations && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Status</h3>
            <div className="flex flex-wrap gap-2">
              {profile.operations.isFollowedByMe.value && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Following you
                </span>
              )}
              {profile.operations.isFollowingMe.value && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  You follow
                </span>
              )}
              {profile.operations.canFollow && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  Can follow
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};