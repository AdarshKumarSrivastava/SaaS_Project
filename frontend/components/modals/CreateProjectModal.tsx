"use client";

import React, { useEffect, useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Check, Globe, Layers, ArrowRight, Loader2 } from 'lucide-react';

export interface CategoryOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  description?: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, category: string, subdomain?: string) => Promise<void>;
  isCreating: boolean;
  categories: CategoryOption[];
  defaultCategory?: string;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
  categories,
  defaultCategory = 'portfolio',
}: CreateProjectModalProps) {
  const modalId = useId();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [customSubdomain, setCustomSubdomain] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-generate subdomain from project name
  const generatedSubdomain = name
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    : 'my-project';

  const activeSubdomain = customSubdomain || generatedSubdomain;

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory(defaultCategory);
      setCustomSubdomain('');
      setShowAdvanced(false);
      setErrorMsg('');
    }
  }, [isOpen, defaultCategory]);

  // ABSOLUTE BACKGROUND SCROLL LOCK & SCROLL POSITION PRESERVATION
  useEffect(() => {
    if (!isOpen) return;

    // 1. Calculate browser scrollbar width to prevent horizontal layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Store original styles
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    
    // Store scroll position for restoring later
    const scrollY = window.scrollY;
    
    // Check for iOS
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    // 2. Lock body scroll & compensate scrollbar width
    document.body.style.overflow = 'hidden';
    
    // iOS Safari specific fix: position fixed prevents background scrolling completely
    if (isIOS) {
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    }
    
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${parseFloat(originalPaddingRight || '0') + scrollbarWidth}px`;
    }

    // 3. Escape key listener for accessibility
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCreating) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      // Restore all original styles
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      
      if (isIOS) {
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        window.scrollTo(0, scrollY);
      }
      
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isCreating, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isCreating) return;

    setErrorMsg('');
    try {
      await onSubmit(name.trim(), category, activeSubdomain);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to provision project environment. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${modalId}-title`}
        >
          {/* Glassmorphic Translucent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 bg-ink/50 backdrop-blur-md z-40 touch-none"
            data-lenis-prevent
            onClick={() => {
              if (!isCreating) onClose();
            }}
          />

          {/* Centered Viewport Wrapper (100% Fixed Centered) */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            {/* Centered Responsive Viewport-Aware Modal Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto relative w-full max-w-xl max-h-[85vh] bg-bg-elevated border border-line rounded-[2.5rem] shadow-[0_32px_90px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col focus:outline-none"
              data-lenis-prevent
            >
              {/* Modal Fixed Header */}
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-line/60 flex items-center justify-between shrink-0 bg-bg-elevated/95 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-ink text-bg-elevated flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 id={`${modalId}-title`} className="text-xl font-bold tracking-tight text-ink">
                      Start New Project
                    </h2>
                    <p className="text-xs text-ink-soft font-light">
                      Provision a high-performance web application environment.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isCreating}
                  className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-bg-subtle transition-colors disabled:opacity-50"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Internal Scrollable Form Area */}
              <div 
                className="px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto flex-1 min-h-0 space-y-6 scrollbar-thin scrollbar-thumb-line overscroll-contain touch-pan-y"
                data-lenis-prevent
              >
                <form id="create-project-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Banner */}
                  {errorMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
                    >
                      {errorMsg}
                    </motion.div>
                  )}

                  {/* Project Name Input */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor={`${modalId}-name`} className="text-xs font-bold uppercase tracking-wider text-ink">
                        Project Name <span className="text-accent">*</span>
                      </label>
                      <span className="text-[11px] text-ink-soft font-mono">
                        {name.length}/40
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        id={`${modalId}-name`}
                        type="text"
                        maxLength={40}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Nexus Commerce Platform"
                        required
                        autoFocus
                        disabled={isCreating}
                        className="w-full bg-bg-base border border-line rounded-2xl px-4 py-3.5 text-ink text-sm font-medium focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition-all placeholder:text-ink-soft/40 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Subdomain URL Preview */}
                  <div className="p-4 rounded-2xl bg-bg-subtle/60 border border-line/60 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Globe className="w-4 h-4 text-ink-soft shrink-0" />
                      <div className="min-w-0 truncate">
                        <span className="text-ink-soft">Target URL: </span>
                        <span className="font-mono font-semibold text-ink truncate">
                          https://{activeSubdomain}.buildspace.app
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-[11px] font-semibold text-accent hover:underline shrink-0"
                    >
                      {showAdvanced ? 'Hide Edit' : 'Edit URL'}
                    </button>
                  </div>

                  {/* Custom Subdomain Input (Collapsible) */}
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label htmlFor={`${modalId}-subdomain`} className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">
                        Custom Subdomain Prefix
                      </label>
                      <input
                        id={`${modalId}-subdomain`}
                        type="text"
                        value={customSubdomain}
                        onChange={(e) => setCustomSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder={generatedSubdomain}
                        className="w-full bg-bg-base border border-line rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink focus:outline-none focus:border-ink"
                      />
                    </motion.div>
                  )}

                  {/* Category Selection Grid */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-3">
                      Select Architecture Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            disabled={isCreating}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-start gap-3.5 relative overflow-hidden group ${
                              isSelected
                                ? 'bg-bg-subtle/80 border-ink ring-2 ring-ink/20 shadow-sm'
                                : 'bg-bg-elevated border-line hover:bg-bg-subtle/40 hover:border-line/80'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cat.accent}`}>
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-semibold text-xs text-ink truncate">{cat.label}</h4>
                                {isSelected && (
                                  <div className="w-4 h-4 rounded-full bg-ink text-bg-elevated flex items-center justify-center shrink-0">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                              <p className="text-[11px] text-ink-soft font-light mt-0.5 line-clamp-1">
                                {cat.description || `Optimized for ${cat.label.toLowerCase()} web apps.`}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Fixed Action Footer */}
              <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-line/60 bg-bg-elevated/95 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-ink-soft hover:text-ink hover:bg-bg-subtle transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  form="create-project-form"
                  disabled={isCreating || !name.trim()}
                  className="inline-flex items-center gap-2 bg-ink text-bg-elevated px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-ink/90 transition-all shadow-md disabled:opacity-50 active:scale-95"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
