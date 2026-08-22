"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Loader2, Save, Settings, Monitor, Smartphone, Lock, ChevronRight, ChevronLeft, CheckCircle2, LayoutTemplate,
  Upload, Image as ImageIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

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
  const siteId = params?.siteId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  // Wizard state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

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
        
        if (data.schema && typeof data.schema === 'object' && !Array.isArray(data.schema) && data.schema.pages) {
          loadedData = data.schema as SiteData;
        } else {
          // Fallback seeder for empty projects (now multi-page by default)
          loadedData = {
            pages: [
               {
                  id: 'home',
                  name: 'Home',
                  path: '/',
                  sections: [
                     { id: `hero-${Date.now()}`, type: 'Hero', props: { 
                        brandName: data.name || 'My Velocity', 
                        heroSubtitle: 'System // Override // Active', 
                        primaryCta: 'Initialize Sequence',
                        heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop'
                     } }
                  ]
               },
               {
                  id: 'products',
                  name: 'Products',
                  path: '/products',
                  sections: [
                     { id: crypto.randomUUID(), type: 'Pricing', props: { shopTitle: 'The Arsenal', viewAllText: 'Access Full Grid' } },
                  ]
               },
               {
                  id: 'contact',
                  name: 'Contact',
                  path: '/contact',
                  sections: [
                     { id: crypto.randomUUID(), type: 'Contact', props: { marqueeText1: 'Cybernetic Enhance', marqueeText2: 'Neo-Tokyo Aesthetics' } },
                  ]
               }
            ],
            global: { brandName: data.name || 'My Brand', templateSlug: 'velocity' }
          };
          apiClient.patch(`/api/sites/${siteId}/schema`, { schema: loadedData }).catch(console.error);
        }
        
        setSiteData(loadedData);
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

  // Handle template ready signal
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'TEMPLATE_READY' && iframeRef.current && iframeRef.current.contentWindow && siteData) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'UPDATE_SCHEMA', payload: { ...siteData, products } },
          '*'
        );
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [siteData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch(`/api/sites/${siteId}/schema`, {
        schema: siteData,
        products: products
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Initializing Engine</span>
      </div>
    </div>
  );

  const isFinished = currentStepIndex >= siteData.pages.length;
  const isLastStep = currentStepIndex === siteData.pages.length - 1;

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Setup Complete</h2>
          <p className="text-white/60 mb-8">Your website has been successfully configured and saved.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push(`/sites/${siteId}/admin`)}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-colors"
            >
              Manage Website (Admin)
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors"
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
    <div className="h-screen bg-[#050505] text-white flex overflow-hidden font-sans selection:bg-white/20">
      
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* LEFT STAGE - Live Canvas */}
      <div className="flex-1 relative z-0 flex flex-col items-center justify-center p-6 lg:p-10">
         
         <div className="absolute top-6 left-6 flex items-center gap-4 z-20">
            <button onClick={() => router.push('/dashboard')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md">
               <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
               <Lock className="w-3 h-3 text-white/40" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">buildspace.preview</span>
            </div>
         </div>

         <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 p-1 rounded-full z-20">
            <button onClick={() => setDevice('desktop')} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${device === 'desktop' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
               <Monitor className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setDevice('mobile')} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${device === 'mobile' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
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

      {/* RIGHT PANEL - Wizard Editor */}
      <div className="relative z-10 w-[420px] h-full p-6 flex flex-col shrink-0">
         
         <div className="flex items-center justify-between mb-6 shrink-0">
            <button onClick={() => router.push('/dashboard')} className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
               <ArrowLeft className="w-3 h-3" /> Dashboard
            </button>
            <button 
               onClick={handleSave} 
               disabled={saving}
               className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
               {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
               Save
            </button>
         </div>

         {/* The Wizard Glass Pane */}
         <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="flex-1 min-h-0 bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative z-10">
            
            {/* Wizard Progress Header */}
            <div className="shrink-0 p-6 border-b border-white/5 bg-white/[0.01]">
               <div className="flex items-center justify-between mb-4">
                  <div>
                     <h2 className="text-sm font-bold tracking-wide">Editing: {activePage.name}</h2>
                     <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] mt-1">Page Settings</p>
                  </div>
                  <span className="text-[10px] font-bold text-white/40 tracking-widest whitespace-nowrap ml-4">
                     STEP {Math.min(currentStepIndex + 1, siteData.pages.length)} OF {siteData.pages.length}
                  </span>
               </div>
               {/* Progress bar */}
               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                     className="h-full bg-white"
                     initial={{ width: 0 }}
                     animate={{ width: `${((currentStepIndex) / Math.max(siteData.pages.length, 1)) * 100}%` }}
                     transition={{ duration: 0.3 }}
                  />
               </div>
            </div>

            <div 
               data-lenis-prevent="true"
               className="flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden custom-scrollbar pointer-events-auto overscroll-contain"
            >
               <AnimatePresence mode="wait">
                  {!isFinished && (
                     <motion.div 
                        key={activePage.id}
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="p-8 pb-32 space-y-8"
                     >
                        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                              <Settings className="w-5 h-5 text-white" />
                           </div>
                           <div>
                              <h2 className="text-sm font-bold tracking-wide">{activePage.name} Page</h2>
                              <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] mt-1">Edit Content</p>
                           </div>
                        </div>

                        <div className="space-y-8">
                           {activePage.sections.map((section, sIdx) => (
                              <div key={section.id} className="relative group">
                                 {/* Futuristic Section Header */}
                                 <div className="flex items-center gap-3 mb-6">
                                    <div className="flex flex-col gap-1">
                                       <div className="w-4 h-[1px] bg-[#00f0ff]" />
                                       <div className="w-2 h-[1px] bg-[#00f0ff]/50" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-[#00f0ff] uppercase tracking-[0.3em] font-mono">
                                       {section.type} <span className="text-white/20">BLOCK</span>
                                    </h3>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[#00f0ff]/20 to-transparent" />
                                 </div>

                                 {/* Inputs Grid */}
                                 <div className="space-y-5 pl-7 border-l border-white/5">
                                    {Object.keys(section.props).map(propKey => {
                                       const isImage = propKey.toLowerCase().includes('image') || propKey.toLowerCase().includes('logo');
                                       const isLongText = !isImage && section.props[propKey].length > 40;
                                       return (
                                          <div key={propKey} className="group/input">
                                             <label className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 group-focus-within/input:text-[#00f0ff] transition-colors">
                                                <div className="w-1 h-1 rounded-full bg-white/20 group-focus-within/input:bg-[#00f0ff] group-focus-within/input:animate-pulse" />
                                                {propKey.replace(/([A-Z])/g, ' $1').trim()}
                                             </label>
                                             {isImage ? (
                                                <div className="relative group/upload cursor-pointer border border-dashed border-white/20 rounded-xl overflow-hidden hover:border-[#00f0ff]/50 transition-all bg-black/40">
                                                   <input 
                                                      type="file" 
                                                      accept="image/*"
                                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                      onChange={(e) => {
                                                         const file = e.target.files?.[0];
                                                         if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => {
                                                               if (event.target?.result) {
                                                                  updateSectionProp(section.id, propKey, event.target.result as string);
                                                               }
                                                            };
                                                            reader.readAsDataURL(file);
                                                         }
                                                      }}
                                                   />
                                                   <div className="p-6 flex flex-col items-center justify-center gap-3">
                                                      {section.props[propKey] && (section.props[propKey].startsWith('data:image') || section.props[propKey].startsWith('http')) ? (
                                                         <div className="w-full h-32 relative rounded-lg overflow-hidden group-hover/upload:opacity-50 transition-opacity bg-black">
                                                            <img src={section.props[propKey]} alt="Upload preview" className="w-full h-full object-cover" />
                                                         </div>
                                                      ) : (
                                                         <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover/upload:bg-[#00f0ff]/20 group-hover/upload:text-[#00f0ff] transition-all">
                                                            <ImageIcon className="w-5 h-5" />
                                                         </div>
                                                      )}
                                                      <div className="text-center relative z-20 pointer-events-none">
                                                         <p className="text-xs font-bold text-white group-hover/upload:text-[#00f0ff] transition-colors flex items-center justify-center gap-2">
                                                            <Upload className="w-3 h-3" /> Click to upload image
                                                         </p>
                                                         <p className="text-[9px] text-white/40 mt-1 uppercase tracking-widest">SVG, PNG, JPG or GIF</p>
                                                      </div>
                                                   </div>
                                                </div>
                                             ) : isLongText ? (
                                                <textarea 
                                                   value={section.props[propKey]}
                                                   onChange={(e) => updateSectionProp(section.id, propKey, e.target.value)}
                                                   className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff]/50 focus:bg-[#00f0ff]/5 transition-all shadow-inner custom-scrollbar min-h-[80px] resize-y"
                                                   placeholder={`Enter ${propKey}...`}
                                                />
                                             ) : (
                                                <input 
                                                   type="text"
                                                   value={section.props[propKey]}
                                                   onChange={(e) => updateSectionProp(section.id, propKey, e.target.value)}
                                                   className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f0ff]/50 focus:bg-[#00f0ff]/5 transition-all shadow-inner"
                                                   placeholder={`Enter ${propKey}...`}
                                                />
                                             )}
                                          </div>
                                       );
                                    })}
                                 </div>
                              </div>
                           ))}

                            {activePage.id === 'products' && (
                               <div className="relative group mt-8">
                                  <div className="flex items-center gap-3 mb-6">
                                     <div className="flex flex-col gap-1">
                                        <div className="w-4 h-[1px] bg-[#00f0ff]" />
                                        <div className="w-2 h-[1px] bg-[#00f0ff]/50" />
                                     </div>
                                     <h3 className="text-[10px] font-black text-[#00f0ff] uppercase tracking-[0.3em] font-mono">
                                        Products <span className="text-white/20">MANAGER</span>
                                     </h3>
                                     <div className="flex-1 h-[1px] bg-gradient-to-r from-[#00f0ff]/20 to-transparent" />
                                  </div>

                                  <div className="space-y-4">
                                     {products.map((prod, idx) => (
                                        <div key={prod.id || idx} className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                                           <input 
                                              type="text" 
                                              value={prod.name} 
                                              onChange={(e) => {
                                                 const newProds = [...products];
                                                 newProds[idx].name = e.target.value;
                                                 setProducts(newProds);
                                              }}
                                              className="bg-transparent border-b border-white/20 pb-1 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                                              placeholder="Product Name"
                                           />
                                           <input 
                                              type="number" 
                                              value={prod.price} 
                                              onChange={(e) => {
                                                 const newProds = [...products];
                                                 newProds[idx].price = e.target.value;
                                                 setProducts(newProds);
                                              }}
                                              className="bg-transparent border-b border-white/20 pb-1 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
                                              placeholder="Price"
                                           />
                                           <button 
                                              onClick={() => {
                                                 const newProds = [...products];
                                                 newProds.splice(idx, 1);
                                                 setProducts(newProds);
                                              }}
                                              className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-left hover:text-red-400 mt-2"
                                           >
                                              Remove Product
                                           </button>
                                        </div>
                                     ))}
                                     <button 
                                        onClick={() => {
                                           setProducts([...products, { id: crypto.randomUUID(), name: 'New Product', price: 0, image: '', category: 'All' }]);
                                        }}
                                        className="w-full py-4 border border-dashed border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:border-white/50 transition-colors"
                                     >
                                        + Add Product
                                     </button>
                                  </div>
                               </div>
                            )}
                         </div>
                      </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Wizard Navigation Footer */}
            {!isFinished && siteData.pages.length > 0 && (
               <div className="shrink-0 p-4 border-t border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between gap-4 z-20">
                  <button 
                     onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                     disabled={currentStepIndex === 0}
                     className="px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 flex items-center gap-2"
                  >
                     <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                     onClick={async () => {
                        if (isLastStep) {
                           await handleSave();
                        }
                        setCurrentStepIndex(currentStepIndex + 1);
                     }}
                     disabled={saving}
                     className="flex-1 bg-white text-black px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                     {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLastStep ? 'Finish Setup' : 'Next Page')} <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
