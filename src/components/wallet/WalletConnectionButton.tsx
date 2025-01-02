import React from "react";
import { useAccount } from "wagmi";
import WalletConnection from "./WalletConnection";

const WalletConnectionButton = () => {
  const { isConnected } = useAccount();

  return (
    <div className="flex justify-center">
      <WalletConnection />
    </div>
  );
};

export default WalletConnectionButton;