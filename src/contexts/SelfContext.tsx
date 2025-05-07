
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import { getUniversalLink, SelfAppBuilder } from '@selfxyz/core';
import { supabase } from "@/integrations/supabase/client";

// Define interface for SelfID
interface SelfID {
  id: string;
  address: string;
  isAuthenticated: boolean;
}

interface SelfContextType {
  selfID: SelfID | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
  error: string | null;
  getProofLink: (proofType: string) => string;
  verifyProof: (proofData: any) => Promise<boolean>;
}

const SelfContext = createContext<SelfContextType | undefined>(undefined);

export const SelfProviderWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <SelfContextProvider>{children}</SelfContextProvider>
  );
};

export const SelfContextProvider = ({ children }: { children: ReactNode }) => {
  const [selfID, setSelfID] = useState<SelfID | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selfApp, setSelfApp] = useState<any>(null);
  const walletAddress = useAddress();

  // Initialize Self App
  useEffect(() => {
    if (walletAddress) {
      try {
        // Create Self App instance with the connected wallet
        const app = new SelfAppBuilder({
          appName: "KYC Harmony",
          scope: "identity:basic",
          endpoint: window.location.origin + "/api/self-callback",
          logoBase64: window.location.origin + "/logo.png", 
          userIdType: 'hex',
          userId: walletAddress,
        }).build();
        
        setSelfApp(app);
        
        // Check if we already have a stored Self ID for this wallet
        const storedSelfID = localStorage.getItem(`selfID_${walletAddress}`);
        if (storedSelfID) {
          try {
            const parsedSelfID = JSON.parse(storedSelfID);
            setSelfID(parsedSelfID);
            setIsConnected(true);
          } catch (e) {
            console.error("Failed to parse stored Self ID:", e);
            localStorage.removeItem(`selfID_${walletAddress}`);
          }
        }
      } catch (err: any) {
        console.error("Error initializing Self app:", err);
      }
    }
  }, [walletAddress]);

  const connect = async () => {
    if (!walletAddress) {
      setError("Wallet not connected");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // In a production environment, this would interact with the actual Self Protocol
      // For this implementation, we're creating a mock connection that simulates the process
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock selfID
      const mockSelfID = {
        id: `did:ethr:${walletAddress}`,
        address: walletAddress,
        isAuthenticated: true,
      };
      
      // Store the Self ID in localStorage for persistence
      localStorage.setItem(`selfID_${walletAddress}`, JSON.stringify(mockSelfID));
      
      setSelfID(mockSelfID);
      setIsConnected(true);
      console.log("Connected to Self Protocol", mockSelfID);
      
    } catch (err: any) {
      console.error("Error connecting to Self ID:", err);
      setError(err.message || "Failed to connect to Self ID");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    if (walletAddress) {
      localStorage.removeItem(`selfID_${walletAddress}`);
    }
    setSelfID(null);
    setIsConnected(false);
  };

  // Generate deep link for creating proofs
  const getProofLink = (proofType: string): string => {
    if (!selfApp || !walletAddress) return "#";
    
    try {
      // Configuration for different proof types
      const proofConfig = {
        age: {
          scope: "identity:age",
          fact: "over18",
          reason: "Age verification required"
        },
        identity: {
          scope: "identity:basic",
          fact: "identityVerified",
          reason: "Identity verification required"
        },
        address: {
          scope: "identity:address",
          fact: "addressVerified",
          reason: "Address verification required"
        },
        custom: {
          scope: "custom:verification",
          fact: "customVerified",
          reason: "Custom verification required"
        }
      };
      
      const config = proofConfig[proofType as keyof typeof proofConfig] || proofConfig.identity;
      
      // Generate universal link for deeplink into Self app
      const universalLink = getUniversalLink({
        appName: "KYC Harmony",
        scope: config.scope,
        fact: config.fact,
        reason: config.reason,
        callbackUrl: `${window.location.origin}/privacy?verified=true&type=${proofType}`,
      });
      
      return universalLink;
    } catch (error) {
      console.error("Error generating proof link:", error);
      return "#";
    }
  };

  // Verify proof data using our edge function
  const verifyProof = async (proofData: any): Promise<boolean> => {
    try {
      // Call our edge function to verify the proof
      const { data, error } = await supabase.functions.invoke("self-verify", {
        body: { proofData }
      });
      
      if (error) {
        console.error("Error calling verification edge function:", error);
        return false;
      }
      
      console.log("Verification result:", data);
      
      // Return the verification result
      return data?.valid || false;
    } catch (error) {
      console.error("Error verifying proof:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!walletAddress && isConnected) {
      disconnect();
    }
  }, [walletAddress, isConnected]);

  return (
    <SelfContext.Provider value={{ 
      selfID, 
      isConnected, 
      connect, 
      disconnect, 
      loading, 
      error, 
      getProofLink,
      verifyProof
    }}>
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
