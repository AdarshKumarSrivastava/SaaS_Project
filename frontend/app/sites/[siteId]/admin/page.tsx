"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowLeft, Globe, Settings, LayoutTemplate, ShoppingBag, 
  Plus, Edit2, Trash2, Loader2, Save, Image as ImageIcon,
  ExternalLink, Rocket, Activity, Box, BarChart3, ChevronRight, Zap, Sparkles, Lock
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AdminPanelPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;
  const { user } = useAuth();
  
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'settings'>('overview');

  // Product State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', category: '', image: '' });
  const [savingProduct, setSavingProduct] = useState(false);
  const [deploying, setDeploying] = useState(false);

  // Parallax setup
  const { scrollYProgress } = useScroll();
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    fetchSiteAndProducts();
  }, [siteId]);

  const fetchSiteAndProducts = async () => {
    try {
      setLoading(true);
      const [siteData, productsData] = await Promise.all([
        apiClient.get(`http://localhost:3001/api/sites/${siteId}`),
        apiClient.get(`http://localhost:3001/api/sites/${siteId}/products`)
      ]);
      setSite(siteData);
      setProducts(productsData);
    } catch (err) {
      console.error(err);
      toast.error('System synchronization failed');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const payload = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        category: productForm.category,
        image: productForm.image
      };

      if (editingProduct) {
        await apiClient.patch(`http://localhost:3001/api/sites/${siteId}/products/${editingProduct.id}`, payload);
        toast.success('Product metrics updated');
      } else {
        await apiClient.post(`http://localhost:3001/api/sites/${siteId}/products`, payload);
        toast.success('Asset integrated successfully');
      }
      setIsProductModalOpen(false);
      fetchSiteAndProducts();
    } catch (err) {
      toast.error('Integration failure');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Eradicate this asset from the database? This action is irreversible.')) return;
    try {
      await apiClient.delete(`http://localhost:3001/api/sites/${siteId}/products/${productId}`);
      toast.success('Asset eradicated');
      fetchSiteAndProducts();
    } catch (err) {
      toast.error('Failed to eradicate asset');
    }
  };

  const openProductModal = (prod: any = null) => {
    setEditingProduct(prod);
    if (prod) {
      setProductForm({ name: prod.name, price: prod.price.toString(), category: prod.category || '', image: prod.image || '' });
    } else {
      setProductForm({ name: '', price: '', category: '', image: '' });
    }
    setIsProductModalOpen(true);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      await apiClient.patch(`http://localhost:3001/api/sites/${siteId}`, { status: 'published' });
      toast.success('Sequence initialized. Site is now live.');
      fetchSiteAndProducts();
    } catch (err) {
      toast.error('Deployment sequence failed');
    } finally {
      setDeploying(false);
    }
  };

  if (loading || !site) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center font-sans selection:bg-white/20">
        <div className="flex flex-col items-center gap-8">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 border-t border-white/20 rounded-full animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-0 border-r border-white/40 rounded-full animate-[spin_2s_linear_infinite]" />
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold text-center">Establishing Secure Link</span>
        </div>
      </div>
    );
  }

  const liveUrl = `http://${site.subdomain}.localhost:3000`; 

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-white/20 overflow-x-hidden">
      
      {/* Cinematic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-white/[0.03] to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Floating Header / Navigation */}
      <header className="fixed top-0 left-0 w-full z-40 border-b border-white/5 bg-[#020202]/60 backdrop-blur-3xl transition-all duration-500">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:scale-105 transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">Exit to Core</span>
            </button>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-widest uppercase">{site.name}</h1>
              <a href={liveUrl} target="_blank" rel="noreferrer" className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1.5 mt-0.5 uppercase tracking-widest font-mono">
                {site.subdomain}.buildspace.app <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/sites/${siteId}/builder`)}
              className="relative group overflow-hidden bg-white/5 border border-white/10 px-6 py-2.5 rounded-full flex items-center gap-2 transition-all hover:border-white/30"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Edit2 className="w-3.5 h-3.5 relative z-10 text-white/70 group-hover:text-white transition-colors" />
              <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 group-hover:text-white transition-colors">Edit Template</span>
            </button>

            <button 
              onClick={handleDeploy}
              disabled={deploying}
              className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {deploying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
              Deploy
            </button>
          </div>

        </div>
      </header>

      {/* Main Layout & Secondary Nav */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-32 pb-24 relative z-10 flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Cinematic Vertical Nav */}
        <nav className="md:w-48 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-none sticky top-32 h-fit">
          <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4 hidden md:block pl-4">Command Center</div>
          {[
            { id: 'overview', label: 'Overview', icon: LayoutTemplate },
            { id: 'products', label: 'Inventory', icon: Box },
            { id: 'settings', label: 'System', icon: Settings },
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
                  <motion.div 
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-white/10 border border-white/20 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Content Area */}
        <main className="flex-1 min-w-0 relative">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                className="space-y-16"
              >
                {/* Hero Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Status Card */}
                  <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 overflow-hidden">
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

                  {/* Inventory Card */}
                  <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.05] transition-colors" />
                    <div className="flex justify-between items-start mb-12">
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
                        <Box className="w-4 h-4 text-white/70" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Active Products</h3>
                      <p className="text-3xl font-light tracking-tight">{products.length}</p>
                    </div>
                  </div>

                  {/* Engine Card */}
                  <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-white/[0.05] transition-colors" />
                    <div className="flex justify-between items-start mb-12">
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
                        <Zap className="w-4 h-4 text-white/70" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Template Core</h3>
                      <p className="text-2xl font-light tracking-tight capitalize">{site.schema?.global?.templateSlug || 'Velocity'}</p>
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
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <motion.div 
                key="products"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div>
                    <h2 className="text-4xl font-light tracking-tight mb-3">Inventory Matrix</h2>
                    <p className="text-white/50 text-sm max-w-md font-light leading-relaxed">Manage your digital and physical assets. Changes made here will immediately synchronize across your global edge network.</p>
                  </div>
                  <button onClick={() => openProductModal()} className="bg-white text-black px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:scale-105 transition-all shrink-0">
                    <Plus className="w-4 h-4" /> Initialize Asset
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="border border-dashed border-white/20 rounded-[2rem] p-24 flex flex-col items-center justify-center text-center bg-white/[0.01]">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
                      <Box className="w-8 h-8 text-white/40" />
                    </div>
                    <h3 className="text-2xl font-light mb-3">Database Empty</h3>
                    <p className="text-white/40 mb-8 max-w-sm font-light">No assets detected in the primary partition. Initialize your first product to begin.</p>
                    <button onClick={() => openProductModal()} className="bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
                      Initialize Asset
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((prod, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}
                        key={prod.id} 
                        className="group bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden hover:border-white/30 transition-all duration-500 hover:-translate-y-1"
                      >
                        <div className="aspect-[4/3] bg-black relative overflow-hidden">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[url('/images/noise.png')] opacity-20">
                              <ImageIcon className="w-10 h-10 text-white/20" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
                          <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                            <button onClick={() => openProductModal(prod)} className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteProduct(prod.id)} className="w-8 h-8 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-6 relative">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <h3 className="text-lg font-semibold tracking-tight">{prod.name}</h3>
                            <span className="font-mono text-sm tracking-tighter">${prod.price.toFixed(2)}</span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                            <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em]">{prod.category || 'Uncategorized'}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                className="max-w-2xl"
              >
                <div className="mb-12">
                  <h2 className="text-4xl font-light tracking-tight mb-3">System Configuration</h2>
                  <p className="text-white/50 text-sm font-light leading-relaxed">Adjust core parameters for your deployment instance.</p>
                </div>

                <div className="space-y-8">
                  {/* Name Input Group */}
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Project Designation</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        disabled 
                        value={site.name} 
                        className="w-full bg-transparent border-b border-white/20 pb-3 text-xl font-light text-white/80 focus:outline-none focus:border-white transition-colors cursor-not-allowed" 
                      />
                      <Lock className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    </div>
                  </div>

                  {/* Domain Input Group */}
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Edge Network Subdomain</label>
                    <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl p-2 pl-6">
                      <input 
                        type="text" 
                        disabled 
                        value={site.subdomain} 
                        className="flex-1 bg-transparent text-lg font-light text-white/80 focus:outline-none cursor-not-allowed min-w-0" 
                      />
                      <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/5 whitespace-nowrap">
                        <span className="text-xs font-mono text-white/60">.buildspace.app</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/40 mt-4 leading-relaxed font-light">Custom domain mapping is restricted in the current tier. Upgrade to Enterprise to configure apex domains.</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* PRODUCT MODAL - Glassmorphic Overlay */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
              onClick={() => setIsProductModalOpen(false)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-2xl p-10 md:p-14 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
              
              <h3 className="text-3xl font-light tracking-tight mb-8 relative z-10">{editingProduct ? 'Modify Asset' : 'Initialize Asset'}</h3>
              
              <form onSubmit={handleProductSubmit} className="space-y-8 relative z-10">
                
                <div className="relative group/input">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3 group-focus-within/input:text-white transition-colors">Asset Designation</label>
                  <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-black/50 border border-white/10 focus:border-white/50 rounded-2xl px-6 py-5 text-sm font-light transition-all outline-none" placeholder="e.g. Cybernetic Implant V2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative group/input">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3 group-focus-within/input:text-white transition-colors">Market Value ($)</label>
                    <input required type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-black/50 border border-white/10 focus:border-white/50 rounded-2xl px-6 py-5 text-sm font-light font-mono transition-all outline-none" placeholder="299.99" />
                  </div>
                  <div className="relative group/input">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3 group-focus-within/input:text-white transition-colors">Classification</label>
                    <input type="text" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-black/50 border border-white/10 focus:border-white/50 rounded-2xl px-6 py-5 text-sm font-light transition-all outline-none" placeholder="e.g. Hardware" />
                  </div>
                </div>

                <div className="relative group/input">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3 group-focus-within/input:text-white transition-colors">Visual Matrix (Image URL)</label>
                  <input type="url" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="w-full bg-black/50 border border-white/10 focus:border-white/50 rounded-2xl px-6 py-5 text-sm font-light transition-all outline-none" placeholder="https://source.unsplash.com/..." />
                  
                  {productForm.image && (
                    <div className="mt-6 w-full h-48 rounded-[1.5rem] bg-black border border-white/10 overflow-hidden relative group/img">
                      <img src={productForm.image} alt="Preview" className="w-full h-full object-cover opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-[10px] font-mono tracking-widest text-white/60 uppercase">Preview Validated</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-4 pt-4">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 bg-white/5 text-white/70 hover:text-white font-bold py-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors text-xs uppercase tracking-widest">Abort</button>
                  <button type="submit" disabled={savingProduct} className="flex-[2] bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all disabled:opacity-50 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                    {savingProduct ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingProduct ? 'Commit Changes' : 'Initialize')}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
