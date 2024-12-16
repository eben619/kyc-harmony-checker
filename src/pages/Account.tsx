import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Wallet, Fingerprint } from "lucide-react";

const Account = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [userData, setUserData] = useState<{
    email: string | undefined;
    wallet_address: string | null;
    created_at: string | null;
  }>({
    email: user?.email,
    wallet_address: null,
    created_at: null,
  });

  useEffect(() => {
    const getWalletAccount = async () => {
      try {
        setLoading(true);
        if (!user) return;

        const { data: walletData, error } = await supabase
          .from("wallet_accounts")
          .select("wallet_address, created_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching wallet account:", error);
          toast({
            title: "Error",
            description: "Failed to fetch wallet information",
            variant: "destructive",
          });
          return;
        }

        setUserData((prev) => ({
          ...prev,
          wallet_address: walletData?.wallet_address || null,
          created_at: walletData?.created_at || null,
        }));
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    getWalletAccount();
  }, [user, supabase, toast]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const connectWallet = async () => {
    try {
      setConnectingWallet(true);

      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast({
          title: "MetaMask Required",
          description: "Please install MetaMask to connect your wallet",
          variant: "destructive",
        });
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const walletAddress = accounts[0];

      // Get biometric data using WebAuthn
      const publicKeyCredentialCreationOptions = {
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
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      // Convert credential to string for storage
      const biometricHash = btoa(JSON.stringify(credential));

      // Store wallet address and biometric hash in Supabase
      const { error } = await supabase
        .from('wallet_accounts')
        .upsert({
          user_id: user?.id,
          wallet_address: walletAddress,
          biometric_hash: biometricHash,
        });

      if (error) throw error;

      // Update local state
      setUserData(prev => ({
        ...prev,
        wallet_address: walletAddress,
        created_at: new Date().toISOString(),
      }));

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

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{user?.email}</h2>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(user?.created_at || "").toLocaleDateString()}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Email</h3>
              <p className="text-muted-foreground">{userData.email}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Wallet Address</h3>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : userData.wallet_address ? (
                <>
                  <p className="text-muted-foreground font-mono mb-2">
                    {userData.wallet_address}
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
              ) : (
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
              )}
            </div>

            {userData.created_at && (
              <div>
                <h3 className="font-medium mb-2">Wallet Connected On</h3>
                <p className="text-muted-foreground">
                  {new Date(userData.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;