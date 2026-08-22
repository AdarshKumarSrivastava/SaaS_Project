"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Settings, LayoutTemplate, Box, MessageSquare, 
  ChevronRight, Loader2, Users, Receipt
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

// Lazy load or import directly
import OverviewTab from '@/components/admin/OverviewTab';
import OrdersTab from '@/components/admin/OrdersTab';
import ProductsTab from '@/components/admin/ProductsTab';
import CustomersTab from '@/components/admin/CustomersTab';
// Fallbacks for tabs not yet modularized
const FallbackTab = ({ name }: { name: string }) => (
  <div className="h-[500px] flex items-center justify-center border border-dashed border-white/20 rounded-[2rem]">
    <div className="text-center">
      <h2 className="text-2xl font-light mb-2">{name}</h2>
      <p className="text-white/40">Module is currently being upgraded...</p>
    </div>
  </div>
);

export default function AdminPanelPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;
  const { user } = useAuth();
  
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'customers' | 'inbox' | 'settings'>('overview');

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const data = await apiClient.get(`/api/sites/${siteId}`);
        setSite(data);
      } catch (err) {
        toast.error('System synchronization failed');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [siteId]);

  if (loading || !site) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const liveUrl = `http://${site.subdomain}.localhost:3000`; 

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-white/20 overflow-x-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-40 border-b border-white/5 bg-[#020202]/60 backdrop-blur-3xl">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => router.push('/dashboard')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10">
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">Exit</span>
            </button>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-widest uppercase">{site.name}</h1>
              <a href={liveUrl} target="_blank" rel="noreferrer" className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1.5 uppercase font-mono">
                {site.subdomain}.buildspace.app
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-[1600px] mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col xl:flex-row gap-12">
        
        {/* Dock Navigation */}
        <nav className="xl:w-64 shrink-0 flex flex-row xl:flex-col gap-2 overflow-x-auto xl:overflow-visible pb-4 xl:pb-0 scrollbar-none sticky top-32 h-fit">
          <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4 hidden xl:block pl-4">Commerce OS</div>
          {[
            { id: 'overview', label: 'Overview', icon: LayoutTemplate },
            { id: 'orders', label: 'Orders', icon: Receipt },
            { id: 'products', label: 'Products', icon: Box },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'inbox', label: 'Inbox', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-white/10 border border-white/20 rounded-2xl" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab key="overview" siteId={siteId} site={site} />}
            {activeTab === 'orders' && <OrdersTab key="orders" siteId={siteId} />}
            {activeTab === 'products' && <ProductsTab key="products" siteId={siteId} />}
            {activeTab === 'customers' && <CustomersTab key="customers" siteId={siteId} />}
            {activeTab === 'inbox' && <FallbackTab key="inbox" name="Communications" />}
            {activeTab === 'settings' && <FallbackTab key="settings" name="Settings" />}
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
