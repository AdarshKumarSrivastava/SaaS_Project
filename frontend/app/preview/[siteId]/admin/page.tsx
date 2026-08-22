"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Settings, LogOut, Package, CreditCard, Activity, ArrowUpRight, TrendingUp, Mail, Archive, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function SiteAdminPanel() {
  const params = useParams();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // State for Navigation
  const [activeTab, setActiveTab] = useState('Dashboard');

  // State for Inquiries
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(`admin_token_${params.siteId}`);
    if (token) setIsAuthenticated(true);
  }, [params.siteId]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'Inquiries') {
      fetchInquiries();
    }
  }, [isAuthenticated, activeTab, params.siteId]);

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

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const data = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/enquiry?siteId=${params.siteId}`);
      if (data && data.enquiries) {
        setInquiries(data.enquiries);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    }
    setLoadingInquiries(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#f4f7f6] overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/40 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-300/40 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDuration: '12s' }}></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto mb-6 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Admin Vault</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">Site ID: {params?.siteId}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Master Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-slate-800 placeholder:text-slate-400"
                placeholder="Enter access key"
              />
            </div>
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
              Authenticate <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Inquiries', icon: Mail },
    { name: 'Products & Assets', icon: Package },
    { name: 'Demographics', icon: Users },
    { name: 'Revenue Stream', icon: CreditCard },
    { name: 'Preferences', icon: Settings },
  ];

  return (
    <div className="min-h-screen relative flex bg-[#f4f7f6] overflow-hidden font-sans text-slate-800">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDuration: '15s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-rose-300/30 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDuration: '20s' }}></div>
      
      <aside className="relative z-10 w-72 bg-white/40 backdrop-blur-2xl border-r border-white/60 p-8 flex flex-col hidden md:flex shadow-[4px_0_24px_-10px_rgba(0,0,0,0.05)]">
        <div className="mb-12 flex items-center gap-4">
           <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
           </div>
           <div>
             <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Console</h2>
             <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1 break-all truncate w-32">{params?.siteId}</p>
           </div>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <button 
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all ${activeTab === item.name ? 'bg-white/60 text-indigo-600 shadow-sm border border-white/80' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}
            >
              <item.icon className="w-5 h-5" /> {item.name}
            </button>
          ))}
        </nav>
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-rose-500 bg-rose-50/50 hover:bg-rose-100/50 rounded-2xl transition-colors mt-auto border border-rose-100"
        >
          <LogOut className="w-4 h-4" /> Disconnect Session
        </button>
      </aside>

      <main className="relative z-10 flex-1 p-10 lg:p-16 overflow-y-auto h-screen">
        <header className="mb-12 flex justify-between items-end">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">{activeTab}</h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              {activeTab === 'Dashboard' ? 'Real-time metrics for your generated environment.' : 'Manage verified messages and contact requests.'}
            </p>
          </motion.div>
          <div className="hidden lg:flex items-center gap-3 bg-white/40 backdrop-blur-xl border border-white/60 px-4 py-2 rounded-2xl shadow-sm">
             <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-xs font-semibold text-slate-600">System Online</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'Dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                   { label: "Unique Visitors", value: "24,892", change: "+12.5%", isPositive: true },
                   { label: "Active Sessions", value: "1,204", change: "+5.2%", isPositive: true },
                   { label: "Gross Volume", value: "$42,500.00", change: "-2.4%", isPositive: false }
                ].map((stat, idx) => (
                   <motion.div 
                     key={stat.label}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: idx * 0.1 }}
                     className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:-translate-y-1 transition-transform"
                   >
                     <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/60 to-transparent rounded-bl-full opacity-50 pointer-events-none" />
                     <p className="text-sm font-semibold text-slate-500 mb-2">{stat.label}</p>
                     <p className="text-4xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                     <div className="mt-4 flex items-center gap-2">
                       <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${stat.isPositive ? 'bg-emerald-100/50 text-emerald-600' : 'bg-rose-100/50 text-rose-600'}`}>
                          {stat.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                          {stat.change}
                       </span>
                       <span className="text-xs font-medium text-slate-400">vs last month</span>
                     </div>
                   </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)]"
              >
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-bold text-slate-800">Recent Transactions</h3>
                   <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
                </div>
                
                <div className="space-y-4">
                   {[
                     { id: "TXN-9842", user: "Alice Walker", amount: "$1,200.00", status: "Completed", time: "2 mins ago" },
                     { id: "TXN-9841", user: "Mark Johnson", amount: "$450.00", status: "Processing", time: "1 hour ago" },
                     { id: "TXN-9840", user: "Sarah Smith", amount: "$3,400.00", status: "Completed", time: "3 hours ago" },
                   ].map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/80 hover:bg-white/80 transition-colors cursor-pointer">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                               {txn.user.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">{txn.user}</p>
                               <p className="text-xs font-medium text-slate-400">{txn.id} • {txn.time}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">{txn.amount}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${txn.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{txn.status}</p>
                         </div>
                      </div>
                   ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'Inquiries' && (
            <motion.div
              key="inquiries"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[32px] p-10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)]"
            >
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                   <h3 className="text-xl font-bold text-slate-800">Verified Enquiries</h3>
                   <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                     {inquiries.length} TOTAL
                   </span>
                 </div>
                 <button onClick={fetchInquiries} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Refresh</button>
              </div>

              {loadingInquiries ? (
                <div className="flex justify-center items-center py-20 text-slate-400">Loading...</div>
              ) : inquiries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-700 mb-2">No inquiries yet</h4>
                  <p className="text-slate-500 text-sm">When users verify their email and submit the contact form, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((enq) => (
                    <div key={enq.id} className="flex flex-col p-6 bg-white/60 rounded-[24px] border border-white/80 hover:bg-white/90 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-600 text-lg shadow-sm border border-white">
                              {enq.name.charAt(0)}
                           </div>
                           <div>
                              <p className="text-base font-bold text-slate-800">{enq.name}</p>
                              <a href={`mailto:${enq.email}`} className="text-sm font-medium text-indigo-600 hover:underline">{enq.email}</a>
                           </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-400">{new Date(enq.createdAt).toLocaleString()}</p>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-2 px-2 py-1 rounded-lg ${enq.status === 'NEW' ? 'bg-emerald-100/80 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                            {enq.status === 'NEW' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-0.5"></span>}
                            {enq.status}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white/50 rounded-xl p-4 border border-slate-100 text-sm text-slate-700 leading-relaxed font-medium">
                        {enq.message}
                      </div>
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100/50">
                        <a href={`mailto:${enq.email}`} className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Reply via Email
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
