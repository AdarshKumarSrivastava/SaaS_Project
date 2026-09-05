"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  ShoppingBag, 
  LogOut, 
  Package, 
  Calendar, 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useCustomizationContext } from '@/context/CustomizationContext';
import { CustomerAuthForm } from './CustomerAuthForm';

interface PremiumProfileProps {
  basePath?: string;
  theme?: string;
  defaultTab?: 'orders' | 'profile';
}

export default function PremiumProfile({
  basePath = "",
  defaultTab = 'profile'
}: PremiumProfileProps) {
  const router = useRouter();
  const { customer, isLoading, logout } = useCustomerAuth();
  const __customContext = useCustomizationContext();
  const resolvedBasePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : basePath;

  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(defaultTab);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Sync tab if defaultTab changes (e.g. navigation from /profile to /orders)
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Fetch real customer orders
  const fetchOrders = async () => {
    if (!customer) return;
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const siteId = __customContext?.siteData?.id || "";
      const res = await fetch(`/api/storefront/orders?siteId=${siteId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error("Failed to load customer orders:", err);
      setOrdersError("Unable to load orders at this time.");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (customer) {
      fetchOrders();
    }
  }, [customer]);

  const handleLogout = async () => {
    await logout();
    router.push(`${resolvedBasePath}/`);
    router.refresh();
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-[var(--color-background,#fdfbf7)] text-[var(--color-foreground,#402c21)] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[var(--color-accent,#a38c7f)]" />
          <span className="text-xs font-mono tracking-widest uppercase text-[var(--color-accent,#a38c7f)]">
            Loading Account...
          </span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State: Show elegant Customer Login form
  if (!customer) {
    return (
      <CustomerAuthForm
        mode="login"
        basePath={resolvedBasePath}
        brandName={__customContext?.siteData?.global?.brandName || "Store Account"}
      />
    );
  }

  // 3. Authenticated Customer Account View
  const fullName = customer.firstName || customer.lastName 
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() 
    : customer.email.split('@')[0];

  return (
    <div className="w-full bg-[var(--color-background,#fdfbf7)] text-[var(--color-foreground,#402c21)] min-h-screen pt-12 md:pt-20 pb-32 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Account Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[var(--color-foreground,#402c21)]/15 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--color-foreground,#402c21)]/10 border border-[var(--color-foreground,#402c21)]/20 flex items-center justify-center text-[var(--color-foreground,#402c21)] font-serif text-2xl sm:text-3xl font-bold uppercase select-none">
              {fullName.charAt(0)}
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-[0.25em] uppercase font-bold text-[var(--color-accent,#a38c7f)] mb-1">
                Customer Account
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[var(--color-foreground,#402c21)]">
                {fullName}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-foreground,#402c21)]/60 mt-0.5">
                {customer.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--color-foreground,#402c21)]/20 hover:bg-[var(--color-foreground,#402c21)] hover:text-[var(--color-background,#fdfbf7)] text-xs font-mono uppercase tracking-wider transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-[var(--color-foreground,#402c21)]/10 mb-10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 text-xs font-mono uppercase tracking-[0.18em] transition-all relative font-bold ${
              activeTab === 'profile' 
                ? 'text-[var(--color-foreground,#402c21)]' 
                : 'text-[var(--color-foreground,#402c21)]/40 hover:text-[var(--color-foreground,#402c21)]'
            }`}
          >
            Account Details
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-foreground,#402c21)]" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 text-xs font-mono uppercase tracking-[0.18em] transition-all relative font-bold flex items-center gap-2 ${
              activeTab === 'orders' 
                ? 'text-[var(--color-foreground,#402c21)]' 
                : 'text-[var(--color-foreground,#402c21)]/40 hover:text-[var(--color-foreground,#402c21)]'
            }`}
          >
            <span>Order History</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-foreground,#402c21)]/10">
              {orders.length}
            </span>
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-foreground,#402c21)]" />
            )}
          </button>
        </div>

        {/* TAB 1: Account Details */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="md:col-span-2 bg-[var(--color-foreground,#402c21)]/[0.03] border border-[var(--color-foreground,#402c21)]/10 rounded-2xl p-6 sm:p-8">
              <h2 className="font-serif text-xl sm:text-2xl font-bold mb-6 text-[var(--color-foreground,#402c21)]">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-accent,#a38c7f)] mb-1">
                    First Name
                  </span>
                  <p className="text-sm font-medium">{customer.firstName || "—"}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-accent,#a38c7f)] mb-1">
                    Last Name
                  </span>
                  <p className="text-sm font-medium">{customer.lastName || "—"}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-accent,#a38c7f)] mb-1">
                    Email Address
                  </span>
                  <p className="text-sm font-medium">{customer.email}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase font-bold tracking-widest text-[var(--color-accent,#a38c7f)] mb-1">
                    Account Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Customer
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Store Info */}
            <div className="flex flex-col gap-4">
              <div className="bg-[var(--color-foreground,#402c21)]/[0.03] border border-[var(--color-foreground,#402c21)]/10 rounded-2xl p-6">
                <h3 className="font-serif text-lg font-bold mb-3">Quick Navigation</h3>
                <div className="flex flex-col gap-2.5">
                  <Link 
                    href={`${resolvedBasePath}/products`} 
                    className="flex items-center justify-between text-xs font-mono uppercase tracking-wider py-2 text-[var(--color-foreground,#402c21)]/80 hover:text-[var(--color-foreground,#402c21)] hover:translate-x-1 transition-all"
                  >
                    <span>Browse Collection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link 
                    href={`${resolvedBasePath}/cart`} 
                    className="flex items-center justify-between text-xs font-mono uppercase tracking-wider py-2 text-[var(--color-foreground,#402c21)]/80 hover:text-[var(--color-foreground,#402c21)] hover:translate-x-1 transition-all"
                  >
                    <span>View Current Cart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link 
                    href={`${resolvedBasePath}/wishlist`} 
                    className="flex items-center justify-between text-xs font-mono uppercase tracking-wider py-2 text-[var(--color-foreground,#402c21)]/80 hover:text-[var(--color-foreground,#402c21)] hover:translate-x-1 transition-all"
                  >
                    <span>Saved Wishlist</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Order History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {ordersError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {ordersError}
              </div>
            )}

            {orders.length === 0 && !loadingOrders ? (
              <div className="text-center py-20 bg-[var(--color-foreground,#402c21)]/[0.02] border border-dashed border-[var(--color-foreground,#402c21)]/15 rounded-2xl p-8">
                <Package className="w-10 h-10 mx-auto mb-4 opacity-40 text-[var(--color-foreground,#402c21)]" />
                <h3 className="font-serif text-xl font-bold mb-2">No Orders Placed Yet</h3>
                <p className="text-xs sm:text-sm text-[var(--color-foreground,#402c21)]/60 max-w-sm mx-auto mb-6">
                  You haven't placed any orders with this store yet. When you complete checkout, your order updates will appear here.
                </p>
                <Link
                  href={`${resolvedBasePath}/products`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-foreground,#402c21)] text-[var(--color-background,#fdfbf7)] text-xs font-mono uppercase tracking-wider font-bold hover:bg-[var(--color-accent,#a38c7f)] transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-[var(--color-foreground,#402c21)]/[0.03] border border-[var(--color-foreground,#402c21)]/10 rounded-2xl p-6 sm:p-8"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-foreground,#402c21)]/10">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[var(--color-accent,#a38c7f)]">
                          Order Number
                        </span>
                        <h4 className="font-mono text-base font-bold text-[var(--color-foreground,#402c21)]">
                          #{order.orderNumber || order.id.slice(0, 8)}
                        </h4>
                        <span className="text-xs text-[var(--color-foreground,#402c21)]/50">
                          Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                          order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {order.status}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] font-mono uppercase text-[var(--color-foreground,#402c21)]/50 block">Total</span>
                          <span className="font-mono text-lg font-bold">${(order.total || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="pt-6 space-y-3">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-3">
                              {item.product?.images?.[0] && (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.name} 
                                  className="w-10 h-10 object-cover rounded-lg bg-[var(--color-foreground,#402c21)]/5"
                                />
                              )}
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <span className="text-[11px] text-[var(--color-foreground,#402c21)]/60">Qty: {item.quantity}</span>
                              </div>
                            </div>
                            <span className="font-mono font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
