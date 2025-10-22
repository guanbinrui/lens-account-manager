# Lens Protocol Authentication with Account Manager Support

This implementation provides Lens Protocol authentication using the official `@lens-protocol/react` hooks, following the pattern from the provided example. It supports both account manager and account owner authentication.

## Key Features

- ✅ **Lens Protocol Hooks Integration**: Uses official `@lens-protocol/react` hooks
- ✅ **Account Manager Support**: Sign in as an account manager for managed accounts
- ✅ **Account Owner Support**: Sign in as the owner of an account
- ✅ **Wagmi Integration**: Works seamlessly with wagmi wallet connections
- ✅ **Backward Compatibility**: Maintains legacy authentication methods
- ✅ **TypeScript Support**: Fully typed implementation

## Installation

The required dependency has been installed:

```bash
npm install @lens-protocol/react --legacy-peer-deps
```

## Usage

### 1. Basic Usage with Lens Protocol Hooks

```tsx
import { useLensLoginWithAccountManager } from "@/hooks/useLensLogin";
import { useAccount, useWalletClient } from "wagmi";

function MyComponent() {
  const { address } = useAccount();
  const { data: signer } = useWalletClient();
  const { loginAsAccountManager, loginAsAccountOwner, isWalletConnected } = useLensLoginWithAccountManager();

  const handleLoginAsManager = async (accountAddress: string, profileId?: string) => {
    try {
      const result = await loginAsAccountManager(accountAddress, profileId);
      console.log("Login successful:", result);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLoginAsOwner = async (accountAddress: string, profileId?: string) => {
    try {
      const result = await loginAsAccountOwner(accountAddress, profileId);
      console.log("Login successful:", result);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      <button 
        onClick={() => handleLoginAsManager("0x...", "0x01")}
        disabled={!isWalletConnected}
      >
        Login as Account Manager
      </button>
      
      <button 
        onClick={() => handleLoginAsOwner("0x...", "0x01")}
        disabled={!isWalletConnected}
      >
        Login as Account Owner
      </button>
    </div>
  );
}
```

### 2. Using the Updated Account Manager Auth Hook

The `useAccountManagerAuth` hook has been updated to include the new Lens Protocol authentication:

```tsx
import { useAccountManagerAuth } from "@/hooks/useAccountManagerAuth";

function AccountManagerComponent() {
  const {
    authState,
    managedAccounts,
    signInWithLensProtocol, // New recommended method
    signInAsAccountManager, // Legacy method
    isWalletConnected,
    walletAddress,
  } = useAccountManagerAuth();

  const handleSignIn = async (profile: LensProfile, isAccountManager: boolean = true) => {
    try {
      await signInWithLensProtocol(profile, isAccountManager);
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  return (
    <div>
      {managedAccounts.map((profile) => (
        <div key={profile.id}>
          <h3>{profile.handle.fullHandle}</h3>
          <button onClick={() => handleSignIn(profile, true)}>
            Sign In as Manager
          </button>
          <button onClick={() => handleSignIn(profile, false)}>
            Sign In as Owner
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Direct Usage Following the Provided Example

For direct usage following the exact pattern from your example:

```tsx
import { useLogin, LoginRequest } from '@lens-protocol/react';
import { useAccount, useWalletClient } from 'wagmi';
import { EvmAddress } from '@lens-protocol/shared-kernel';
import { ProfileId } from '@lens-protocol/domain/entities';

export function useLensLogin() {
  const { address } = useAccount();
  const { data: signer } = useWalletClient();
  const { execute: login } = useLogin();

  return useCallback(
    async (accountAddress: string, profileId?: string) => {
      if (!signer || !address) {
        console.warn("No wallet signer or address available");
        return Promise.reject(new Error("No wallet signer or address available"));
      }

      const loginRequest: LoginRequest = {
        address: address as EvmAddress,
        ...(profileId && { profileId: profileId as ProfileId }),
      };

      try {
        const result = await login(loginRequest);
        
        if (result.isFailure()) {
          console.error("Login failed:", result.error);
          throw new Error(result.error.message);
        }

        return result.value;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    [signer, address, login]
  );
}
```

## Key Differences from Manual Implementation

### Before (Manual GraphQL)
- Manual challenge generation
- Manual signature creation
- Manual token management
- Complex error handling

### After (Lens Protocol Hooks)
- Automatic challenge generation
- Automatic signature handling
- Built-in token management
- Simplified error handling
- Better type safety

## Components Updated

1. **`useLensLogin.ts`** - New hook implementing the Lens Protocol pattern
2. **`useAccountManagerAuth.ts`** - Updated to include new authentication methods
3. **`AccountManagerLogin.tsx`** - Updated UI to support both authentication methods
4. **`LensLoginExample.tsx`** - Example component demonstrating usage

## Authentication Flow

1. **Wallet Connection**: User connects wallet using wagmi
2. **Account Selection**: User selects a Lens account to authenticate with
3. **Authentication Type**: Choose between account manager or account owner
4. **Challenge Generation**: Lens Protocol automatically generates authentication challenge
5. **Signature**: Wallet signs the challenge automatically
6. **Token Storage**: Tokens are managed by Lens Protocol hooks
7. **Authentication Complete**: User is authenticated and can perform Lens operations

## Error Handling

The new implementation provides better error handling:

```tsx
try {
  await loginAsAccountManager(accountAddress, profileId);
} catch (error) {
  if (error.message.includes("Wrong signer")) {
    // Handle wrong signer error
  } else if (error.message.includes("Expired challenge")) {
    // Handle expired challenge
  } else {
    // Handle other errors
  }
}
```

## Migration Guide

To migrate from the old manual implementation:

1. Replace manual `signInAsAccountManager` calls with `signInWithLensProtocol`
2. Remove manual token storage (handled by Lens Protocol)
3. Update error handling to use the new error types
4. Remove manual challenge generation code

## Benefits

- **Simplified Code**: Less boilerplate code required
- **Better Type Safety**: Full TypeScript support
- **Automatic Updates**: Benefits from Lens Protocol updates
- **Better Error Handling**: More descriptive error messages
- **Token Management**: Automatic token refresh and storage
- **Future Proof**: Uses official Lens Protocol patterns

## Example Integration

See `LensLoginExample.tsx` for a complete working example of how to integrate the new authentication system into your application.
