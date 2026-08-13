"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Code, Layers } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 3D Parallax effect for floating icons
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    // Relative to center of screen
    setMousePosition({
      x: (e.clientX / window.innerWidth - 0.5) * 40,
      y: (e.clientY / window.innerHeight - 0.5) * 40,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details?.[0]?.message || 'Login failed');
      
      if (data.mfaRequired) {
        router.push(`/mfa?email=${encodeURIComponent(email)}`);
      } else {
        localStorage.setItem('token', data.accessToken);
        toast.success("Welcome back!");
        router.push('/dashboard');
      }
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
        className="absolute -top-12 -left-12 w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/5 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] flex items-center justify-center pointer-events-none z-20"
        animate={{ 
          x: mousePosition.x * -2, 
          y: mousePosition.y * -2,
          rotate: mousePosition.x * 0.5
        }}
        transition={{ type: "spring", stiffness: 50 }}
      >
        <Code className="w-10 h-10 text-cyan-400" />
      </motion.div>

      <motion.div 
        className="absolute -bottom-12 -right-12 w-32 h-32 rounded-3xl bg-gradient-to-tr from-fuchsia-500/20 to-purple-500/5 border border-fuchsia-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(217,70,239,0.2)] flex items-center justify-center pointer-events-none z-20"
        animate={{ 
          x: mousePosition.x * 2, 
          y: mousePosition.y * 2,
          rotate: mousePosition.x * -0.5
        }}
        transition={{ type: "spring", stiffness: 50 }}
      >
        <Layers className="w-12 h-12 text-fuchsia-400" />
      </motion.div>

      <div className="p-10 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-[40px] font-black tracking-tighter mb-2 leading-none">
            <span className="relative inline-block">
               ACCESS
               <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 animate-gradient-x blur-[2px] opacity-70">ACCESS</span>
               <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 animate-gradient-x">ACCESS</span>
            </span>
          </h2>
          <p className="text-[14px] text-white/50 font-medium">Re-enter the deployment engine.</p>
        </div>

        <motion.form 
          initial={{ opacity: 1, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, type: "spring" }}
          onSubmit={handleLogin} 
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white/70 uppercase tracking-widest">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-[15px] focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all shadow-inner"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <label className="block text-xs font-bold text-white/70 uppercase tracking-widest">Password</label>
               <Link href="#" className="text-[12px] font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors">Forgot?</Link>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-[15px] focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner tracking-widest"
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Workspace'}
            </button>
          </div>

          <div className="text-center pt-6">
            <p className="text-[13px] text-white/50 font-medium">
              New here? <Link href="/signup" className="text-cyan-400 font-bold hover:underline">Initialize account</Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
