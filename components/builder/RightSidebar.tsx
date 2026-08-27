"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronDown, ChevronRight, Type, Image as ImageIcon, Upload, Trash2, GripVertical, Settings2, Plus } from 'lucide-react';
import { COMPONENT_REGISTRY } from '@/lib/component-registry';
import { ThemeTab } from './ThemeTab';
import { ProductsTab } from './ProductsTab';

interface RightSidebarProps {
  siteData: any;
  activePage: any;
  selectedElement: any | null;
  updatePropByFieldKey: (fieldKey: string, value: any) => void;
  moveSection: (pageId: string, sectionId: string, direction: 'up' | 'down') => void;
  deleteSection: (pageId: string, sectionId: string) => void;
  products: any[];
  updateProduct: (product: any) => void;
  updateTheme: (theme: any) => void;
  focusPreviewElement: (fieldKey: string | null, sectionId: string | null) => void;
}

export function RightSidebar({
  siteData,
  activePage,
  selectedElement,
  updatePropByFieldKey,
  moveSection,
  deleteSection,
  products,
  updateProduct,
  updateTheme,
  focusPreviewElement,
  editorScrollRef
}: RightSidebarProps & { editorScrollRef?: React.RefObject<HTMLDivElement | null> }) {
  const [activeTab, setActiveTab] = useState<'PAGES' | 'THEME' | 'PRODUCTS'>('PAGES');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-expand and scroll to section when selectedElement changes (triggered by Left Panel click)
  useEffect(() => {
    if (selectedElement?.componentId?.startsWith('product-')) {
      setActiveTab('PRODUCTS');
      return;
    }

    if (selectedElement?.sectionId) {
      setActiveTab('PAGES');
      setOpenSections(prev => ({ ...prev, [selectedElement.sectionId!]: true }));
      
      setTimeout(() => {
        const el = sectionRefs.current[selectedElement.sectionId!];
        if (el && editorScrollRef?.current) {
          const container = editorScrollRef.current;
          const topPos = el.offsetTop - 20; // 20px padding
          container.scrollTo({ top: topPos, behavior: 'smooth' });
          
          el.classList.add('bg-white/5');
          setTimeout(() => el.classList.remove('bg-white/5'), 1000);
        }
      }, 100);
    } else if (selectedElement?.fieldKey) {
      setActiveTab('PAGES');
      const parts = selectedElement.fieldKey.split('.');
      if (parts.length >= 2) {
        const sId = parts[1];
        setOpenSections(prev => ({ ...prev, [sId]: true }));
        
        setTimeout(() => {
          const inputEl = document.getElementById(`field-${selectedElement.fieldKey}`);
          if (inputEl && editorScrollRef?.current) {
            const container = editorScrollRef.current;
            // Get offset relative to the scroll container
            const inputOffset = inputEl.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
            container.scrollTo({ top: inputOffset - 100, behavior: 'smooth' });
            inputEl.focus();
          } else {
             const sectionEl = sectionRefs.current[sId];
             if (sectionEl && editorScrollRef?.current) {
               const container = editorScrollRef.current;
               container.scrollTo({ top: sectionEl.offsetTop - 20, behavior: 'smooth' });
             }
          }
        }, 150);
      }
    }
  }, [selectedElement, editorScrollRef]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    // When clicking a section in the editor, focus the corresponding section in the preview
    focusPreviewElement(null, sectionId);
  };

  const handleFieldClick = (fieldKey: string) => {
    focusPreviewElement(fieldKey, null);
  };

  return (
    <div className="w-[400px] bg-[#0A0A0A] border-l border-white/10 flex flex-col h-full overflow-hidden flex-shrink-0 z-40 relative">
      
      {/* Sidebar Header Tabs */}
      <div className="shrink-0 flex items-center border-b border-white/10 bg-[#050505] p-2 gap-2 z-50">
        <button 
          onClick={() => setActiveTab('PAGES')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors ${activeTab === 'PAGES' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
        >
          Pages
        </button>
        <button 
          onClick={() => setActiveTab('THEME')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors ${activeTab === 'THEME' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
        >
          Theme
        </button>
        <button 
          onClick={() => setActiveTab('PRODUCTS')}
          className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors ${activeTab === 'PRODUCTS' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
        >
          Products
        </button>
      </div>

      <div ref={editorScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative bg-[#050505]">
        <AnimatePresence mode="wait">
          
          {/* PAGES TAB */}
          {activeTab === 'PAGES' && (
            <motion.div 
              key="pages"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-3 pb-32"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1 pb-2">
                Editing: {activePage?.name}
              </div>

              {activePage?.sections?.map((section: any, index: number) => {
                const isOpen = !!openSections[section.id || section.type];
                const schema = COMPONENT_REGISTRY[section.type];
                const sId = section.id || section.type;

                return (
                  <div 
                    key={sId}
                    ref={el => { sectionRefs.current[sId] = el; }}
                    className="editor-section border border-white/10 rounded-xl overflow-hidden bg-[#111] transition-colors duration-500"
                  >
                    {/* Section Header */}
                    <button 
                      onClick={() => toggleSection(sId)}
                      className="section-header w-full flex items-center justify-between px-5 py-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-white/20 cursor-grab active:cursor-grabbing" />
                        <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                          {schema?.label || section.type} Block
                        </span>
                      </div>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                    </button>

                    {/* Section Body */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial="hidden" animate="visible" exit="hidden"
                          variants={{
                            hidden: { height: 0, opacity: 0 },
                            visible: { height: 'auto', opacity: 1 }
                          }}
                          className="overflow-hidden border-t border-white/5"
                        >
                          <div className="section-content p-5 space-y-6">
                            
                            {/* Fields */}
                            {schema ? (
                              schema.fields.map((field: any) => {
                                const fieldKey = `${activePage.id}.${sId}.${field.id}`;
                                const val = section.props[field.id] !== undefined ? section.props[field.id] : (field.defaultValue || '');
                                
                                return (
                                  <div key={field.id} className="space-y-2">
                                    <label 
                                      onClick={() => handleFieldClick(fieldKey)}
                                      className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] cursor-pointer hover:text-white/80 transition-colors"
                                    >
                                      <div className="w-1 h-1 rounded-full bg-white/20" />
                                      {field.label}
                                    </label>
                                    
                                    {field.type === 'text' && (
                                      <input 
                                        id={`field-${fieldKey}`}
                                        type="text"
                                        value={val}
                                        onChange={(e) => updatePropByFieldKey(fieldKey, e.target.value)}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all placeholder:text-white/20"
                                      />
                                    )}

                                    {field.type === 'textarea' && (
                                      <textarea 
                                        id={`field-${fieldKey}`}
                                        value={val}
                                        onChange={(e) => updatePropByFieldKey(fieldKey, e.target.value)}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all min-h-[80px] custom-scrollbar placeholder:text-white/20 resize-y"
                                      />
                                    )}

                                    {field.type === 'image' && (
                                      <div 
                                        id={`field-${fieldKey}`}
                                        className="relative group/upload cursor-pointer border border-dashed border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition-all bg-[#1A1A1A]"
                                      >
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
                                                  updatePropByFieldKey(fieldKey, event.target.result);
                                                }
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                        <div className="p-4 flex flex-col items-center justify-center gap-3">
                                          {val && (val.startsWith('data:image') || val.startsWith('http')) ? (
                                            <div className="w-full h-24 relative rounded overflow-hidden">
                                              <img src={val} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                          ) : (
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                              <ImageIcon className="w-4 h-4" />
                                            </div>
                                          )}
                                          <div className="text-center relative z-20 pointer-events-none">
                                            <p className="text-[11px] font-medium text-white/60 flex items-center justify-center gap-1.5">
                                              <Upload className="w-3 h-3" /> Upload Image
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs text-white/40 text-center py-4">No schema defined for {section.type}</div>
                            )}

                            {/* Section Controls */}
                            <div className="pt-4 mt-2 border-t border-white/5 flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => moveSection(activePage.id, sId, 'up')}
                                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md px-2 py-1.5 text-[11px] font-medium text-white/60 hover:text-white transition-colors"
                                >
                                  Move Up
                                </button>
                                <button 
                                  onClick={() => moveSection(activePage.id, sId, 'down')}
                                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md px-2 py-1.5 text-[11px] font-medium text-white/60 hover:text-white transition-colors"
                                >
                                  Move Down
                                </button>
                              </div>
                              <button 
                                onClick={() => deleteSection(activePage.id, sId)}
                                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-md px-2 py-2 text-[11px] font-bold transition-colors"
                              >
                                <Trash2 className="w-3 h-3" /> Remove Section
                              </button>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* THEME TAB */}
          {activeTab === 'THEME' && (
            <motion.div 
              key="theme"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <ThemeTab theme={siteData?.global?.theme} updateTheme={updateTheme} />
            </motion.div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'PRODUCTS' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <ProductsTab 
                products={products} 
                updateProduct={updateProduct} 
                selectedProductId={selectedElement?.componentId?.replace('product-', '')} 
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
