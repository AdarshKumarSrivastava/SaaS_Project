"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { CustomerAuthModal } from '@/components/storefront/CustomerAuthModal';

export type Customer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt?: string;
};

export type AuthModalView = 'login' | 'register' | 'forgot_password' | 'account';
export type AuthModalReason = 'profile' | 'add-to-cart' | 'checkout' | 'orders' | 'wishlist';

export interface OpenAuthModalOptions {
  view?: AuthModalView;
  reason?: AuthModalReason;
  message?: string | null;
  pendingProduct?: any;
  pendingVariant?: any;
  pendingQuantity?: number;
  onSuccess?: () => void;
}

export interface CustomerAuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  siteId: string;
  isAuthModalOpen: boolean;
  authModalView: AuthModalView;
  authModalMessage: string | null;
  authModalReason: AuthModalReason;
  authPendingProduct: any | null;
  authPendingVariant: any | null;
  authPendingQuantity: number;
  openAuthModal: (viewOrOptions?: AuthModalView | OpenAuthModalOptions, message?: string | null) => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: AuthModalView) => void;
  executePendingAction: () => void;
  registerCartHandler: (handler: (product: any, quantity?: number, variant?: any) => void) => () => void;
  setCustomer: (customer: Customer | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  fetchSession: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children, siteId }: { children: ReactNode, siteId: string }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>('login');
  const [authModalMessage, setAuthModalMessage] = useState<string | null>(null);
  const [authModalReason, setAuthModalReason] = useState<AuthModalReason>('profile');
  
  const [authPendingProduct, setAuthPendingProduct] = useState<any | null>(null);
  const [authPendingVariant, setAuthPendingVariant] = useState<any | null>(null);
  const [authPendingQuantity, setAuthPendingQuantity] = useState<number>(1);
  
  const onSuccessCallbackRef = useRef<(() => void) | null>(null);
  const cartHandlerRef = useRef<((product: any, quantity?: number, variant?: any) => void) | null>(null);

  const registerCartHandler = useCallback((handler: (product: any, quantity?: number, variant?: any) => void) => {
    cartHandlerRef.current = handler;
    return () => {
      if (cartHandlerRef.current === handler) {
        cartHandlerRef.current = null;
      }
    };
  }, []);

  const openAuthModal = useCallback((viewOrOptions?: AuthModalView | OpenAuthModalOptions, message?: string | null) => {
    if (typeof viewOrOptions === 'object' && viewOrOptions !== null) {
      setAuthModalView(viewOrOptions.view || 'login');
      setAuthModalReason(viewOrOptions.reason || (viewOrOptions.pendingProduct ? 'add-to-cart' : 'profile'));
      setAuthModalMessage(viewOrOptions.message || (viewOrOptions.pendingProduct ? "Sign in to add this item to your cart." : null));
      setAuthPendingProduct(viewOrOptions.pendingProduct || null);
      setAuthPendingVariant(viewOrOptions.pendingVariant || null);
      setAuthPendingQuantity(viewOrOptions.pendingQuantity || 1);
      onSuccessCallbackRef.current = viewOrOptions.onSuccess || null;
      if (viewOrOptions.pendingProduct && typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('pending_cart_add', JSON.stringify({
            product: viewOrOptions.pendingProduct,
            quantity: viewOrOptions.pendingQuantity || 1,
            variant: viewOrOptions.pendingVariant || null
          }));
        } catch (e) {}
      }
    } else {
      setAuthModalView(viewOrOptions || 'login');
      setAuthModalReason('profile');
      setAuthModalMessage(message || null);
      setAuthPendingProduct(null);
      setAuthPendingVariant(null);
      setAuthPendingQuantity(1);
      onSuccessCallbackRef.current = null;
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalMessage(null);
    setAuthModalReason('profile');
    setAuthPendingProduct(null);
    setAuthPendingVariant(null);
    setAuthPendingQuantity(1);
    onSuccessCallbackRef.current = null;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('pending_cart_add');
      } catch (e) {}
    }
  }, []);

  const executePendingAction = useCallback(() => {
    if (onSuccessCallbackRef.current) {
      const cb = onSuccessCallbackRef.current;
      onSuccessCallbackRef.current = null;
      cb();
    }

    if (authPendingProduct && cartHandlerRef.current) {
      cartHandlerRef.current(authPendingProduct, authPendingQuantity, authPendingVariant);
      setAuthPendingProduct(null);
      setAuthPendingVariant(null);
      setAuthPendingQuantity(1);
    } else if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('pending_cart_add');
        if (saved && cartHandlerRef.current) {
          const parsed = JSON.parse(saved);
          const p = parsed.product || parsed;
          if (p && p.id) {
            cartHandlerRef.current(p, parsed.quantity || 1, parsed.variant);
          }
          sessionStorage.removeItem('pending_cart_add');
        }
      } catch (e) {}
    }
  }, [authPendingProduct, authPendingQuantity, authPendingVariant]);

  const fetchSession = useCallback(async () => {
    if (!siteId) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/storefront/auth/me?siteId=${siteId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.customer) {
          setCustomer(data.customer);
        } else {
          setCustomer(null);
        }
      } else {
        setCustomer(null);
      }
    } catch (e) {
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/storefront/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, siteId })
      });
      const data = await res.json();
      if (res.ok && data.customer) {
        setCustomer(data.customer);
        return { success: true };
      }
      return { success: false, error: data.error || 'Authentication failed' };
    } catch (e) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const res = await fetch('/api/storefront/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, siteId, firstName, lastName })
      });
      const data = await res.json();
      if (res.ok && data.customer) {
        setCustomer(data.customer);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (e) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/storefront/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setCustomer(null);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return (
    <CustomerAuthContext.Provider value={{ 
      customer, 
      isAuthenticated: !!customer, 
      isLoading, 
      siteId, 
      isAuthModalOpen,
      authModalView,
      authModalMessage,
      authModalReason,
      authPendingProduct,
      authPendingVariant,
      authPendingQuantity,
      openAuthModal,
      closeAuthModal,
      setAuthModalView,
      executePendingAction,
      registerCartHandler,
      setCustomer, 
      login, 
      register, 
      logout, 
      fetchSession 
    }}>
      {children}
      <CustomerAuthModal />
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
