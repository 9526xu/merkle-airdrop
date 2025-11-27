'use client';

import { useState } from 'react';

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Admin Login</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Password"
        />
        <button type="submit" className="bg-gray-900 text-white p-2 w-full rounded hover:bg-gray-800 transition-colors">
          Login
        </button>
      </form>
    </div>
  );
}
