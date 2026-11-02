import { walletService } from '@/services/api';
import { isUnauthorizedError } from '@/utils/authError';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';

export interface WalletTransaction {
  _id: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  description: string;
  order?: string;
  createdAt: string;
}

interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
  topUp: (amount: number) => Promise<number>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, logout } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthFailure = useCallback(
    async (requestError: unknown) => {
      if (!isUnauthorizedError(requestError)) return false;

      console.warn('Wallet session expired; signing out.');
      await logout();
      return true;
    },
    [logout]
  );

  const refreshWallet = useCallback(async () => {
    if (!token) {
      setBalance(0);
      setTransactions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await walletService.getWallet(token);
      const wallet = response.data || {};

      setBalance(Number(wallet.balance) || 0);
      setTransactions(
        Array.isArray(wallet.transactions) ? wallet.transactions : []
      );
    } catch (requestError) {
      if (await handleAuthFailure(requestError)) return;

      console.error('Failed to fetch wallet:', requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to load wallet'
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, handleAuthFailure]);

  // A new sign-in (or account switch) must never show the previous wallet.
  useEffect(() => {
    if (!token) {
      setBalance(0);
      setTransactions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    refreshWallet();
  }, [token, refreshWallet]);

  const topUp = useCallback(
    async (amount: number) => {
      if (!token) throw new Error('Please sign in to add money to your wallet.');

      try {
        const response = await walletService.topUp(amount, token);
        const wallet = response.data || {};
        const nextBalance = Number(wallet.balance);

        setBalance(Number.isFinite(nextBalance) ? nextBalance : balance + amount);

        if (wallet.transaction) {
          setTransactions((current) => [
            wallet.transaction as WalletTransaction,
            ...current,
          ]);
        } else {
          await refreshWallet();
        }

        return Number.isFinite(nextBalance) ? nextBalance : balance + amount;
      } catch (requestError) {
        await handleAuthFailure(requestError);
        throw requestError;
      }
    },
    [token, balance, refreshWallet, handleAuthFailure]
  );

  const value = useMemo<WalletContextType>(
    () => ({
      balance,
      transactions,
      isLoading,
      error,
      refreshWallet,
      topUp,
    }),
    [balance, transactions, isLoading, error, refreshWallet, topUp]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error('useWallet must be used within WalletProvider');
  }

  return context;
};
