import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="z-10 text-center space-y-8 max-w-3xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-sm">
            Merkle Airdrop
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-light">
            The next generation of token distribution. Secure, efficient, and transparent.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
          <Link 
            href="/user" 
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="flex items-center gap-2">
              Claim Tokens
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
          
          <Link 
            href="/admin" 
            className="group px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 text-slate-200 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1"
          >
            Admin Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="glass-panel p-6 rounded-xl">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 12 2s10 4.477 10 10z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Whitelist Verification</h3>
            <p className="text-slate-400">Secure on-chain verification ensuring only eligible users can claim.</p>
          </div>
          <div className="glass-panel p-6 rounded-xl">
             <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Merkle Tree Efficiency</h3>
            <p className="text-slate-400">Gas-efficient distribution using cryptographic proofs for massive scale.</p>
          </div>
          <div className="glass-panel p-6 rounded-xl">
             <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Gasless Claims</h3>
            <p className="text-slate-400">Advanced meta-transaction support allows for gasless claiming.</p>
          </div>
        </div>
      </div>
    </main>
  );
}