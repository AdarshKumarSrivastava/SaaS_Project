"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Plus, Search, MoreHorizontal, Edit, Trash2, Image as ImageIcon, CheckCircle, Tag } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function ProductsTab({ siteId }: { siteId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get(`/api/sites/${siteId}/products`);
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [siteId]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.delete(`/api/sites/${siteId}/products/${productId}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-light tracking-tight mb-3">Product Matrix</h2>
          <p className="text-white/50 text-sm font-light leading-relaxed">Manage your catalog, variants, inventory, and merchandising.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex items-center w-full md:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-5 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-full px-6 py-3 pl-12 text-sm font-light focus:border-white/30 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}
            className="shrink-0 bg-white text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <Plus className="w-4 h-4" /> New Product
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 font-mono">Product</th>
                <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 font-mono">Status</th>
                <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 font-mono">Inventory</th>
                <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 font-mono">Price</th>
                <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 font-mono text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-white/20" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-1">{product.name}</p>
                        <p className="text-xs text-white/40 font-mono">{product.sku || 'No SKU'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70">
                      <div className={`w-1.5 h-1.5 rounded-full ${product.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-yellow-500'}`} />
                      {product.status || 'DRAFT'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-mono text-white/70">{product.stock || 0} in stock</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-mono">${product.price.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedProduct(product); setIsFormOpen(true); }}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/20 hover:border-white/30 transition-all text-white/70 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-all text-white/70 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/30">
                    <Box className="w-8 h-8 mx-auto mb-4 opacity-50" />
                    <p className="text-[10px] uppercase tracking-widest font-bold">No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <ProductEditor 
            siteId={siteId} 
            product={selectedProduct} 
            onClose={() => setIsFormOpen(false)} 
            onSaved={() => { setIsFormOpen(false); fetchProducts(); }} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Inline component for the editor to keep files compact
function ProductEditor({ siteId, product, onClose, onSaved }: { siteId: string, product: any, onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState(product || {
    name: '',
    description: '',
    price: 0,
    comparePrice: 0,
    sku: '',
    stock: 0,
    status: 'ACTIVE',
    images: []
  });
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev: any) => ({ ...prev, images: [event.target!.result as string] }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNumberChange = (field: string, value: string) => {
    if (value === '') {
      setFormData((prev: any) => ({ ...prev, [field]: '' }));
      return;
    }
    const cleanValue = value.replace(/^0+(?=\d)/, '');
    setFormData((prev: any) => ({ ...prev, [field]: cleanValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        comparePrice: Number(formData.comparePrice) || 0,
        stock: Number(formData.stock) || 0
      };

      if (product) {
        await apiClient.patch(`/api/sites/${siteId}/products/${product.id}`, payload);
        toast.success('Product updated');
      } else {
        await apiClient.post(`/api/sites/${siteId}/products`, payload);
        toast.success('Product created');
      }
      onSaved();
    } catch (err) {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleModalWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (event.ctrlKey) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll <= 0) return;
    
    const delta = event.deltaY;
    if (!delta) return;
    
    const current = container.scrollTop;
    const next = Math.max(0, Math.min(current + delta, maxScroll));
    
    if (next !== current) {
      event.preventDefault();
      container.scrollTop = next;
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 w-full h-[100dvh] overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/65 backdrop-blur-[12px]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div 
        onWheelCapture={handleModalWheel}
        initial={{ opacity: 0, scale: 0.985, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.985, y: 8 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[980px] h-[min(calc(100dvh-32px),900px)] max-h-[calc(100dvh-32px)] bg-gradient-to-br from-[#111111] to-[#080808] border border-white/10 rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col min-h-0 overflow-hidden box-border"
      >
        {/* Subtle radial lighting & Grid */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black_10%,transparent_40%)] pointer-events-none" />

        {/* Header (Sticky) */}
        <div className="relative shrink-0 px-8 py-8 md:px-10 flex flex-col gap-1 border-b border-white/[0.05] w-full bg-[#0a0a0a]/40 backdrop-blur-md z-10">
          <button type="button" onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors bg-white/[0.03] hover:bg-white/[0.1] p-2 rounded-full backdrop-blur-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-white/40 font-mono">Product Studio / 01</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-[32px] md:text-[38px] font-medium tracking-tight text-white leading-tight mt-1" id="new-product-title">{product ? 'Edit Product' : 'New Product'}</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-[14px] text-white/50 tracking-wide mt-1 max-w-md">Create and configure the identity, pricing, and media for your next storefront item.</p>
          </motion.div>
        </div>

        {/* Body (Scrollable) */}
        <div 
          ref={scrollContainerRef}
          data-lenis-prevent="true"
          className="relative flex-[1_1_auto] min-h-0 overflow-y-auto overflow-x-hidden w-full overscroll-contain touch-pan-y [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/[0.16] hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.28] [&::-webkit-scrollbar-thumb]:rounded-full" 
          style={{ WebkitOverflowScrolling: 'touch', scrollbarGutter: 'stable', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.18) transparent' }}
        >
          <form id="productForm" onSubmit={handleSubmit} className="p-8 md:p-10 w-full grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] gap-12">
            
            {/* Form Column */}
            <div className="w-full space-y-12">
              
              {/* SECTION 01: DETAILS */}
              <section className="space-y-6">
                <div className="border-b border-white/10 pb-2">
                  <h4 className="text-[11px] uppercase font-bold tracking-[0.2em] text-white/60">01 / Product Details</h4>
                  <p className="text-[12px] text-white/40 mt-1">Define the identity and story of this product.</p>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Product Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/[0.025] border border-white/10 rounded-[12px] px-4 h-[50px] text-[14px] text-white focus:bg-white/[0.04] focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)] outline-none transition-all placeholder:text-white/20" placeholder="Minimalist Chair" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/[0.025] border border-white/10 rounded-[12px] p-4 text-[14px] text-white focus:bg-white/[0.04] focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)] outline-none transition-all placeholder:text-white/20 resize-y min-h-[120px] max-h-[300px]" placeholder="Detailed product description..." />
                  </div>
                </div>
              </section>

              {/* SECTION 02: COMMERCIAL */}
              <section className="space-y-6">
                <div className="border-b border-white/10 pb-2">
                  <h4 className="text-[11px] uppercase font-bold tracking-[0.2em] text-white/60">02 / Commercial</h4>
                  <p className="text-[12px] text-white/40 mt-1">Set pricing and available inventory.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Price</label>
                    <div className="relative flex items-center bg-white/[0.025] border border-white/10 rounded-[12px] focus-within:bg-white/[0.04] focus-within:border-white/30 focus-within:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all">
                      <span className="absolute left-4 text-white/40 font-mono">$</span>
                      <input type="number" step="0.01" required value={formData.price === 0 ? '' : formData.price} onChange={e => handleNumberChange('price', e.target.value)} className="w-full bg-transparent h-[50px] pl-8 pr-4 text-[14px] font-mono outline-none text-white" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Stock Quantity</label>
                    <input type="number" required value={formData.stock === 0 ? '' : formData.stock} onChange={e => handleNumberChange('stock', e.target.value)} className="w-full bg-white/[0.025] border border-white/10 rounded-[12px] px-4 h-[50px] text-[14px] text-white font-mono focus:bg-white/[0.04] focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)] outline-none transition-all placeholder:text-white/20" placeholder="0" />
                  </div>
                </div>
              </section>

              {/* SECTION 03: CATALOG */}
              <section className="space-y-6">
                <div className="border-b border-white/10 pb-2">
                  <h4 className="text-[11px] uppercase font-bold tracking-[0.2em] text-white/60">03 / Catalog</h4>
                  <p className="text-[12px] text-white/40 mt-1">Organize how this product appears.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">SKU</label>
                    <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-white/[0.025] border border-white/10 rounded-[12px] px-4 h-[50px] text-[14px] text-white font-mono focus:bg-white/[0.04] focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)] outline-none transition-all placeholder:text-white/20" placeholder="CH-001" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Status</label>
                    <div className="relative">
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white/[0.025] border border-white/10 rounded-[12px] px-4 pl-10 h-[50px] text-[13px] text-white font-bold tracking-wide uppercase focus:bg-white/[0.04] focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)] outline-none transition-all appearance-none cursor-pointer">
                        <option value="ACTIVE" className="bg-[#111] text-white">ACTIVE</option>
                        <option value="DRAFT" className="bg-[#111] text-white">DRAFT</option>
                        <option value="ARCHIVED" className="bg-[#111] text-white">ARCHIVED</option>
                      </select>
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${formData.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : formData.status === 'DRAFT' ? 'bg-yellow-500' : 'bg-white/20'}`} />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 04: MEDIA */}
              <section className="space-y-6">
                <div className="border-b border-white/10 pb-2">
                  <h4 className="text-[11px] uppercase font-bold tracking-[0.2em] text-white/60">04 / Media</h4>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Product Image</label>
                  <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-[16px] p-8 flex flex-col items-center justify-center gap-4 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-transform">
                      <ImageIcon className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-medium text-white/80">Drop image here or click to browse</p>
                      <p className="text-[11px] text-white/40 mt-1 uppercase tracking-widest">JPG / PNG / WEBP • MAX 5MB</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Live Preview Column (Desktop Only / Hidden on tiny screens) */}
            <div className="hidden md:block w-[300px] shrink-0 sticky top-0 h-fit">
              <div className="border-b border-white/10 pb-2 mb-6">
                <h4 className="text-[11px] uppercase font-bold tracking-[0.2em] text-white/60 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Live Preview
                </h4>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-[16px] overflow-hidden p-4">
                <div className="w-full aspect-[4/5] bg-white/[0.03] rounded-[10px] flex items-center justify-center mb-4 overflow-hidden relative">
                  {formData.images?.[0] ? (
                    <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-white/10" />
                  )}
                  {formData.status !== 'ACTIVE' && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest text-white/80 border border-white/10">
                      {formData.status}
                    </div>
                  )}
                </div>
                <h5 className="text-[15px] font-medium text-white truncate px-1">{formData.name || 'Product Name'}</h5>
                <p className="text-[13px] font-mono text-white/60 px-1 mt-1">${formData.price ? Number(formData.price).toFixed(2) : '0.00'}</p>
                <div className="mt-4 px-1">
                  <button type="button" disabled className="w-full bg-white text-black py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-widest opacity-50">Add to Cart</button>
                </div>
              </div>
            </div>

          </form>
        </div>
        
        {/* Footer (Sticky) */}
        <div className="relative shrink-0 px-8 py-5 md:px-10 border-t border-white/[0.05] bg-black/50 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">{saving ? 'Processing...' : 'Ready to Create'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50">ESC / Cancel</button>
            <button type="submit" form="productForm" disabled={saving} className="group relative bg-white text-black pl-6 pr-5 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 flex items-center gap-2 overflow-hidden">
              <span className="relative z-10">{saving ? 'Saving...' : 'Save Product'}</span>
              {!saving && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
