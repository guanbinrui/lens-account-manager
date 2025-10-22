import { LensConfig, development } from '@lens-protocol/react-web';
import { bindings as wagmiBindings } from '@lens-protocol/wagmi';
import { createConfig, http } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';

// Create a minimal wagmi config for Lens Protocol bindings
const wagmiConfig = createConfig({
  chains: [mainnet, polygon],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
});

export const lensConfig: LensConfig = {
  bindings: wagmiBindings(wagmiConfig),
  environment: development,
};

// Lens GraphQL API endpoint
export const LENS_API_URL = 'https://api.lens.xyz/graphql';

// GraphQL queries for Lens Protocol
export const ACCOUNTS_AVAILABLE_QUERY = `
  query AccountsAvailable($request: AccountsAvailableRequest!) {
    value: accountsAvailable(request: $request) {
      items {
        ...AccountAvailable
      }
      pageInfo {
        ...PaginatedResultInfo
      }
    }
  }
  fragment AccountAvailable on AccountAvailable {
    __typename
    ... on AccountManaged {
      ...AccountManaged
    }
    ... on AccountOwned {
      __typename
      addedAt
      account {
        ...Account
      }
    }
  }
  fragment Account on Account {
    __typename
    address
    owner
    score
    createdAt
    username {
      ...Username
    }
    metadata {
      ...AccountMetadata
    }
    operations {
      ...LoggedInAccountOperations
    }
    rules {
      ...AccountFollowRules
    }
    actions {
      ...AccountAction
    }
  }
  fragment AccountMetadata on AccountMetadata {
    __typename
    attributes {
      ...MetadataAttribute
    }
    bio
    coverPicture
    id
    name
    picture
  }
  fragment MetadataAttribute on MetadataAttribute {
    __typename
    type
    key
    value
  }
  fragment LoggedInAccountOperations on LoggedInAccountOperations {
    __typename
    id
    isFollowedByMe
    isFollowingMe
    canFollow {
      ...AccountFollowOperationValidationOutcome
    }
    canUnfollow {
      ...AccountFollowOperationValidationOutcome
    }
    isMutedByMe
    isBlockedByMe
    hasBlockedMe
    canBlock
    canUnblock
    hasReported
  }
  fragment AccountFollowOperationValidationOutcome on AccountFollowOperationValidationOutcome {
    __typename
  }
  fragment AccountFollowRules on AccountFollowRules {
    __typename
    required {
      ...AccountFollowRule
    }
    anyOf {
      ...AccountFollowRule
    }
  }
  fragment AccountFollowRule on AccountFollowRule {
    __typename
    id
    address
    type
    config {
      ...AnyKeyValue
    }
  }
  fragment AnyKeyValue on AnyKeyValue {
    __typename
  }
  fragment AccountAction on AccountAction {
    __typename
  }
  fragment Username on Username {
    __typename
    id
    value
    localName
    linkedTo
    ownedBy
    timestamp
    namespace
    operations {
      ...LoggedInUsernameOperations
    }
  }
  fragment LoggedInUsernameOperations on LoggedInUsernameOperations {
    __typename
    id
    canRemove {
      ...NamespaceOperationValidationOutcome
    }
    canAssign {
      ...NamespaceOperationValidationOutcome
    }
    canUnassign {
      ...NamespaceOperationValidationOutcome
    }
  }
  fragment NamespaceOperationValidationOutcome on NamespaceOperationValidationOutcome {
    __typename
  }
  fragment AccountManaged on AccountManaged {
    __typename
    addedAt
    account {
      ...Account
    }
    permissions {
      ...AccountManagerPermissions
    }
  }
  fragment AccountManagerPermissions on AccountManagerPermissions {
    __typename
    canExecuteTransactions
    canSetMetadataUri
    canTransferNative
    canTransferTokens
  }
  fragment PaginatedResultInfo on PaginatedResultInfo {
    __typename
    prev
    next
  }
`;

// Authentication queries and mutations
export const CHALLENGE_QUERY = `
  mutation Challenge($request: ChallengeRequest!) {
    value: challenge(request: $request) {
      ...AuthenticationChallenge
    }
  }
  fragment AuthenticationChallenge on AuthenticationChallenge {
    __typename
    id
    text
  }
`;

export const AUTHENTICATE_MUTATION = `
  mutation Authenticate($request: SignedAuthChallenge!) {
    value: authenticate(request: $request) {
      ...AuthenticationResult
    }
  }
  fragment AuthenticationResult on AuthenticationResult {
    ... on AuthenticationTokens {
      ...AuthenticationTokens
    }
    ... on WrongSignerError {
      ...WrongSignerError
    }
    ... on ExpiredChallengeError {
      ...ExpiredChallengeError
    }
    ... on ForbiddenError {
      ...ForbiddenError
    }
  }
  fragment AuthenticationTokens on AuthenticationTokens {
    __typename
    accessToken
    refreshToken
    idToken
  }
  fragment WrongSignerError on WrongSignerError {
    __typename
    reason
  }
  fragment ExpiredChallengeError on ExpiredChallengeError {
    __typename
    reason
  }
  fragment ForbiddenError on ForbiddenError {
    __typename
    reason
  }
`;

// Account Manager Management Mutations
export const ADD_ACCOUNT_MANAGER_MUTATION = `
  mutation AddAccountManager($request: AddAccountManagerRequest!) {
    value: addAccountManager(request: $request) {
      ... on SponsoredTransactionRequest {
        ...SponsoredTransactionRequest
      }
      ... on SelfFundedTransactionRequest {
        ...SelfFundedTransactionRequest
      }
      ... on TransactionWillFail {
        ...TransactionWillFail
      }
    }
  }
  fragment SponsoredTransactionRequest on SponsoredTransactionRequest {
    __typename
    raw {
      ...Eip712TransactionRequest
    }
    reason
    sponsoredReason
  }
  fragment SelfFundedTransactionRequest on SelfFundedTransactionRequest {
    __typename
    raw {
      ...Eip1559TransactionRequest
    }
    reason
    selfFundedReason
  }
  fragment TransactionWillFail on TransactionWillFail {
    __typename
    reason
  }
  fragment Eip712TransactionRequest on Eip712TransactionRequest {
    __typename
    type
    to
    from
    nonce
    gasLimit
    maxPriorityFeePerGas
    maxFeePerGas
    data
    value
    chainId
    customData {
      ...Eip712Meta
    }
  }
  fragment Eip1559TransactionRequest on Eip1559TransactionRequest {
    __typename
    to
    data
    value
    gasLimit
    maxFeePerGas
    maxPriorityFeePerGas
    nonce
    chainId
  }
  fragment Eip712Meta on Eip712Meta {
    __typename
    gasPerPubdata
    factoryDeps
    customSignature
    paymasterParams {
      ...PaymasterParams
    }
  }
  fragment PaymasterParams on PaymasterParams {
    __typename
    paymaster
    paymasterInput
  }
`;

export const REMOVE_ACCOUNT_MANAGER_MUTATION = `
  mutation RemoveAccountManager($request: RemoveAccountManagerRequest!) {
    value: removeAccountManager(request: $request) {
      ... on SponsoredTransactionRequest {
        ...SponsoredTransactionRequest
      }
      ... on SelfFundedTransactionRequest {
        ...SelfFundedTransactionRequest
      }
      ... on TransactionWillFail {
        ...TransactionWillFail
      }
    }
  }
`;

export const UPDATE_ACCOUNT_MANAGER_PERMISSIONS_MUTATION = `
  mutation UpdateAccountManagerPermissions($request: UpdateAccountManagerPermissionsRequest!) {
    value: updateAccountManagerPermissions(request: $request) {
      ... on SponsoredTransactionRequest {
        ...SponsoredTransactionRequest
      }
      ... on SelfFundedTransactionRequest {
        ...SelfFundedTransactionRequest
      }
      ... on TransactionWillFail {
        ...TransactionWillFail
      }
    }
  }
`;

// Signless Experience Mutations
export const ENABLE_SIGNLESS_MUTATION = `
  mutation EnableSignless {
    value: enableSignless {
      ... on SponsoredTransactionRequest {
        ...SponsoredTransactionRequest
      }
      ... on SelfFundedTransactionRequest {
        ...SelfFundedTransactionRequest
      }
      ... on TransactionWillFail {
        ...TransactionWillFail
      }
    }
  }
`;

export const REMOVE_SIGNLESS_MUTATION = `
  mutation RemoveSignless {
    value: removeSignless {
      ... on SponsoredTransactionRequest {
        ...SponsoredTransactionRequest
      }
      ... on SelfFundedTransactionRequest {
        ...SelfFundedTransactionRequest
      }
      ... on TransactionWillFail {
        ...TransactionWillFail
      }
    }
  }
`;

// Account Manager Listing Query
export const FETCH_ACCOUNT_MANAGERS_QUERY = `
  query FetchAccountManagers($request: AccountManagersRequest!) {
    accountManagers(request: $request) {
      items {
        ...AccountManager
      }
      pageInfo {
        ...PaginatedResultInfo
      }
    }
  }
  fragment AccountManager on AccountManager {
    __typename
    manager
    addedAt
    permissions {
      ...AccountManagerPermissions
    }
  }
  fragment AccountManagerPermissions on AccountManagerPermissions {
    __typename
    canExecuteTransactions
    canSetMetadataUri
    canTransferNative
    canTransferTokens
  }
  fragment PaginatedResultInfo on PaginatedResultInfo {
    __typename
    prev
    next
  }
`;

// Hide/Unhide Managed Account Mutations
export const HIDE_MANAGED_ACCOUNT_MUTATION = `
  mutation HideManagedAccount($request: HideManagedAccountRequest!) {
    value: hideManagedAccount(request: $request) {
      ... on SponsoredTransactionRequest {
        ...SponsoredTransactionRequest
      }
      ... on SelfFundedTransactionRequest {
        ...SelfFundedTransactionRequest
      }
      ... on TransactionWillFail {
        ...TransactionWillFail
      }
    }
  }
`;

export const UNHIDE_MANAGED_ACCOUNT_MUTATION = `
  mutation UnhideManagedAccount($request: UnhideManagedAccountRequest!) {
    value: unhideManagedAccount(request: $request) {
      ... on SponsoredTransactionRequest {
        ...SponsoredTransactionRequest
      }
      ... on SelfFundedTransactionRequest {
        ...SelfFundedTransactionRequest
      }
      ... on TransactionWillFail {
        ...TransactionWillFail
      }
    }
  }
`;

// Legacy queries for backward compatibility
export const GET_PROFILES_BY_ADDRESS = `
  query GetAccountByAddress($address: EvmAddress!) {
    account(request: { address: $address }) {
      address
      owner
      createdAt
      metadata {
        name
        bio
        picture
        coverPicture
        attributes {
          key
          value
        }
      }
      username {
        localName
        value
      }
    }
  }
`;

export const GET_PROFILE_DETAILS = `
  query GetAccountDetails($address: EvmAddress!) {
    account(request: { address: $address }) {
      address
      owner
      createdAt
      metadata {
        name
        bio
        picture
        coverPicture
        attributes {
          key
          value
        }
      }
      username {
        localName
        value
      }
      operations {
        isFollowedByMe {
          value
        }
        isFollowingMe {
          value
        }
        canFollow
        canUnfollow
        canBlock
        canUnblock
        canReport
      }
    }
  }
`;

// Helper function to make GraphQL requests
export const lensRequest = async (
  query: string, 
  variables: Record<string, unknown> = {},
  accessToken?: string
) => {
  try {
    const requestBody: any = {
      query,
      variables,
    };

    // Add operationName for authenticate mutation to match the working curl request
    if (query.includes('mutation Authenticate')) {
      requestBody.operationName = 'Authenticate';
    }

    console.log('Lens API Request:', {
      url: LENS_API_URL,
      body: requestBody,
      hasAuth: !!accessToken,
    });

    const headers: Record<string, string> = {
      'accept': 'application/graphql-response+json, application/graphql+json, application/json, text/event-stream, multipart/mixed',
      'accept-language': 'en,zh-CN;q=0.9,zh;q=0.8',
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      'origin': 'https://firefly.social',
      'pragma': 'no-cache',
      'priority': 'u=1, i',
      'referer': 'https://firefly.social/',
      'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    };

    // Add authorization header if access token is provided
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(LENS_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    
    console.log('Lens API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: result,
    });
    
    if (result.errors) {
      console.error('Lens API Errors:', result.errors);
      throw new Error(result.errors[0]?.message || 'GraphQL Error');
    }

    return result.data;
  } catch (error) {
    console.error('Lens API Error:', error);
    throw error;
  }
};