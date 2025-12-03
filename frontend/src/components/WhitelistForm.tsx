'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { api } from '../lib/api';

export default function WhitelistForm() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ isWhitelisted: boolean; allocation: string | null } | null>(null);
  const [appStatus, setAppStatus] = useState<'COLLECTION' | 'PROCESSING' | 'CLAIM' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!address) return;
    try {
      const data = await api.whitelist.status(address);
      setStatus({ isWhitelisted: data.isWhitelisted, allocation: data.allocation });
    } catch (err) {
      console.error(err);
    }
  }, [address]);

  const fetchAppStatus = useCallback(async () => {
    try {
      const data = await api.admin.getStatus();
      setAppStatus(data.status);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAppStatus();
    if (isConnected && address) {
      fetchStatus();
    } else {
      setStatus(null);
    }
  }, [address, isConnected, fetchStatus, fetchAppStatus]);

  const handleJoin = async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.whitelist.join(address);
      await fetchStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join whitelist';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 p-8 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Whitelist</h2>
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
             appStatus === 'COLLECTION' ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50' : 'bg-slate-700 text-slate-400'
          }`}>
            {appStatus === 'COLLECTION' ? 'Active' : 'Closed'}
          </div>
        </div>

        {!isConnected ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                <p className="text-slate-400 mb-2">Wallet not connected</p>
                <p className="text-sm text-slate-500">Please connect your wallet to register.</p>
            </div>
        ) : (
            <div className="space-y-6">
                {status?.isWhitelisted ? (
                    <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-green-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <p className="font-bold text-green-400 text-lg">Successfully Registered!</p>
                        <p className="text-slate-400 text-sm mt-1">Allocation: <span className="text-white font-mono">{status.allocation} Tokens</span></p>
                    </div>
                ) : (
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <p className="text-slate-300 mb-4">Join the exclusive whitelist to secure your airdrop allocation. Spots are limited.</p>
                        
                        {appStatus === 'COLLECTION' ? (
                            <button
                                onClick={handleJoin}
                                disabled={isLoading}
                                className="w-full btn-primary relative overflow-hidden group"
                            >
                                <span className="relative z-10">{isLoading ? 'Processing...' : 'Join Whitelist'}</span>
                                {!isLoading && <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>}
                            </button>
                        ) : (
                             <button disabled className="w-full btn-secondary opacity-50 cursor-not-allowed">
                                Registration Closed
                            </button>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}