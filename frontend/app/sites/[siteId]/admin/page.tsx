"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Globe, Settings, LayoutTemplate, ShoppingBag, 
  Plus, Edit2, Trash2, Loader2, Save, Image as ImageIcon,
  ExternalLink, Rocket
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AdminPanelPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;
  const { user } = useAuth();
  
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'settings'>('overview');

  // Product State
  const [products, setProducts] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', category: '', image: '' });
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    fetchSiteAndProducts();
  }, [siteId]);

  const fetchSiteAndProducts = async () => {
    try {
      setLoading(true);
      const [siteData, productsData] = await Promise.all([
        apiClient.get(`http://localhost:3001/api/sites/${siteId}`),
        apiClient.get(`http://localhost:3001/api/sites/${siteId}/products`)
      ]);
      setSite(siteData);
      setProducts(productsData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin panel');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const payload = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        category: productForm.category,
        image: productForm.image
      };

      if (editingProduct) {
        await apiClient.patch(`http://localhost:3001/api/sites/${siteId}/products/${editingProduct.id}`, payload);
        toast.success('Product updated');
      } else {
        await apiClient.post(`http://localhost:3001/api/sites/${siteId}/products`, payload);
        toast.success('Product added');
      }
      setIsProductModalOpen(false);
      fetchSiteAndProducts();
    } catch (err) {
      toast.error('Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await apiClient.delete(`http://localhost:3001/api/sites/${siteId}/products/${productId}`);
      toast.success('Product deleted');
      fetchSiteAndProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const openProductModal = (prod: any = null) => {
    setEditingProduct(prod);
    if (prod) {
      setProductForm({ name: prod.name, price: prod.price.toString(), category: prod.category || '', image: prod.image || '' });
    } else {
      setProductForm({ name: '', price: '', category: '', image: '' });
    }
    setIsProductModalOpen(true);
  };

  const handleDeploy = async () => {
    try {
      await apiClient.patch(`http://localhost:3001/api/sites/${siteId}`, { status: 'published' });
      toast.success('Site deployed live!');
      fetchSiteAndProducts();
    } catch (err) {
      toast.error('Failed to deploy site');
    }
  };

  if (loading || !site) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-ink-soft" />
      </div>
    );
  }

  const liveUrl = `http://${site.subdomain}.localhost:3000`; // Assuming local development

  return (
    <div className="min-h-screen bg-bg-base text-ink flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-bg-elevated border-r border-line/60 flex flex-col shrink-0">
        <div className="p-6 border-b border-line/60 flex flex-col gap-4">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink-soft hover:text-ink transition-colors">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </button>
          <div>
            <h1 className="text-xl font-bold truncate">{site.name}</h1>
            <a href={liveUrl} target="_blank" rel="noreferrer" className="text-xs text-accent flex items-center gap-1 hover:underline mt-1 font-medium">
              {site.subdomain}.buildspace.app <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutTemplate },
            { id: 'products', label: 'Products', icon: ShoppingBag },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-ink text-bg-elevated shadow-md' 
                    : 'text-ink-soft hover:bg-bg-subtle hover:text-ink'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="p-6 border-t border-line/60">
          <button 
            onClick={() => router.push(`/sites/${siteId}/builder`)}
            className="w-full bg-bg-subtle text-ink font-bold text-[10px] uppercase tracking-widest py-3.5 rounded-xl border border-line/60 hover:bg-line transition-all flex items-center justify-center gap-2"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Template
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <div className="max-w-5xl mx-auto">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-line/60">
            <div>
              <h2 className="text-4xl font-black tracking-tight capitalize">{activeTab}</h2>
              <p className="text-ink-soft mt-2">Manage your website's {activeTab} & performance.</p>
            </div>
            {activeTab === 'products' && (
              <button onClick={() => openProductModal()} className="bg-ink text-bg-elevated px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            )}
            {activeTab === 'overview' && (
              <button onClick={handleDeploy} className="bg-emerald-600 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-emerald-500 hover:scale-105 transition-all active:scale-95">
                <Rocket className="w-4 h-4" /> Deploy Live
              </button>
            )}
          </header>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-bg-elevated border border-line rounded-3xl p-6 shadow-sm">
                  <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-4">Live Status</h3>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full shadow-inner ${site.status === 'published' ? 'bg-emerald-500 animate-pulse shadow-emerald-500/50' : 'bg-amber-500 shadow-amber-500/50'}`} />
                    <span className="text-2xl font-black capitalize">{site.status}</span>
                  </div>
                </div>
                <div className="bg-bg-elevated border border-line rounded-3xl p-6 shadow-sm">
                  <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-4">Total Products</h3>
                  <span className="text-4xl font-black">{products.length}</span>
                </div>
                <div className="bg-bg-elevated border border-line rounded-3xl p-6 shadow-sm">
                  <h3 className="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-4">Template Engine</h3>
                  <span className="text-xl font-bold capitalize">{site.schema?.global?.templateSlug || 'Velocity'}</span>
                </div>
              </div>

              {site.status === 'published' && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-emerald-900 font-bold text-lg mb-1">Your site is live and active.</h3>
                    <p className="text-emerald-700 text-sm">Customers can now access your store and purchase products.</p>
                  </div>
                  <a href={liveUrl} target="_blank" rel="noreferrer" className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-500 transition-colors flex items-center gap-2 whitespace-nowrap">
                    View Live Site <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="bg-bg-elevated border border-line rounded-3xl overflow-hidden shadow-xl">
              {products.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-bg-subtle rounded-full flex items-center justify-center mb-6 shadow-inner border border-line">
                    <ShoppingBag className="w-8 h-8 text-ink-soft" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Inventory Empty</h3>
                  <p className="text-ink-soft mb-8 max-w-sm font-medium">Add products to your catalog. They will instantly sync with your live storefront.</p>
                  <button onClick={() => openProductModal()} className="bg-ink text-bg-elevated px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl">
                    <Plus className="w-4 h-4" /> Create First Product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-subtle/50 border-b border-line text-[10px] uppercase tracking-widest text-ink-soft">
                        <th className="p-6 font-bold w-1/2">Product Information</th>
                        <th className="p-6 font-bold">Category</th>
                        <th className="p-6 font-bold">Price</th>
                        <th className="p-6 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {products.map(prod => (
                        <tr key={prod.id} className="hover:bg-bg-subtle/50 transition-colors group">
                          <td className="p-6 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-xl bg-bg-subtle border border-line overflow-hidden shrink-0 shadow-sm">
                              {prod.image ? (
                                <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-ink-soft m-auto mt-4" />
                              )}
                            </div>
                            <span className="font-bold text-base">{prod.name}</span>
                          </td>
                          <td className="p-6 text-ink-soft font-medium">{prod.category || '—'}</td>
                          <td className="p-6 font-black text-lg">${prod.price.toFixed(2)}</td>
                          <td className="p-6">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openProductModal(prod)} className="p-2.5 text-ink-soft hover:text-ink hover:bg-bg-subtle rounded-xl transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-xl">
              <div className="bg-bg-elevated border border-line rounded-3xl p-8 space-y-6 shadow-sm">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Project Name</label>
                  <input type="text" disabled value={site.name} className="w-full bg-bg-subtle border border-line rounded-xl px-4 py-3 text-ink opacity-70 cursor-not-allowed font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Production Subdomain</label>
                  <div className="flex shadow-sm">
                    <input type="text" disabled value={site.subdomain} className="flex-1 bg-bg-subtle border border-line border-r-0 rounded-l-xl px-4 py-3 text-ink opacity-70 cursor-not-allowed font-semibold" />
                    <span className="bg-line/20 border border-line rounded-r-xl px-4 py-3 text-ink-soft font-mono text-sm">.buildspace.app</span>
                  </div>
                  <p className="text-xs text-ink-soft mt-3">Domains are immutable in the MVP tier. Contact support for custom apex domains.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* PRODUCT MODAL */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/60 backdrop-blur-md" onClick={() => setIsProductModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-bg-elevated border border-line rounded-[2rem] w-full max-w-lg p-10 relative z-10 shadow-2xl">
              <h3 className="text-3xl font-black mb-8">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Product Name</label>
                  <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-bg-subtle border border-line focus:border-ink rounded-xl px-5 py-4 text-sm font-semibold transition-colors outline-none shadow-inner" placeholder="e.g. Minimalist Watch" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Price ($)</label>
                    <input required type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-bg-subtle border border-line focus:border-ink rounded-xl px-5 py-4 text-sm font-semibold transition-colors outline-none shadow-inner" placeholder="99.99" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Category</label>
                    <input type="text" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-bg-subtle border border-line focus:border-ink rounded-xl px-5 py-4 text-sm font-semibold transition-colors outline-none shadow-inner" placeholder="e.g. Accessories" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Image URL</label>
                  <input type="url" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="w-full bg-bg-subtle border border-line focus:border-ink rounded-xl px-5 py-4 text-sm font-semibold transition-colors outline-none shadow-inner" placeholder="https://..." />
                  {productForm.image && (
                    <div className="mt-4 w-full h-40 rounded-2xl bg-bg-base border border-line overflow-hidden shadow-sm">
                      <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 bg-bg-subtle text-ink font-bold py-4 rounded-xl border border-line hover:bg-line transition-colors">Cancel</button>
                  <button type="submit" disabled={savingProduct} className="flex-[2] bg-ink text-bg-elevated font-bold py-4 rounded-xl hover:bg-ink/90 transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                    {savingProduct ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingProduct ? 'Save Changes' : 'Create Product')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
