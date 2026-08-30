"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Customer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

interface CustomerAuthContextType {
  customer: Customer | null;
  isLoading: boolean;
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

  const fetchSession = async () => {
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
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/storefront/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, siteId })
      });
      const data = await res.json();
      if (res.ok) {
        setCustomer(data.customer);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (e) {
      return { success: false, error: 'Network error' };
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
      if (res.ok) {
        setCustomer(data.customer);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (e) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    await fetch('/api/storefront/auth/logout', { method: 'POST' });
    setCustomer(null);
  };

  useEffect(() => {
    if (siteId) {
      fetchSession();
    } else {
      setIsLoading(false);
    }
  }, [siteId]);

  return (
    <CustomerAuthContext.Provider value={{ customer, isLoading, setCustomer, login, register, logout, fetchSession }}>
      {children}
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
