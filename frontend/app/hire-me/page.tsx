"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Briefcase, DollarSign, MessageSquare, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function HireMePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [stipend, setStipend] = useState('');
  const [message, setMessage] = useState('');
  
  // OTP State
  const [otp, setOtp] = useState('');

  // Mouse Parallax for background
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !role) {
      setError('Email and Role are required.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/hire/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, stipend, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp) return;
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/hire/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center overflow-hidden relative selection:bg-fuchsia-500/30">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-500/30 rounded-full blur-[120px] mix-blend-screen" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/20 rounded-full blur-[120px] mix-blend-screen" style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }} />
      </div>

      <Link href="/" className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors">
        ← Back to Engine
      </Link>

      <div className="w-full max-w-xl px-6 relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-[0_0_40px_rgba(217,70,239,0.3)] mb-6">
            <span className="text-black font-black text-3xl">A</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4">
            Let&apos;s build something.
          </h1>
          <p className="text-white/50 text-lg">Send me a direct proposal. I&apos;ll get back to you within 24 hours.</p>
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: Offer Form */}
          {step === 1 && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
              {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-xl">{error}</div>}
              
              <form onSubmit={handleSendOffer} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Recruiter Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="you@company.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Proposed Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input type="text" value={role} onChange={e => setRole(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="e.g. Senior Frontend Engineer" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Stipend / Salary Range (Optional)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input type="text" value={stipend} onChange={e => setStipend(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="e.g. $120k - $150k" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Message (Optional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-white/30" />
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors resize-none" placeholder="Tell me about the project..." />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full relative group overflow-hidden rounded-xl bg-white text-black font-bold py-4 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Verification'}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </span>
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
              <p className="text-white/50 mb-8">We sent a 6-digit code to <strong>{email}</strong>. Enter it below to confirm your identity and send the offer.</p>
              
              {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-xl">{error}</div>}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <input 
                  type="text" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center text-3xl tracking-[0.5em] font-mono bg-black/50 border border-white/10 rounded-xl py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
                />

                <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Send Offer'}
                </button>
                
                <button type="button" onClick={() => setStep(1)} className="text-sm text-white/40 hover:text-white transition-colors">
                  Wrong email? Go back.
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl text-center">
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Offer Sent!</h2>
              <p className="text-white/50 mb-8 max-w-sm mx-auto">
                Your proposal has been verified and securely delivered to Adarsh&apos;s personal inbox. Expect a response soon!
              </p>
              
              <Link href="/" className="inline-block bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-zinc-200 transition-colors">
                Return to Engine
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
