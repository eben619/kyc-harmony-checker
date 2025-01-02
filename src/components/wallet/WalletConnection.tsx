import { useEffect } from "react";
import { WagmiConfig } from 'wagmi';
import { useToast } from "@/components/ui/use-toast";
import { wagmiConfig, projectId } from './web3Config';
import { WalletConnectionButton } from './WalletConnectionButton';

interface WalletConnectionProps {
  walletData: {
    wallet_address: string | null;
    created_at: string | null;
  } | null;
  onWalletUpdate: () => void;
}

const WalletConnection = (props: WalletConnectionProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId) {
      toast({
        title: "Configuration Error",
        description: "WalletConnect is not properly configured. Please try again later.",
        variant: "destructive",
      });
    }
  }, []);

  if (!projectId) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Wallet connection is currently unavailable.</p>
      </div>
    );
  }

  return (
    <WagmiConfig config={wagmiConfig as any}>
      <WalletConnectionButton {...props} />
    </WagmiConfig>
  );
};

export default WalletConnection;