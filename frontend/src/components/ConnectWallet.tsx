'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function ConnectWallet() {
  return (
    <div className="flex items-center">
      <ConnectButton 
        showBalance={{ smallScreen: false, largeScreen: true }}
        accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
      />
    </div>
  );
}