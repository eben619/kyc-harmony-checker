import { createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { createPublicClient, http } from 'viem';

const alchemyKey = "Smq0OZ5rRX6EN5Ych6FRIdCXxBNJZWmm";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`)
});

export const config = createConfig({
  publicClient,
});