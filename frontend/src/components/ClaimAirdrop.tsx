'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { api } from '../lib/api';

// TODO: Move to config
const AIRDROP_ADDRESS = process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS as `0x${string}`;
const CHAIN_ID = 31337; // Anvil

export default function ClaimAirdrop() {
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  
  const [status, setStatus] = useState<{ isWhitelisted: boolean; allocation: string | null; proof?: string[] } | null>(null);
  const [appStatus, setAppStatus] = useState<'COLLECTION' | 'PROCESSING' | 'CLAIM' | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin.getStatus().then(data => setAppStatus(data.status)).catch(console.error);
    if (isConnected && address) {
        api.whitelist.status(address).then(setStatus).catch(console.error);
    } else {
        setStatus(null);
    }
  }, [address, isConnected]);

  const handleClaim = async () => {
      if (!address || !status?.allocation || !status.proof) return;
      setIsClaiming(true);
      setError(null);
      setTxHash(null);

      try {
          // 1. Sign the message (EIP-712)
          const signature = await signTypedDataAsync({
            domain: {
                name: 'Airdrop',
                version: '1',
                chainId: CHAIN_ID,
                verifyingContract: AIRDROP_ADDRESS,
            },
            types: {
                Claim: [
                    { name: 'claimer', type: 'address' },
                    { name: 'amount', type: 'uint256' },
                ],
            },
            primaryType: 'Claim',
            message: {
                claimer: address,
                amount: BigInt(status.allocation),
            },
          });

          // 2. Submit to Relayer
          const result = await api.claim.submit(
              address,
              status.allocation,
              status.proof,
              signature
          );

          setTxHash(result.transactionHash);
      } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : "Failed to claim");
      } finally {
          setIsClaiming(false);
      }
  };

  // Only show claim component if whitelisted OR if we want to show "not eligible" message
  // But let's always render the structure to keep layout consistent
  
  return (
    <div className="bg-slate-900/50 p-8 h-full flex flex-col justify-between">
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Claim Airdrop</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    appStatus === 'CLAIM' ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/50' : 'bg-slate-700 text-slate-400'
                }`}>
                    {appStatus === 'CLAIM' ? 'Live' : 'Pending'}
                </div>
            </div>

            {!isConnected ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                    <p className="text-slate-400 mb-2">Wallet not connected</p>
                    <p className="text-sm text-slate-500">Please connect your wallet to claim.</p>
                </div>
            ) : !status?.isWhitelisted ? (
                 <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-xl text-center">
                    <p className="text-yellow-400 font-semibold">Not Eligible</p>
                    <p className="text-slate-400 text-sm mt-2">You are not currently on the whitelist.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
                         <p className="text-slate-400 text-sm mb-1">Available to Claim</p>
                         <p className="text-4xl font-bold text-white tracking-tight">{status.allocation} <span className="text-lg text-slate-500">TKN</span></p>
                    </div>

                    {appStatus === 'CLAIM' && status?.proof && status.proof.length > 0 ? (
                         <button 
                            className={`w-full py-4 px-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                                isClaiming || txHash 
                                ? 'bg-green-600/20 text-green-400 cursor-default' 
                                : 'bg-green-600 hover:bg-green-500 text-white hover:shadow-green-500/25 hover:-translate-y-1'
                            }`}
                            onClick={handleClaim}
                            disabled={isClaiming || !!txHash}
                        >
                            {isClaiming ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : txHash ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    Claimed
                                </span>
                            ) : 'Claim Tokens (Gasless)'}
                        </button>
                    ) : (
                        <button disabled className="w-full btn-secondary opacity-50 cursor-not-allowed">
                            Airdrop Not Active
                        </button>
                    )}
                </div>
            )}
        </div>

        {error && (
             <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-sm">
                {error}
            </div>
        )}

        {txHash && (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded break-all text-sm">
                <p className="font-bold mb-1">Success!</p>
                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">
                    View on Etherscan
                </a>
            </div>
        )}
    </div>
  );
}