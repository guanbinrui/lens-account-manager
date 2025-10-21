// New API types based on AccountsAvailable query
export interface Username {
  __typename: string;
  id: string;
  value: string;
  localName: string;
  linkedTo: string;
  ownedBy: string;
  timestamp: string;
  namespace: string;
  operations: LoggedInUsernameOperations;
}

export interface LoggedInUsernameOperations {
  __typename: string;
  id: string;
  canRemove: NamespaceOperationValidationOutcome;
  canAssign: NamespaceOperationValidationOutcome;
  canUnassign: NamespaceOperationValidationOutcome;
}

export interface NamespaceOperationValidationOutcome {
  __typename: string;
}

export interface MetadataAttribute {
  __typename: string;
  type: string;
  key: string;
  value: string;
}

export interface AccountMetadata {
  __typename: string;
  attributes: MetadataAttribute[];
  bio?: string;
  coverPicture?: string;
  id: string;
  name?: string;
  picture?: string;
}

export interface LoggedInAccountOperations {
  __typename: string;
  id: string;
  isFollowedByMe: boolean;
  isFollowingMe: boolean;
  canFollow: AccountFollowOperationValidationOutcome;
  canUnfollow: AccountFollowOperationValidationOutcome;
  isMutedByMe: boolean;
  isBlockedByMe: boolean;
  hasBlockedMe: boolean;
  canBlock: boolean;
  canUnblock: boolean;
  hasReported: boolean;
}

export interface AccountFollowOperationValidationOutcome {
  __typename: string;
}

export interface AccountFollowRules {
  __typename: string;
  required: AccountFollowRule[];
  anyOf: AccountFollowRule[];
}

export interface AccountFollowRule {
  __typename: string;
  id: string;
  address: string;
  type: string;
  config: AnyKeyValue;
}

export interface AnyKeyValue {
  __typename: string;
}

export interface AccountAction {
  __typename: string;
}

export interface Account {
  __typename: string;
  address: string;
  owner: string;
  score: number;
  createdAt: string;
  username: Username;
  metadata: AccountMetadata;
  operations: LoggedInAccountOperations;
  rules: AccountFollowRules;
  actions: AccountAction[];
}

export interface AccountManagerPermissions {
  __typename: string;
  canExecuteTransactions: boolean;
  canSetMetadataUri: boolean;
  canTransferNative: boolean;
  canTransferTokens: boolean;
}

export interface AccountManaged {
  __typename: string;
  addedAt: string;
  account: Account;
  permissions: AccountManagerPermissions;
}

export interface AccountOwned {
  __typename: string;
  addedAt: string;
  account: Account;
}

export interface AccountAvailable {
  __typename: string;
}

export interface PaginatedResultInfo {
  __typename: string;
  prev?: string;
  next?: string;
}

export interface AccountsAvailableResponse {
  value: {
    items: (AccountManaged | AccountOwned)[];
    pageInfo: PaginatedResultInfo;
  };
}

// Authentication types
export interface AuthenticationChallenge {
  __typename: string;
  id: string;
  text: string;
}

export interface AuthenticationTokens {
  __typename: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

export interface WrongSignerError {
  __typename: string;
  reason: string;
}

export interface ExpiredChallengeError {
  __typename: string;
  reason: string;
}

export interface ForbiddenError {
  __typename: string;
  reason: string;
}

export type AuthenticationResult = AuthenticationTokens | WrongSignerError | ExpiredChallengeError | ForbiddenError;

export interface ChallengeRequest {
  accountOwner: {
    account: string;
    app: string;
    owner: string;
  };
}

export interface SignedAuthChallenge {
  id: string;
  signature: string;
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

// Legacy types for backward compatibility
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