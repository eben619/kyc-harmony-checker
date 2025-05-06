
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSelf } from '@/contexts/SelfContext';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const ProofGenerator = () => {
  const { selfID, isConnected } = useSelf();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [proofType, setProofType] = useState('age');
  const [proofValue, setProofValue] = useState('');
  const [proofGenerated, setProofGenerated] = useState<any>(null);
  
  // Mock data options for proof generation
  const [selectedFields, setSelectedFields] = useState({
    name: false,
    age: true,
    country: false,
    email: false,
  });

  const handleGenerateProof = async () => {
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect to Self Protocol first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate proof generation with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock proof
      const mockProof = {
        id: `proof-${Math.random().toString(36).substr(2, 9)}`,
        type: proofType,
        value: proofType === 'age' ? 'over18' : proofValue,
        issuer: selfID.id,
        issuedAt: new Date().toISOString(),
        expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        fields: Object.entries(selectedFields)
          .filter(([_, selected]) => selected)
          .map(([field]) => field),
      };
      
      setProofGenerated(mockProof);
      
      toast({
        title: "Proof Generated",
        description: "Your proof has been successfully generated",
      });
    } catch (error) {
      console.error("Error generating proof:", error);
      toast({
        title: "Error",
        description: "Failed to generate proof",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Self Proof</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="proofType">Proof Type</Label>
          <select
            id="proofType"
            value={proofType}
            onChange={(e) => setProofType(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={loading || !isConnected}
          >
            <option value="age">Age Verification</option>
            <option value="identity">Identity Verification</option>
            <option value="address">Address Verification</option>
            <option value="custom">Custom Verification</option>
          </select>
        </div>
        
        {proofType === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="proofValue">Proof Value</Label>
            <Input
              id="proofValue"
              value={proofValue}
              onChange={(e) => setProofValue(e.target.value)}
              disabled={loading || !isConnected}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Fields to Include</Label>
          <div className="space-y-2">
            {Object.entries(selectedFields).map(([field, selected]) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={`field-${field}`}
                  checked={selected}
                  onCheckedChange={(checked) => 
                    setSelectedFields(prev => ({ ...prev, [field]: !!checked }))
                  }
                  disabled={loading || !isConnected}
                />
                <Label htmlFor={`field-${field}`} className="cursor-pointer">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {proofGenerated && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <h4 className="font-medium mb-1">Generated Proof</h4>
            <pre className="text-xs overflow-auto p-2 bg-background rounded-sm">
              {JSON.stringify(proofGenerated, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateProof}
          disabled={loading || !isConnected}
          className="w-full"
        >
          {loading ? "Generating..." : "Generate Proof"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProofGenerator;
