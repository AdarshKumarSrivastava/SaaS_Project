"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function MfaPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If no mfaToken in storage, they shouldn't be here
    if (!localStorage.getItem('mfaToken')) {
      router.push('/login');
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const mfaToken = localStorage.getItem('mfaToken');
    try {
      const res = await fetch('http://localhost:3001/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, token })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      localStorage.removeItem('mfaToken');
      localStorage.setItem('accessToken', data.accessToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-emerald-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-medium text-white">Two-Step Verification</h2>
        <p className="text-sm text-zinc-400 mt-1">Enter the 6-digit code from your authenticator app.</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}
        
        <div>
          <input 
            type="text" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full text-center tracking-[0.5em] font-mono bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            required
            maxLength={6}
            placeholder="000000"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-500 text-white font-medium py-2.5 rounded-lg text-sm flex items-center justify-center hover:bg-emerald-600 transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Secure Login'}
        </button>
      </form>
      
      <p className="text-center text-xs text-zinc-500 mt-6">
        Lost access to your authenticator? <br/> Contact support for recovery.
      </p>
    </motion.div>
  );
}
