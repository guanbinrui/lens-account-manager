import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { ConnectedWallet } from '@/types/wallet';

export const useEthereumWallet = () => {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // Check MetaMask installation on client-side only
  useEffect(() => {
    setIsMetaMaskInstalled(typeof window !== 'undefined' && !!window.ethereum);
  }, []);

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(accounts[0]);
          
          setWallet({
            address: accounts[0],
            balance: parseFloat(ethers.formatEther(balance)),
            provider
          });
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  }, []);

  const connectMetaMask = useCallback(async () => {
    setConnecting(true);
    setError(null);

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(accounts[0]);

      setWallet({
        address: accounts[0],
        balance: parseFloat(ethers.formatEther(balance)),
        provider
      });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect MetaMask';
      setError(errorMessage);
      console.error('MetaMask connection error:', err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setError(null);
  }, []);

  const getBalance = useCallback(async () => {
    if (wallet && wallet.provider) {
      try {
        const balance = await wallet.provider.getBalance(wallet.address);
        const updatedWallet = {
          ...wallet,
          balance: parseFloat(ethers.formatEther(balance))
        };
        setWallet(updatedWallet);
        return updatedWallet.balance;
      } catch (err) {
        console.error('Error fetching balance:', err);
        return null;
      }
    }
    return null;
  }, [wallet]);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!wallet || !wallet.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      const signer = await wallet.provider.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (err) {
      console.error('Error signing message:', err);
      throw err;
    }
  }, [wallet]);

  const sendTransaction = useCallback(async (transaction: any): Promise<string> => {
    if (!wallet || !wallet.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      // Ensure we're on the correct network (zkSync Era Lens mainnet - chain ID 232)
      const targetChainId = '0xe8'; // 232 in hex
      const currentNetwork = await wallet.provider.getNetwork();
      const currentChainId = currentNetwork.chainId.toString(16);
      
      console.log('Current chain ID:', currentChainId, 'Target chain ID:', targetChainId);
      
      if (currentChainId !== targetChainId) {
        console.log('Switching to zkSync Era Lens mainnet...');
        try {
          await window.ethereum?.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError: any) {
          // If the chain doesn't exist, add it
          if (switchError.code === 4902) {
            console.log('Adding zkSync Era Lens mainnet...');
            await window.ethereum?.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainId,
                chainName: 'zkSync Era Lens Mainnet',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.zksync.io'],
                blockExplorerUrls: ['https://explorer.zksync.io'],
              }],
            });
          } else {
            throw switchError;
          }
        }
        
        // Wait a moment for the network switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get a fresh provider after network switch
        const freshProvider = wallet.provider;
        const signer = await freshProvider.getSigner();
        
        // Verify we're on the correct network
        const newNetwork = await freshProvider.getNetwork();
        console.log('Network after switch:', newNetwork.chainId.toString(16));
        
        // Handle EIP-712 transactions (zkSync Era)
        if (transaction.type === 113) {
          console.log('Sending EIP-712 transaction:', transaction);
          
          // For zkSync Era, we need to convert the transaction to a format MetaMask can understand
          // Remove the custom type and customData, and use standard transaction format
          const standardTx = {
            to: transaction.to,
            data: transaction.data,
            value: transaction.value || '0',
            gasLimit: transaction.gasLimit,
            maxFeePerGas: transaction.maxFeePerGas,
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
            nonce: transaction.nonce,
            chainId: parseInt(targetChainId, 16), // Use the correct chain ID
            // Remove type and customData for MetaMask compatibility
          };
          
          console.log('Converted to standard transaction:', standardTx);
          const txResponse = await signer.sendTransaction(standardTx);
          
          console.log('Transaction sent:', txResponse);
          return txResponse.hash;
        } else {
          // Regular transaction
          console.log('Sending regular transaction:', transaction);
          const txResponse = await signer.sendTransaction({
            to: transaction.to,
            data: transaction.data,
            value: transaction.value || '0',
            gasLimit: transaction.gasLimit,
            maxFeePerGas: transaction.maxFeePerGas,
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
            nonce: transaction.nonce,
            chainId: parseInt(targetChainId, 16), // Use the correct chain ID
          });
          
          console.log('Transaction sent:', txResponse);
          return txResponse.hash;
        }
      } else {
        // Already on correct network, proceed with transaction
        const signer = await wallet.provider.getSigner();
        
        // Handle EIP-712 transactions (zkSync Era)
        if (transaction.type === 113) {
          console.log('Sending EIP-712 transaction:', transaction);
          
          // For zkSync Era, we need to convert the transaction to a format MetaMask can understand
          // Remove the custom type and customData, and use standard transaction format
          const standardTx = {
            to: transaction.to,
            data: transaction.data,
            value: transaction.value || '0',
            gasLimit: transaction.gasLimit,
            maxFeePerGas: transaction.maxFeePerGas,
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
            nonce: transaction.nonce,
            chainId: parseInt(targetChainId, 16), // Use the correct chain ID
            // Remove type and customData for MetaMask compatibility
          };
          
          console.log('Converted to standard transaction:', standardTx);
          const txResponse = await signer.sendTransaction(standardTx);
          
          console.log('Transaction sent:', txResponse);
          return txResponse.hash;
        } else {
          // Regular transaction
          console.log('Sending regular transaction:', transaction);
          const txResponse = await signer.sendTransaction({
            to: transaction.to,
            data: transaction.data,
            value: transaction.value || '0',
            gasLimit: transaction.gasLimit,
            maxFeePerGas: transaction.maxFeePerGas,
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
            nonce: transaction.nonce,
            chainId: parseInt(targetChainId, 16), // Use the correct chain ID
          });
          
          console.log('Transaction sent:', txResponse);
          return txResponse.hash;
        }
      }
    } catch (err) {
      console.error('Error sending transaction:', err);
      throw err;
    }
  }, [wallet]);

  useEffect(() => {
    checkIfWalletIsConnected();

    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          checkIfWalletIsConnected();
        }
      };

      const handleChainChanged = () => {
        checkIfWalletIsConnected();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkIfWalletIsConnected, disconnect]);

  return {
    wallet,
    connecting,
    error,
    connectMetaMask,
    disconnect,
    getBalance,
    signMessage,
    sendTransaction,
    isMetaMaskInstalled
  };
};