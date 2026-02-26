import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface WalletContextType {
  connected: boolean;
  setConnected: (v: boolean) => void;
  walletOpen: boolean;
  setWalletOpen: (v: boolean) => void;
}

export const WalletContext = createContext<WalletContextType>({
  connected: false,
  setConnected: () => {},
  walletOpen: false,
  setWalletOpen: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false);
  return (
    <WalletContext.Provider value={{ connected, setConnected, walletOpen, setWalletOpen }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
