'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { api } from '../lib/api';

// TODO: Move to config
const AIRDROP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
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

  if (!isConnected) return null;
  
  // Only show claim component if whitelisted OR if we want to show "not eligible" message
  if (status && !status.isWhitelisted) {
      return null; 
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Claim Airdrop</h2>
        
        {status?.allocation && (
            <div className="mb-4">
                <p className="text-gray-600">Your Allocation:</p>
                <p className="text-3xl font-bold text-blue-600">{status.allocation} Tokens</p>
            </div>
        )}

        {appStatus === 'CLAIM' && status?.proof && status.proof.length > 0 ? (
            <>
                <button 
                    className="w-full bg-green-600 text-white py-3 px-4 rounded font-bold hover:bg-green-700 transition-colors shadow-lg disabled:bg-green-300"
                    onClick={handleClaim}
                    disabled={isClaiming || !!txHash}
                >
                    {isClaiming ? 'Processing...' : (txHash ? 'Claimed!' : 'Claim Tokens (Gasless)')}
                </button>
                
                {error && (
                    <div className="mt-4 bg-red-100 text-red-800 p-3 rounded">
                        {error}
                    </div>
                )}

                {txHash && (
                    <div className="mt-4 bg-green-100 text-green-800 p-3 rounded break-all">
                        <p className="font-bold">Success!</p>
                        <p className="text-xs mt-1">Tx: {txHash}</p>
                    </div>
                )}
            </>
        ) : (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded border border-yellow-200">
                <p className="font-semibold">Airdrop Not Active</p>
                <p className="text-sm">
                    {appStatus === 'COLLECTION' ? 'Registration is open.' : 
                     appStatus === 'PROCESSING' ? 'Airdrop is being calculated.' :
                     'Claiming is not yet enabled for your account.'}
                </p>
            </div>
        )}
    </div>
  );
}
