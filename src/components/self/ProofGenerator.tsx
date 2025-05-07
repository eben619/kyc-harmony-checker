
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSelf } from '@/contexts/SelfContext';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, FileDigit, Loader2, ShieldAlert } from 'lucide-react';

type ProofType = 'age' | 'identity' | 'address' | 'custom';

interface ProofField {
  name: string;
  description: string;
  defaultEnabled: boolean;
}

const ProofGenerator = () => {
  const { selfID, isConnected, getProofLink } = useSelf();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [proofType, setProofType] = useState<ProofType>('age');
  const [proofGenerated, setProofGenerated] = useState<any>(null);
  
  // Field configurations for each proof type
  const proofTypeFields: Record<ProofType, ProofField[]> = {
    age: [
      { name: 'age', description: 'Age verification (over 18)', defaultEnabled: true },
      { name: 'birthYear', description: 'Birth year range', defaultEnabled: false },
    ],
    identity: [
      { name: 'name', description: 'Full name', defaultEnabled: false },
      { name: 'documentType', description: 'Identification document type', defaultEnabled: true },
      { name: 'nationality', description: 'Country of nationality', defaultEnabled: false },
    ],
    address: [
      { name: 'country', description: 'Country', defaultEnabled: true },
      { name: 'city', description: 'City', defaultEnabled: false },
      { name: 'postalCode', description: 'Postal code', defaultEnabled: false },
    ],
    custom: [
      { name: 'customField1', description: 'Custom field 1', defaultEnabled: true },
      { name: 'customField2', description: 'Custom field 2', defaultEnabled: false },
    ],
  };

  const [selectedFields, setSelectedFields] = useState(() => {
    // Initialize selected fields based on default values for age proof type
    return proofTypeFields.age.reduce((acc, field) => {
      acc[field.name] = field.defaultEnabled;
      return acc;
    }, {} as Record<string, boolean>);
  });

  // Update selected fields when proof type changes
  const handleProofTypeChange = (newType: ProofType) => {
    setProofType(newType);
    // Reset selected fields based on the new proof type
    const newSelectedFields = proofTypeFields[newType].reduce((acc, field) => {
      acc[field.name] = field.defaultEnabled;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedFields(newSelectedFields);
  };

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
      // Generate deep link URL for the Self app
      const proofLink = getProofLink(proofType);
      
      // Open the deep link in a new tab
      window.open(proofLink, '_blank');
      
      // In a real implementation, we'd wait for the callback from the Self app
      // For now, simulate the proof generation with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock proof to display in the UI
      const selectedFieldNames = Object.entries(selectedFields)
        .filter(([_, selected]) => selected)
        .map(([field]) => field);
        
      const mockProof = {
        id: `proof-${Math.random().toString(36).substring(2, 9)}`,
        type: proofType,
        value: proofType === 'age' ? 'over18' : 'verified',
        issuer: selfID?.id,
        issuedAt: new Date().toISOString(),
        expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        fields: selectedFieldNames,
        attributes: selectedFieldNames.reduce((acc, field) => {
          // Generate mock attribute values based on field name
          if (field === 'age') acc[field] = 'over18';
          else if (field === 'birthYear') acc[field] = '1980-2000';
          else if (field === 'documentType') acc[field] = 'passport';
          else acc[field] = `verified-${field}`;
          return acc;
        }, {} as Record<string, string>),
      };
      
      setProofGenerated(mockProof);
      
      toast({
        title: "Deep Link Generated",
        description: "Check your browser or Self app to continue verification",
      });
    } catch (error) {
      console.error("Error generating proof:", error);
      toast({
        title: "Error",
        description: "Failed to generate proof link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Generate Self Proof
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="proofType">Proof Type</Label>
          <select
            id="proofType"
            value={proofType}
            onChange={(e) => handleProofTypeChange(e.target.value as ProofType)}
            className="w-full p-2 border rounded-md"
            disabled={loading || !isConnected}
          >
            <option value="age">Age Verification</option>
            <option value="identity">Identity Verification</option>
            <option value="address">Address Verification</option>
            <option value="custom">Custom Verification</option>
          </select>
        </div>
        
        <div className="bg-muted/50 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2">What you're verifying:</h4>
          {proofType === 'age' && (
            <p className="text-sm text-muted-foreground">
              Age verification confirms you are above 18 without revealing your exact birthdate.
              Uses the SelfCircuitLibrary for zero-knowledge proofs.
            </p>
          )}
          {proofType === 'identity' && (
            <p className="text-sm text-muted-foreground">
              Identity verification confirms your personal details match a government ID.
              Utilizes the CircuitAttributeHandler library for secure verification.
            </p>
          )}
          {proofType === 'address' && (
            <p className="text-sm text-muted-foreground">
              Address verification confirms your current residence without revealing the exact address.
              Implementation uses the VcAndDiscloseCircuitVerifier for secure verification.
            </p>
          )}
          {proofType === 'custom' && (
            <p className="text-sm text-muted-foreground">
              Custom verification allows for specific attributes to be verified.
              Uses the general SelfVerificationRoot implementation.
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Fields to Include</Label>
          <div className="grid grid-cols-1 gap-2">
            {proofTypeFields[proofType].map((field) => (
              <div key={field.name} className="flex items-center space-x-2 p-2 rounded bg-background">
                <Checkbox
                  id={`field-${field.name}`}
                  checked={selectedFields[field.name] || false}
                  onCheckedChange={(checked) => 
                    setSelectedFields(prev => ({ ...prev, [field.name]: !!checked }))
                  }
                  disabled={loading || !isConnected}
                />
                <div>
                  <Label htmlFor={`field-${field.name}`} className="cursor-pointer text-sm">
                    {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                  </Label>
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {proofGenerated && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <FileDigit className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Generated Proof</h4>
            </div>
            <pre className="text-xs overflow-auto p-2 bg-background rounded-sm max-h-48">
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
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" /> Generate Proof with Self App
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProofGenerator;
