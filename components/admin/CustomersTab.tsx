"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, UserCircle, MapPin, Phone, Mail, FileText, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function CustomersTab({ siteId }: { siteId: string }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const fetchCustomers = async () => {
    try {
      const data = await apiClient.get(`/api/sites/${siteId}/customers`);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [siteId]);

  const filteredCustomers = customers.filter(c => 
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-light tracking-tight mb-3">Customer Database</h2>
          <p className="text-white/50 text-sm font-light leading-relaxed">View and manage customer profiles, lifetime value, and order history.</p>
        </div>
        <div className="relative flex items-center w-full md:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-5 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search email or name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-full px-6 py-3 pl-12 text-sm font-light focus:border-white/30 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filteredCustomers.map(customer => (
            <div 
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className={`p-5 rounded-[1.5rem] border cursor-pointer transition-all duration-300 flex items-center gap-4 ${selectedCustomer?.id === customer.id ? 'bg-white/10 border-white/30' : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'}`}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <UserCircle className="w-5 h-5 text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{customer.name || 'Unnamed Customer'}</p>
                <p className="text-xs text-white/40 truncate">{customer.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Orders</p>
                <p className="font-mono text-sm">{customer._count?.orders || 0}</p>
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && !loading && (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-[1.5rem]">
              <Users className="w-6 h-6 mx-auto mb-3 opacity-30" />
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">No customers found</p>
            </div>
          )}
        </div>

        {/* Customer Details Side */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedCustomer ? (
              <motion.div 
                key={selectedCustomer.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12 sticky top-32"
              >
                <div className="flex items-start gap-6 mb-10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00f0ff]/20 to-[#ffbd2e]/20 border-2 border-white/10 flex items-center justify-center shrink-0">
                    <UserCircle className="w-10 h-10 text-white/60" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-light mb-2">{selectedCustomer.name || 'Unnamed Customer'}</h3>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Mail className="w-4 h-4" /> {selectedCustomer.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Member Since</p>
                    <p className="font-mono">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Total Orders</p>
                    <p className="font-mono text-2xl">{selectedCustomer._count?.orders || 0}</p>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[1.5rem] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Recent History</h4>
                    <button className="text-[10px] uppercase font-bold tracking-widest text-white/60 hover:text-white flex items-center gap-1">
                      View All <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {selectedCustomer._count?.orders === 0 ? (
                    <div className="text-center py-8 text-white/30">
                      <p className="text-sm font-light">No order history available.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* We'd map over selectedCustomer.orders here if we eager loaded them, but we only have counts right now from the list view. To show orders, we'd need to fetch the single customer endpoint. */}
                      <div className="text-center py-8 text-white/40 border border-dashed border-white/10 rounded-xl">
                        <p className="text-xs uppercase tracking-widest font-bold mb-2">Order records</p>
                        <p className="text-sm">Click "View All" to see detailed transaction history.</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-white/30 sticky top-32">
                <Users className="w-8 h-8 mb-4 opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Select a customer profile</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
