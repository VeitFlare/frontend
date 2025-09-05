'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getUserWallets } from '@/lib/api'; // Import the correct API function

// Define a basic Wallet interface. Adjust as per actual backend response.
interface Wallet {
  id: string;
  name: string;
  amount: number;
  unlockDate: Date;
  status: "locked" | "unlocked";
  createdAt: Date;
  totalLockDuration: number;
  owner?: string;
  recipient?: string;
  tokenType?: string;
  actualBalance?: number;
}

interface WalletContextType {
  wallets: Wallet[];
  loading: boolean;
  error: string | null;
  fetchWallets: () => Promise<void>;
  updateWalletStatus: (walletId: string, status: "locked" | "unlocked") => void;
  refreshWallets: (newWallets: Wallet[]) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { connection } = useConnection();
  const { publicKey } = useSolanaWallet();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    if (!publicKey) {
      setWallets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use the correct API function to fetch wallets
      const walletsData = await getUserWallets(publicKey.toBase58());
      setWallets(walletsData);
    } catch (err: any) {
      console.error('Failed to fetch wallets:', err);
      setError(err.message || 'Failed to fetch wallets. Please try again.');
      setWallets([]);
    } finally {
      setLoading(false);
    }
  }, [publicKey?.toBase58()]);

  useEffect(() => {
    if (publicKey) {
      // Add a small delay to prevent excessive calls
      const timer = setTimeout(() => {
        fetchWallets();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setWallets([]);
      setLoading(false);
    }
  }, [publicKey?.toBase58()]);

  const updateWalletStatus = (walletId: string, status: "locked" | "unlocked") => {
    setWallets(prevWallets => 
      prevWallets.map(wallet => 
        wallet.id === walletId ? { ...wallet, status } : wallet
      )
    );
  };

  const refreshWallets = (newWallets: Wallet[]) => {
    setWallets(newWallets);
  };

  return (
    <WalletContext.Provider value={{ wallets, loading, error, fetchWallets, updateWalletStatus, refreshWallets }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
