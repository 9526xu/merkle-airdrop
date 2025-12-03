'use client';

import { ConnectWallet } from '@/components/ConnectWallet';
import WhitelistForm from '@/components/WhitelistForm';
import ClaimAirdrop from '@/components/ClaimAirdrop';
import Link from 'next/link';

export default function UserPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
            <h1 className="text-xl font-bold text-white tracking-tight">Merkle Airdrop</h1>
          </Link>
          <ConnectWallet />
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl font-extrabold text-white tracking-tight">
            Dashboard
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Check your eligibility, join the whitelist, and claim your tokens securely.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 items-start">
          <div className="glass-panel p-1 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-[1.02]">
             <WhitelistForm />
          </div>
          <div className="glass-panel p-1 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-[1.02]">
             <ClaimAirdrop />
          </div>
        </div>
      </main>
    </div>
  );
}