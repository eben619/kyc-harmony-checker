import React from "react";
import { useAccount } from "wagmi";
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
  const { isConnected } = useAccount();

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