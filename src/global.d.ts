// Global type declarations

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: "accountsChanged", handler: (accounts: string[]) => void): void;
  on(event: "chainChanged", handler: () => void): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener(
    event: "accountsChanged",
    handler: (accounts: string[]) => void,
  ): void;
  removeListener(event: "chainChanged", handler: () => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
  isConnected?(): boolean;
  selectedAddress?: string;
  chainId?: string;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
