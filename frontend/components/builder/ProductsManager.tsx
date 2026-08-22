import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: string | null;
}

export default function ProductsManager({ siteId }: { siteId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({ name: '', price: '', image: '', category: '' });
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/products`);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [siteId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        image: formData.image || undefined,
        category: formData.category || undefined
      };

      if (isEditing) {
        await apiClient.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/products/${isEditing.id}`, payload);
      } else {
        await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/products`, payload);
      }
      setIsEditing(null);
      setIsCreating(false);
      setFormData({ name: '', price: '', image: '', category: '' });
      fetchProducts();
    } catch (err) {
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await apiClient.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-ink-soft">Loading catalog...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Product Catalog</h2>
        <button 
          onClick={() => { setIsCreating(true); setFormData({ name: '', price: '', image: '', category: '' }); }}
          className="bg-ink text-bg-base px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {(isCreating || isEditing) && (
        <div className="bg-bg-elevated p-6 rounded-2xl border border-line space-y-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{isEditing ? 'Edit Product' : 'New Product'}</h3>
            <button onClick={() => { setIsCreating(false); setIsEditing(null); }} className="text-ink-soft hover:text-ink">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-bg-base border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink" placeholder="The Perfect Tee" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">Price</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-bg-base border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink" placeholder="35.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">Category</label>
              <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-bg-base border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink" placeholder="Tops" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1">Image URL</label>
              <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-bg-base border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ink" placeholder="https://..." />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button disabled={saving} onClick={handleSave} className="bg-ink text-bg-base px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </div>
      )}

      <div className="bg-bg-elevated rounded-2xl border border-line overflow-hidden shadow-sm">
        {products.length === 0 ? (
          <div className="p-8 text-center text-ink-soft text-sm">No products found. Add your first product!</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-subtle/50 text-xs text-ink-soft">
              <tr>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-bg-subtle/30 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-bg-subtle bg-cover bg-center border border-line" style={{ backgroundImage: `url(${p.image || ''})` }} />
                    <span className="font-medium text-ink">{p.name}</span>
                  </td>
                  <td className="px-6 py-4 text-ink-soft">{p.category || '—'}</td>
                  <td className="px-6 py-4 font-mono text-ink">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setIsEditing(p); setFormData({ name: p.name, price: String(p.price), category: p.category || '', image: p.image || '' }); }} className="p-2 text-ink-soft hover:text-ink bg-bg-base border border-line rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:text-red-700 bg-red-50 border border-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
