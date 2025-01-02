import { WagmiConfig } from 'wagmi';
import { config } from './web3Config';
import { WalletConnectionButton } from './WalletConnectionButton';

interface WalletConnectionProps {
  walletData: {
    wallet_address: string | null;
    created_at: string | null;
  } | null;
  onWalletUpdate: () => void;
}

const WalletConnection = (props: WalletConnectionProps) => {
  return (
    <WagmiConfig config={config}>
      <WalletConnectionButton {...props} />
    </WagmiConfig>
  );
};

export default WalletConnection;