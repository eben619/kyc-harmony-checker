import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';

const alchemyKey = "Smq0OZ5rRX6EN5Ych6FRIdCXxBNJZWmm";

export const config = createConfig({
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`)
  }
});