import {
  SponsoredTransactionRequest,
  SelfFundedTransactionRequest,
  Eip712TransactionRequest,
  Eip1559TransactionRequest,
} from "@/types/lens";

// Transaction handling utilities for Lens Protocol account manager operations
// Based on the Lens Protocol documentation: https://lens.xyz/docs/protocol/accounts/manager

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Handles sponsored transactions (EIP-712)
 * These transactions are sponsored by Lens Protocol and don't require user funding
 */
export const handleSponsoredTransaction = async (
  transactionRequest: SponsoredTransactionRequest,
  walletClient: any, // This would be from wagmi or ethers
): Promise<TransactionResult> => {
  try {
    console.log("Handling sponsored transaction:", transactionRequest);

    const { raw } = transactionRequest;

    // For sponsored transactions, we need to sign the EIP-712 transaction
    // The wallet client should handle the signing process
    const txHash = await walletClient.sendTransaction({
      to: raw.to,
      data: raw.data,
      value: BigInt(raw.value),
      gasLimit: BigInt(raw.gasLimit),
      maxFeePerGas: BigInt(raw.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(raw.maxPriorityFeePerGas),
      nonce: raw.nonce,
      chainId: raw.chainId,
      // EIP-712 specific fields
      type: raw.type,
      customData: raw.customData,
    });

    console.log("Sponsored transaction sent:", txHash);

    return {
      success: true,
      transactionHash: txHash,
    };
  } catch (error) {
    console.error("Error handling sponsored transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Handles self-funded transactions (EIP-1559)
 * These transactions require the user to pay gas fees
 */
export const handleSelfFundedTransaction = async (
  transactionRequest: SelfFundedTransactionRequest,
  walletClient: any, // This would be from wagmi or ethers
): Promise<TransactionResult> => {
  try {
    console.log("Handling self-funded transaction:", transactionRequest);

    const { raw } = transactionRequest;

    // For self-funded transactions, we need to send a regular EIP-1559 transaction
    const txHash = await walletClient.sendTransaction({
      to: raw.to,
      data: raw.data,
      value: BigInt(raw.value),
      gasLimit: BigInt(raw.gasLimit),
      maxFeePerGas: BigInt(raw.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(raw.maxPriorityFeePerGas),
      nonce: raw.nonce,
      chainId: raw.chainId,
    });

    console.log("Self-funded transaction sent:", txHash);

    return {
      success: true,
      transactionHash: txHash,
    };
  } catch (error) {
    console.error("Error handling self-funded transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Generic transaction handler that determines the type and routes accordingly
 */
export const handleTransaction = async (
  transactionRequest:
    | SponsoredTransactionRequest
    | SelfFundedTransactionRequest,
  walletClient: any,
): Promise<TransactionResult> => {
  if (transactionRequest.__typename === "SponsoredTransactionRequest") {
    return handleSponsoredTransaction(transactionRequest, walletClient);
  } else if (transactionRequest.__typename === "SelfFundedTransactionRequest") {
    return handleSelfFundedTransaction(transactionRequest, walletClient);
  } else {
    return {
      success: false,
      error: "Unknown transaction type",
    };
  }
};

/**
 * Utility to wait for transaction confirmation
 */
export const waitForTransaction = async (
  transactionHash: string,
  walletClient: any,
  confirmations: number = 1,
): Promise<TransactionResult> => {
  try {
    console.log("Waiting for transaction confirmation:", transactionHash);

    const receipt = await walletClient.waitForTransactionReceipt({
      hash: transactionHash,
      confirmations,
    });

    console.log("Transaction confirmed:", receipt);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error("Error waiting for transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Complete transaction flow: send and wait for confirmation
 */
export const executeTransaction = async (
  transactionRequest:
    | SponsoredTransactionRequest
    | SelfFundedTransactionRequest,
  walletClient: any,
  waitForConfirmation: boolean = true,
): Promise<TransactionResult> => {
  try {
    // First, send the transaction
    const sendResult = await handleTransaction(
      transactionRequest,
      walletClient,
    );

    if (!sendResult.success || !sendResult.transactionHash) {
      return sendResult;
    }

    // If requested, wait for confirmation
    if (waitForConfirmation) {
      const confirmResult = await waitForTransaction(
        sendResult.transactionHash,
        walletClient,
      );
      return confirmResult;
    }

    return sendResult;
  } catch (error) {
    console.error("Error executing transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
