import { createConfig } from "wagmi";
import { mainnet, polygon, optimism } from "wagmi/chains";
import { createPublicClient, http, Client } from "viem";

const alchemyKey = "Smq0OZ5rRX6EN5Ych6FRIdCXxBNJZWmm";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`),
});

export const config = createConfig({
  chains: [mainnet, polygon, optimism],
  client: publicClient,
});

// Export the client type for use in components
export type Web3Client = Client;