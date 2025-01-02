import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { Button } from "@/components/ui/button";

const WalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex flex-col gap-4 items-center">
        <p className="text-foreground">Connected to {address}</p>
        <Button 
          variant="destructive"
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => connect()}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    >
      Connect Wallet
    </Button>
  );
};

export default WalletConnection;