"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Box, Zap, Sparkles, ChevronRight, Users, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function OverviewTab({ siteId, site }: { siteId: string, site: any }) {
  const router = useRouter();
  const [metrics, setMetrics] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiClient.get(`http://localhost:3001/api/sites/${siteId}/analytics`);
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
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      transition={{ duration: 0.4 }}
      className="space-y-16"
    >
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue Card */}
        <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 overflow-hidden hover:-translate-y-1 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/[0.02] rounded-full blur-3xl group-hover:bg-[#00f0ff]/[0.05] transition-colors" />
          <div className="flex justify-between items-start mb-12">
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
              <TrendingUp className="w-4 h-4 text-white/70" />
            </div>
            <div className="flex items-center gap-2 bg-[#00f0ff]/10 px-3 py-1 rounded-full border border-[#00f0ff]/20">
              <span className="text-[9px] uppercase tracking-widest font-bold text-[#00f0ff]">+12%</span>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Total Revenue</h3>
            <p className="text-3xl font-light tracking-tight">${metrics.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        {/* Orders Card */}
        <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 overflow-hidden hover:-translate-y-1 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffbd2e]/[0.02] rounded-full blur-3xl group-hover:bg-[#ffbd2e]/[0.05] transition-colors" />
          <div className="flex justify-between items-start mb-12">
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
              <Box className="w-4 h-4 text-white/70" />
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Fulfillment Pipeline</h3>
            <p className="text-3xl font-light tracking-tight">{metrics.orders}</p>
          </div>
        </div>

        {/* Customers Card */}
        <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 overflow-hidden hover:-translate-y-1 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.05] transition-colors" />
          <div className="flex justify-between items-start mb-12">
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
              <Users className="w-4 h-4 text-white/70" />
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Active Customers</h3>
            <p className="text-3xl font-light tracking-tight">{metrics.customers}</p>
          </div>
        </div>

        {/* Network Status Card */}
        <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 overflow-hidden hover:-translate-y-1 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.05] transition-colors" />
          <div className="flex justify-between items-start mb-12">
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
              <Activity className="w-4 h-4 text-white/70" />
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <div className={`w-1.5 h-1.5 rounded-full ${site.status === 'published' ? 'bg-[#00f0ff] animate-pulse shadow-[0_0_10px_#00f0ff]' : 'bg-[#ffbd2e]'}`} />
              <span className="text-[9px] uppercase tracking-widest font-bold">{site.status}</span>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Network Status</h3>
            <p className="text-3xl font-light tracking-tight">{site.status === 'published' ? 'Online' : 'Standby'}</p>
          </div>
        </div>

      </div>

      {/* Promotional / Action Area */}
      <div className="relative rounded-[2rem] border border-white/10 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700" />
        
        <div className="relative z-20 p-12 md:p-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
              <Sparkles className="w-3 h-3 text-white" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">BuildSpace Studio</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Sculpt your vision.</h2>
            <p className="text-lg text-white/60 font-light max-w-md leading-relaxed">Enter the builder environment to craft every detail of your interactive digital experience.</p>
          </div>
          
          <button 
            onClick={() => router.push(`/sites/${siteId}/builder`)}
            className="bg-white text-black px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-all shrink-0 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Enter Builder <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
