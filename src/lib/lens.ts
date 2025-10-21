import { LensConfig, development } from '@lens-protocol/react-web';
import { bindings as wagmiBindings } from '@lens-protocol/wagmi';

export const lensConfig: LensConfig = {
  bindings: wagmiBindings(),
  environment: development,
};

// Lens GraphQL API endpoint
export const LENS_API_URL = 'https://api.lens.xyz/graphql';

// GraphQL queries for Lens Protocol
export const GET_PROFILES_BY_ADDRESS = `
  query GetProfilesByAddress($address: EthereumAddress!) {
    profiles(request: { where: { ownedBy: [$address] } }) {
      items {
        id
        handle {
          fullHandle
          localName
        }
        metadata {
          displayName
          bio
          picture {
            ... on ImageSet {
              optimized {
                uri
                width
                height
              }
            }
          }
        }
        stats {
          followers
          following
          posts
        }
        createdAt
      }
    }
  }
`;

export const GET_PROFILE_DETAILS = `
  query GetProfileDetails($profileId: ProfileId!) {
    profile(request: { forProfileId: $profileId }) {
      id
      handle {
        fullHandle
        localName
      }
      metadata {
        displayName
        bio
        picture {
          ... on ImageSet {
            optimized {
              uri
              width
              height
            }
          }
        }
        coverPicture {
          ... on ImageSet {
            optimized {
              uri
              width
              height
            }
          }
        }
        attributes {
          key
          value
        }
      }
      stats {
        followers
        following
        posts
        comments
        mirrors
        quotes
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
      createdAt
    }
  }
`;

// Helper function to make GraphQL requests
export const lensRequest = async (query: string, variables: any = {}) => {
  try {
    const response = await fetch(LENS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL Error');
    }

    return result.data;
  } catch (error) {
    console.error('Lens API Error:', error);
    throw error;
  }
};