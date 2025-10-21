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
    isMetaMaskInstalled
  };
};