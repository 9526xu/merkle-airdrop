import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">Merkle Airdrop</h1>
      <div className="flex gap-4">
        <Link 
          href="/user" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          User Dashboard
        </Link>
        <Link 
          href="/admin" 
          className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          Admin Panel
        </Link>
      </div>
    </main>
  );
}
