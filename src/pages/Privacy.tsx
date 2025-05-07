
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SelfProviderWrapper } from '@/contexts/SelfContext';
import SelfConnect from '@/components/self/SelfConnect';
import ProofGenerator from '@/components/self/ProofGenerator';
import ProofVerifier from '@/components/self/ProofVerifier';
import { useLocation } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Lock, ShieldCheck } from 'lucide-react';

const Privacy = () => {
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<{
    verified: boolean;
    type: string | null;
  } | null>(null);

  // Check for callback parameters from Self app
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get('verified') === 'true';
    const type = params.get('type');
    
    if (verified) {
      setVerificationStatus({ verified, type });
      
      // Clear the URL parameters after processing
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center">
            <Lock className="mr-2 h-5 w-5" />
            Self Protocol Identity & Proofs
          </h1>
          <p className="text-muted-foreground">
            Manage your decentralized identity and create zero-knowledge proofs with Self Protocol
          </p>
        </div>
        
        <SelfProviderWrapper>
          <div className="grid gap-6">
            {verificationStatus?.verified && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Verification Complete</AlertTitle>
                <AlertDescription>
                  Your {verificationStatus.type} proof has been successfully created with Self Protocol.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid md:grid-cols-[350px_1fr] gap-6">
              <div>
                <SelfConnect />
              </div>
              
              <div>
                <Tabs defaultValue="generate" className="w-full">
                  <div className="mb-4 bg-muted/30 p-4 rounded-lg">
                    <h2 className="text-lg font-medium mb-2 flex items-center">
                      <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                      Self Protocol Zero-Knowledge Proofs
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Zero-knowledge proofs allow you to prove certain information without revealing the underlying data.
                      The Self Protocol implementation uses SelfCircuitLibrary, CircuitAttributeHandler, and VcAndDiscloseCircuitVerifier
                      to create cryptographic proofs that protect your privacy.
                    </p>
                  </div>
                  
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="generate">Generate Proofs</TabsTrigger>
                    <TabsTrigger value="verify">Verify Proofs</TabsTrigger>
                  </TabsList>
                  <TabsContent value="generate" className="mt-4">
                    <ProofGenerator />
                  </TabsContent>
                  <TabsContent value="verify" className="mt-4">
                    <ProofVerifier />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </SelfProviderWrapper>
      </div>
    </div>
  );
};

export default Privacy;
