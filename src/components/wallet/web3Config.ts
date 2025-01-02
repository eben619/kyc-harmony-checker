import { defaultWagmiConfig } from "@web3modal/wagmi/react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { mainnet } from "wagmi/chains";

export const projectId = "8f6d85eadf66e7a3d75f5a57f6fb0850";

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Connection",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [mainnet];
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });