import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center font-sans overflow-hidden bg-[#030014] selection:bg-fuchsia-500/30">
      
      {/* Back to Home Button */}
      <Link href="/" className="absolute top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium tracking-wide">Return to Engine</span>
      </Link>
      
      {/* Insane Animated Background Gradients from the Landing Page */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/30 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-500/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-violet-600/30 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Floating UI Container */}
      <div className="relative z-10 w-full max-w-[500px] p-6">
        <div className="bg-[#030014]/60 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-[0_0_100px_rgba(217,70,239,0.15)] overflow-visible relative">
           {children}
        </div>
      </div>
    </div>
  );
}
