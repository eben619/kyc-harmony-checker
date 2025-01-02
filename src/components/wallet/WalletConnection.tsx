import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { Button } from "@/components/ui/button";

interface WalletData {
  wallet_address: string | null;
  created_at: string | null;
}

interface WalletConnectionProps {
  walletData?: WalletData | null;
  onWalletUpdate?: () => Promise<void>;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ walletData, onWalletUpdate }) => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const handleConnect = async () => {
    try {
      await connect();
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

  if (isConnected && address) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <p className="text-foreground">Connected to {address}</p>
        <Button 
          variant="destructive"
          onClick={handleDisconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    >
      Connect Wallet
    </Button>
  );
};

export default WalletConnection;