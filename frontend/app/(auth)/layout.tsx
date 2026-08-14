import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center font-sans overflow-hidden bg-ink selection:bg-bg-elevated selection:text-ink">
      
      {/* Premium Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/shapes_bg.jpg" 
          alt="Premium Background" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-ink/20 mix-blend-overlay"></div>
      </div>
      
      {/* Back to Home Button */}
      <Link href="/" className="absolute top-8 left-8 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-bg-elevated/40 backdrop-blur-2xl border border-white/40 text-ink hover:bg-bg-elevated/80 transition-all group shadow-lg">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </Link>
      
      {/* Clean UI Container - Glassmorphism */}
      <div className="relative z-10 w-full max-w-[460px] p-6">
        <div className="bg-bg-elevated/80 backdrop-blur-3xl border border-white/60 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden relative">
           {children}
        </div>
      </div>
    </div>
  );
}
