"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { resolveSiteData } from '@/lib/schema';

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
  global: { brandName: string; templateSlug?: string; theme?: any };
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

interface BuilderContextType {
  siteData: SiteData | null;
  products: any[];
  device: 'desktop' | 'tablet' | 'mobile';
  setDevice: (d: 'desktop' | 'tablet' | 'mobile') => void;
  currentStepIndex: number;
  setCurrentStepIndex: (idx: number) => void;
  loading: boolean;
  saving: boolean;
  isDirty: boolean;
  saveSuccess: boolean;
  selectedElement: SelectedElement | null;
  setSelectedElement: (el: SelectedElement | null) => void;
  cmdKOpen: boolean;
  setCmdKOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  
  handleSave: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  updatePropByFieldKey: (fieldKey: string, value: any) => void;
  moveSection: (pageId: string, sectionId: string, direction: 'up' | 'down') => void;
  addSection: (pageId: string, sectionType: string) => void;
  deleteSection: (pageId: string, sectionId: string) => void;
  updateTheme: (newTheme: any) => void;
  updateProduct: (updatedProduct: any) => Promise<void>;
  
  focusPreviewElement: (fieldKey: string | null, sectionId: string | null) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  editorScrollRef: React.RefObject<HTMLDivElement | null>;
}

const BuilderContext = createContext<BuilderContextType | null>(null);

export function BuilderProvider({ children, siteId }: { children: ReactNode; siteId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [history, setHistory] = useState<SiteData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyIndexRef = useRef(-1);
  const skipHistoryRecord = useRef(false);

  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [cmdKOpen, setCmdKOpen] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  // Initial Fetch
  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) return;

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
          const idx = loadedData.pages.findIndex((p: any) => p.path === pageQuery || p.id === pageQuery);
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
  }, [siteId, router, searchParams]);

  // Sync schema to iframe when it changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && siteData) {
      const activePage = siteData.pages[currentStepIndex];
      iframeRef.current.contentWindow.postMessage(
        { type: 'UPDATE_SCHEMA', payload: { siteData, products, activePath: activePage?.path === '/' ? '/' : activePage?.path } },
        '*'
      );
    }
  }, [siteData, products, currentStepIndex]);

  // Global body lock
  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  // Handle messages from iframe
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
  }, [siteData, products, currentStepIndex, siteId, router]);

  // Dirty state listener
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

  // History tracking
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

  // Keyboard shortcuts
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
  }, [historyIndex, history, siteData, saving, siteId, router]);

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
      if (updatedProduct.id.startsWith('o') || updatedProduct.id.startsWith('v') || updatedProduct.id.startsWith('new-')) {
        const res = await apiClient.post(`/api/sites/${siteId}/products`, {
           ...updatedProduct,
           id: undefined,
           slug: undefined
        });
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? res : p));
      } else {
        await apiClient.patch(`/api/sites/${siteId}/products/${updatedProduct.id}`, updatedProduct);
      }
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

  const updatePropByFieldKey = (fieldKey: string, value: any) => {
    if (!siteData) return;
    
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

  const focusPreviewElement = (fieldKey: string | null, sectionId: string | null) => {
    window.postMessage({
      type: 'FOCUS_ELEMENT',
      fieldKey,
      sectionId
    }, '*');
  };

  const value = {
    siteData,
    products,
    device,
    setDevice,
    currentStepIndex,
    setCurrentStepIndex,
    loading,
    saving,
    isDirty,
    saveSuccess,
    selectedElement,
    setSelectedElement,
    cmdKOpen,
    setCmdKOpen,
    handleSave,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    updatePropByFieldKey,
    moveSection,
    addSection,
    deleteSection,
    updateTheme,
    updateProduct,
    focusPreviewElement,
    iframeRef,
    editorScrollRef
  };

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}
