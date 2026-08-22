"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Package, Truck, CheckCircle2, XCircle, Search, Clock, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const STATUSES = ['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrdersTab({ siteId }: { siteId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    try {
      const data = await apiClient.get(`http://localhost:3001/api/sites/${siteId}/orders`);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [siteId]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await apiClient.patch(`http://localhost:3001/api/sites/${siteId}/orders/${orderId}/status`, { status });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'PROCESSING': return <Package className="w-4 h-4 text-blue/500" />;
      case 'SHIPPED': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Box className="w-4 h-4 text-white/50" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-light tracking-tight mb-3">Fulfillment Operations</h2>
          <p className="text-white/50 text-sm font-light leading-relaxed">Manage order lifecycles and physical fulfillment pipelines.</p>
        </div>
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-full px-6 py-3 pl-12 text-sm font-light focus:border-white/30 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-white/40 absolute left-5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Order List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {orders.map(order => (
            <div 
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`p-6 rounded-[1.5rem] border cursor-pointer transition-all duration-300 ${selectedOrder?.id === order.id ? 'bg-white/10 border-white/30' : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'}`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-sm tracking-widest">{order.orderNumber}</span>
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/60">
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-lg font-light">{order.customer?.email || 'Guest'}</p>
                  <p className="text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="font-mono text-lg">${order.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div 
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12 sticky top-32"
              >
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-3xl font-light mb-2 font-mono">{selectedOrder.orderNumber}</h3>
                    <p className="text-white/50 text-sm">Customer: {selectedOrder.customer?.email || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                      className="bg-black border border-white/20 text-white rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[1.5rem] p-8 mb-10">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">Manifest</h4>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-white/40" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-mono">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 mt-6 pt-6 flex flex-col gap-2 font-mono text-sm">
                    <div className="flex justify-between text-white/60"><span>Subtotal</span><span>${selectedOrder.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-white/60"><span>Tax</span><span>${selectedOrder.tax.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-white/10"><span>Total</span><span>${selectedOrder.total.toFixed(2)}</span></div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-white/30 sticky top-32">
                <FileText className="w-8 h-8 mb-4 opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Select an order manifest</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
