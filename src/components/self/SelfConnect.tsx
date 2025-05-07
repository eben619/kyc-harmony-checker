
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSelf } from '@/contexts/SelfContext';
import { useAddress } from '@thirdweb-dev/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Check, ExternalLink, QrCode, ShieldCheck, XCircle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

const SelfConnect = () => {
  const { selfID, isConnected, connect, disconnect, loading, error } = useSelf();
  const address = useAddress();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: "Connected to Self Protocol",
        description: "Your identity has been verified successfully.",
      });
    } catch (err) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to Self Protocol. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from Self Protocol.",
    });
  };

  return (
    <Card className="border-2 border-primary/10 shadow-md">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Self Protocol Identity</span>
          </div>
          {isConnected && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 bg-green-50 rounded-full">
                    <QrCode className="h-5 w-5 text-green-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Self Protocol Identity Verified</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Status:</span>
            <div className="flex items-center">
              {isConnected ? (
                <span className="flex items-center text-green-500">
                  <Check className="w-4 h-4 mr-1" /> Connected
                </span>
              ) : (
                <span className="flex items-center text-gray-400">
                  <XCircle className="w-4 h-4 mr-1" /> Disconnected
                </span>
              )}
            </div>
          </div>
          
          {selfID && (
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center justify-between">
                <span className="font-medium">DID:</span>
                <span className="font-mono text-xs truncate max-w-[220px]">{selfID.id}</span>
              </div>
              {selfID.metadata?.name && (
                <div className="flex items-center justify-between mt-2">
                  <span className="font-medium">Name:</span>
                  <span>{selfID.metadata.name}</span>
                </div>
              )}
              {selfID.metadata?.verifiedAttributes && (
                <div className="mt-2">
                  <span className="font-medium block mb-1">Verified:</span>
                  <div className="flex flex-wrap gap-1">
                    {selfID.metadata.verifiedAttributes.map((attr, idx) => (
                      <span 
                        key={idx} 
                        className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {attr.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-3">
                Your decentralized identity is securely verified using SelfCircuitLibrary
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
              Error: {error}
            </div>
          )}
        </div>
        
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm text-muted-foreground">
            Self Protocol provides decentralized identity verification and zero-knowledge proofs for privacy. 
            The implementation uses the SelfVerificationRoot and CircuitAttributeHandler libraries.
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20">
        {!isConnected ? (
          <Button 
            onClick={handleConnect} 
            disabled={!address || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect Self Protocol
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="destructive" 
            onClick={handleDisconnect}
            className="w-full"
          >
            Disconnect Self Protocol
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SelfConnect;
