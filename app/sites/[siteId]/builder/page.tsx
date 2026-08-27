"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Loader2, Save, Undo, Redo, LayoutTemplate,
  Monitor, Smartphone, Tablet, Search, X, ChevronRight, Settings, Image as ImageIcon, Type, Link as LinkIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { resolveSiteData } from '@/lib/schema';
import { RightSidebar } from '@/components/builder/RightSidebar';
import { TemplateRenderer } from '@/components/TemplateRenderer';

interface PageData {
  id: string;
  name: string;
  path: string;
  sections: any[];
  title?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
}

interface SiteData {
  pages: PageData[];
  global: { brandName: string; templateSlug?: string };
}

interface SelectedElement {
  fieldKey: string | null;
  sectionId: string | null;
  pageId: string | null;
  componentId: string | null;
  tag: string;
  text?: string;
  src?: string;
  rect: { top: number; left: number; width: number; height: number };
}

export default function BuilderPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params?.siteId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [history, setHistory] = useState<SiteData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyIndexRef = useRef(-1);
  const skipHistoryRecord = useRef(false);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [cmdKOpen, setCmdKOpen] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const [siteRes, productsRes] = await Promise.all([
          apiClient.get(`/api/sites/${siteId}`),
          apiClient.get(`/api/sites/${siteId}/products`).catch(() => [])
        ]);
        
        if (Array.isArray(productsRes)) setProducts(productsRes);

        let loadedData: SiteData;
        if (siteRes.schema && typeof siteRes.schema === 'object' && !Array.isArray(siteRes.schema)) {
          loadedData = resolveSiteData(siteRes.schema, siteRes.name) as SiteData;
        } else {
          throw new Error("Site lacks an initialized schema.");
        }
        
        setSiteData(loadedData);
        
        const pageQuery = searchParams?.get('page');
        if (pageQuery) {
          const idx = loadedData.pages.findIndex(p => p.path === pageQuery || p.id === pageQuery);
          if (idx !== -1) setCurrentStepIndex(idx);
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

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && siteData) {
      const activePage = siteData.pages[currentStepIndex];
      iframeRef.current.contentWindow.postMessage(
        { type: 'UPDATE_SCHEMA', payload: { siteData, products, activePath: activePage?.path === '/' ? '/' : activePage?.path } },
        '*'
      );
    }
  }, [siteData, products, currentStepIndex]);

  useEffect(() => {
    // Route-level body lock to guarantee no document scrolling while in Builder
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const focusPreviewElement = (fieldKey: string | null, sectionId: string | null) => {
    window.postMessage({
      type: 'FOCUS_ELEMENT',
      fieldKey,
      sectionId
    }, '*');
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!siteData) return;
      
      if (e.data?.type === 'ELEMENT_SELECTED') {
        setSelectedElement(e.data);
      } else if (e.data?.type === 'TEMPLATE_READY') {
        if (iframeRef.current && iframeRef.current.contentWindow && siteData) {
          const activePage = siteData.pages[currentStepIndex];
          iframeRef.current.contentWindow.postMessage(
            { type: 'UPDATE_SCHEMA', payload: { siteData, products, activePath: activePage?.path === '/' ? '/' : activePage?.path } },
            '*'
          );
        }
      } else if (e.data?.type === 'NAVIGATE') {
        const path = e.data.path;
        const activePathStr = path.replace(`/sites/${siteId}/builder`, '') || '/';
        const page = siteData.pages.find((p: any) => p.path === activePathStr || activePathStr.startsWith(p.path + '/') || (p.path === '/' && activePathStr === ''));
        if (page) {
          const idx = siteData.pages.findIndex((p: any) => p.id === page.id);
          if (idx !== -1 && idx !== currentStepIndex) {
            setCurrentStepIndex(idx);
            router.replace(`?page=${siteData.pages[idx].id}`, { scroll: false });
          }
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [siteData, currentStepIndex]);


  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!siteData) return;
    if (skipHistoryRecord.current) {
       skipHistoryRecord.current = false;
       return;
    }
    
    setHistory(prev => {
       const newHistory = prev.slice(0, historyIndexRef.current + 1);
       newHistory.push(JSON.parse(JSON.stringify(siteData)));
       
       if (newHistory.length > 50) {
           newHistory.shift(); 
       }
       
       setHistoryIndex(newHistory.length - 1);
       setIsDirty(true);
       
       return newHistory;
    });
  }, [siteData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdKOpen(o => !o);
      }
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setCmdKOpen(false);
        if (iframeRef.current?.contentWindow) {
           iframeRef.current.contentWindow.postMessage({ type: 'CLEAR_SELECTION' }, '*');
        }
      }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

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

  const handleSave = async () => {
    if (!siteData || saving) return;
    setSaving(true);
    try {
      // Must use /schema endpoint to persist full builder schema state
      await apiClient.patch(`/api/sites/${siteId}/schema`, { schema: siteData });
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => {
        router.push(`/sites/${siteId}/admin`);
      }, 1000);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Unable to save changes. Your edits are still here. Please try again.');
      setSaving(false);
    }
  };

  
  const moveSection = (pageId: string, sectionId: string, direction: 'up' | 'down') => {
    if (!siteData) return;
    setSiteData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(page => {
          if (page.id !== pageId) return page;
          const idx = page.sections.findIndex(s => s.id === sectionId || s.type.toLowerCase() === sectionId.toLowerCase());
          if (idx === -1) return page;
          if (direction === 'up' && idx === 0) return page;
          if (direction === 'down' && idx === page.sections.length - 1) return page;
          
          const newSections = [...page.sections];
          const temp = newSections[idx];
          newSections[idx] = newSections[direction === 'up' ? idx - 1 : idx + 1];
          newSections[direction === 'up' ? idx - 1 : idx + 1] = temp;
          
          return { ...page, sections: newSections };
        })
      };
    });
  };

  
  const addSection = (pageId: string, sectionType: string) => {
    if (!siteData) return;
    setSiteData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(page => {
          if (page.id !== pageId) return page;
          const newSection = {
            id: sectionType.toLowerCase() + '-' + Date.now(),
            type: sectionType,
            props: {}
          };
          return {
            ...page,
            sections: [...page.sections, newSection]
          };
        })
      };
    });
    setCmdKOpen(false);
  };
const deleteSection = (pageId: string, sectionId: string) => {
    if (!siteData) return;
    setSiteData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(page => {
          if (page.id !== pageId) return page;
          return {
            ...page,
            sections: page.sections.filter(s => s.id !== sectionId && s.type.toLowerCase() !== sectionId.toLowerCase())
          };
        })
      };
    });
    setSelectedElement(null);
  };

  const updateTheme = (newTheme: any) => {
    if (!siteData) return;
    setSiteData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        global: {
          ...prev.global,
          theme: newTheme
        }
      };
    });
  };

  const updateProduct = async (updatedProduct: any) => {
    // Optimistic UI update
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === updatedProduct.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updatedProduct;
        return next;
      }
      return [...prev, updatedProduct];
    });

    try {
      // If it's a demo product (o1, v1) or a completely new one, POST it.
      if (updatedProduct.id.startsWith('o') || updatedProduct.id.startsWith('v') || updatedProduct.id.startsWith('new-')) {
        const res = await apiClient.post(`/api/sites/${siteId}/products`, {
           ...updatedProduct,
           id: undefined, // Let DB generate ID
           slug: undefined
        });
        // Replace temp ID with real ID
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? res : p));
      } else {
        // Real DB product
        await apiClient.patch(`/api/sites/${siteId}/products/${updatedProduct.id}`, updatedProduct);
      }
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

const updatePropByFieldKey = (fieldKey: string, value: any) => {
    if (!siteData) return;
    
    // fieldKey format: home.hero.title
    const parts = fieldKey.split('.');
    const pageId = parts[0];
    const sectionId = parts[1];
    const propKey = parts[2];

    setSiteData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(page => {
          if (page.id !== pageId) return page;
          return {
            ...page,
            sections: page.sections.map(section => {
              if (section.id !== sectionId && section.type.toLowerCase() !== sectionId) return section;
              return {
                ...section,
                props: {
                  ...section.props,
                  [propKey]: value
                }
              };
            })
          };
        })
      };
    });
  };

  if (loading || !siteData) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  const activePage = siteData.pages[currentStepIndex];

  return (
    <div className="fixed inset-0 h-[100dvh] bg-[#050505] flex flex-col font-sans overflow-hidden text-white">
      
      {/* TOP COMMAND BAR */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-[#0A0A0A] z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="text-sm font-semibold tracking-wide text-white/90">
            {siteData.global?.brandName || 'Untitled Project'}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
          <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded-md transition-colors ${device === 'desktop' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}>
            <Monitor className="w-4 h-4" />
          </button>
          <button onClick={() => setDevice('tablet')} className={`p-1.5 rounded-md transition-colors ${device === 'tablet' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}>
            <Tablet className="w-4 h-4" />
          </button>
          <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded-md transition-colors ${device === 'mobile' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}>
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2 text-white/40 hover:text-white disabled:opacity-30 transition-colors">
            <Undo className="w-4 h-4" />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 text-white/40 hover:text-white disabled:opacity-30 transition-colors">
            <Redo className="w-4 h-4" />
          </button>
          <button onClick={handleSave} disabled={saving || (!isDirty && !saveSuccess)} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors ${saveSuccess ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-white/90 disabled:opacity-50'}`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <span className="flex items-center gap-1">Saved ✓</span> : <Save className="w-4 h-4" />}
            {!saveSuccess && 'Save'}
          </button>
        </div>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* LEFT PREVIEW (75%) */}
        <div className="flex-1 relative overflow-auto overscroll-contain bg-[#050505] flex justify-center items-start p-4 custom-scrollbar z-10 min-w-0 min-h-0">
          <motion.div 
            layout
            className="relative bg-white shadow-2xl overflow-hidden"
            style={{
              width: '100%',
              maxWidth: device === 'desktop' ? 'none' : device === 'tablet' ? '768px' : '390px',
              height: device === 'desktop' ? '100%' : '844px',
              minHeight: device === 'desktop' ? '100%' : '844px',
              borderRadius: device === 'desktop' ? '0px' : '32px',
              border: device === 'desktop' ? 'none' : '12px solid #1a1a1a',
              transition: 'max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              flexShrink: 0
            }}
          >
            <iframe 
              ref={iframeRef} 
              src={`/sites/${siteId}/builder/preview-frame`} 
              className="w-full h-full border-0 bg-white"
              title="Builder Preview"
            />
          </motion.div>
        </div>

        {/* RIGHT SIDEBAR (25%) */}
        <RightSidebar 
          siteData={siteData}
          activePage={activePage}
          selectedElement={selectedElement}
          updatePropByFieldKey={updatePropByFieldKey}
          moveSection={moveSection}
          deleteSection={deleteSection}
          products={products}
          updateProduct={updateProduct}
          updateTheme={updateTheme}
          focusPreviewElement={focusPreviewElement}
          editorScrollRef={editorScrollRef}
        />

        {/* Command Palette Overlay */}
        <AnimatePresence>
          {cmdKOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setCmdKOpen(false)}
            >
              <div 
                className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 p-4 border-b border-white/10">
                  <Search className="w-5 h-5 text-white/40" />
                  <input 
                    autoFocus
                    placeholder="Search commands, pages, or sections..."
                    className="flex-1 bg-transparent border-none text-lg focus:outline-none placeholder:text-white/30"
                  />
                  <div className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/50 font-mono">ESC</div>
                </div>
                <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                  
                  <div className="text-xs font-bold text-white/30 px-3 pt-2 pb-1 uppercase tracking-wider">Pages</div>
                  {siteData.pages.map((p, i) => (
                    <button 
                      key={p.id}
                      onClick={() => {
                        setCurrentStepIndex(i);
                        setCmdKOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-500/10 hover:text-blue-400 transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-white/30 group-hover:text-blue-400/50 font-mono">{p.path}</span>
                    </button>
                  ))}
                  <div className="text-xs font-bold text-white/30 px-3 pt-4 pb-1 uppercase tracking-wider">Add Section to {activePage.name}</div>
                  {['Hero', 'FeaturedProducts', 'Manifesto', 'Testimonials', 'Gallery', 'FAQ'].map(sec => (
                    <button 
                      key={sec}
                      onClick={() => addSection(activePage.id, sec)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-500/10 hover:text-green-400 transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium">Add {sec}</span>
                      <span className="text-xs text-white/30 group-hover:text-green-400/50 font-mono">Component</span>
                    </button>
                  ))}

              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
