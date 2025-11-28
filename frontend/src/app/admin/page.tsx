'use client';

import AdminAuth from '@/components/AdminAuth';
import AdminControls from '@/components/AdminControls';
import { ConnectWallet } from '@/components/ConnectWallet';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <AdminAuth>
      <div className="min-h-screen">
        <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-mono font-bold text-white">A</div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Admin Console</h1>
                </Link>
                <ConnectWallet />
            </div>
        </header>

        <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar / Instructions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-xl border-l-4 border-blue-500">
                        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Workflow Guide
                        </h3>
                        <ol className="relative border-l border-slate-700 ml-3 space-y-8">
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-900 rounded-full -left-3 ring-4 ring-slate-900 text-blue-300 text-xs font-bold">1</span>
                                <h3 className="flex items-center mb-1 text-md font-semibold text-white">Collection Phase</h3>
                                <p className="mb-4 text-sm font-normal text-slate-400">Set status to COLLECTION to allow users to register for the whitelist.</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-orange-900 rounded-full -left-3 ring-4 ring-slate-900 text-orange-300 text-xs font-bold">2</span>
                                <h3 className="flex items-center mb-1 text-md font-semibold text-white">Processing Phase</h3>
                                <p className="mb-4 text-sm font-normal text-slate-400">Freeze whitelist (PROCESSING). Generate Merkle Tree off-chain. Update Contract Root on-chain.</p>
                            </li>
                            <li className="ml-6">
                                <span className="absolute flex items-center justify-center w-6 h-6 bg-green-900 rounded-full -left-3 ring-4 ring-slate-900 text-green-300 text-xs font-bold">3</span>
                                <h3 className="flex items-center mb-1 text-md font-semibold text-white">Claim Phase</h3>
                                <p className="mb-4 text-sm font-normal text-slate-400">Set status to CLAIM to allow eligible users to claim their tokens.</p>
                            </li>
                        </ol>
                    </div>
                </div>

                {/* Main Controls */}
                <div className="lg:col-span-2">
                    <AdminControls />
                </div>
            </div>
        </main>
      </div>
    </AdminAuth>
  );
}