"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Loader2, Save, Settings, Monitor, Smartphone, Lock, ChevronRight, ChevronLeft, CheckCircle2, LayoutTemplate,
  Upload, Image as ImageIcon, Undo, Redo, Paintbrush, FileText, Navigation
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { resolveSiteData } from '@/lib/schema';
import { SchemaRenderer } from '@/components/builder/SchemaRenderer';

interface PageData {
  id: string;
  name: string;
  path: string;
  sections: any[];
}

interface SiteData {
  pages: PageData[];
  global: { brandName: string; templateSlug?: string };
}

export default function BuilderPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params?.siteId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  // Wizard state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'pages' | 'theme' | 'navigation'>('pages');
  
  // History State for Undo/Redo
  const [history, setHistory] = useState<SiteData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const skipHistoryRecord = useRef(false);


  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const [siteRes, productsRes] = await Promise.all([
          apiClient.get(`/api/sites/${siteId}`),
          apiClient.get(`/api/sites/${siteId}/products`).catch(() => [])
        ]);
        
        const data = siteRes;
        if (Array.isArray(productsRes)) {
           setProducts(productsRes);
        }

        let loadedData: SiteData;
        
        if (data.schema && typeof data.schema === 'object' && !Array.isArray(data.schema)) {
          loadedData = resolveSiteData(data.schema, data.name) as SiteData;
        } else {
          // If for some reason legacy sites lack a schema, throw error instead of faking it
          throw new Error("Site lacks an initialized schema. Please recreate the site.");
        }
        
        setSiteData(loadedData);
        
        // Check URL query param for page index
        const pageQuery = searchParams?.get('page');
        if (pageQuery) {
          const idx = loadedData.pages.findIndex(p => p.path === pageQuery || p.id === pageQuery);
          if (idx !== -1) {
            setCurrentStepIndex(idx);
          }
        }
      } catch (err) {
        console.error(err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [siteId, router]);

  const templateSlug = (siteData?.global as any)?.templateSlug || 'velocity';

  // Broadcast siteData to the iframe live preview
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && siteData) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'UPDATE_SCHEMA', payload: { ...siteData, products } },
        '*'
      );
    }
  }, [siteData, products]);

  // Handle template ready signal and navigation sync
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!iframeRef.current || !iframeRef.current.contentWindow || !siteData) return;
      
      if (e.data?.type === 'TEMPLATE_READY') {
        iframeRef.current.contentWindow.postMessage(
          { type: 'UPDATE_SCHEMA', payload: { ...siteData, products } },
          '*'
        );
      } else if (e.data?.type === 'IFRAME_NAVIGATED') {
        const navigatedPath = e.data.path; // e.g. /templates/origin/products
        if (!navigatedPath) return;
        
        // Find matching page index from schema
        const idx = siteData.pages.findIndex(p => {
           if (p.path === '/') return navigatedPath.endsWith('/origin') || navigatedPath.endsWith('/velocity') || navigatedPath.endsWith('/nexus-pro');
           return navigatedPath.includes(p.path);
        });
        
        if (idx !== -1 && idx !== currentStepIndex) {
          setCurrentStepIndex(idx);
          router.replace(`?page=${siteData.pages[idx].id}`, { scroll: false });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [siteData, currentStepIndex, router]);

  // Push to history when siteData changes
  useEffect(() => {
    if (!siteData) return;
    if (skipHistoryRecord.current) {
       skipHistoryRecord.current = false;
       return;
    }
    setHistory(prev => {
       const newHistory = prev.slice(0, historyIndex + 1);
       newHistory.push(JSON.parse(JSON.stringify(siteData)));
       if (newHistory.length > 50) newHistory.shift(); // Keep last 50 edits
       return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [siteData]);

  // Debounced auto-save
  useEffect(() => {
    if (!siteData) return;
    const timeout = setTimeout(() => {
       handleSave(siteData);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [siteData]);

  const undo = () => {
    if (historyIndex > 0) {
       skipHistoryRecord.current = true;
       setHistoryIndex(prev => prev - 1);
       setSiteData(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
       skipHistoryRecord.current = true;
       setHistoryIndex(prev => prev + 1);
       setSiteData(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const handleSave = async (dataToSave = siteData) => {
    setSaving(true);
    try {
      await apiClient.patch(`/api/sites/${siteId}/schema`, {
        schema: dataToSave
      });
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  const updateSectionProp = (sectionId: string, key: string, value: string) => {
    if (!siteData) return;
    
    setSiteData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map((page, idx) => {
          if (idx === currentStepIndex) {
            return {
              ...page,
              sections: page.sections.map((s) => {
                if (s.id === sectionId) {
                   return { ...s, props: { ...s.props, [key]: value } };
                }
                return s;
              })
            };
          }
          return page;
        })
      };
    });
  };

  if (loading || !siteData) return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Initializing Engine</span>
      </div>
    </div>
  );

  const isFinished = currentStepIndex >= siteData.pages.length;
  const isLastStep = currentStepIndex === siteData.pages.length - 1;

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-10 text-center shadow-xl">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Setup Complete</h2>
          <p className="text-white/60 mb-8">Your website has been successfully configured and saved.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push(`/sites/${siteId}/admin`)}
              className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Manage Website (Admin)
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-neutral-200 dark:bg-white/10 text-neutral-900 dark:text-white font-bold py-3 rounded-xl hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activePage = siteData.pages[currentStepIndex];

  return (
    <div className="h-screen bg-gray-50 dark:bg-neutral-950 text-neutral-900 dark:text-white flex overflow-hidden font-sans selection:bg-neutral-200 dark:selection:bg-white/20">
      
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* LEFT STAGE - Live Canvas */}
      <div className="flex-1 relative z-0 flex flex-col items-center justify-center p-6 lg:p-10">
         
         <div className="absolute top-6 left-6 flex items-center gap-4 z-20">
            <button onClick={() => router.push('/dashboard')} className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-white/70 dark:hover:text-white shadow-sm transition-all">
               <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
               <Lock className="w-3 h-3 text-neutral-400 dark:text-white/40" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-white/60">preview</span>
            </div>
         </div>

         <div className="absolute top-6 right-6 flex items-center gap-2 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-1 rounded-full z-20 shadow-sm">
            <button onClick={() => setDevice('desktop')} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${device === 'desktop' ? 'bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-900 dark:text-white/40 dark:hover:text-white'}`}>
               <Monitor className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setDevice('mobile')} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${device === 'mobile' ? 'bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-900 dark:text-white/40 dark:hover:text-white'}`}>
               <Smartphone className="w-3.5 h-3.5" />
            </button>
         </div>

         {/* The Device Frame */}
         <motion.div 
            className="w-[1200px] h-[750px] max-w-[calc(100vw-500px)] bg-black rounded-2xl shadow-2xl relative mx-auto z-10 pointer-events-auto border border-white/10 flex flex-col"
            layout
            initial={false}
            animate={{ width: device === 'mobile' ? 375 : 1200 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
         >
            {/* Fake Mac Toolbar */}
            <div className="h-12 border-b border-white/10 shrink-0 flex items-center px-4 bg-white/5 backdrop-blur-md rounded-t-2xl gap-2">
               <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
               </div>
            </div>

            {/* Live Content Area (Iframe Native Scroll) */}
            <div className="absolute top-12 left-0 right-0 bottom-0 overflow-hidden bg-white text-black rounded-b-2xl">
               <iframe 
                  key={activePage.id} // Force re-render on page change
                  ref={iframeRef}
                  src={`/templates/${templateSlug}${activePage.path === '/' ? '' : activePage.path}?preview=true`}
                  className="w-full h-full border-none"
                  title="Live Template Preview"
               />
            </div>
         </motion.div>
      </div>

      {/* RIGHT PANEL - Universal Editor */}
      <div className="relative z-10 w-[420px] h-full p-6 flex flex-col shrink-0">
         
         <div className="flex items-center justify-between mb-4 shrink-0">
            <button onClick={() => router.push('/dashboard')} className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 dark:text-white/40 dark:hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
               <ArrowLeft className="w-3 h-3" /> Exit
            </button>
            <div className="flex items-center gap-2">
               <button onClick={undo} disabled={historyIndex <= 0} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-500 disabled:opacity-30 hover:bg-neutral-200 transition">
                  <Undo className="w-3.5 h-3.5" />
               </button>
               <button onClick={redo} disabled={historyIndex >= history.length - 1} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-500 disabled:opacity-30 hover:bg-neutral-200 transition">
                  <Redo className="w-3.5 h-3.5" />
               </button>
               <button 
                  onClick={() => handleSave()} 
                  disabled={saving}
                  className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 ml-2"
               >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save
               </button>
            </div>
         </div>

         {/* The Editor Panel */}
         <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-lg relative z-10">
            
            {/* Tab Navigation */}
            <div className="shrink-0 p-2 border-b border-neutral-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01]">
               <div className="flex bg-neutral-100 dark:bg-black/40 rounded-full p-1">
                  <button onClick={() => setActiveTab('pages')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-all ${activeTab === 'pages' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
                     <FileText className="w-3 h-3" /> Pages
                  </button>
                  <button onClick={() => setActiveTab('theme')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-all ${activeTab === 'theme' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
                     <Paintbrush className="w-3 h-3" /> Theme
                  </button>
                  <button onClick={() => setActiveTab('navigation')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 transition-all ${activeTab === 'navigation' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
                     <Navigation className="w-3 h-3" /> Nav
                  </button>
               </div>
            </div>

            <div 
               data-lenis-prevent="true"
               className="flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden custom-scrollbar pointer-events-auto overscroll-contain p-6"
            >
               <AnimatePresence mode="wait">
                  {activeTab === 'pages' && (
                     <motion.div key="pages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
                        
                        {/* Page Selector */}
                        <div className="bg-neutral-50 dark:bg-black/20 p-4 rounded-xl border border-neutral-200 dark:border-white/10">
                           <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Editing Page</label>
                           <select 
                              value={currentStepIndex}
                              onChange={(e) => {
                                 setCurrentStepIndex(Number(e.target.value));
                                 router.replace(`?page=${siteData.pages[Number(e.target.value)].id}`, { scroll: false });
                              }}
                              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none"
                           >
                              {siteData.pages.map((p, idx) => (
                                 <option key={p.id} value={idx}>{p.name} ({p.path})</option>
                              ))}
                           </select>
                        </div>

                        {/* Sections Editor */}
                        <div className="space-y-8">
                           {activePage.sections.map((section, sIdx) => (
                              <div key={section.id} className="relative group">
                                 <div className="flex items-center gap-3 mb-6">
                                    <div className="flex flex-col gap-1">
                                       <div className="w-4 h-[1px] bg-neutral-300 dark:bg-white/20" />
                                       <div className="w-2 h-[1px] bg-neutral-200 dark:bg-white/10" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-[0.3em] font-mono">
                                       {section.type} <span className="text-neutral-400 dark:text-white/20">BLOCK</span>
                                    </h3>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-neutral-200 dark:from-white/10 to-transparent" />
                                 </div>
                                 <SchemaRenderer 
                                    section={section} 
                                    onChange={(key, value) => updateSectionProp(section.id, key, value)} 
                                 />
                              </div>
                           ))}
                        </div>
                     </motion.div>
                  )}

                  {activeTab === 'theme' && (
                     <motion.div key="theme" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20 text-center text-neutral-500 mt-10">
                        <Paintbrush className="w-8 h-8 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Theme schema integration coming in Phase 3</p>
                     </motion.div>
                  )}

                  {activeTab === 'navigation' && (
                     <motion.div key="nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20 text-center text-neutral-500 mt-10">
                        <Navigation className="w-8 h-8 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Navigation integration coming in Phase 3</p>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>
      </div>
    </div>
  );
}