'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { api } from '../lib/api';
import { parseAbi } from 'viem';
import { getChain } from '../lib/chains';

// ABI for updateMerkleRoot and merkleRoot
const ADMIN_ABI = parseAbi([
  'function updateMerkleRoot(bytes32 _merkleRoot) external',
  'function merkleRoot() external view returns (bytes32)'
]);

// TODO: Fetch this from config or env
const AIRDROP_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS as `0x${string}`; 

export default function AdminControls() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const chain = getChain(chainId);
  
  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract();
  
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { data: onChainRoot, refetch: refetchRoot } = useReadContract({
    address: AIRDROP_ADDRESS,
    abi: ADMIN_ABI,
    functionName: 'merkleRoot',
  });

  const [status, setStatus] = useState<'COLLECTION' | 'PROCESSING' | 'CLAIM' | null>(null);
  const [generatedRoot, setGeneratedRoot] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    fetchTreeInfo();
  }, []);

  useEffect(() => {
    if (isTxSuccess) {
      handleStatusChange('CLAIM');
      refetchRoot();
    }
  }, [isTxSuccess, refetchRoot]);

  const fetchTreeInfo = async () => {
    try {
      const info = await api.admin.getTreeInfo();
      if (info.merkleRoot) {
        setGeneratedRoot(info.merkleRoot);
        setUserCount(info.count);
      }
    } catch (err) {
      console.error('Failed to fetch tree info:', err);
    }
  };

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

  const isPending = isWritePending || isTxConfirming;

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

      {/* Section 3: On-Chain Update & Consistency Check */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Phase 2: On-Chain Update</h3>
        
        {/* Consistency Check UI */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Consistency Check</h4>
            
            <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">Local Root (Backend):</span>
                    <span className={`px-2 py-1 rounded ${generatedRoot ? 'bg-slate-900 text-yellow-400' : 'text-slate-600'}`}>
                        {generatedRoot ? `${generatedRoot.slice(0, 10)}...${generatedRoot.slice(-8)}` : 'Not Generated'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-500">On-Chain Root (Contract):</span>
                    <span className={`px-2 py-1 rounded ${onChainRoot ? 'bg-slate-900 text-blue-400' : 'text-slate-600'}`}>
                        {onChainRoot ? `${onChainRoot.slice(0, 10)}...${onChainRoot.slice(-8)}` : 'Loading...'}
                    </span>
                </div>
                
                <div className="border-t border-slate-700/50 my-2"></div>
                
                <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status:</span>
                    {generatedRoot && onChainRoot && generatedRoot === onChainRoot ? (
                         <span className="flex items-center gap-1 text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            SYNCED
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-red-400 font-bold bg-red-900/20 px-2 py-1 rounded animate-pulse">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            NOT SYNCED
                        </span>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <p className="text-sm text-slate-400">
            Publish the new Merkle Root to the smart contract if statuses are not synced.
            <br/>
            Requires: <span className="text-yellow-400 font-mono">DEFAULT_ADMIN_ROLE</span>
            </p>
            
            <button
            onClick={handleUpdateContract}
            disabled={!generatedRoot || !isConnected || isPending || status !== 'PROCESSING' || generatedRoot === onChainRoot}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold transition-all ${
                generatedRoot === onChainRoot
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'btn-secondary bg-orange-600 hover:bg-orange-500 text-white shadow-lg hover:shadow-orange-500/20'
            }`}
            >
            {isWritePending ? 'Sign Request...' : isTxConfirming ? 'Confirming Transaction...' : generatedRoot === onChainRoot ? 'Contract is Up to Date' : 'Update Contract Root'}
            </button>
        </div>

        {txHash && (
             <div className="mt-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-blue-400 text-sm">
                <p className="font-bold mb-1">Transaction Sent</p>
                {chain?.explorerTxUrl ? (
                  <a href={chain.explorerTxUrl(txHash)} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300 break-all">
                    {txHash}
                  </a>
                ) : (
                  <span className="break-all">{txHash}</span>
                )}
            </div>
        )}

        {isTxSuccess && (
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