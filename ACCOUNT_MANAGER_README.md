# Lens Protocol Account Manager Implementation

This implementation provides comprehensive account manager functionality for Lens Protocol based on the official documentation at [https://lens.xyz/docs/protocol/accounts/manager](https://lens.xyz/docs/protocol/accounts/manager).

## Features Implemented

### 1. Account Manager Management
- **Add Account Manager**: Delegate social operations to an EVM address
- **Remove Account Manager**: Revoke manager permissions
- **Update Permissions**: Modify what operations a manager can perform
- **List Account Managers**: View all current account managers and their permissions

### 2. Signless Experience
- **Enable Signless**: Set up Lens API as account manager for seamless social interactions
- **Remove Signless**: Disable the signless experience

### 3. Account Visibility Management
- **Hide Managed Account**: Hide accounts from the available accounts list
- **Unhide Managed Account**: Restore hidden accounts to the list

### 4. Transaction Handling
- **Sponsored Transactions**: Handle EIP-712 transactions sponsored by Lens Protocol
- **Self-Funded Transactions**: Handle EIP-1559 transactions requiring user funding
- **Transaction Confirmation**: Wait for transaction confirmation and provide status updates

## Account Manager Permissions

The following permissions can be granted to account managers:

- **Execute Transactions**: Allow manager to execute social operations
- **Set Metadata URI**: Allow manager to update account metadata
- **Transfer Native Tokens**: Allow manager to transfer native tokens (use with caution)
- **Transfer Tokens**: Allow manager to transfer ERC-20 tokens (use with caution)

## Security Considerations

⚠️ **Important Security Notes**:

1. **Account managers can sign most social operations** on behalf of the account owner
2. **Sensitive operations** (like updating account managers) always require the account owner's signature
3. **Token transfer permissions** should be granted carefully as they allow managers to move funds
4. **Free operations** can be signless, while **paid operations** require user signatures

## Usage Examples

### Adding an Account Manager

```typescript
const success = await addAccountManager({
  address: "0x1234...", // Ethereum address
  permissions: {
    canExecuteTransactions: true,
    canSetMetadataUri: true,
    canTransferNative: false, // Recommended: keep false for security
    canTransferTokens: false, // Recommended: keep false for security
  }
}, accessToken);
```

### Enabling Signless Experience

```typescript
const success = await enableSignless(accessToken);
```

### Listing Account Managers

```typescript
const managers = await fetchAccountManagers(accessToken);
console.log('Current managers:', managers);
```

### Updating Manager Permissions

```typescript
const success = await updateAccountManagerPermissions({
  address: "0x1234...",
  permissions: {
    canExecuteTransactions: true,
    canSetMetadataUri: false,
    canTransferNative: false,
    canTransferTokens: false,
  }
}, accessToken);
```

## Transaction Flow

1. **Request Creation**: Account manager operations create transaction requests
2. **Transaction Type**: Requests can be either sponsored or self-funded
3. **Execution**: Use the transaction handler to execute transactions
4. **Confirmation**: Wait for blockchain confirmation

### Sponsored Transactions
- No gas fees required
- Handled by Lens Protocol
- Use EIP-712 signing

### Self-Funded Transactions
- User pays gas fees
- Standard EIP-1559 transactions
- Requires sufficient ETH balance

## UI Components

The implementation includes a comprehensive UI with:

- **Add Manager Form**: Input Ethereum address and set permissions
- **Managers List**: View all current managers with their permissions
- **Permissions Editor**: Update manager permissions with checkboxes
- **Signless Controls**: Enable/disable signless experience
- **Transaction Status**: Real-time feedback on transaction progress

## Error Handling

The implementation provides detailed error handling for:

- Invalid Ethereum addresses
- Network errors
- Transaction failures
- Permission errors
- Authentication issues

## Integration with Existing Code

This implementation integrates seamlessly with the existing Lens Protocol authentication and wallet connection system:

- Uses existing `useLensAuth` hook for authentication
- Leverages `useEthereumWallet` for wallet operations
- Extends the existing `LensProfileList` component
- Maintains consistency with existing UI patterns

## Files Modified/Created

### New Files
- `src/lib/transactionHandler.ts` - Transaction execution utilities

### Modified Files
- `src/types/lens.ts` - Added account manager types
- `src/lib/lens.ts` - Added GraphQL queries and mutations
- `src/hooks/useAccountManager.ts` - Enhanced with all account manager functions
- `src/components/LensProfileList.tsx` - Added comprehensive UI for account management

## Next Steps

To complete the implementation, consider:

1. **Wallet Integration**: Connect the transaction handler with your wallet client (wagmi/ethers)
2. **Testing**: Test all account manager operations on Lens testnet
3. **Error Recovery**: Implement retry mechanisms for failed transactions
4. **Notifications**: Add user notifications for transaction status updates
5. **Analytics**: Track account manager usage patterns

## Resources

- [Lens Protocol Account Manager Documentation](https://lens.xyz/docs/protocol/accounts/manager)
- [Lens Protocol Transaction Lifecycle](https://lens.xyz/docs/protocol/guides/transaction-lifecycle)
- [Lens Protocol Security Considerations](https://lens.xyz/docs/protocol/guides/security-considerations)
