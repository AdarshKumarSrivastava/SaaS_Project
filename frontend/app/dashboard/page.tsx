"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, LayoutTemplate, ShoppingBag, Scissors, Utensils, Settings } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const categories = [
  { id: 'portfolio', label: 'Portfolio', icon: LayoutTemplate, color: 'bg-blue-500/20 text-blue-400' },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag, color: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'salon', label: 'Salon', icon: Scissors, color: 'bg-purple-500/20 text-purple-400' },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils, color: 'bg-orange-500/20 text-orange-400' }
];

const templatesList = [
  { id: "starter-minimalist", name: "Minimalist", category: "ecommerce", color: 'from-zinc-500/20 to-transparent' },
  { id: "starter-essence", name: "Essence", category: "salon", color: 'from-emerald-500/20 to-transparent' },
  { id: "starter-origin", name: "Origin", category: "portfolio", color: 'from-orange-500/20 to-transparent' },
  { id: "starter-canvas", name: "Canvas", category: "portfolio", color: 'from-blue-500/20 to-transparent' },
  { id: "growth-nexus-pro", name: "Nexus Pro", category: "ecommerce", color: 'from-purple-500/20 to-transparent' },
  { id: "growth-velocity", name: "Velocity", category: "portfolio", color: 'from-red-500/20 to-transparent' },
  { id: "growth-quantum", name: "Quantum", category: "ecommerce", color: 'from-cyan-500/20 to-transparent' },
  { id: "growth-horizon", name: "Horizon", category: "portfolio", color: 'from-fuchsia-500/20 to-transparent' }
];

export default function DashboardPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteCategory, setNewSiteCategory] = useState('portfolio');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const data = await apiClient.get('http://localhost:3001/api/sites');
        setSites(data);
      } catch (err) {
        console.error(err);
        if (String(err).includes('Unauthorized')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, [router]);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const data = await apiClient.post('http://localhost:3001/api/sites', {
        name: newSiteName,
        category: newSiteCategory
      });
      // Route immediately to the wizard (Phase 6)
      router.push(`/sites/${data.id}/setup`);
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  };

  const handleOwnThisTemplate = async (template: typeof templatesList[0]) => {
    setIsCreating(true);
    try {
      const data = await apiClient.post('http://localhost:3001/api/sites', {
        name: `My ${template.name}`,
        category: template.category
      });
      router.push(`/sites/${data.id}/setup`);
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Dashboard</h1>
            <p className="text-zinc-400 mt-1">Manage your web properties.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Site
          </button>
        </header>

        {sites.length === 0 ? (
          <div className="border border-white/10 border-dashed rounded-2xl p-16 text-center bg-white/5">
            <h3 className="text-xl font-medium mb-2">No sites yet</h3>
            <p className="text-zinc-400 mb-6 text-sm">Create your first site to get started.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white/10 text-white border border-white/20 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Create Site
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map(site => (
              <div key={site.id} className="group bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg ${categories.find(c => c.id === site.category)?.color || 'bg-white/10'}`}>
                    {categories.find(c => c.id === site.category)?.icon({ className: "w-5 h-5" })}
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 bg-white/10 rounded-full text-zinc-300">
                    {site.status === 'draft' ? 'Draft' : 'Live'}
                  </span>
                </div>
                <h3 className="text-lg font-medium truncate">{site.name}</h3>
                <p className="text-zinc-500 text-sm mt-1 mb-6 truncate">{site.subdomain}.buildspace.app</p>
                
                <div className="mt-auto flex items-center gap-3">
                  <button onClick={() => router.push(`/sites/${site.id}/setup`)} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm py-2 rounded-lg transition-colors flex justify-center items-center gap-2">
                    <Settings className="w-4 h-4" /> Setup
                  </button>
                  <button onClick={() => router.push(`/sites/${site.id}/builder`)} className="flex-1 bg-white text-black hover:bg-zinc-200 text-sm py-2 rounded-lg transition-colors">
                    Builder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Templates Gallery Section */}
        <div className="mt-24">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-medium tracking-tight">Template Gallery</h2>
              <p className="text-zinc-400 mt-1 text-sm">Start with a professionally designed template.</p>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesList.map(template => (
              <div key={template.id} className="group bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col h-full relative">
                
                {/* Template Preview Header */}
                <div className={`h-40 w-full bg-gradient-to-br ${template.color} border-b border-white/5 relative flex items-center justify-center p-6`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative w-full h-full bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 flex items-center justify-center shadow-2xl">
                     <div className="text-white/20 font-bold tracking-widest uppercase text-sm">Preview</div>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">{template.name}</h3>
                    <span className="text-xs font-medium px-2.5 py-1 bg-white/5 rounded-full text-zinc-400">
                      {categories.find(c => c.id === template.category)?.label || template.category}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-6 flex items-center gap-3">
                    <button 
                      onClick={() => handleOwnThisTemplate(template)} 
                      disabled={isCreating}
                      className="flex-1 bg-white text-black hover:bg-zinc-200 text-sm font-medium py-2.5 rounded-lg transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      Own This
                    </button>
                    <a href={`/templates/${template.id.replace('starter-', '').replace('growth-', '')}?mode=preview`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/10 hover:bg-white/20 text-white text-center text-sm font-medium py-2.5 rounded-lg transition-colors">
                      Live Demo
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-lg font-medium">Create New Site</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <form id="create-site-form" onSubmit={handleCreateSite} className="space-y-6">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Project Name</label>
                    <input 
                      type="text" 
                      value={newSiteName}
                      onChange={(e) => setNewSiteName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="e.g., My Awesome Startup"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-zinc-400 mb-3">Select Category</label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map(cat => {
                        const Icon = cat.icon;
                        const isSelected = newSiteCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setNewSiteCategory(cat.id)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              isSelected 
                                ? 'bg-white/10 border-white/30 ring-1 ring-white/30' 
                                : 'bg-transparent border-white/10 hover:bg-white/5'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${cat.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <h4 className="font-medium text-sm text-white">{cat.label}</h4>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-white/10 bg-black/50 mt-auto">
                <button 
                  type="submit"
                  form="create-site-form"
                  disabled={isCreating || !newSiteName}
                  className="w-full bg-white text-black font-medium py-3 rounded-lg text-sm flex items-center justify-center hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Provisioning...' : 'Create Project'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
