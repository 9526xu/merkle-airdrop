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
const AIRDROP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

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
    if (s === 'COLLECTION') return 'text-blue-600';
    if (s === 'PROCESSING') return 'text-orange-600';
    if (s === 'CLAIM') return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white p-6 rounded shadow-md border border-gray-200 space-y-8">
      <h2 className="text-xl font-bold text-gray-900">Admin Controls</h2>

      <div>
        <h3 className="font-semibold mb-2 text-gray-700">Phase 0: Status Management</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-sm">
            Current Status: 
            <span className={`ml-2 font-bold ${getStatusColor(status)}`}>
              {status || 'Loading...'}
            </span>
          </div>
        </div>
        
        {/* Status Control Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleStatusChange('COLLECTION')}
            disabled={statusLoading || status === 'COLLECTION'}
            className={`py-1 px-3 rounded text-sm transition-colors ${
              status === 'COLLECTION' 
                ? 'bg-blue-100 text-blue-800 cursor-default' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            Set COLLECTION
          </button>
          <button
            onClick={() => handleStatusChange('PROCESSING')}
            disabled={statusLoading || status === 'PROCESSING'}
            className={`py-1 px-3 rounded text-sm transition-colors ${
              status === 'PROCESSING' 
                ? 'bg-orange-100 text-orange-800 cursor-default' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            Set PROCESSING
          </button>
          <button
            onClick={() => handleStatusChange('CLAIM')}
            disabled={statusLoading || status === 'CLAIM'}
            className={`py-1 px-3 rounded text-sm transition-colors ${
              status === 'CLAIM' 
                ? 'bg-green-100 text-green-800 cursor-default' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            Set CLAIM
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
            Workflow: Collection (Register) → Processing (Freeze & Gen) → Claim (Distribute)
        </p>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-2 text-gray-700">Phase 1: Off-Chain Processing</h3>
        <p className="text-sm text-gray-500 mb-3">
            Freeze the whitelist and generate the Merkle Root.
            <br/>
            <span className="text-xs text-orange-600">Note: Status must be PROCESSING to generate.</span>
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading || status !== 'PROCESSING'}
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Merkle Tree'}
        </button>
        {status !== 'PROCESSING' && (
            <p className="text-xs text-red-500 mt-1">Switch status to PROCESSING to generate tree.</p>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {generatedRoot && (
          <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
            <p className="text-green-700 font-bold">✓ Tree Generated!</p>
            <p className="text-sm">Total Users: {userCount}</p>
            <p className="text-xs break-all font-mono mt-1 bg-white p-1 border rounded text-gray-600">Root: {generatedRoot}</p>
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-2 text-gray-700">Phase 2: On-Chain Update</h3>
        <p className="text-sm text-gray-500 mb-4">
          Transaction must be sent by an account with DEFAULT_ADMIN_ROLE.
        </p>
        <button
          onClick={handleUpdateContract}
          disabled={!generatedRoot || !isConnected || isPending || status !== 'PROCESSING'}
          className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:bg-gray-300 transition-colors"
        >
          {isPending ? 'Updating...' : 'Update Contract Root'}
        </button>
        {status !== 'PROCESSING' && (
            <p className="text-xs text-red-500 mt-1">Status must be PROCESSING to update contract.</p>
        )}
        {isSuccess && <p className="text-green-600 mt-2 font-bold">Transaction Sent Successfully!</p>}
        {writeError && <p className="text-red-500 mt-2 text-sm">Tx Error: {writeError.message}</p>}
      </div>
    </div>
  );
}
