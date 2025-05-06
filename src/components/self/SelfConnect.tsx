
import React from 'react';
import { useSelf } from '@/contexts/SelfContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SelfConnect = () => {
  const { selfID, isConnected, connect, disconnect, loading, error } = useSelf();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: "Connected to Self Protocol",
        description: "You are now connected to Self Protocol",
      });
    } catch (err: any) {
      toast({
        title: "Connection Failed",
        description: err.message || "Failed to connect to Self Protocol",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Disconnected",
      description: "You have disconnected from Self Protocol",
    });
  };

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Self Protocol Connection</h3>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center text-green-500 gap-1">
              <CheckCircle2 size={16} />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-red-500 gap-1">
              <XCircle size={16} />
              <span className="text-sm">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive p-2 bg-destructive/10 rounded">
          Error: {error}
        </div>
      )}

      <div>
        {!isConnected ? (
          <Button onClick={handleConnect} disabled={loading} className="w-full">
            {loading ? "Connecting..." : "Connect to Self Protocol"}
          </Button>
        ) : (
          <Button onClick={handleDisconnect} variant="outline" className="w-full">
            Disconnect
          </Button>
        )}
      </div>
    </div>
  );
};

export default SelfConnect;
