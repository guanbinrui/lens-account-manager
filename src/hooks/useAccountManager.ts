import { useState, useCallback } from "react";
import {
  AddAccountManagerRequest,
  RemoveAccountManagerRequest,
  UpdateAccountManagerPermissionsRequest,
  AddAccountManagerResponse,
  RemoveAccountManagerResponse,
  UpdateAccountManagerPermissionsResponse,
  EnableSignlessRequest,
  RemoveSignlessRequest,
  EnableSignlessResponse,
  RemoveSignlessResponse,
  FetchAccountManagersResponse,
  AccountManagersRequest,
  HideManagedAccountRequest,
  UnhideManagedAccountRequest,
  HideManagedAccountResponse,
  UnhideManagedAccountResponse,
  SponsoredTransactionRequest,
  SelfFundedTransactionRequest,
  TransactionWillFail,
  AccountManager,
} from "@/types/lens";
import {
  lensRequest,
  ADD_ACCOUNT_MANAGER_MUTATION,
  REMOVE_ACCOUNT_MANAGER_MUTATION,
  UPDATE_ACCOUNT_MANAGER_PERMISSIONS_MUTATION,
  ENABLE_SIGNLESS_MUTATION,
  REMOVE_SIGNLESS_MUTATION,
  FETCH_ACCOUNT_MANAGERS_QUERY,
  HIDE_MANAGED_ACCOUNT_MUTATION,
  UNHIDE_MANAGED_ACCOUNT_MUTATION,
} from "@/lib/lens";

interface AccountManagerState {
  loading: boolean;
  error: string | null;
  success: string | null;
  accountManagers: AccountManager[];
  managersLoading: boolean;
  managersError: string | null;
  transactionHash: string | null;
  executingTransaction: boolean;
}

export const useAccountManager = () => {
  const [state, setState] = useState<AccountManagerState>({
    loading: false,
    error: null,
    success: null,
    accountManagers: [],
    managersLoading: false,
    managersError: null,
    transactionHash: null,
    executingTransaction: false,
  });

  const addAccountManager = useCallback(
    async (
      request: AddAccountManagerRequest,
      accessToken: string,
      sendTransaction?: (transaction: any) => Promise<string>,
    ): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        success: null,
      }));

      try {
        console.log("Adding account manager:", request);

        const response = await lensRequest(
          ADD_ACCOUNT_MANAGER_MUTATION,
          {
            request,
          },
          accessToken,
        );

        console.log("Add account manager response:", response);
        const result: AddAccountManagerResponse = response.value;

        if (result.__typename === "SponsoredTransactionRequest") {
          const sponsoredTx = result as SponsoredTransactionRequest;

          // If sendTransaction is provided, automatically execute the transaction
          if (sendTransaction) {
            try {
              console.log("Sponsored transaction data:", sponsoredTx.raw);
              setState((prev) => ({ ...prev, executingTransaction: true }));
              const txHash = await sendTransaction(sponsoredTx.raw);
              setState((prev) => ({
                ...prev,
                loading: false,
                executingTransaction: false,
                transactionHash: txHash,
                success: `Account manager added successfully! Transaction hash: ${txHash}`,
                error: null,
              }));
              return true;
            } catch (txError) {
              setState((prev) => ({
                ...prev,
                loading: false,
                executingTransaction: false,
                error: `Transaction failed: ${txError instanceof Error ? txError.message : "Unknown error"}`,
                success: null,
              }));
              return false;
            }
          } else {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: null,
              success: `Account manager request created! Transaction will be sponsored. Reason: ${sponsoredTx.reason}`,
            }));
            return true;
          }
        } else if (result.__typename === "SelfFundedTransactionRequest") {
          const selfFundedTx = result as SelfFundedTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Account manager request created! You need to fund the transaction. Reason: ${selfFundedTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "TransactionWillFail") {
          const failTx = result as TransactionWillFail;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: `Transaction will fail: ${failTx.reason}`,
            success: null,
          }));
          return false;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Unknown error occurred",
            success: null,
          }));
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add account manager";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: null,
        }));
        return false;
      }
    },
    [],
  );

  const removeAccountManager = useCallback(
    async (
      request: RemoveAccountManagerRequest,
      accessToken: string,
    ): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        success: null,
      }));

      try {
        console.log("Removing account manager:", request);

        const response = await lensRequest(
          REMOVE_ACCOUNT_MANAGER_MUTATION,
          {
            request,
          },
          accessToken,
        );

        console.log("Remove account manager response:", response);
        const result: RemoveAccountManagerResponse = response.value;

        if (result.__typename === "SponsoredTransactionRequest") {
          const sponsoredTx = result as SponsoredTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Account manager removal request created! Transaction will be sponsored. Reason: ${sponsoredTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "SelfFundedTransactionRequest") {
          const selfFundedTx = result as SelfFundedTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Account manager removal request created! You need to fund the transaction. Reason: ${selfFundedTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "TransactionWillFail") {
          const failTx = result as TransactionWillFail;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: `Transaction will fail: ${failTx.reason}`,
            success: null,
          }));
          return false;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Unknown error occurred",
            success: null,
          }));
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove account manager";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: null,
        }));
        return false;
      }
    },
    [],
  );

  const updateAccountManagerPermissions = useCallback(
    async (
      request: UpdateAccountManagerPermissionsRequest,
      accessToken: string,
    ): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        success: null,
      }));

      try {
        console.log("Updating account manager permissions:", request);

        const response = await lensRequest(
          UPDATE_ACCOUNT_MANAGER_PERMISSIONS_MUTATION,
          {
            request,
          },
          accessToken,
        );

        console.log("Update account manager permissions response:", response);
        const result: UpdateAccountManagerPermissionsResponse = response.value;

        if (result.__typename === "SponsoredTransactionRequest") {
          const sponsoredTx = result as SponsoredTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Account manager permissions update request created! Transaction will be sponsored. Reason: ${sponsoredTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "SelfFundedTransactionRequest") {
          const selfFundedTx = result as SelfFundedTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Account manager permissions update request created! You need to fund the transaction. Reason: ${selfFundedTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "TransactionWillFail") {
          const failTx = result as TransactionWillFail;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: `Transaction will fail: ${failTx.reason}`,
            success: null,
          }));
          return false;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Unknown error occurred",
            success: null,
          }));
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update account manager permissions";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: null,
        }));
        return false;
      }
    },
    [],
  );

  const enableSignless = useCallback(
    async (accessToken: string): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        success: null,
      }));

      try {
        console.log("Enabling signless experience");

        const response = await lensRequest(
          ENABLE_SIGNLESS_MUTATION,
          {},
          accessToken,
        );

        console.log("Enable signless response:", response);
        const result: EnableSignlessResponse = response.value;

        if (result.__typename === "SponsoredTransactionRequest") {
          const sponsoredTx = result as SponsoredTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Signless experience enabled! Transaction will be sponsored. Reason: ${sponsoredTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "SelfFundedTransactionRequest") {
          const selfFundedTx = result as SelfFundedTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Signless experience enabled! You need to fund the transaction. Reason: ${selfFundedTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "TransactionWillFail") {
          const failTx = result as TransactionWillFail;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: `Transaction will fail: ${failTx.reason}`,
            success: null,
          }));
          return false;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Unknown error occurred",
            success: null,
          }));
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to enable signless experience";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: null,
        }));
        return false;
      }
    },
    [],
  );

  const removeSignless = useCallback(
    async (accessToken: string): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        success: null,
      }));

      try {
        console.log("Removing signless experience");

        const response = await lensRequest(
          REMOVE_SIGNLESS_MUTATION,
          {},
          accessToken,
        );

        console.log("Remove signless response:", response);
        const result: RemoveSignlessResponse = response.value;

        if (result.__typename === "SponsoredTransactionRequest") {
          const sponsoredTx = result as SponsoredTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Signless experience removed! Transaction will be sponsored. Reason: ${sponsoredTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "SelfFundedTransactionRequest") {
          const selfFundedTx = result as SelfFundedTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Signless experience removed! You need to fund the transaction. Reason: ${selfFundedTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "TransactionWillFail") {
          const failTx = result as TransactionWillFail;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: `Transaction will fail: ${failTx.reason}`,
            success: null,
          }));
          return false;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Unknown error occurred",
            success: null,
          }));
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove signless experience";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: null,
        }));
        return false;
      }
    },
    [],
  );

  const fetchAccountManagers = useCallback(
    async (
      accessToken: string,
      request: AccountManagersRequest = {},
    ): Promise<AccountManager[]> => {
      setState((prev) => ({
        ...prev,
        managersLoading: true,
        managersError: null,
      }));

      try {
        console.log("Fetching account managers with request:", request);

        const response = await lensRequest(
          FETCH_ACCOUNT_MANAGERS_QUERY,
          { request },
          accessToken,
        );

        console.log("Fetch account managers response:", response);
        const result: FetchAccountManagersResponse = response;

        setState((prev) => ({
          ...prev,
          managersLoading: false,
          managersError: null,
          accountManagers: result.accountManagers.items,
        }));

        return result.accountManagers.items;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch account managers";
        setState((prev) => ({
          ...prev,
          managersLoading: false,
          managersError: errorMessage,
          accountManagers: [],
        }));
        return [];
      }
    },
    [],
  );

  const hideManagedAccount = useCallback(
    async (
      request: HideManagedAccountRequest,
      accessToken: string,
    ): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        success: null,
      }));

      try {
        console.log("Hiding managed account:", request);

        const response = await lensRequest(
          HIDE_MANAGED_ACCOUNT_MUTATION,
          {
            request,
          },
          accessToken,
        );

        console.log("Hide managed account response:", response);
        const result: HideManagedAccountResponse = response.value;

        if (result.__typename === "SponsoredTransactionRequest") {
          const sponsoredTx = result as SponsoredTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Managed account hidden! Transaction will be sponsored. Reason: ${sponsoredTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "SelfFundedTransactionRequest") {
          const selfFundedTx = result as SelfFundedTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Managed account hidden! You need to fund the transaction. Reason: ${selfFundedTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "TransactionWillFail") {
          const failTx = result as TransactionWillFail;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: `Transaction will fail: ${failTx.reason}`,
            success: null,
          }));
          return false;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Unknown error occurred",
            success: null,
          }));
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to hide managed account";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: null,
        }));
        return false;
      }
    },
    [],
  );

  const unhideManagedAccount = useCallback(
    async (
      request: UnhideManagedAccountRequest,
      accessToken: string,
    ): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        success: null,
      }));

      try {
        console.log("Unhiding managed account:", request);

        const response = await lensRequest(
          UNHIDE_MANAGED_ACCOUNT_MUTATION,
          {
            request,
          },
          accessToken,
        );

        console.log("Unhide managed account response:", response);
        const result: UnhideManagedAccountResponse = response.value;

        if (result.__typename === "SponsoredTransactionRequest") {
          const sponsoredTx = result as SponsoredTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Managed account unhidden! Transaction will be sponsored. Reason: ${sponsoredTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "SelfFundedTransactionRequest") {
          const selfFundedTx = result as SelfFundedTransactionRequest;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            success: `Managed account unhidden! You need to fund the transaction. Reason: ${selfFundedTx.reason}`,
          }));
          return true;
        } else if (result.__typename === "TransactionWillFail") {
          const failTx = result as TransactionWillFail;
          setState((prev) => ({
            ...prev,
            loading: false,
            error: `Transaction will fail: ${failTx.reason}`,
            success: null,
          }));
          return false;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Unknown error occurred",
            success: null,
          }));
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to unhide managed account";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: null,
        }));
        return false;
      }
    },
    [],
  );

  const executeTransaction = useCallback(
    async (
      transactionRequest:
        | SponsoredTransactionRequest
        | SelfFundedTransactionRequest,
      sendTransaction: (transaction: any) => Promise<string>,
    ): Promise<boolean> => {
      setState((prev) => ({
        ...prev,
        executingTransaction: true,
        error: null,
        success: null,
      }));

      try {
        console.log("Executing transaction:", transactionRequest);

        const transactionHash = await sendTransaction(transactionRequest.raw);

        setState((prev) => ({
          ...prev,
          executingTransaction: false,
          transactionHash,
          success: `Transaction sent successfully! Hash: ${transactionHash}`,
          error: null,
        }));

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to execute transaction";
        setState((prev) => ({
          ...prev,
          executingTransaction: false,
          error: errorMessage,
          success: null,
          transactionHash: null,
        }));
        return false;
      }
    },
    [],
  );

  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      success: null,
      transactionHash: null,
    }));
  }, []);

  return {
    ...state,
    addAccountManager,
    removeAccountManager,
    updateAccountManagerPermissions,
    enableSignless,
    removeSignless,
    fetchAccountManagers,
    hideManagedAccount,
    unhideManagedAccount,
    executeTransaction,
    clearMessages,
  };
};
