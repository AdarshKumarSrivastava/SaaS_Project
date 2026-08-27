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

      {/* Promotional / Action Area */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative rounded-[2rem] border border-white/10 overflow-hidden group min-h-[400px] flex items-center"
      >
        <div className="absolute inset-0 bg-[#050505] z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-[#050505] to-fuchsia-600/20 z-10 mix-blend-screen" />
        
        {/* Animated Mesh / Gradient Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 rounded-full blur-[100px] opacity-50 group-hover:opacity-80 transition-opacity duration-1000 z-10 mix-blend-screen pointer-events-none" />

        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:scale-105 group-hover:opacity-30 transition-all duration-1000 z-0 grayscale mix-blend-luminosity" />
        
        <div className="relative z-30 p-12 md:p-20 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8 shadow-2xl"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">BuildSpace Studio 2.0</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              Sculpt your <br/>vision.
            </h2>
            <p className="text-xl text-white/50 font-light max-w-lg leading-relaxed mb-10">
              Enter the canvas environment to craft every molecular detail of your digital interactive experience.
            </p>
          </div>
          
          <button 
            onClick={() => router.push(`/sites/${siteId}/builder`)}
            className="group/btn relative overflow-hidden bg-white text-black px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4 shrink-0 shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:shadow-[0_0_80px_rgba(255,255,255,0.3)] transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white via-[#f0f0f0] to-white opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-4">
              Enter Builder 
              <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform duration-300">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
