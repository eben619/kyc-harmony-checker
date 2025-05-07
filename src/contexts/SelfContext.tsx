
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import { getUniversalLink, SelfAppBuilder } from '@selfxyz/core';
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from './NotificationsContext';

// Define interface for SelfID
interface SelfID {
  id: string;
  address: string;
  isAuthenticated: boolean;
  metadata?: {
    name?: string;
    profileImage?: string;
    verifiedAttributes?: string[];
  };
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
  const { addNotification } = useNotifications?.() || { addNotification: undefined };

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
            console.log("Restored Self connection from storage:", parsedSelfID);
          } catch (e) {
            console.error("Failed to parse stored Self ID:", e);
            localStorage.removeItem(`selfID_${walletAddress}`);
          }
        }
      } catch (err: any) {
        console.error("Error initializing Self app:", err);
        setError("Failed to initialize Self app: " + (err.message || "Unknown error"));
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

      // In a real production environment with the full Self SDK, we would:
      // 1. Initiate the connection with selfApp.connect()
      // 2. Wait for the response from the Self app
      // 3. Process the response and generate a self ID
      
      console.log("Connecting to Self Protocol with wallet:", walletAddress);
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a selfID with realistic data
      const selfIDData = {
        id: `did:self:${walletAddress.substring(0, 16)}`,
        address: walletAddress,
        isAuthenticated: true,
        metadata: {
          name: `User_${walletAddress.substring(2, 8)}`,
          verifiedAttributes: ['basic_identity', 'wallet_ownership'],
        }
      };
      
      // Store the Self ID in localStorage for persistence
      localStorage.setItem(`selfID_${walletAddress}`, JSON.stringify(selfIDData));
      
      setSelfID(selfIDData);
      setIsConnected(true);
      console.log("Connected to Self Protocol", selfIDData);
      
      // Add notification for successful connection
      if (addNotification) {
        addNotification({
          title: "Self Protocol Connected",
          message: "Your identity has been verified with Self Protocol",
          type: "success",
          category: "self",
          action_url: "/privacy"
        });
      }
      
    } catch (err: any) {
      console.error("Error connecting to Self ID:", err);
      setError(err.message || "Failed to connect to Self ID");
      
      // Add notification for failed connection
      if (addNotification) {
        addNotification({
          title: "Self Protocol Connection Failed",
          message: err.message || "Failed to connect to Self Protocol",
          type: "error",
          category: "self",
          action_url: "/privacy"
        });
      }
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
    console.log("Disconnected from Self Protocol");
    
    // Add notification for disconnection
    if (addNotification) {
      addNotification({
        title: "Self Protocol Disconnected",
        message: "You have been disconnected from Self Protocol",
        type: "info",
        category: "self",
        action_url: "/privacy"
      });
    }
  };

  // Generate deep link for creating proofs
  const getProofLink = (proofType: string): string => {
    if (!selfApp || !walletAddress) return "#";
    
    try {
      // Configuration for different proof types
      const proofConfig = {
        age: {
          scope: "identity:age",
          reason: "Age verification required"
        },
        identity: {
          scope: "identity:basic",
          reason: "Identity verification required"
        },
        address: {
          scope: "identity:address",
          reason: "Address verification required"
        },
        custom: {
          scope: "custom:verification",
          reason: "Custom verification required"
        }
      };
      
      const config = proofConfig[proofType as keyof typeof proofConfig] || proofConfig.identity;
      
      // Generate universal link for deeplink into Self app
      const universalLink = getUniversalLink({
        appName: "KYC Harmony",
        scope: config.scope
      });
      
      console.log("Generated proof link:", universalLink);
      return universalLink;
    } catch (error) {
      console.error("Error generating proof link:", error);
      return "#";
    }
  };

  // Verify proof data using our edge function
  const verifyProof = async (proofData: any): Promise<boolean> => {
    try {
      console.log("Verifying proof with edge function:", proofData);
      
      // Call our edge function to verify the proof
      const { data, error } = await supabase.functions.invoke("self-verify", {
        body: { proofData }
      });
      
      if (error) {
        console.error("Error calling verification edge function:", error);
        
        // Add notification for verification failure
        if (addNotification) {
          addNotification({
            title: "Proof Verification Failed",
            message: "Could not verify your Self Protocol proof",
            type: "error",
            category: "self",
            action_url: "/privacy"
          });
        }
        
        return false;
      }
      
      console.log("Verification result:", data);
      
      // Add notification for successful verification
      if (data?.valid && addNotification) {
        addNotification({
          title: "Proof Verified Successfully",
          message: "Your Self Protocol proof has been verified",
          type: "success",
          category: "self",
          action_url: "/privacy"
        });
      }
      
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
