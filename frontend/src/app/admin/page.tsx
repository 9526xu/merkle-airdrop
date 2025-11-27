'use client';

import AdminAuth from '@/components/AdminAuth';
import AdminControls from '@/components/AdminControls';
import { ConnectWallet } from '@/components/ConnectWallet';

export default function AdminPage() {
  return (
    <AdminAuth>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">Merkle Admin Dashboard</h1>
                <ConnectWallet />
            </div>
        </header>

        <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-800">Workflow</h3>
                    <ol className="list-decimal list-inside text-blue-700 mt-2 space-y-1">
                        <li>Wait for users to join whitelist.</li>
                        <li>Click <strong>Generate Merkle Tree</strong> to freeze whitelist and compute root.</li>
                        <li>Connect Admin Wallet.</li>
                        <li>Click <strong>Update Contract Root</strong> to push new root on-chain.</li>
                    </ol>
                </div>
                <AdminControls />
            </div>
        </main>
      </div>
    </AdminAuth>
  );
}
