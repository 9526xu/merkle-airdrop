'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { api } from '../lib/api';

export default function WhitelistForm() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ isWhitelisted: boolean; allocation: string | null } | null>(null);
  const [appStatus, setAppStatus] = useState<'COLLECTION' | 'PROCESSING' | 'CLAIM' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (!address) return;
    try {
      const data = await api.whitelist.status(address);
      setStatus({ isWhitelisted: data.isWhitelisted, allocation: data.allocation });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppStatus = async () => {
    try {
      const data = await api.admin.getStatus();
      setAppStatus(data.status);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppStatus();
    if (isConnected && address) {
      fetchStatus();
    } else {
      setStatus(null);
    }
  }, [address, isConnected]);

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

  if (!isConnected) {
    return <div className="text-center p-4">Please connect your wallet to join the whitelist.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Whitelist Registration</h2>
      
      {status?.isWhitelisted ? (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
          <p className="font-bold">You are whitelisted!</p>
          <p>Allocation: {status.allocation} Tokens</p>
        </div>
      ) : (
        <div>
          {appStatus === 'COLLECTION' ? (
            <>
                <p className="mb-4 text-gray-600">Join the whitelist to be eligible for the airdrop.</p>
                <button
                    onClick={handleJoin}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                    {isLoading ? 'Joining...' : 'Join Whitelist'}
                </button>
            </>
          ) : (
            <div className="bg-gray-100 text-gray-600 p-4 rounded">
                <p className="font-bold">Registration Closed</p>
                <p className="text-sm">The airdrop is currently in {appStatus} phase.</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-100 text-red-800 p-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
