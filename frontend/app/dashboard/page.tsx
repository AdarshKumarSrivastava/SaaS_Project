"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, LayoutTemplate, ShoppingBag, Scissors, Utensils, Settings, 
  ArrowRight, Globe, Search, Bell, Zap, BarChart3, Database, ShieldCheck, 
  LayoutGrid, List, Sparkles, Layers, Cpu, ExternalLink, Activity, MoreHorizontal, Trash2, Copy
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/Button';
import { TransitionLink } from '@/components/TransitionLink';
import { InteractiveTemplateCard } from '@/components/ui/InteractiveTemplateCard';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { useAuth } from '@/context/AuthContext';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';

const categories = [
  { id: 'portfolio', label: 'Portfolio', icon: LayoutTemplate, accent: 'bg-blue-50 text-blue-600 border-blue-100', description: 'Personal, architectural & creative showcases.' },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag, accent: 'bg-emerald-50 text-emerald-600 border-emerald-100', description: 'Storefronts with high conversion primitives.' },
  { id: 'salon', label: 'Salon & Beauty', icon: Scissors, accent: 'bg-purple-50 text-purple-600 border-purple-100', description: 'Luxury booking & service scheduling.' },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils, accent: 'bg-orange-50 text-orange-600 border-orange-100', description: 'Dining menus & reservation experiences.' },
  { id: 'tech', label: 'Tech & AI', icon: Cpu, accent: 'bg-cyan-50 text-cyan-600 border-cyan-100', description: 'SaaS platforms & developer tools.' },
  { id: 'studio', label: 'Digital Studio', icon: Layers, accent: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100', description: 'Agencies & production portfolios.' }
];

const templatesList = [
  { id: "starter-minimalist", name: "Minimalist", category: "ecommerce", description: "Clean, focused e-commerce storefront with high conversion primitives.", img: "/images/templates/minimalist.jpg", href: "/templates/minimalist" },
  { id: "starter-essence", name: "Essence", category: "salon", description: "Elegant salon & luxury beauty booking experience.", img: "/images/templates/salon.jpg", href: "/templates/essence" },
  { id: "starter-origin", name: "Origin", category: "portfolio", description: "Refined architectural portfolio showcase with editorial depth.", img: "/images/templates/portfolio.jpg", href: "/templates/origin" },
  { id: "starter-canvas", name: "Canvas", category: "portfolio", description: "Creative portfolio with immersive layout and typography.", img: "/images/templates/portfolio.jpg", href: "/templates/canvas" },
  { id: "growth-nexus-pro", name: "Nexus Pro", category: "ecommerce", description: "Full-featured tech & gadgets commerce platform.", img: "/images/templates/minimalist.jpg", href: "/templates/nexus-pro" },
  { id: "growth-velocity", name: "Velocity", category: "portfolio", description: "Performance-first cyberpunk developer portfolio.", img: "/images/templates/tech.jpg", href: "/templates/velocity" },
  { id: "growth-quantum", name: "Quantum", category: "ecommerce", description: "Advanced kinetic commerce engine with dynamic product cards.", img: "/images/templates/tech.jpg", href: "/templates/quantum" },
  { id: "growth-horizon", name: "Horizon", category: "portfolio", description: "Expansive digital agency & studio portfolio.", img: "/images/templates/portfolio.jpg", href: "/templates/horizon" }
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
   
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteCategory, setNewSiteCategory] = useState('portfolio');
  const [isCreating, setIsCreating] = useState(false);

  // Template & Project Filtering states
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [projectSearch, setProjectSearch] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeSiteMenu, setActiveSiteMenu] = useState<string | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.site-menu-container')) {
        setActiveSiteMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    // Handle OAuth Redirect Tokens
    if (typeof window !== 'undefined') {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const cookieAccessToken = getCookie('accessToken');
      if (cookieAccessToken) {
        localStorage.setItem('accessToken', cookieAccessToken);
        localStorage.setItem('token', cookieAccessToken);
        document.cookie = 'accessToken=; Max-Age=-99999999; path=/';
      }

      // Legacy fallback (can be removed once we are sure it works)
      const urlParams = new URLSearchParams(window.location.search);
      const urlAccessToken = urlParams.get('accessToken');
      if (urlAccessToken) {
        localStorage.setItem('accessToken', urlAccessToken);
        localStorage.setItem('token', urlAccessToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    const fetchSites = async () => {
      try {
        const data = await apiClient.get('http://localhost:3001/api/sites');
        setSites(data);
      } catch (err) {
        console.warn('Dashboard auth check:', err);
        router.push('/login');
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

  // Filter user projects
  const filteredSites = sites.filter((site) => {
    const matchesSearch = site.name.toLowerCase().includes(projectSearch.toLowerCase()) || 
                          site.subdomain?.toLowerCase().includes(projectSearch.toLowerCase());
    const matchesStatus = projectFilter === 'all' || 
                          (projectFilter === 'live' && site.status === 'live') ||
                          (projectFilter === 'draft' && (site.status === 'draft' || !site.status));
    return matchesSearch && matchesStatus;
  });

  // Filter templates based on active category & search query
  const filteredTemplates = templatesList.filter((template) => {
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col">
        {/* Fake Navbar Skeleton */}
        <nav className="sticky top-0 z-40 bg-bg-elevated/80 backdrop-blur-3xl border-b border-line/50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-lg bg-line/50 animate-pulse" />
              <div className="w-24 h-5 bg-line/50 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-line/50 animate-pulse" />
              <div className="w-28 h-8 rounded-full bg-line/50 animate-pulse hidden sm:block" />
              <div className="w-8 h-8 rounded-full bg-line/50 animate-pulse" />
            </div>
          </div>
        </nav>

        {/* Dashboard Content Skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
          <div className="mb-10">
            <div className="w-40 h-6 bg-line/40 rounded-full animate-pulse mb-4" />
            <div className="w-64 h-10 bg-line/40 rounded-lg animate-pulse mb-3" />
            <div className="w-96 h-5 bg-line/30 rounded animate-pulse mb-8" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-bg-elevated/50 p-5 rounded-2xl border border-line/50">
                  <div className="flex justify-between mb-4">
                    <div className="w-20 h-4 bg-line/40 rounded animate-pulse" />
                    <div className="w-8 h-8 bg-line/40 rounded-xl animate-pulse" />
                  </div>
                  <div className="w-16 h-8 bg-line/40 rounded animate-pulse mb-2" />
                  <div className="w-32 h-3 bg-line/30 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 flex justify-between items-end">
            <div>
              <div className="w-48 h-8 bg-line/40 rounded animate-pulse mb-2" />
              <div className="w-72 h-4 bg-line/30 rounded animate-pulse" />
            </div>
            <div className="w-64 h-10 bg-line/40 rounded-full animate-pulse hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-bg-elevated/50 border border-line/50 rounded-2xl p-6 h-[180px] flex flex-col">
                <div className="flex justify-between mb-4">
                  <div className="w-10 h-10 bg-line/40 rounded-xl animate-pulse" />
                  <div className="w-16 h-5 bg-line/40 rounded-full animate-pulse" />
                </div>
                <div className="w-32 h-5 bg-line/40 rounded animate-pulse mb-2" />
                <div className="w-48 h-3 bg-line/30 rounded animate-pulse mb-auto" />
                <div className="flex gap-2">
                  <div className="w-1/2 h-8 bg-line/40 rounded-xl animate-pulse" />
                  <div className="w-1/2 h-8 bg-line/40 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-ink relative z-0 flex flex-col justify-between">
      {/* Premium Background Ambient Mesh */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <img 
          src="/images/shapes_bg.jpg" 
          alt="Premium Background" 
          className="w-full h-full object-cover opacity-25 mix-blend-multiply"
        />
      </div>

      <div>
        {/* Top Apple-Grade Nav Bar */}
        <nav className="sticky top-0 z-40 bg-bg-elevated/80 backdrop-blur-3xl border-b border-line/50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Brand Logo & Status */}
            <div className="flex items-center gap-4">
              <TransitionLink href="/" className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="text-bg-elevated font-bold text-xs">B</span>
                </div>
                <span className="font-bold text-lg tracking-tight">BuildSpace</span>
              </TransitionLink>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">Empire Pro</span>
              </div>
            </div>

            {/* Quick Actions & Profile Dropdown */}
            <div className="flex items-center gap-3">
              {/* Notifications Button */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-xl bg-bg-subtle/80 border border-line/60 hover:bg-bg-elevated text-ink-soft hover:text-ink transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
                </button>

                {/* Notifications Popover */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-bg-elevated border border-line rounded-2xl shadow-2xl p-4 z-50"
                    >
                      <div className="flex justify-between items-center pb-3 border-b border-line">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">System Notifications</h4>
                        <span className="text-[10px] bg-accent/10 text-accent font-semibold px-2 py-0.5 rounded-full">1 New</span>
                      </div>
                      <div className="py-3 space-y-3">
                        <div className="flex gap-3 items-start">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-ink">Global Edge Node Deployed</p>
                            <p className="text-[11px] text-ink-soft mt-0.5">All 8 template sites are now optimized with 14ms latency.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Create New Project */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-ink text-bg-elevated px-4 py-2 rounded-full text-xs font-semibold hover:bg-ink/90 transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>

              {/* Profile Dropdown Component */}
              <div className="pl-1 border-l border-line/60">
                <ProfileDropdown user={user} logout={logout} />
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content Body */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          
          {/* Header & Overview Stats */}
          <ScrollReveal>
            <div className="mb-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-subtle border border-line mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium tracking-wide text-ink-soft">Workspace Operational</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink mb-1.5">
                    Welcome back{user?.first_name ? `, ${user.first_name}` : ''}.
                  </h1>
                  <p className="text-base text-ink-soft font-light">Here is your digital empire overview and live performance metrics.</p>
                </div>
              </div>

              {/* Analytics & System Health Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-bg-elevated/90 p-5 rounded-2xl border border-line backdrop-blur-md shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Active Projects</span>
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Globe className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-ink">{sites.length}</p>
                  <p className="text-xs text-ink-soft mt-1">Live web properties</p>
                </div>

                <div className="bg-bg-elevated/90 p-5 rounded-2xl border border-line backdrop-blur-md shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Network Traffic</span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-ink">14.8k</p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">+18%</span>
                  </div>
                  <p className="text-xs text-ink-soft mt-1">Unique monthly visitors</p>
                </div>

                <div className="bg-bg-elevated/90 p-5 rounded-2xl border border-line backdrop-blur-md shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Global Latency</span>
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-ink">12 ms</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">99.99% Edge Uptime</p>
                </div>

                <div className="bg-bg-elevated/90 p-5 rounded-2xl border border-line backdrop-blur-md shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Storage Used</span>
                    <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                      <Database className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-ink">4.2 GB</p>
                  <p className="text-xs text-ink-soft mt-1">of 50 GB allocated</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* User Projects Section */}
          <div className="mb-20">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-ink">Your Projects</h2>
                  <p className="text-xs text-ink-soft mt-0.5">Manage, build, and deploy your custom web applications.</p>
                </div>

                {/* Project Search & View Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <input
                      type="text"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="Filter projects..."
                      className="w-full bg-bg-elevated border border-line rounded-full pl-8 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-1 bg-bg-subtle p-1 rounded-full border border-line/60">
                    {(['all', 'live', 'draft'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setProjectFilter(filter)}
                        className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all ${
                          projectFilter === filter
                            ? 'bg-ink text-bg-elevated shadow-sm'
                            : 'text-ink-soft hover:text-ink'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-bg-subtle p-1 rounded-xl border border-line/60">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-bg-elevated text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
                      }`}
                      aria-label="Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-bg-elevated text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
                      }`}
                      aria-label="List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Sites Render Area */}
            {filteredSites.length === 0 ? (
              <ScrollReveal delay={0.1}>
                <div className="border border-dashed border-line rounded-3xl p-16 text-center bg-gradient-to-b from-bg-elevated to-bg-base shadow-sm relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-bg-subtle border border-line shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-all">
                      <Globe className="w-7 h-7 text-ink-soft" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight mb-1.5">No projects found</h3>
                    <p className="text-ink-soft text-sm mb-6 max-w-sm mx-auto font-light">
                      {projectSearch ? 'No projects match your filter query.' : 'Your workspace is empty. Create your first project to start building.'}
                    </p>
                    <Button onClick={() => setIsModalOpen(true)} size="md" className="rounded-xl shadow-md">
                      <Plus className="w-4 h-4 mr-2" /> Start New Project
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSites.map((site, i) => {
                  const cat = categories.find(c => c.id === site.category);
                  const CatIcon = cat?.icon || Globe;
                  return (
                    <ScrollReveal key={site.id} delay={i * 0.05}>
                      <div className="group bg-bg-elevated border border-line/80 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:border-line transition-all duration-300 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-5 relative site-menu-container">
                          <div className={`p-2.5 rounded-xl border ${cat?.accent || 'bg-bg-subtle text-ink-soft border-line'}`}>
                            <CatIcon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                              site.status === 'draft' 
                                ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            }`}>
                              {site.status === 'draft' ? 'Draft' : 'Live'}
                            </span>
                            
                            {/* Quick Actions Menu Trigger */}
                            <button 
                              onClick={() => setActiveSiteMenu(activeSiteMenu === site.id ? null : site.id)}
                              className="p-1.5 rounded-lg text-ink-soft hover:bg-bg-subtle hover:text-ink transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Quick Actions Dropdown */}
                          <AnimatePresence>
                            {activeSiteMenu === site.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute top-10 right-0 w-40 bg-bg-elevated border border-line rounded-xl shadow-xl z-20 py-1 overflow-hidden"
                              >
                                <button className="w-full px-4 py-2 text-left text-xs text-ink hover:bg-bg-subtle flex items-center gap-2 transition-colors">
                                  <ExternalLink className="w-3.5 h-3.5 text-ink-soft" /> View Live
                                </button>
                                <button className="w-full px-4 py-2 text-left text-xs text-ink hover:bg-bg-subtle flex items-center gap-2 transition-colors">
                                  <Copy className="w-3.5 h-3.5 text-ink-soft" /> Duplicate
                                </button>
                                <div className="h-px bg-line/60 my-1" />
                                <button className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete Project
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <h3 className="text-base font-semibold truncate text-ink">{site.name}</h3>
                        <p className="text-ink-soft text-xs mt-0.5 mb-6 truncate">{site.subdomain || 'app'}.buildspace.app</p>
                        
                        <div className="mt-auto flex items-center gap-2.5">
                          <button 
                            onClick={() => router.push(`/sites/${site.id}/setup`)} 
                            className="flex-1 bg-bg-subtle hover:bg-bg-base text-ink text-xs py-2 rounded-xl transition-colors flex justify-center items-center gap-1.5 border border-line font-medium"
                          >
                            <Settings className="w-3.5 h-3.5" /> Setup
                          </button>
                          <button 
                            onClick={() => router.push(`/sites/${site.id}/builder`)} 
                            className="flex-1 bg-ink text-bg-elevated hover:bg-ink/90 text-xs py-2 rounded-xl transition-colors font-medium shadow-sm"
                          >
                            Builder
                          </button>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="bg-bg-elevated border border-line rounded-2xl overflow-hidden divide-y divide-line/60">
                {filteredSites.map((site) => {
                  const cat = categories.find(c => c.id === site.category);
                  const CatIcon = cat?.icon || Globe;
                  return (
                    <div key={site.id} className="p-4 flex items-center justify-between gap-4 hover:bg-bg-subtle/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl border ${cat?.accent || 'bg-bg-subtle text-ink-soft border-line'}`}>
                          <CatIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold truncate text-ink">{site.name}</h3>
                          <p className="text-xs text-ink-soft truncate">{site.subdomain}.buildspace.app</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider hidden sm:inline-block ${
                          site.status === 'draft' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {site.status === 'draft' ? 'Draft' : 'Live'}
                        </span>
                        <button 
                          onClick={() => router.push(`/sites/${site.id}/setup`)}
                          className="px-3 py-1.5 text-xs bg-bg-subtle hover:bg-bg-base border border-line rounded-lg font-medium"
                        >
                          Setup
                        </button>
                        <button 
                          onClick={() => router.push(`/sites/${site.id}/builder`)}
                          className="px-3 py-1.5 text-xs bg-ink text-bg-elevated rounded-lg font-medium shadow-sm"
                        >
                          Builder
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Templates Vault Showcase */}
          <div className="mt-20">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-ink">Interactive Template Vault</h2>
                  <p className="text-ink-soft mt-1.5 text-sm font-light">Click directly on any preview image to launch its live website experience.</p>
                </div>

                {/* Search Bar & Category Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search templates..."
                      className="w-full sm:w-60 bg-bg-elevated border border-line rounded-full pl-8 pr-3 py-2 text-xs text-ink focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {['all', 'ecommerce', 'portfolio', 'salon'].map((catId) => (
                      <button
                        key={catId}
                        onClick={() => setActiveCategory(catId)}
                        className={`px-3.5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                          activeCategory === catId
                            ? 'bg-ink text-bg-elevated shadow-sm'
                            : 'bg-bg-subtle text-ink-soft hover:text-ink hover:bg-bg-elevated border border-line/60'
                        }`}
                      >
                        {catId}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
            
            {/* Animated Filtered Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[420px]">
              <AnimatePresence mode="sync">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <InteractiveTemplateCard
                      template={template}
                      onUseTemplate={handleOwnThisTemplate}
                      isCreating={isCreating}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-16 bg-bg-elevated rounded-3xl border border-line">
                <p className="text-ink-soft text-sm">No templates match your selected criteria.</p>
                <button 
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                  className="mt-3 text-xs font-semibold text-accent hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Creation Modal Component */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (name, category, subdomain) => {
          setIsCreating(true);
          try {
            const data = await apiClient.post('http://localhost:3001/api/sites', {
              name,
              category,
              subdomain,
            });
            router.push(`/sites/${data.id}/setup`);
          } catch (err: any) {
            console.error(err);
            setIsCreating(false);
            throw err;
          }
        }}
        isCreating={isCreating}
        categories={categories}
      />

      {/* Apple-Grade Dashboard Footer */}
      <footer className="w-full bg-bg-elevated border-t border-line/60 pt-16 pb-12 mt-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-16">
            
            {/* Brand Column */}
            <div className="md:col-span-2">
              <TransitionLink href="/" className="flex items-center gap-2.5 mb-4 group">
                <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center shadow-md">
                  <span className="text-bg-elevated font-bold text-xs">B</span>
                </div>
                <span className="font-bold text-xl tracking-tight">BuildSpace</span>
              </TransitionLink>
              <p className="text-xs text-ink-soft leading-relaxed max-w-sm mb-6">
                Next-generation web engine engineered for high-performance storefronts, creative portfolios, and award-winning digital experiences.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-wide">All Systems Operational</span>
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink mb-4">Platform</h4>
              <ul className="space-y-2.5 text-xs text-ink-soft">
                <li><TransitionLink href="/templates" className="hover:text-ink transition-colors">Template Vault</TransitionLink></li>
                <li><a href="#sites" className="hover:text-ink transition-colors">Project Manager</a></li>
                <li><a href="#analytics" className="hover:text-ink transition-colors">Edge Analytics</a></li>
                <li><a href="#ai" className="hover:text-ink transition-colors">AI Studio Engine</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs text-ink-soft">
                <li><a href="#" className="hover:text-ink transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-ink transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-ink transition-colors">System Status</a></li>
                <li><a href="#" className="hover:text-ink transition-colors">Release Notes</a></li>
              </ul>
            </div>

            {/* Company & Legal Column */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink mb-4">Legal & Privacy</h4>
              <ul className="space-y-2.5 text-xs text-ink-soft">
                <li><a href="#" className="hover:text-ink transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-ink transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-ink transition-colors">Security Audit</a></li>
                <li><a href="#" className="hover:text-ink transition-colors">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-line/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-ink-soft">
            <p>© 2026 BuildSpace Technologies Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <span>Engineered with Apple-level precision</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
