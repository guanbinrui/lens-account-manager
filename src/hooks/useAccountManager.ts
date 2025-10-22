import { useState, useCallback } from 'react';
import { 
  AddAccountManagerRequest, 
  RemoveAccountManagerRequest, 
  UpdateAccountManagerPermissionsRequest,
  AddAccountManagerResponse,
  RemoveAccountManagerResponse,
  UpdateAccountManagerPermissionsResponse,
  SponsoredTransactionRequest,
  SelfFundedTransactionRequest,
  TransactionWillFail
} from '@/types/lens';
import { 
  lensRequest, 
  ADD_ACCOUNT_MANAGER_MUTATION, 
  REMOVE_ACCOUNT_MANAGER_MUTATION,
  UPDATE_ACCOUNT_MANAGER_PERMISSIONS_MUTATION 
} from '@/lib/lens';

interface AccountManagerState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export const useAccountManager = () => {
  const [state, setState] = useState<AccountManagerState>({
    loading: false,
    error: null,
    success: null,
  });

  const addAccountManager = useCallback(async (
    request: AddAccountManagerRequest,
    accessToken: string
  ): Promise<boolean> => {
    setState({ loading: true, error: null, success: null });

    try {
      console.log('Adding account manager:', request);
      
      const response = await lensRequest(ADD_ACCOUNT_MANAGER_MUTATION, {
        request,
      }, accessToken);

      console.log('Add account manager response:', response);
      const result: AddAccountManagerResponse = response.value;

      if (result.__typename === 'SponsoredTransactionRequest') {
        const sponsoredTx = result as SponsoredTransactionRequest;
        setState({
          loading: false,
          error: null,
          success: `Account manager request created! Transaction will be sponsored. Reason: ${sponsoredTx.reason}`,
        });
        return true;
      } else if (result.__typename === 'SelfFundedTransactionRequest') {
        const selfFundedTx = result as SelfFundedTransactionRequest;
        setState({
          loading: false,
          error: null,
          success: `Account manager request created! You need to fund the transaction. Reason: ${selfFundedTx.reason}`,
        });
        return true;
      } else if (result.__typename === 'TransactionWillFail') {
        const failTx = result as TransactionWillFail;
        setState({
          loading: false,
          error: `Transaction will fail: ${failTx.reason}`,
          success: null,
        });
        return false;
      } else {
        setState({
          loading: false,
          error: 'Unknown error occurred',
          success: null,
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add account manager';
      setState({
        loading: false,
        error: errorMessage,
        success: null,
      });
      return false;
    }
  }, []);

  const removeAccountManager = useCallback(async (
    request: RemoveAccountManagerRequest,
    accessToken: string
  ): Promise<boolean> => {
    setState({ loading: true, error: null, success: null });

    try {
      console.log('Removing account manager:', request);
      
      const response = await lensRequest(REMOVE_ACCOUNT_MANAGER_MUTATION, {
        request,
      }, accessToken);

      console.log('Remove account manager response:', response);
      const result: RemoveAccountManagerResponse = response.value;

      if (result.__typename === 'SponsoredTransactionRequest') {
        const sponsoredTx = result as SponsoredTransactionRequest;
        setState({
          loading: false,
          error: null,
          success: `Account manager removal request created! Transaction will be sponsored. Reason: ${sponsoredTx.reason}`,
        });
        return true;
      } else if (result.__typename === 'SelfFundedTransactionRequest') {
        const selfFundedTx = result as SelfFundedTransactionRequest;
        setState({
          loading: false,
          error: null,
          success: `Account manager removal request created! You need to fund the transaction. Reason: ${selfFundedTx.reason}`,
        });
        return true;
      } else if (result.__typename === 'TransactionWillFail') {
        const failTx = result as TransactionWillFail;
        setState({
          loading: false,
          error: `Transaction will fail: ${failTx.reason}`,
          success: null,
        });
        return false;
      } else {
        setState({
          loading: false,
          error: 'Unknown error occurred',
          success: null,
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove account manager';
      setState({
        loading: false,
        error: errorMessage,
        success: null,
      });
      return false;
    }
  }, []);

  const updateAccountManagerPermissions = useCallback(async (
    request: UpdateAccountManagerPermissionsRequest,
    accessToken: string
  ): Promise<boolean> => {
    setState({ loading: true, error: null, success: null });

    try {
      console.log('Updating account manager permissions:', request);
      
      const response = await lensRequest(UPDATE_ACCOUNT_MANAGER_PERMISSIONS_MUTATION, {
        request,
      }, accessToken);

      console.log('Update account manager permissions response:', response);
      const result: UpdateAccountManagerPermissionsResponse = response.value;

      if (result.__typename === 'SponsoredTransactionRequest') {
        const sponsoredTx = result as SponsoredTransactionRequest;
        setState({
          loading: false,
          error: null,
          success: `Account manager permissions update request created! Transaction will be sponsored. Reason: ${sponsoredTx.reason}`,
        });
        return true;
      } else if (result.__typename === 'SelfFundedTransactionRequest') {
        const selfFundedTx = result as SelfFundedTransactionRequest;
        setState({
          loading: false,
          error: null,
          success: `Account manager permissions update request created! You need to fund the transaction. Reason: ${selfFundedTx.reason}`,
        });
        return true;
      } else if (result.__typename === 'TransactionWillFail') {
        const failTx = result as TransactionWillFail;
        setState({
          loading: false,
          error: `Transaction will fail: ${failTx.reason}`,
          success: null,
        });
        return false;
      } else {
        setState({
          loading: false,
          error: 'Unknown error occurred',
          success: null,
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update account manager permissions';
      setState({
        loading: false,
        error: errorMessage,
        success: null,
      });
      return false;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, error: null, success: null }));
  }, []);

  return {
    ...state,
    addAccountManager,
    removeAccountManager,
    updateAccountManagerPermissions,
    clearMessages,
  };
};
