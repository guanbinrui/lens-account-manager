export interface WalletInfo {
  name: string;
  icon: string;
  adapter: any;
}

export interface WalletState {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  balance: number | null;
  wallet: WalletInfo | null;
}

export interface ConnectedWallet {
  address: string;
  balance?: number;
  provider?: any;
}