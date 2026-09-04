"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Loader2, Save, Undo, Redo, 
  Monitor, Smartphone, Tablet, Search
} from 'lucide-react';
import { RightSidebar } from '@/components/builder/RightSidebar';
import { useBuilder } from '@/context/BuilderContext';

export default function BuilderPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params?.siteId as string;

  const { 
    siteData, products, device, setDevice, currentStepIndex, setCurrentStepIndex, 
    loading, saving, isDirty, saveSuccess, selectedElement, 
    cmdKOpen, setCmdKOpen, handleSave, undo, redo, canUndo, canRedo, 
    updatePropByFieldKey, moveSection, addSection, deleteSection, 
    updateTheme, updateProduct, focusPreviewElement, iframeRef, editorScrollRef 
  } = useBuilder();

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
          <button onClick={undo} disabled={!canUndo} className="p-2 text-white/40 hover:text-white disabled:opacity-30 transition-colors">
            <Undo className="w-4 h-4" />
          </button>
          <button onClick={redo} disabled={!canRedo} className="p-2 text-white/40 hover:text-white disabled:opacity-30 transition-colors">
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
                  <div className="text-xs font-bold text-white/30 px-3 pt-4 pb-1 uppercase tracking-wider">Add Section to {activePage?.name || 'Page'}</div>
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
