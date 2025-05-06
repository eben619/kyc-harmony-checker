
import React from "react";
import { 
  ConnectWallet, 
  useAddress, 
  useDisconnect, 
  useConnectionStatus 
} from "@thirdweb-dev/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface WalletData {
  wallet_address: string | null;
  created_at: string | null;
}

interface WalletConnectionProps {
  walletData?: WalletData | null;
  onWalletUpdate?: () => Promise<void>;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ 
  walletData, 
  onWalletUpdate 
}) => {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const disconnect = useDisconnect();
  const { toast } = useToast();
  const isConnected = connectionStatus === "connected";

  const handleDisconnect = async () => {
    try {
      disconnect();
      if (onWalletUpdate) {
        await onWalletUpdate();
      }
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected successfully.",
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <p className="text-foreground text-sm">Connected to {address}</p>
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
    <ConnectWallet
      theme="dark"
      switchToActiveChain={true}
      welcomeScreen={{
        title: "Connect to Celo",
        subtitle: "Connect your wallet to access your account",
        img: {
          src: "https://celo.org/images/footer-logo-celo.svg",
          width: 150,
          height: 50,
        }
      }}
      modalTitle="Connect to Celo"
      modalSize="wide"
      onConnect={async () => {
        if (onWalletUpdate) {
          await onWalletUpdate();
        }
        toast({
          title: "Wallet connected",
          description: "Your wallet has been connected successfully.",
        });
      }}
    />
  );
};

export default WalletConnection;
