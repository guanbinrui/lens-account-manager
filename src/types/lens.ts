export interface LensHandle {
  fullHandle: string;
  localName: string;
}

export interface LensImageSet {
  optimized: {
    uri: string;
    width: number;
    height: number;
  };
}

export interface LensMetadata {
  displayName?: string;
  bio?: string;
  picture?: LensImageSet;
  coverPicture?: LensImageSet;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

export interface LensStats {
  followers: number;
  following: number;
  posts: number;
  comments?: number;
  mirrors?: number;
  quotes?: number;
}

export interface LensOperations {
  isFollowedByMe: {
    value: boolean;
  };
  isFollowingMe: {
    value: boolean;
  };
  canFollow: boolean;
  canUnfollow: boolean;
  canBlock: boolean;
  canUnblock: boolean;
  canReport: boolean;
}

export interface LensProfile {
  id: string;
  handle: LensHandle;
  metadata: LensMetadata;
  stats: LensStats;
  operations?: LensOperations;
  createdAt: string;
}

export interface LensProfilesResponse {
  profiles: {
    items: LensProfile[];
  };
}

export interface LensProfileResponse {
  profile: LensProfile;
}

export interface LensAuthChallenge {
  id: string;
  text: string;
}

export interface LensAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LensAuthState {
  isAuthenticated: boolean;
  profile: LensProfile | null;
  tokens: LensAuthTokens | null;
  loading: boolean;
  error: string | null;
}