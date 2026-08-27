import React, { useState, useEffect } from 'react';
import { Package, Upload, Plus, Tag } from 'lucide-react';

interface ProductsTabProps {
  products: any[];
  updateProduct: (product: any) => void;
  selectedProductId?: string;
}

export function ProductsTab({ products, updateProduct, selectedProductId }: ProductsTabProps) {
  const [activeProductId, setActiveProductId] = useState<string | null>(selectedProductId || null);

  useEffect(() => {
    if (selectedProductId) setActiveProductId(selectedProductId);
  }, [selectedProductId]);

  const activeProduct = products.find(p => p.id === activeProductId);

  const handleFieldChange = (field: string, value: any) => {
    if (!activeProduct) return;
    updateProduct({ ...activeProduct, [field]: value });
  };

  if (activeProductId && activeProduct) {
    return (
      <div className="space-y-6 pb-32">
        <button 
          onClick={() => setActiveProductId(null)}
          className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-2 px-1"
        >
          ← Back to Products
        </button>

        <div className="editor-section bg-[#111] border border-white/10 rounded-xl overflow-hidden flex flex-col">
          <div className="section-header px-5 py-4 bg-white/[0.02] border-b border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">Product Details</h3>
          </div>
          <div className="section-content p-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/60">Product Name</label>
            <input 
              type="text" 
              value={activeProduct.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 text-white"
            />
          </div>

          <div className="flex gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-[11px] font-medium text-white/60">Price</label>
              <input 
                type="number" 
                value={activeProduct.price || 0}
                onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 text-white"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="text-[11px] font-medium text-white/60">Category</label>
              <input 
                type="text" 
                value={activeProduct.category || ''}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/60">Description</label>
            <textarea 
              value={activeProduct.description || activeProduct.shortDescription || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={4}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 text-white resize-y min-h-[80px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/60">Primary Image URL</label>
            <div className="w-full h-32 bg-[#1A1A1A] border border-dashed border-white/20 rounded-lg overflow-hidden flex items-center justify-center mb-2 relative">
              {activeProduct.image ? (
                <img src={activeProduct.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-white/20" />
              )}
            </div>
            <input 
              type="text" 
              value={activeProduct.image || ''}
              onChange={(e) => handleFieldChange('image', e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 text-white"
            />
          </div>
          
          {activeProduct.id.startsWith('o') || activeProduct.id.startsWith('v') ? (
            <div className="text-[10px] text-blue-400 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              Editing this demo product will automatically clone it into your project's database.
            </div>
          ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">
          Project Products
        </div>
        <button 
          className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded"
          onClick={() => {
            const newProduct = {
              id: `new-${Date.now()}`,
              name: "New Product",
              price: 0,
              category: "Uncategorized"
            };
            updateProduct(newProduct);
            setActiveProductId(newProduct.id);
          }}
        >
          <Plus className="w-3 h-3" /> Add New
        </button>
      </div>

      <div className="space-y-2">
        {products.map(product => (
          <button 
            key={product.id}
            onClick={() => setActiveProductId(product.id)}
            className="w-full text-left bg-[#111] hover:bg-[#1A1A1A] border border-white/5 hover:border-white/20 rounded-xl p-3 flex items-center gap-4 transition-all"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0 flex items-center justify-center">
              {product.image ? (
                <img src={product.image} className="w-full h-full object-cover" alt="" />
              ) : (
                <Package className="w-5 h-5 text-white/20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{product.name}</div>
              <div className="text-xs text-white/50 flex items-center gap-2 mt-1">
                <span>${(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')).toFixed(2)}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="truncate">{product.category}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
