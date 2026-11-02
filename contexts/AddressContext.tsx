import { addressService } from '@/services/api';
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

export interface Address {
  _id: string;
  label: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  isDefault?: boolean;
}

export interface AddressInput {
  label: Address['label'];
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: Address['coordinates'];
  isDefault?: boolean;
}

interface AddressContextType {
  addresses: Address[];
  defaultAddress: Address | null;
  isLoading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  addAddress: (address: AddressInput) => Promise<Address>;
  updateAddress: (addressId: string, updates: Partial<AddressInput>) => Promise<Address>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, logout } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthFailure = useCallback(
    async (requestError: unknown) => {
      if (!isUnauthorizedError(requestError)) return false;

      console.warn('Address session expired; signing out.');
      await logout();
      return true;
    },
    [logout]
  );

  const loadAddresses = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!token) {
        setAddresses([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      if (!silent) setIsLoading(true);
      setError(null);

      try {
        const response = await addressService.getAll(token);
        setAddresses(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        if (await handleAuthFailure(requestError)) return;

        console.error('Failed to fetch addresses:', requestError);
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to load addresses'
        );
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [token, handleAuthFailure]
  );

  const fetchAddresses = useCallback(async () => {
    await loadAddresses();
  }, [loadAddresses]);

  // Keep saved addresses scoped to the signed-in account.
  useEffect(() => {
    if (!token) {
      setAddresses([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    loadAddresses();
  }, [token, loadAddresses]);

  const addAddress = useCallback(
    async (address: AddressInput) => {
      if (!token) throw new Error('Please sign in to save an address.');

      try {
        const response = await addressService.create(address, token);
        const created: Address | undefined = response.data;

        if (created?._id) {
          setAddresses((current) => {
            const withoutDuplicate = current.filter(
              (item) => item._id !== created._id
            );

            return [
              ...withoutDuplicate.map((item) =>
                created.isDefault ? { ...item, isDefault: false } : item
              ),
              created,
            ];
          });
        }

        // Re-sync quietly so server-side default changes are reflected.
        await loadAddresses({ silent: true });

        if (!created?._id) {
          throw new Error('Invalid address response from server');
        }

        return created;
      } catch (requestError) {
        await handleAuthFailure(requestError);
        throw requestError;
      }
    },
    [token, loadAddresses, handleAuthFailure]
  );

  const updateAddress = useCallback(
    async (addressId: string, updates: Partial<AddressInput>) => {
      if (!token) throw new Error('Please sign in to update an address.');

      try {
        const response = await addressService.update(addressId, updates, token);
        const updated: Address | undefined = response.data;

        if (updated?._id) {
          setAddresses((current) =>
            current.map((item) => {
              if (item._id === updated._id) return updated;
              return updated.isDefault ? { ...item, isDefault: false } : item;
            })
          );
        }

        await loadAddresses({ silent: true });

        if (!updated?._id) {
          throw new Error('Invalid address response from server');
        }

        return updated;
      } catch (requestError) {
        await handleAuthFailure(requestError);
        throw requestError;
      }
    },
    [token, loadAddresses, handleAuthFailure]
  );

  const deleteAddress = useCallback(
    async (addressId: string) => {
      if (!token) throw new Error('Please sign in to delete an address.');

      try {
        await addressService.delete(addressId, token);
        setAddresses((current) =>
          current.filter((item) => item._id !== addressId)
        );

        // The server promotes another address when the default is deleted.
        await loadAddresses({ silent: true });
      } catch (requestError) {
        await handleAuthFailure(requestError);
        throw requestError;
      }
    },
    [token, loadAddresses, handleAuthFailure]
  );

  const setDefaultAddress = useCallback(
    async (addressId: string) => {
      if (!token) throw new Error('Please sign in to update an address.');

      try {
        await addressService.update(addressId, { isDefault: true }, token);
        setAddresses((current) =>
          current.map((item) => ({
            ...item,
            isDefault: item._id === addressId,
          }))
        );
      } catch (requestError) {
        await handleAuthFailure(requestError);
        throw requestError;
      }
    },
    [token, handleAuthFailure]
  );

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses]
  );

  const value = useMemo<AddressContextType>(
    () => ({
      addresses,
      defaultAddress,
      isLoading,
      error,
      fetchAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    }),
    [
      addresses,
      defaultAddress,
      isLoading,
      error,
      fetchAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    ]
  );

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  );
};

export const useAddress = (): AddressContextType => {
  const context = useContext(AddressContext);

  if (context === undefined) {
    throw new Error('useAddress must be used within AddressProvider');
  }

  return context;
};
