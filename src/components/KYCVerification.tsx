
import React, { useState, useEffect } from 'react';
import { useAddress, useConnectionStatus } from "@thirdweb-dev/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LivenessDetection } from './LivenessDetection';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/contexts/NotificationsContext';

export function KYCVerification() {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const isConnected = connectionStatus === "connected";
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isWalletBound, setIsWalletBound] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        checkWalletBinding(user.id);
      }
    };
    checkUser();
  }, []);

  const checkWalletBinding = async (uid: string) => {
    const { data } = await supabase
      .from('wallet_accounts')
      .select('wallet_address')
      .eq('user_id', uid)
      .single();
    
    setIsWalletBound(!!data);
  };

  const bindWallet = async () => {
    if (!isConnected || !address || !userId) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('wallet_accounts')
        .insert([
          {
            user_id: userId,
            wallet_address: address,
          }
        ]);

      if (error) throw error;

      setIsWalletBound(true);
      toast({
        title: "Success",
        description: "Wallet successfully bound to your account",
      });

      // Add notification for successful wallet binding
      addNotification({
        title: "Wallet Bound Successfully",
        message: `Your wallet address ${address.substring(0, 6)}...${address.substring(address.length - 4)} is now bound to your account.`,
        type: "success",
        category: "kyc",
        action_url: "/account"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bind wallet. Please try again.",
        variant: "destructive"
      });

      // Add notification for failed wallet binding
      addNotification({
        title: "Wallet Binding Failed",
        message: "There was an error binding your wallet to your account. Please try again.",
        type: "error",
        category: "kyc",
        action_url: "/account"
      });
    }
  };

  const handleVerificationComplete = async () => {
    setVerificationComplete(true);
    toast({
      title: "Success",
      description: "Liveness verification completed successfully!",
    });

    // Add notification for successful liveness verification
    addNotification({
      title: "KYC Verification Completed",
      message: "Your liveness verification has been completed successfully. Your identity is being verified.",
      type: "success",
      category: "kyc",
      action_url: "/kyc"
    });
  };

  if (!userId) {
    return (
      <Card className="p-6">
        <p>Please sign in to continue with KYC verification.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">KYC Verification</h2>
        
        {!isWalletBound && (
          <div className="space-y-2">
            <p>First, bind your wallet to continue with verification:</p>
            <Button onClick={bindWallet} disabled={!isConnected}>
              Bind Wallet
            </Button>
          </div>
        )}

        {isWalletBound && !verificationComplete && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Liveness Capture</h3>
            <p>Please follow the instructions to complete the verification process:</p>
            <LivenessDetection 
              userId={userId}
              onComplete={handleVerificationComplete}
            />
          </div>
        )}

        {verificationComplete && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800">
              Verification completed successfully! Our team will review your submission.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
