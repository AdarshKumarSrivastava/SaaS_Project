"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Settings, LogOut, Package, CreditCard } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function SiteAdminPanel() {
  const params = useParams();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem(`admin_token_${params.siteId}`);
    if (token) setIsAuthenticated(true);
  }, [params.siteId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post(`/sites/${params.siteId}/admin/login`, { password });
      if (res.token) {
        setIsAuthenticated(true);
        localStorage.setItem(`admin_token_${params.siteId}`, res.token);
      }
    } catch (err) {
      alert('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`admin_token_${params.siteId}`);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-bg-elevated border border-line rounded-2xl p-8 shadow-sm"
        >
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-ink">Admin Login</h1>
            <p className="text-sm text-ink-soft mt-1">Manage your site: {params.siteId}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-base border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ink transition-colors"
                placeholder="Enter admin password"
              />
              <p className="text-xs text-ink-soft">Hint: admin123</p>
            </div>
            <button className="w-full bg-ink text-bg-elevated py-2.5 rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors">
              Access Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-elevated border-r border-line p-6 flex flex-col hidden md:flex">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink tracking-tight">Admin Panel</h2>
          <p className="text-xs text-ink-soft mt-0.5 break-all">{params.siteId}</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium bg-bg-subtle text-ink rounded-lg">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink hover:bg-bg-subtle/50 rounded-lg transition-colors">
            <Package className="w-4 h-4" /> Products/Services
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink hover:bg-bg-subtle/50 rounded-lg transition-colors">
            <Users className="w-4 h-4" /> Customers
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink hover:bg-bg-subtle/50 rounded-lg transition-colors">
            <CreditCard className="w-4 h-4" /> Billing
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink hover:bg-bg-subtle/50 rounded-lg transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </a>
        </nav>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50/50 rounded-lg transition-colors mt-auto"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Overview</h1>
          <p className="text-sm text-ink-soft mt-1">Welcome to your site's generated management dashboard.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-bg-elevated border border-line rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-medium text-ink-soft mb-1">Total Views</p>
            <p className="text-3xl font-semibold text-ink">1,248</p>
          </div>
          <div className="bg-bg-elevated border border-line rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-medium text-ink-soft mb-1">Active Users</p>
            <p className="text-3xl font-semibold text-ink">34</p>
          </div>
          <div className="bg-bg-elevated border border-line rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-medium text-ink-soft mb-1">Revenue</p>
            <p className="text-3xl font-semibold text-ink">$0.00</p>
          </div>
        </div>

        <div className="bg-bg-elevated border border-line rounded-2xl p-8 shadow-sm">
          <h3 className="text-lg font-medium text-ink mb-4">Recent Activity</h3>
          <div className="text-center py-12 text-ink-soft text-sm">
            No recent activity to display.
          </div>
        </div>
      </main>
    </div>
  );
}
