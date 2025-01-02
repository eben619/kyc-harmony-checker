import { createConfig } from "wagmi";
import { mainnet, polygon, optimism } from "wagmi/chains";
import { createPublicClient, http } from "viem";

const alchemyKey = "Smq0OZ5rRX6EN5Ych6FRIdCXxBNJZWmm";

const chains = [mainnet, polygon, optimism];

export const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`),
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`),
    [optimism.id]: http(`https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`),
  },
});

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`),
});