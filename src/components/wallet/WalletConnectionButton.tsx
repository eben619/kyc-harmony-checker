
import React from "react";
import { useAddress, useConnectionStatus } from "@thirdweb-dev/react";
import WalletConnection from "./WalletConnection";

interface WalletConnectionButtonProps {
  walletData?: {
    wallet_address: string | null;
    created_at: string | null;
  } | null;
  onWalletUpdate?: () => Promise<void>;
}

const WalletConnectionButton: React.FC<WalletConnectionButtonProps> = ({
  walletData,
  onWalletUpdate,
}) => {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const isConnected = connectionStatus === "connected";

  return (
    <div className="flex justify-center">
      <WalletConnection 
        walletData={walletData}
        onWalletUpdate={onWalletUpdate}
      />
    </div>
  );
};

export default WalletConnectionButton;
