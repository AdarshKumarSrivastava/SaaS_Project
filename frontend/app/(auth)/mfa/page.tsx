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
    <div className="w-full relative">
      <div className="p-10 relative z-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-5 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-ink">Two-Step Verification</h2>
            <p className="text-sm text-ink-soft mt-1.5">Enter the 6-digit code from your authenticator app.</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">{error}</div>}
            
            <div>
              <input 
                type="text" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full text-center tracking-[0.5em] font-mono bg-bg-base border border-line rounded-xl px-4 py-4 text-ink text-xl focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/30 placeholder:tracking-normal placeholder:text-sm"
                required
                maxLength={6}
                placeholder="Enter code"
                autoFocus
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-ink text-bg-elevated font-medium py-3 rounded-xl text-sm flex items-center justify-center hover:bg-ink/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Continue'}
            </button>
          </form>
          
          <p className="text-center text-xs text-ink-soft mt-6">
            Lost access to your authenticator?<br/>Contact support for recovery.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
