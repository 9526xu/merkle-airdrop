'use client';

import { useState } from 'react';

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      // Shake effect could be added here
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="glass-panel p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <h2 className="text-3xl font-bold mb-6 text-center text-white tracking-tight">Admin Access</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`input-field w-full ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
            />
            {error && <p className="text-red-500 text-xs mt-1">Incorrect password</p>}
          </div>
          
          <button type="submit" className="w-full btn-primary py-3">
            Unlock Dashboard
          </button>
        </div>
      </form>
    </div>
  );
}