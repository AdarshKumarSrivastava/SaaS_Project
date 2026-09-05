"use client";

import React, { useEffect, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Activity, Box, Zap, Sparkles, ChevronRight, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

function PremiumCard({ children, gradient = "rgba(255,255,255,0.1)" }: { children: React.ReactNode, gradient?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className="group relative bg-[#050505] rounded-[2rem] p-8 border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/10"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              ${gradient},
              transparent 80%
            )
          `,
        }}
      />
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}

export default function OverviewTab({ siteId, site }: { siteId: string, site: any }) {
  const router = useRouter();
  const [metrics, setMetrics] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiClient.get(`/api/sites/${siteId}/analytics`);
        setMetrics(data.metrics);
      } catch (err) {
        console.error('Failed to load metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [siteId]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} 
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
      exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} 
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Revenue Card */}
        <PremiumCard gradient="rgba(0,240,255,0.08)">
          <div className="flex justify-between items-start mb-16">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00f0ff]/20 to-transparent flex items-center justify-center border border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
              <TrendingUp className="w-5 h-5 text-[#00f0ff]" />
            </div>
            <div className="flex items-center gap-1.5 bg-[#00f0ff]/10 px-3 py-1.5 rounded-full border border-[#00f0ff]/20">
              <ArrowUpRight className="w-3 h-3 text-[#00f0ff]" />
              <span className="text-[9px] uppercase tracking-widest font-bold text-[#00f0ff]">12.5%</span>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Total Revenue</h3>
            <p className="text-4xl font-light tracking-tight text-white flex items-baseline gap-1">
              <span className="text-white/40 text-2xl">$</span>
              {metrics.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </p>
          </div>
        </PremiumCard>

        {/* Orders Card */}
        <PremiumCard gradient="rgba(255,189,46,0.08)">
          <div className="flex justify-between items-start mb-16">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffbd2e]/20 to-transparent flex items-center justify-center border border-[#ffbd2e]/30 shadow-[0_0_30px_rgba(255,189,46,0.1)]">
              <Box className="w-5 h-5 text-[#ffbd2e]" />
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Fulfillment Pipeline</h3>
            <p className="text-4xl font-light tracking-tight text-white">
              {metrics.orders}
            </p>
          </div>
        </PremiumCard>

        {/* Customers Card */}
        <PremiumCard gradient="rgba(255,255,255,0.05)">
          <div className="flex justify-between items-start mb-16">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-transparent flex items-center justify-center border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <Users className="w-5 h-5 text-white/90" />
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Active Customers</h3>
            <p className="text-4xl font-light tracking-tight text-white">
              {metrics.customers}
            </p>
          </div>
        </PremiumCard>

        {/* Network Status Card */}
        <PremiumCard gradient="rgba(0,255,128,0.08)">
          <div className="flex justify-between items-start mb-16">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00ff80]/20 to-transparent flex items-center justify-center border border-[#00ff80]/30 shadow-[0_0_30px_rgba(0,255,128,0.1)]">
              <Activity className="w-5 h-5 text-[#00ff80]" />
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <div className={`w-2 h-2 rounded-full ${site.status === 'published' ? 'bg-[#00ff80] animate-pulse shadow-[0_0_15px_#00ff80]' : 'bg-[#ffbd2e]'}`} />
              <span className="text-[9px] uppercase tracking-widest font-bold text-white/80">{site.status}</span>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Network Status</h3>
            <p className="text-4xl font-light tracking-tight text-white">
              {site.status === 'published' ? 'Online' : 'Standby'}
            </p>
          </div>
        </PremiumCard>

      </div>

      {/* Promotional / Action Area - Refined Compact SaaS Module */}
      <motion.div 
        whileHover={{ scale: 1.004 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative rounded-2xl md:rounded-3xl border border-white/[0.08] bg-[#07050e] overflow-hidden group p-6 sm:p-8 lg:px-10 lg:py-7 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 transition-all duration-500 hover:border-violet-500/30"
      >
        {/* Subtle Background Mesh & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-950/40 via-[#07050e] to-fuchsia-950/30 z-0 pointer-events-none" />
        
        {/* Atmospheric Radial Purple Glow */}
        <div className="absolute -right-16 -bottom-16 w-[420px] h-[280px] bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 rounded-full blur-[90px] opacity-60 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none z-0" />
        <div className="absolute -left-16 -top-16 w-[300px] h-[200px] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none z-0" />

        {/* Scaled-down Abstract Flowing Waves Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-[0.14] group-hover:opacity-20 transition-all duration-700 z-0 grayscale mix-blend-luminosity pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.025] mix-blend-overlay z-10 pointer-events-none" />
        
        {/* Decorative Wave SVG for Atmospheric Depth */}
        <svg 
          className="absolute right-0 bottom-0 top-0 h-full w-2/3 opacity-25 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none z-0 overflow-hidden" 
          viewBox="0 0 600 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 120 C 150 40, 300 190, 600 60 L 600 200 L 0 200 Z" 
            fill="url(#purpleWaveGrad)" 
            opacity="0.3"
          />
          <path 
            d="M0 150 C 180 90, 350 180, 600 110 L 600 200 L 0 200 Z" 
            fill="url(#purpleWaveGrad)" 
            opacity="0.5"
          />
          <defs>
            <linearGradient id="purpleWaveGrad" x1="0" y1="0" x2="600" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="1" stopColor="#d946ef" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Content Section: Left (Badge, Heading, Subtitle) */}
        <div className="relative z-20 max-w-2xl">
          {/* Refined Compact Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] backdrop-blur-md rounded-full border border-white/[0.08] mb-3.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#00f0ff]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/80">
              BuildSpace Studio 2.0
            </span>
          </div>
          
          {/* Compact, High-Impact Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-bold tracking-tight mb-2 leading-[1.1] text-white">
            Sculpt your vision.
          </h2>
          
          {/* Restrained Supporting Text */}
          <p className="text-xs sm:text-sm text-white/50 font-normal max-w-lg leading-relaxed">
            Enter the canvas environment to craft every molecular detail of your digital interactive experience.
          </p>
        </div>
        
        {/* Action Button: Right (CTA) */}
        <div className="relative z-20 shrink-0">
          <button 
            onClick={() => router.push(`/sites/${siteId}/builder`)}
            className="group/btn relative overflow-hidden bg-white text-black px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] flex items-center gap-3 shrink-0 shadow-[0_4px_24px_rgba(139,92,246,0.18)] hover:shadow-[0_4px_32px_rgba(255,255,255,0.25)] hover:bg-white/95 active:scale-[0.98] transition-all duration-300"
          >
            <span>Enter Builder</span>
            <span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
