"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
   
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (token: string, refreshToken: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }

    if (token) {
      fetch(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Token invalid');
        })
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        })
        .catch((err) => {
          console.warn('Could not sync user profile, trying refresh:', err);
          return tryRefresh();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      tryRefresh().finally(() => setLoading(false));
    }

    async function tryRefresh() {
      try {
        const res = await fetch(`/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Refresh failed');
        const data = await res.json();
        
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('token', data.accessToken);
        
        const meRes = await fetch(`/api/auth/me`, {
          headers: { Authorization: `Bearer ${data.accessToken}` }
        });
        if (!meRes.ok) throw new Error('Me failed after refresh');
        const meData = await meRes.json();
        
        setUser(meData.user);
        localStorage.setItem('user', JSON.stringify(meData.user));
      } catch (e) {
        console.warn('Refresh flow failed', e);
        // Clean up completely
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, []);

  const login = (token: string, refreshToken: string, userData: User) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
