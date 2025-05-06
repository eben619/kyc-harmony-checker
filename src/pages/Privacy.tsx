
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SelfProviderWrapper } from '@/contexts/SelfContext';
import SelfConnect from '@/components/self/SelfConnect';
import ProofGenerator from '@/components/self/ProofGenerator';
import ProofVerifier from '@/components/self/ProofVerifier';

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Privacy & Proofs</h1>
      
      <SelfProviderWrapper>
        <div className="grid gap-6">
          <SelfConnect />
          
          <Tabs defaultValue="generate" className="w-full">
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
          
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">About Zero-Knowledge Proofs</h3>
            <p className="text-sm text-muted-foreground">
              Zero-knowledge proofs allow you to prove certain information without revealing the underlying data.
              For example, you can prove you're over 18 without revealing your actual birth date.
              Self Protocol makes this cryptographic technology accessible and easy to use.
            </p>
          </div>
        </div>
      </SelfProviderWrapper>
    </div>
  );
};

export default Privacy;
