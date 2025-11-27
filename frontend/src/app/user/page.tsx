'use client';

import { ConnectWallet } from '@/components/ConnectWallet';
import WhitelistForm from '@/components/WhitelistForm';
import ClaimAirdrop from '@/components/ClaimAirdrop';

export default function UserPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Merkle Airdrop</h1>
          <ConnectWallet />
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Join the Revolution</h2>
            <p className="mt-4 text-lg text-gray-500">Register now to receive your free tokens.</p>
          </div>
          <WhitelistForm />
          <ClaimAirdrop />
        </div>
      </main>
    </div>
  );
}
