
import React, { useEffect } from "react";
import { useAddress, useDisconnect, useConnect, metamaskWallet } from "@thirdweb-dev/react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface WalletData {
  wallet_address: string | null;
  created_at: string | null;
}

interface WalletConnectionProps {
  walletData?: WalletData | null;
  onWalletUpdate?: () => Promise<void>;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onWalletUpdate }) => {
  const address = useAddress();
  const disconnect = useDisconnect();
  const connect = useConnect();
  
  const metamaskConfig = metamaskWallet();
  
  const handleConnect = async () => {
    try {
      await connect(metamaskConfig);
      if (onWalletUpdate) {
        await onWalletUpdate();
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      disconnect();
      if (onWalletUpdate) {
        await onWalletUpdate();
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  useEffect(() => {
    if (address && onWalletUpdate) {
      onWalletUpdate();
    }
  }, [address, onWalletUpdate]);

  if (address) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <p className="text-foreground">Connected to {address}</p>
        <Button 
          variant="destructive"
          onClick={handleDisconnect}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect}
      className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
};

export default WalletConnection;
