"use client";

import React, { useEffect, useState } from 'react';
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
      const data = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/products`);
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
      await apiClient.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/products/${productId}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (product) {
        await apiClient.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/products/${product.id}`, formData);
        toast.success('Product updated');
      } else {
        await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/products`, formData);
        toast.success('Product created');
      }
      onSaved();
    } catch (err) {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-12"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-auto md:w-full md:max-w-3xl md:h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-none">
          <h3 className="text-2xl font-light tracking-tight mb-8">{product ? 'Edit Product' : 'New Product'}</h3>
          
          <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Product Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/30 outline-none" placeholder="Minimalist Chair" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/30 outline-none resize-none" placeholder="Detailed product description..." />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 pl-8 text-sm font-mono focus:border-white/30 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Stock Quantity</label>
                <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-white/30 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">SKU</label>
                <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-white/30 outline-none" placeholder="CH-001" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-white/30 outline-none">
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
            
            {/* Minimal image drag-drop placeholder */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Media Assets</label>
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-white/[0.01] hover:bg-white/[0.02] transition-colors cursor-pointer">
                <ImageIcon className="w-6 h-6 text-white/30" />
                <p className="text-xs text-white/50 text-center max-w-xs">Drag and drop images here, or click to browse. Supported formats: JPG, PNG, WEBP.</p>
              </div>
            </div>

          </form>
        </div>
        <div className="p-6 border-t border-white/10 bg-black flex justify-end gap-4 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">Cancel</button>
          <button type="submit" form="productForm" disabled={saving} className="bg-white text-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </motion.div>
    </>
  );
}
