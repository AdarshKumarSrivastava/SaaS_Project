"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, UserCircle, Mail, Phone, ExternalLink, ShoppingBag, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function CustomersTab({ siteId }: { siteId: string }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get(`/api/sites/${siteId}/customers`);
      const list = Array.isArray(data?.customers) ? data.customers : Array.isArray(data) ? data : [];
      setCustomers(list);
      if (selectedCustomer) {
        const updated = list.find((c: any) => c.id === selectedCustomer.id);
        if (updated) setSelectedCustomer(updated);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [siteId]);

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const filteredCustomers = safeCustomers.filter(c => 
    (c?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-light tracking-tight mb-3">Customer Database</h2>
          <p className="text-white/50 text-sm font-light leading-relaxed">
            View real registered customers, lifetime spend, order records, and activity for this store.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex items-center w-full md:w-72">
            <Search className="w-4 h-4 text-white/40 absolute left-5 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search email or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-full px-6 py-3 pl-12 text-sm font-light focus:border-white/30 outline-none transition-all text-white placeholder:text-white/30"
            />
          </div>
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="p-3 bg-[#0a0a0a] border border-white/10 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Refresh Customers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filteredCustomers.map(customer => (
            <div 
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className={`p-5 rounded-[1.5rem] border cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                selectedCustomer?.id === customer.id 
                  ? 'bg-white/10 border-white/30 shadow-lg' 
                  : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <UserCircle className="w-5 h-5 text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-white">{customer.name || customer.email}</p>
                <p className="text-xs text-white/40 truncate">{customer.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Spend</p>
                <p className="font-mono text-sm font-medium text-emerald-400">
                  ${(customer.totalSpent || 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && !loading && (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-[1.5rem] bg-[#0a0a0a]/50">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-30 text-white" />
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">No customers registered yet</p>
              <p className="text-xs text-white/30 mt-1">Customers who sign up on your live site will appear here.</p>
            </div>
          )}
        </div>

        {/* Customer Details Side */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedCustomer ? (
              <motion.div 
                key={selectedCustomer.id}
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12 sticky top-32"
              >
                <div className="flex items-start gap-6 mb-10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00f0ff]/20 to-[#ffbd2e]/20 border-2 border-white/10 flex items-center justify-center shrink-0">
                    <UserCircle className="w-10 h-10 text-white/70" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-light mb-2 text-white">{selectedCustomer.name || 'Customer'}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-white/50 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-white/40" /> {selectedCustomer.email}
                      </div>
                      {selectedCustomer.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-white/40" /> {selectedCustomer.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Member Since</p>
                    <p className="font-mono text-xs text-white/80">
                      {new Date(selectedCustomer.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Total Orders</p>
                    <p className="font-mono text-xl text-white font-medium">
                      {selectedCustomer.ordersCount || selectedCustomer.orders?.length || 0}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Total Spent</p>
                    <p className="font-mono text-xl text-emerald-400 font-medium">
                      ${(selectedCustomer.totalSpent || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {selectedCustomer.lastLoginAt && (
                  <div className="mb-8 flex items-center gap-2 text-xs text-white/40">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last active on store: {new Date(selectedCustomer.lastLoginAt).toLocaleString()}</span>
                  </div>
                )}

                <div className="bg-white/[0.02] border border-white/5 rounded-[1.5rem] p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5" /> Order History
                    </h4>
                  </div>
                  
                  {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                    <div className="text-center py-8 text-white/30 border border-dashed border-white/10 rounded-xl">
                      <p className="text-sm font-light">No order records placed yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCustomer.orders.map((order: any) => (
                        <div key={order.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-mono font-bold text-white mb-1">#{order.orderNumber || order.id.slice(0, 8)}</p>
                            <p className="text-[11px] text-white/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${
                              order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {order.status}
                            </span>
                            <p className="font-mono text-sm text-white font-medium">${(order.total || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-white/30 sticky top-32">
                <Users className="w-8 h-8 mb-4 opacity-50 text-white" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Select a customer profile to view activity</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
