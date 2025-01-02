import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet } from 'wagmi/chains';

const metadata = {
  name: 'Universal KYC',
  description: 'Universal KYC Wallet Connection',
  url: window.location.origin,
  icons: [`${window.location.origin}/icon.png`]
};

const chains = [mainnet];
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

export const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId: projectId || '', 
  metadata,
});

if (projectId) {
  createWeb3Modal({ 
    wagmiConfig, 
    projectId, 
    chains,
    defaultChain: mainnet,
    themeMode: 'light',
    themeVariables: {
      '--w3m-z-index': 1000
    }
  });
}

export { projectId, chains };