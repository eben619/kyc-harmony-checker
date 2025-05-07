
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSelf } from '@/contexts/SelfContext';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, FileJson, Loader2, ShieldCheck, XCircle } from 'lucide-react';

const ProofVerifier = () => {
  const { isConnected, verifyProof } = useSelf();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [proofInput, setProofInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    details?: any;
  } | null>(null);

  const handleVerifyProof = async () => {
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect to Self Protocol first",
        variant: "destructive",
      });
      return;
    }

    if (!proofInput.trim()) {
      toast({
        title: "Missing proof",
        description: "Please enter a proof to verify",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Parse the input proof
      const parsedProof = JSON.parse(proofInput);
      
      // Use the verifyProof method from context to call our edge function
      const isValid = await verifyProof(parsedProof);
      
      setVerificationResult({
        valid: isValid,
        details: isValid ? {
          ...parsedProof,
          verifiedAt: new Date().toISOString()
        } : null,
      });
      
      toast({
        title: isValid ? "Proof Valid" : "Proof Invalid",
        description: isValid 
          ? "The proof has been successfully verified with Self Protocol" 
          : "The proof is invalid or tampered with",
        variant: isValid ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error verifying proof:", error);
      setVerificationResult({
        valid: false,
      });
      toast({
        title: "Invalid Proof Format",
        description: "The proof format is invalid or malformed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sample proof for easy testing
  const insertSampleProof = () => {
    const sampleProof = {
      id: "proof-a1b2c3d4",
      type: "identity",
      issuer: "did:self:0x1234567890abcdef",
      issuedAt: new Date().toISOString(),
      attributes: {
        documentType: "passport",
        name: "verified",
        nationality: "verified"
      }
    };
    setProofInput(JSON.stringify(sampleProof, null, 2));
  };

  return (
    <Card className="border-2 border-primary/10 shadow-md">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Verify Self Proof
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <label htmlFor="proofInput" className="block text-sm font-medium">
            Proof Data
          </label>
          <Textarea
            id="proofInput"
            value={proofInput}
            onChange={(e) => setProofInput(e.target.value)}
            rows={8}
            placeholder="Paste the proof JSON here..."
            disabled={loading}
            className="font-mono text-sm"
          />
          <div className="text-right">
            <Button 
              variant="outline"
              size="sm"
              type="button"
              onClick={insertSampleProof}
              className="text-xs"
              disabled={loading}
            >
              Insert Sample
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 items-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
          <FileJson className="h-4 w-4 shrink-0" />
          <p>
            Enter a proof JSON received from a Self Protocol application to verify its authenticity and validity.
            The verification uses SelfVerificationRoot and CircuitAttributeHandler libraries.
          </p>
        </div>
        
        {verificationResult !== null && (
          <div className={`p-4 rounded-md ${
            verificationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {verificationResult.valid ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-700">Proof Verified Successfully</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-700">Proof Verification Failed</span>
                </>
              )}
            </div>
            
            {verificationResult.valid && verificationResult.details && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-1">Proof Details</h4>
                <pre className="text-xs p-2 bg-background rounded-sm overflow-auto max-h-48">
                  {JSON.stringify(verificationResult.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleVerifyProof}
          disabled={loading || !isConnected || !proofInput}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying with Self Protocol...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" /> Verify Proof
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProofVerifier;
