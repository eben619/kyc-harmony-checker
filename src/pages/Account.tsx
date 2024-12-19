import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserProfile from "@/components/user/UserProfile";
import WalletConnection from "@/components/wallet/WalletConnection";

const Account = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<{
    wallet_address: string | null;
    created_at: string | null;
  } | null>(null);

  const fetchWalletAccount = async () => {
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

      setWalletData(walletData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchWalletAccount();
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const VerificationStatus = ({ completed, label, path }: { completed: boolean; label: string; path: string }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-2">
        {completed ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {!completed && (
        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => navigate(path)}>
          Complete
          <ArrowRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <UserProfile user={user} />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Email</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Wallet Address</h3>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : (
                <WalletConnection 
                  walletData={walletData} 
                  onWalletUpdate={fetchWalletAccount}
                />
              )}
            </div>

            {walletData?.created_at && (
              <div>
                <h3 className="font-medium mb-2">Wallet Connected On</h3>
                <p className="text-muted-foreground">
                  {new Date(walletData.created_at).toLocaleDateString()}
                </p>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-3">Verification Status</h3>
              <div className="space-y-2">
                <VerificationStatus 
                  completed={false} 
                  label="KYC Verification" 
                  path="/kyc"
                />
                <VerificationStatus 
                  completed={false} 
                  label="Tax Information" 
                  path="/tax"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;