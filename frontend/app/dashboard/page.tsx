"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, LayoutTemplate, ShoppingBag, Scissors, Utensils, Settings, ArrowRight, Globe, Search } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/Button';
import { TransitionLink } from '@/components/TransitionLink';

const categories = [
  { id: 'portfolio', label: 'Portfolio', icon: LayoutTemplate, accent: 'bg-blue-50 text-blue-600 border-blue-100' },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag, accent: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: 'salon', label: 'Salon', icon: Scissors, accent: 'bg-purple-50 text-purple-600 border-purple-100' },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils, accent: 'bg-orange-50 text-orange-600 border-orange-100' }
];

const templatesList = [
  { id: "starter-minimalist", name: "Minimalist", category: "ecommerce", description: "Clean, focused e-commerce storefront", img: "/images/templates/minimalist.jpg" },
  { id: "starter-essence", name: "Essence", category: "salon", description: "Elegant salon & beauty booking", img: "/images/templates/salon.jpg" },
  { id: "starter-origin", name: "Origin", category: "portfolio", description: "Refined portfolio showcase", img: "/images/templates/portfolio.jpg" },
  { id: "starter-canvas", name: "Canvas", category: "portfolio", description: "Creative portfolio with depth", img: "/images/templates/portfolio.jpg" },
  { id: "growth-nexus-pro", name: "Nexus Pro", category: "ecommerce", description: "Full-featured commerce platform", img: "/images/templates/minimalist.jpg" },
  { id: "growth-velocity", name: "Velocity", category: "portfolio", description: "Performance-first portfolio", img: "/images/templates/tech.jpg" },
  { id: "growth-quantum", name: "Quantum", category: "ecommerce", description: "Advanced commerce engine", img: "/images/templates/tech.jpg" },
  { id: "growth-horizon", name: "Horizon", category: "portfolio", description: "Expansive creative portfolio", img: "/images/templates/portfolio.jpg" }
];

export default function DashboardPage() {
  const router = useRouter();
   
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
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
          <span className="text-sm text-ink-soft">Loading your workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-ink relative z-0">
      {/* Premium Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <img 
          src="/images/shapes_bg.jpg" 
          alt="Premium Background" 
          className="w-full h-full object-cover opacity-30 mix-blend-multiply"
        />
      </div>

      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-bg-elevated/80 backdrop-blur-3xl border-b border-line/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <TransitionLink href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md bg-ink flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-bg-elevated font-bold text-xs">B</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">BuildSpace</span>
          </TransitionLink>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-ink text-bg-elevated px-4 py-2 rounded-full text-sm font-medium hover:bg-ink/90 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        {/* Premium Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-subtle border border-line mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium tracking-wide text-ink-soft">Workspace Operational</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink mb-2">Welcome back.</h1>
              <p className="text-lg text-ink-soft font-light">Here's an overview of your web properties today.</p>
            </div>
            
            <div className="flex items-center gap-8 bg-bg-elevated/80 p-6 rounded-3xl border border-line backdrop-blur-md shadow-sm">
              <div>
                <p className="text-sm font-medium text-ink-soft mb-1">Active Projects</p>
                <p className="text-3xl font-semibold">{sites.length}</p>
              </div>
              <div className="w-px h-12 bg-line"></div>
              <div>
                <p className="text-sm font-medium text-ink-soft mb-1">Network Traffic</p>
                <p className="text-3xl font-semibold flex items-center gap-2">
                  12.4k <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">+14%</span>
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Sites Grid */}
        {sites.length === 0 ? (
          <ScrollReveal delay={0.1}>
            <div className="border border-dashed border-line rounded-3xl p-20 text-center bg-gradient-to-b from-bg-elevated to-bg-base shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-bg-subtle border border-line shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
                  <Globe className="w-8 h-8 text-ink-soft group-hover:text-ink transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-2">No projects yet</h3>
                <p className="text-ink-soft text-base mb-8 max-w-sm mx-auto font-light">Your workspace is empty. Create your first high-performance project to start building.</p>
                <Button onClick={() => setIsModalOpen(true)} size="lg" className="rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" /> Start Your First Project
                </Button>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sites.map((site, i) => {
              const cat = categories.find(c => c.id === site.category);
              const CatIcon = cat?.icon || Globe;
              return (
                <ScrollReveal key={site.id} delay={i * 0.05}>
                  <div className="group bg-bg-elevated border border-line rounded-2xl p-6 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-line/80 transition-all duration-300 ease-out flex flex-col h-full">
                    <div className="flex justify-between items-start mb-5">
                      <div className={`p-2.5 rounded-xl border ${cat?.accent || 'bg-bg-subtle text-ink-soft border-line'}`}>
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        site.status === 'draft' 
                          ? 'bg-amber-50 text-amber-600 border-amber-100' 
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {site.status === 'draft' ? 'Draft' : 'Live'}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold truncate">{site.name}</h3>
                    <p className="text-ink-soft text-sm mt-0.5 mb-6 truncate">{site.subdomain}.buildspace.app</p>
                    
                    <div className="mt-auto flex items-center gap-2.5">
                      <button 
                        onClick={() => router.push(`/sites/${site.id}/setup`)} 
                        className="flex-1 bg-bg-subtle hover:bg-bg-base text-ink text-sm py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 border border-line font-medium"
                      >
                        <Settings className="w-3.5 h-3.5" /> Setup
                      </button>
                      <button 
                        onClick={() => router.push(`/sites/${site.id}/builder`)} 
                        className="flex-1 bg-ink text-bg-elevated hover:bg-ink/90 text-sm py-2.5 rounded-xl transition-colors font-medium shadow-sm"
                      >
                        Builder
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* Templates Gallery */}
        <div className="mt-20">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Template Gallery</h2>
                <p className="text-ink-soft mt-1 text-sm">Start with a professionally designed template.</p>
              </div>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {templatesList.map((template, i) => {
              const cat = categories.find(c => c.id === template.category);
              return (
                <ScrollReveal key={template.id} delay={i * 0.04}>
                  <div className="group bg-bg-elevated border border-line rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-line/80 transition-all duration-300 ease-out flex flex-col h-full">
                    {/* Preview Area */}
                    <div className="h-40 w-full bg-bg-subtle border-b border-line relative overflow-hidden group/preview">
                      <img 
                        src={template.img} 
                        alt={template.name}
                        className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-700 ease-out" 
                      />
                      <div className="absolute inset-0 bg-ink/5 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-sm font-semibold">{template.name}</h3>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cat?.accent || 'bg-bg-subtle text-ink-soft border-line'}`}>
                          {cat?.label || template.category}
                        </span>
                      </div>
                      <p className="text-xs text-ink-soft mb-4">{template.description}</p>
                      
                      <div className="mt-auto flex items-center gap-2">
                        <button 
                          onClick={() => handleOwnThisTemplate(template)} 
                          disabled={isCreating}
                          className="flex-1 bg-ink text-bg-elevated hover:bg-ink/90 text-xs font-medium py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                          Use Template
                        </button>
                        <a 
                          href={`/templates/${template.id.replace('starter-', '').replace('growth-', '')}?mode=preview`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex-1 bg-bg-subtle hover:bg-bg-base text-ink text-center text-xs font-medium py-2 rounded-lg transition-colors border border-line"
                        >
                          Preview
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
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
              className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 12 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg bg-bg-elevated border border-line rounded-2xl shadow-[0_24px_64px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-line flex justify-between items-center">
                <h2 className="text-lg font-semibold">Create New Project</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-ink-soft hover:text-ink transition-colors p-1 rounded-lg hover:bg-bg-subtle">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <form id="create-site-form" onSubmit={handleCreateSite} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Project Name</label>
                    <input 
                      type="text" 
                      value={newSiteName}
                      onChange={(e) => setNewSiteName(e.target.value)}
                      className="w-full bg-bg-base border border-line rounded-xl px-4 py-3 text-ink text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/50"
                      placeholder="e.g., My Awesome Startup"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-ink mb-3">Category</label>
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
                                ? 'bg-bg-subtle border-ink ring-1 ring-ink/20' 
                                : 'bg-bg-elevated border-line hover:bg-bg-subtle'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 border ${cat.accent}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <h4 className="font-medium text-sm text-ink">{cat.label}</h4>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-line bg-bg-subtle/50 mt-auto">
                <button 
                  type="submit"
                  form="create-site-form"
                  disabled={isCreating || !newSiteName}
                  className="w-full bg-ink text-bg-elevated font-medium py-3 rounded-xl text-sm flex items-center justify-center hover:bg-ink/90 transition-colors disabled:opacity-50 shadow-sm"
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
