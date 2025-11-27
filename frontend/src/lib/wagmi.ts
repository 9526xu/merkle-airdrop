import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { foundry } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Merkle Airdrop',
  projectId: 'YOUR_PROJECT_ID',
  chains: [foundry],
  ssr: false,
});
