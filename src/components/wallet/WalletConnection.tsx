import { useState, useEffect } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, Fingerprint } from "lucide-react";
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiConfig, useAccount, useDisconnect } from 'wagmi';
import { mainnet } from 'wagmi/chains';

// Initialize WalletConnect with static values
const metadata = {
  name: 'Universal KYC',
  description: 'Universal KYC Wallet Connection',
  url: 'https://universalkyc.com', // Static URL as string
  icons: ['https://universalkyc.com/icon.png'] // Static icon URL as string
};

const chains = [mainnet];
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "b2f135e64d641e7415e333d1a66828e9";

const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata
}) as any;

// Create Web3Modal instance
createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  defaultChain: mainnet,
  themeMode: 'light',
  themeVariables: {
    '--w3m-z-index': 1000
  }
});

interface WalletConnectionProps {
  walletData: {
    wallet_address: string | null;
    created_at: string | null;
  } | null;
  onWalletUpdate: () => void;
}

const WalletConnectionButton = ({ walletData, onWalletUpdate }: WalletConnectionProps) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { toast } = useToast();
  const [connectingWallet, setConnectingWallet] = useState(false);
  const { address } = useAccount();
  const { disconnectAsync } = useDisconnect();

  const connectWallet = async () => {
    try {
      setConnectingWallet(true);

      if (!address) {
        toast({
          title: "Error",
          description: "Please connect your wallet first using WalletConnect",
          variant: "destructive",
        });
        return;
      }

      // Create static challenge array
      const challenge = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        challenge[i] = Math.floor(Math.random() * 256);
      }

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Universal KYC",
          id: window.location.hostname, // Use current hostname instead of hardcoded value
        },
        user: {
          id: new Uint8Array(16),
          name: user?.email || '',
          displayName: user?.email || '',
        },
        pubKeyCredParams: [{alg: -7, type: "public-key"}],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      const biometricHash = btoa(String(credential));

      const { error } = await supabase
        .from('wallet_accounts')
        .upsert({
          user_id: user?.id,
          wallet_address: address,
          biometric_hash: biometricHash,
        });

      if (error) throw error;

      onWalletUpdate();

      toast({
        title: "Success",
        description: "Wallet connected successfully!",
      });

    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Error",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnectingWallet(false);
    }
  };

  if (!walletData?.wallet_address) {
    return (
      <div className="space-y-2">
        <w3m-button />
        <Button
          onClick={connectWallet}
          disabled={connectingWallet || !address}
          className="gap-2"
        >
          <Wallet className="h-4 w-4" />
          {connectingWallet ? "Connecting..." : "Bind Wallet"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="text-muted-foreground font-mono mb-2">
        {walletData.wallet_address}
      </p>
      <Button
        variant="outline"
        className="gap-2"
        onClick={connectWallet}
        disabled={connectingWallet}
      >
        <Fingerprint className="h-4 w-4" />
        Verify Biometrics
      </Button>
    </>
  );
};

// Wrap the component with WagmiConfig
const WalletConnection = (props: WalletConnectionProps) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <WalletConnectionButton {...props} />
    </WagmiConfig>
  );
};

export default WalletConnection;