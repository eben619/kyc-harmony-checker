import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

const Account = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
          .single();

        if (error) {
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

  if (!user) {
    navigate("/login");
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
                <p className="text-muted-foreground font-mono">
                  {userData.wallet_address}
                </p>
              ) : (
                <p className="text-muted-foreground">No wallet connected</p>
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