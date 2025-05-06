
import React, { useState } from 'react';
import { useSelf } from '@/contexts/SelfContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const ProofVerifier = () => {
  const { selfID, isConnected } = useSelf();
  const { toast } = useToast();
  const [proofId, setProofId] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    message: string;
  } | null>(null);

  const handleVerifyProof = async () => {
    if (!selfID || !isConnected || !proofId) return;

    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      // Simulate proof verification with Self Protocol
      // In a real implementation, you would call the Self Protocol SDK here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification logic
      const isValid = proofId.startsWith('proof_');
      
      setVerificationResult({
        verified: isValid,
        message: isValid 
          ? "Proof verified successfully. The credential is valid." 
          : "Proof verification failed. Invalid proof format."
      });
      
      toast({
        title: isValid ? "Verification Successful" : "Verification Failed",
        description: isValid 
          ? "The proof was verified successfully"
          : "The proof could not be verified",
        variant: isValid ? "default" : "destructive",
      });
    } catch (error: any) {
      setVerificationResult({
        verified: false,
        message: `Verification error: ${error.message || "Unknown error"}`,
      });
      
      toast({
        title: "Verification Error",
        description: error.message || "An error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verify Proofs</CardTitle>
          <CardDescription>
            Verify zero-knowledge proofs without exposing sensitive data
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">Please connect to Self Protocol first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Proofs</CardTitle>
        <CardDescription>
          Enter a proof ID to verify its authenticity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proofId">Proof ID</Label>
            <Input
              id="proofId"
              placeholder="Enter proof ID (e.g., proof_age_1234567890)"
              value={proofId}
              onChange={(e) => setProofId(e.target.value)}
              disabled={isVerifying}
            />
          </div>

          {verificationResult && (
            <div className={`p-4 border rounded-md ${
              verificationResult.verified 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {verificationResult.verified ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h4 className={`text-sm font-medium ${
                    verificationResult.verified ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {verificationResult.verified ? 'Verification Successful' : 'Verification Failed'}
                  </h4>
                  <p className="text-sm mt-1">{verificationResult.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleVerifyProof} 
          disabled={!proofId || isVerifying}
          className="w-full"
        >
          {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isVerifying ? "Verifying..." : "Verify Proof"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProofVerifier;
