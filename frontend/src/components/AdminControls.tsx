'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { api } from '../lib/api';
import { parseAbi } from 'viem';

// ABI for updateMerkleRoot
const ADMIN_ABI = parseAbi([
  'function updateMerkleRoot(bytes32 _merkleRoot) external'
]);

// TODO: Fetch this from config or env
const AIRDROP_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS as `0x${string}`; 

export default function AdminControls() {
  const { isConnected } = useAccount();
  const { writeContract, isPending, isSuccess, error: writeError } = useWriteContract();
  
  const [status, setStatus] = useState<'COLLECTION' | 'PROCESSING' | 'CLAIM' | null>(null);
  const [generatedRoot, setGeneratedRoot] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      handleStatusChange('CLAIM');
    }
  }, [isSuccess]);

  const fetchStatus = async () => {
    try {
      const data = await api.admin.getStatus();
      setStatus(data.status);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const handleStatusChange = async (newStatus: 'COLLECTION' | 'PROCESSING' | 'CLAIM') => {
    setStatusLoading(true);
    try {
      const data = await api.admin.updateStatus(newStatus, 'admin123');
      setStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.admin.generateTree('admin123');
      setGeneratedRoot(data.merkleRoot);
      setUserCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContract = () => {
    if (!generatedRoot) return;
    writeContract({
      address: AIRDROP_ADDRESS,
      abi: ADMIN_ABI,
      functionName: 'updateMerkleRoot',
      args: [generatedRoot as `0x${string}`],
    });
  };

  const getStatusColor = (s: string | null) => {
    if (s === 'COLLECTION') return 'text-blue-400';
    if (s === 'PROCESSING') return 'text-orange-400';
    if (s === 'CLAIM') return 'text-green-400';
    return 'text-slate-400';
  };

  return (
    <div className="glass-panel p-8 rounded-xl shadow-xl space-y-10">
      
      {/* Section 1: Phase Management */}
      <div>
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Phase 0: Global Status
            </h3>
            <div className={`px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono`}>
                Current: <span className={`font-bold ${getStatusColor(status)}`}>{status || 'Loading...'}</span>
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleStatusChange('COLLECTION')}
            disabled={statusLoading || status === 'COLLECTION'}
            className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 border ${
              status === 'COLLECTION' 
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            COLLECTION
          </button>
          <button
            onClick={() => handleStatusChange('PROCESSING')}
            disabled={statusLoading || status === 'PROCESSING'}
            className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 border ${
              status === 'PROCESSING' 
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            PROCESSING
          </button>
          <button
            onClick={() => handleStatusChange('CLAIM')}
            disabled={statusLoading || status === 'CLAIM'}
            className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 border ${
              status === 'CLAIM' 
                ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            CLAIM
          </button>
        </div>
      </div>
      
      <div className="border-t border-slate-700/50"></div>

      {/* Section 2: Off-Chain Processing */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Phase 1: Merkle Generation</h3>
        <p className="text-sm text-slate-400">
            Freeze the whitelist and generate the Merkle Root off-chain. 
            <br/>
            Required Status: <span className="text-orange-400 font-mono">PROCESSING</span>
        </p>
        
        <div className="flex items-center gap-4">
            <button
            onClick={handleGenerate}
            disabled={loading || status !== 'PROCESSING'}
            className="btn-primary"
            >
            {loading ? 'Generating...' : 'Generate Merkle Tree'}
            </button>
            
            {generatedRoot && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-semibold animate-in fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Success
                </div>
            )}
        </div>

        {status !== 'PROCESSING' && (
             <p className="text-xs text-red-400">⚠️ Switch status to PROCESSING to enable generation.</p>
        )}
        
        {error && <p className="text-red-400 bg-red-900/20 p-3 rounded border border-red-900/50">{error}</p>}
        
        {generatedRoot && (
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 font-mono text-xs text-slate-300 space-y-2">
            <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="text-white">{userCount}</span>
            </div>
            <div className="border-t border-slate-800 my-2"></div>
            <div>
                <span className="block text-slate-500 mb-1">Merkle Root:</span>
                <span className="break-all text-yellow-400">{generatedRoot}</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-700/50"></div>

      {/* Section 3: On-Chain Update */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Phase 2: On-Chain Update</h3>
        <p className="text-sm text-slate-400">
          Publish the new Merkle Root to the smart contract.
          <br/>
          Requires: <span className="text-yellow-400 font-mono">DEFAULT_ADMIN_ROLE</span>
        </p>
        
        <button
          onClick={handleUpdateContract}
          disabled={!generatedRoot || !isConnected || isPending || status !== 'PROCESSING'}
          className="btn-secondary bg-orange-600 hover:bg-orange-500 text-white w-full sm:w-auto"
        >
          {isPending ? 'Broadcasting Transaction...' : 'Update Contract Root'}
        </button>

        {isSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <p className="text-green-400 font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Root Updated Successfully!
                </p>
                <p className="text-sm text-green-300/70 mt-1">Users can now claim their tokens once status is set to CLAIM.</p>
            </div>
        )}
        
        {writeError && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-400 text-sm">
                <p className="font-bold mb-1">Transaction Error</p>
                <p>{writeError.message}</p>
            </div>
        )}
      </div>
    </div>
  );
}