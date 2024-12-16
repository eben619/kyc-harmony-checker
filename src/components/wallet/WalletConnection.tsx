import { useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, Fingerprint } from "lucide-react";

interface WalletConnectionProps {
  walletData: {
    wallet_address: string | null;
    created_at: string | null;
  } | null;
  onWalletUpdate: () => void;
}

const WalletConnection = ({ walletData, onWalletUpdate }: WalletConnectionProps) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { toast } = useToast();
  const [connectingWallet, setConnectingWallet] = useState(false);

  const connectWallet = async () => {
    try {
      setConnectingWallet(true);

      if (!window.ethereum) {
        toast({
          title: "MetaMask Required",
          description: "Please install MetaMask to connect your wallet",
          variant: "destructive",
        });
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const walletAddress = accounts[0];

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32),
        rp: {
          name: "Universal KYC",
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(16),
          name: user?.email || '',
          displayName: user?.email || '',
        },
        pubKeyCredParams: [{alg: -7, type: "public-key"}],
        authenticatorSelection: {
          authenticatorAttachment: "platform" as AuthenticatorAttachment,
          userVerification: "required",
        },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      const biometricHash = btoa(JSON.stringify(credential));

      const { error } = await supabase
        .from('wallet_accounts')
        .upsert({
          user_id: user?.id,
          wallet_address: walletAddress,
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
        <p className="text-muted-foreground">No wallet connected</p>
        <Button
          onClick={connectWallet}
          disabled={connectingWallet}
          className="gap-2"
        >
          <Wallet className="h-4 w-4" />
          {connectingWallet ? "Connecting..." : "Connect Wallet"}
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

export default WalletConnection;