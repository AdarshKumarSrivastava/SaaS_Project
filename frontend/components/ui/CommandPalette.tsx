"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Globe, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
   
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  
  // Ref for debouncing search input
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      
      // Close on Escape
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setResults([]);
      return;
    }

    if (query.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await apiClient.get(`http://localhost:3001/api/sites/search?q=${encodeURIComponent(query)}`);
        setResults(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce prevents hammering the database while typing
  }, [query, isOpen]);

  const handleSelect = React.useCallback((site: { id: string }) => {
    setIsOpen(false);
    // Instantly teleport the user to the visual builder for this site
    router.push(`/sites/${site.id}/builder`);
  }, [router]);

  // Handle Keyboard Navigation within the Modal
  useEffect(() => {
    if (!isOpen) return;
    
    const handleNavigation = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
      if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, results, selectedIndex, handleSelect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-bg-elevated border border-line shadow-2xl rounded-2xl overflow-hidden z-[101]"
          >
            <div className="flex items-center px-4 py-4 border-b border-line">
              <Search className="w-5 h-5 text-ink-soft mr-3" />
              <input 
                autoFocus
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sites by name or subdomain..."
                className="w-full bg-transparent text-lg text-ink focus:outline-none placeholder:text-ink-soft"
              />
              {loading && <Loader2 className="w-5 h-5 text-ink-soft animate-spin" />}
              <div className="flex items-center gap-1 ml-4 bg-bg-subtle px-2 py-1 rounded text-xs text-ink-soft font-medium tracking-widest">
                <span>ESC</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {query && results.length === 0 && !loading && (
                <div className="p-8 text-center text-ink-soft">
                  No sites found matching &quot;{query}&quot;
                </div>
              )}

              {results.map((site, index) => (
                <div 
                  key={site.id} 
                  onClick={() => handleSelect(site)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-4 py-4 cursor-pointer transition-colors ${index === selectedIndex ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-bg-subtle'}`}
                >
                  <div className="flex items-center gap-4">
                    <Globe className={`w-5 h-5 ${index === selectedIndex ? 'text-accent' : 'text-ink-soft'}`} />
                    <div>
                      <div className={`font-medium ${index === selectedIndex ? 'text-accent' : 'text-ink'}`}>{site.name}</div>
                      <div className="text-sm opacity-60 text-ink-soft">{site.subdomain}.localhost:3000</div>
                    </div>
                  </div>
                  {index === selectedIndex && <ArrowRight className="w-5 h-5 text-accent" />}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
