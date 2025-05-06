
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSelf } from '@/contexts/SelfContext';
import { useAddress } from '@thirdweb-dev/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Check, XCircle } from 'lucide-react';

const SelfConnect = () => {
  const { selfID, isConnected, connect, disconnect, loading, error } = useSelf();
  const address = useAddress();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Self Protocol Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <div>
              <span className="font-medium">DID:</span> <span className="font-mono text-xs">{selfID.id}</span>
            </div>
          )}
          
          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {!isConnected ? (
          <Button 
            onClick={connect} 
            disabled={!address || loading}
            className="w-full"
          >
            {loading ? "Connecting..." : "Connect Self Protocol"}
          </Button>
        ) : (
          <Button 
            variant="destructive" 
            onClick={disconnect}
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
