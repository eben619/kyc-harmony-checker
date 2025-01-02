import { defaultWagmiConfig } from "@web3modal/wagmi/react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { mainnet, polygon, optimism } from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";

export const projectId = "8f6d85eadf66e7a3d75f5a57f6fb0850";

const metadata = {
  name: "Universal KYC",
  description: "Secure KYC Verification",
  url: "https://universalkyc.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [mainnet, polygon, optimism];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

export const wagmiConfig = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata,
  queryClient,
});

createWeb3Modal({ wagmiConfig, projectId, chains });