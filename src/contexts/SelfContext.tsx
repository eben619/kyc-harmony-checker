
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

interface SelfContextType {
  selfID: any | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
  error: string | null;
}

const SelfContext = createContext<SelfContextType | undefined>(undefined);

export const SelfProviderWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <SelfContextProvider>{children}</SelfContextProvider>
  );
};

export const SelfContextProvider = ({ children }: { children: ReactNode }) => {
  const [selfID, setSelfID] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const walletAddress = useAddress();

  const connect = async () => {
    if (!walletAddress || !window.ethereum) {
      setError("Wallet not connected or ethereum not available");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Simulated connection process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock selfID
      const mockSelfID = {
        id: `did:ethr:${walletAddress}`,
        address: walletAddress,
        isAuthenticated: true,
      };
      
      setSelfID(mockSelfID);
      setIsConnected(true);
      console.log("Connected to Self Protocol (mock)", mockSelfID);
    } catch (err: any) {
      console.error("Error connecting to Self ID:", err);
      setError(err.message || "Failed to connect to Self ID");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setSelfID(null);
    setIsConnected(false);
  };

  useEffect(() => {
    if (!walletAddress && isConnected) {
      disconnect();
    }
  }, [walletAddress, isConnected]);

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
