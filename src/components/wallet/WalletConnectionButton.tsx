import { useState, useEffect } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, Fingerprint } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

interface WalletConnectionButtonProps {
  walletData: {
    wallet_address: string | null;
    created_at: string | null;
  } | null;
  onWalletUpdate: () => void;
}

export const WalletConnectionButton = ({ walletData, onWalletUpdate }: WalletConnectionButtonProps) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { toast } = useToast();
  const [connectingWallet, setConnectingWallet] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const connectWallet = async () => {
    try {
      setConnectingWallet(true);
      
      if (!isConnected) {
        connect();
        return;
      }

      if (!address) {
        toast({
          title: "Error",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }

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

  const verifyBiometrics = async () => {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: "required",
          timeout: 60000,
        },
      });

      if (credential) {
        toast({
          title: "Success",
          description: "Biometric verification successful!",
        });
      }
    } catch (error) {
      console.error('Error verifying biometrics:', error);
      toast({
        title: "Error",
        description: "Biometric verification failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isConnected && address && !walletData?.wallet_address) {
      connectWallet();
    }
  }, [isConnected, address]);

  if (!walletData?.wallet_address) {
    return (
      <Button
        onClick={connectWallet}
        disabled={connectingWallet}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Wallet className="h-4 w-4" />
        {connectingWallet ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground font-mono">
        {walletData.wallet_address}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="gap-2"
          onClick={verifyBiometrics}
        >
          <Fingerprint className="h-4 w-4" />
          Verify Biometrics
        </Button>
        <Button
          variant="destructive"
          onClick={() => disconnect()}
          className="gap-2"
        >
          <Wallet className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    </div>
  );
};