
import React, { useState } from 'react';
import { useSelf } from '@/contexts/SelfContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ProofData {
  type: string;
  title: string;
  description: string;
  available: boolean;
}

const AVAILABLE_PROOFS: ProofData[] = [
  {
    type: 'identity',
    title: 'Identity Verification',
    description: 'Prove your identity without revealing personal details',
    available: true,
  },
  {
    type: 'age',
    title: 'Age Verification',
    description: 'Prove you are above a certain age without revealing your birthdate',
    available: true,
  },
  {
    type: 'residency',
    title: 'Residency Verification',
    description: 'Prove your country of residence without revealing your address',
    available: true,
  },
  {
    type: 'income',
    title: 'Income Verification',
    description: 'Prove income level without revealing exact amounts',
    available: false,
  },
];

const ProofGenerator = () => {
  const { selfID, isConnected } = useSelf();
  const { toast } = useToast();
  const [selectedProofs, setSelectedProofs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedProofs, setGeneratedProofs] = useState<Record<string, string>>({});

  const handleSelectProof = (proofType: string) => {
    setSelectedProofs(prev => 
      prev.includes(proofType)
        ? prev.filter(p => p !== proofType)
        : [...prev, proofType]
    );
  };

  const handleGenerateProofs = async () => {
    if (!selfID || !isConnected || selectedProofs.length === 0) return;

    setIsGenerating(true);
    try {
      // Simulate proof generation with Self Protocol
      // In a real implementation, you would call the Self Protocol SDK here
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockProofs: Record<string, string> = {};
      selectedProofs.forEach(proofType => {
        mockProofs[proofType] = `proof_${proofType}_${Date.now()}`;
      });

      setGeneratedProofs(mockProofs);
      toast({
        title: "Proofs Generated",
        description: `Successfully generated ${selectedProofs.length} proof(s)`,
      });
    } catch (error: any) {
      toast({
        title: "Error Generating Proofs",
        description: error.message || "Failed to generate proofs",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generate Proofs</CardTitle>
          <CardDescription>
            Connect to Self Protocol to generate zero-knowledge proofs
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
        <CardTitle>Generate Proofs</CardTitle>
        <CardDescription>
          Select the information you want to prove without revealing sensitive data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {AVAILABLE_PROOFS.map((proof) => (
            <div key={proof.type} className="flex items-center space-x-2">
              <Checkbox 
                id={`proof-${proof.type}`}
                checked={selectedProofs.includes(proof.type)}
                onCheckedChange={() => proof.available && handleSelectProof(proof.type)}
                disabled={!proof.available || isGenerating}
              />
              <div className="grid gap-1.5 leading-none">
                <Label 
                  htmlFor={`proof-${proof.type}`}
                  className={!proof.available ? "text-muted-foreground" : ""}
                >
                  {proof.title}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {proof.description}
                  {!proof.available && " (Coming soon)"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(generatedProofs).length > 0 && (
          <div className="mt-6 p-4 border rounded-md bg-muted/50">
            <h4 className="text-sm font-medium mb-2">Generated Proofs</h4>
            <ul className="space-y-2">
              {Object.entries(generatedProofs).map(([type, proofId]) => (
                <li key={type} className="text-sm">
                  <span className="font-medium">{AVAILABLE_PROOFS.find(p => p.type === type)?.title}:</span>{' '}
                  <code className="px-1 py-0.5 bg-muted rounded text-xs">{proofId}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateProofs} 
          disabled={selectedProofs.length === 0 || isGenerating}
          className="w-full"
        >
          {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isGenerating ? "Generating Proofs..." : "Generate Selected Proofs"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProofGenerator;
