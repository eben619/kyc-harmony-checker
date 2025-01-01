import { useState, useEffect } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, Fingerprint } from "lucide-react";
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiConfig, useAccount, useDisconnect, useConnect } from 'wagmi';
import { mainnet } from 'wagmi/chains';

const metadata = {
  name: 'Universal KYC',
  description: 'Universal KYC Wallet Connection',
  url: window.location.origin,
  icons: [`${window.location.origin}/icon.png`]
};

const chains = [mainnet];
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  console.error('WalletConnect Project ID is not defined in environment variables');
}

const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId: projectId || '', 
  metadata,
});

// Initialize Web3Modal
createWeb3Modal({ 
  wagmiConfig, 
  projectId: projectId || '', 
  chains,
  defaultChain: mainnet,
  themeMode: 'light',
  themeVariables: {
    '--w3m-z-index': 1000 // Changed from string to number
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
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { connectAsync } = useConnect();

  const connectWallet = async () => {
    try {
      setConnectingWallet(true);
      console.log("Starting wallet connection...");

      if (!isConnected || !address) {
        toast({
          title: "Error",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }

      console.log("Wallet connected:", address);

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Universal KYC",
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(16),
          name: user?.email || 'anonymous',
          displayName: user?.email || 'Anonymous User',
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

      const credentialData = credential ? {
        id: credential.id,
        type: credential.type,
        timestamp: Date.now()
      } : null;

      const biometricHash = btoa(JSON.stringify(credentialData));

      const { error } = await supabase
        .from('wallet_accounts')
        .upsert({
          user_id: user?.id,
          wallet_address: address,
          biometric_hash: biometricHash,
        });

      if (error) throw error;

      onWalletUpdate();
      console.log("Wallet connected successfully:", address);

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

  useEffect(() => {
    if (isConnected && address && !walletData?.wallet_address) {
      connectWallet();
    }
  }, [isConnected, address]);

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
        disabled={connectingWallet || !isConnected}
      >
        <Fingerprint className="h-4 w-4" />
        Verify Biometrics
      </Button>
    </>
  );
};

// Wrap the WagmiConfig with proper typing
const WalletConnection = (props: WalletConnectionProps) => {
  return (
    <WagmiConfig config={wagmiConfig as any}>
      <WalletConnectionButton {...props} />
    </WagmiConfig>
  );
};

export default WalletConnection;