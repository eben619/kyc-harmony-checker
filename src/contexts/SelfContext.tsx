
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import { SelfProvider, SelfID, useClient } from '@self.id/framework';
import { EthereumWebAuth, getAccountId } from '@self.id/web';
import { ethers } from 'ethers';

interface SelfContextType {
  selfID: SelfID | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
  error: string | null;
}

const SelfContext = createContext<SelfContextType | undefined>(undefined);

export const SelfProviderWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <SelfProvider>
      <SelfContextProvider>{children}</SelfContextProvider>
    </SelfProvider>
  );
};

export const SelfContextProvider = ({ children }: { children: ReactNode }) => {
  const [selfID, setSelfID] = useState<SelfID | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const walletAddress = useAddress();
  const client = useClient();

  const connect = async () => {
    if (!walletAddress || !client || !window.ethereum) {
      setError("Wallet not connected or Self client not initialized");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Request ethereum accounts
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const accountId = await getAccountId(provider, walletAddress);

      // Create auth
      const authMethod = await EthereumWebAuth.getAuthMethod(provider, accountId);
      
      // Connect to Self ID
      const selfID = await client.authenticate(authMethod);
      
      setSelfID(selfID);
      setIsConnected(true);
      setLoading(false);
    } catch (err: any) {
      console.error("Error connecting to Self ID:", err);
      setError(err.message || "Failed to connect to Self ID");
      setLoading(false);
    }
  };

  const disconnect = () => {
    setSelfID(null);
    setIsConnected(false);
  };

  useEffect(() => {
    if (!isConnected && selfID) {
      disconnect();
    }
  }, [isConnected, selfID]);

  return (
    <SelfContext.Provider value={{ selfID, isConnected, connect, disconnect, loading, error }}>
      {children}
    </SelfContext.Provider>
  );
};

export const useSelf = () => {
  const context = useContext(SelfContext);
  if (context === undefined) {
    throw new Error('useSelf must be used within a SelfContextProvider');
  }
  return context;
};
