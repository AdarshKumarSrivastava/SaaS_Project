"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Code } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // 3D Parallax effect for floating icons
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth - 0.5) * 40,
      y: (e.clientY / window.innerHeight - 0.5) * 40,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details?.[0]?.message || 'Signup failed');
      setStep('otp');
      toast.success("Verification code sent to your email.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      toast.success("Email verified successfully! Please log in.");
      router.push('/login');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative" onMouseMove={handleMouseMove}>
      
      {/* Floating 3D Elements that bleed out of the container */}
      <motion.div 
        className="absolute -top-12 -right-12 w-28 h-28 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/5 border border-fuchsia-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(217,70,239,0.2)] flex items-center justify-center pointer-events-none z-20"
        animate={{ 
          x: mousePosition.x * -2, 
          y: mousePosition.y * -2,
          rotate: mousePosition.x * 0.5
        }}
        transition={{ type: "spring", stiffness: 50 }}
      >
        <Code className="w-10 h-10 text-fuchsia-400" />
      </motion.div>

      <div className="p-10 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-[40px] font-black tracking-tighter mb-2 leading-none">
            <span className="relative inline-block">
               INITIALIZE
               <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 animate-gradient-x blur-[2px] opacity-70">INITIALIZE</span>
               <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 animate-gradient-x">INITIALIZE</span>
            </span>
          </h2>
          <p className="text-[14px] text-white/50 font-medium">Join the edge.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'details' ? (
            <motion.form 
              key="details"
              initial={{ opacity: 1, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 1, scale: 0.95 }}
              transition={{ duration: 0.5, type: "spring" }}
              onSubmit={handleSignup} 
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/70 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-[15px] focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/70 uppercase tracking-widest">E-mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-[15px] focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/70 uppercase tracking-widest">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-[15px] focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all shadow-inner tracking-widest"
                  required
                />
              </div>

              <div className="mt-6 relative group">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl blur-md opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="relative w-full bg-[#030014] border border-white/10 hover:bg-zinc-900 text-white font-bold py-4 rounded-xl text-[15px] flex items-center justify-center transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </button>
              </div>

              <div className="text-center pt-6">
                <p className="text-[13px] text-white/50 font-medium">
                  Already deployed? <Link href="/login" className="text-cyan-400 font-bold hover:underline">Log in</Link>
                </p>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="otp"
              initial={{ opacity: 1, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 1, scale: 0.95 }}
              transition={{ duration: 0.5, type: "spring" }}
              onSubmit={handleVerifyOtp} 
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/70 uppercase tracking-widest">Authentication Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-[24px] text-center tracking-[0.5em] font-mono focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all shadow-inner"
                  required
                />
              </div>
              
              <div className="mt-6 relative group">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl blur-md opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="relative w-full bg-[#030014] border border-white/10 hover:bg-zinc-900 text-white font-bold py-4 rounded-xl text-[15px] flex items-center justify-center transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                </button>
              </div>

              <div className="text-center pt-6">
                <p className="text-[13px] text-white/50 font-medium">
                  We&apos;ve sent a verification code to <br />
                  <span className="text-cyan-400 font-bold">{email}</span>
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
