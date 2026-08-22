"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Lock, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function BYOKVault() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  const [viewState, setViewState] = useState<'loading' | 'setup' | 'locked' | 'unlocked' | 'forgot_otp'>('loading');

  // Forms state
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');

  // Credentials State
  const [credentials, setCredentials] = useState<Array<{keyName: string, preview: string}>>([]);
  const [imageKitPublic, setImageKitPublic] = useState('');
  const [imageKitPrivate, setImageKitPrivate] = useState('');
  const [razorpayId, setRazorpayId] = useState('');
  const [razorpaySecret, setRazorpaySecret] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { hasPin } = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/credentials/pin/status`);
        setViewState(hasPin ? 'locked' : 'setup');
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, [siteId]);

  const fetchCredentials = async () => {
    try {
      const data = await apiClient.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/credentials`);
      setCredentials(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/credentials/pin/setup`, { pin });
      setViewState('unlocked');
      await fetchCredentials();
      setPin('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to setup PIN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/credentials/pin/verify`, { pin });
      setViewState('unlocked');
      await fetchCredentials();
      setPin('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Incorrect PIN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/credentials/pin/forgot`, {});
      setViewState('forgot_otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/credentials/pin/reset`, { otp, newPin });
      setViewState('locked');
      setOtp('');
      setNewPin('');
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset PIN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveKeys = async (keyName: string, keyValue: string) => {
    try {
      await apiClient.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sites/${siteId}/credentials`, { keys: [{ keyName, keyValue }] });
      await fetchCredentials();
      alert('Key saved securely!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save key');
    }
  };

  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-ink-soft" />
      </div>
    );
  }

  const renderPinInput = (value: string, onChange: (v: string) => void, placeholder = "Enter 4-8 digit PIN") => (
    <div className="relative">
      <input 
        type={showPin ? "text" : "password"} 
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={8}
        className="w-full bg-bg-base border border-line rounded-xl px-4 py-4 text-center text-2xl tracking-widest text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/40 placeholder:tracking-normal placeholder:text-base"
        placeholder={placeholder}
      />
      <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors">
        {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-base text-ink p-8">
      <div className="max-w-2xl mx-auto pt-10">
        <button onClick={() => router.push(`/dashboard`)} className="flex items-center gap-2 text-ink-soft hover:text-ink transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <AnimatePresence mode="wait">
          
          {/* SETUP STATE */}
          {viewState === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-bg-elevated border border-line p-10 rounded-3xl text-center shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
              <div className="w-16 h-16 bg-bg-subtle border border-line rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-ink" />
              </div>
              <h1 className="text-3xl font-medium mb-4 tracking-tight">Secure your Vault</h1>
              <p className="text-ink-soft mb-8 max-w-md mx-auto leading-relaxed">Create a 4 to 8 character Master PIN to encrypt and protect access to your API keys across all your sites.</p>
              
              <form onSubmit={handleSetupPin} className="max-w-xs mx-auto space-y-6">
                {renderPinInput(pin, setPin)}
                {error && <p className="text-red-600 bg-red-50 py-2 rounded-xl border border-red-100 text-sm flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
                <button disabled={isSubmitting || pin.length < 4} className="w-full bg-ink text-bg-elevated px-6 py-4 rounded-xl font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                  Set Master PIN
                </button>
              </form>
            </motion.div>
          )}

          {/* LOCKED STATE */}
          {viewState === 'locked' && (
            <motion.div key="locked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="bg-bg-elevated border border-line p-10 rounded-3xl text-center shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
              <div className="w-16 h-16 bg-bg-subtle border border-line rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-ink" />
              </div>
              <h1 className="text-3xl font-medium mb-4 tracking-tight">Vault Locked</h1>
              <p className="text-ink-soft mb-8 max-w-md mx-auto leading-relaxed">Enter your Master PIN to access your API keys.</p>
              
              <form onSubmit={handleUnlock} className="max-w-xs mx-auto space-y-6">
                {renderPinInput(pin, setPin, "Enter PIN")}
                {error && <p className="text-red-600 bg-red-50 py-2 rounded-xl border border-red-100 text-sm flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
                <button disabled={isSubmitting || pin.length < 4} className="w-full bg-ink text-bg-elevated px-6 py-4 rounded-xl font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Unlock Vault'}
                </button>
                <button type="button" onClick={handleForgotPin} className="text-sm font-medium text-ink-soft hover:text-ink hover:underline mt-4 transition-colors">
                  Forgot PIN?
                </button>
              </form>
            </motion.div>
          )}

          {/* FORGOT OTP STATE */}
          {viewState === 'forgot_otp' && (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-bg-elevated border border-line p-10 rounded-3xl text-center shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
              <div className="w-16 h-16 bg-bg-subtle border border-line rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-ink" />
              </div>
              <h1 className="text-3xl font-medium mb-4 tracking-tight">Check your Email</h1>
              <p className="text-ink-soft mb-8 max-w-md mx-auto leading-relaxed">We sent a 6-digit OTP to your registered email address.</p>
              
              <form onSubmit={handleResetPin} className="max-w-xs mx-auto space-y-4">
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="6-digit OTP" className="w-full bg-bg-base border border-line rounded-xl px-4 py-4 text-center tracking-widest text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/40 placeholder:tracking-normal placeholder:text-base" />
                {renderPinInput(newPin, setNewPin, "New Master PIN")}
                
                {error && <p className="text-red-600 bg-red-50 py-2 rounded-xl border border-red-100 text-sm flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
                <button disabled={isSubmitting || otp.length < 6 || newPin.length < 4} className="w-full bg-ink text-bg-elevated px-6 py-4 rounded-xl font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 shadow-sm">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Reset PIN'}
                </button>
                <button type="button" onClick={() => setViewState('locked')} className="text-sm font-medium text-ink-soft hover:text-ink mt-4 transition-colors">
                  Cancel
                </button>
              </form>
            </motion.div>
          )}

          {/* UNLOCKED STATE (VAULT) */}
          {viewState === 'unlocked' && (
            <motion.div key="vault" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight text-ink">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                      <Key className="w-6 h-6 text-emerald-600" /> 
                    </div>
                    API Keys Vault
                  </h1>
                  <p className="text-ink-soft mt-2 text-sm">Manage your encrypted third-party integrations.</p>
                </div>
                <button onClick={() => { setViewState('locked'); }} className="bg-bg-elevated border border-line hover:bg-bg-subtle px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm text-ink">
                  Lock Vault
                </button>
              </div>

              {/* ImageKit Card */}
              <div className="bg-bg-elevated border border-line rounded-3xl p-8 shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-ink tracking-tight">ImageKit (Media)</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Public Key</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input type="text" placeholder={credentials.find(c => c.keyName === 'imagekit_public')?.preview || 'Not set'} className="flex-1 w-full bg-bg-base border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/40" value={imageKitPublic} onChange={e => setImageKitPublic(e.target.value)} />
                      <button onClick={() => handleSaveKeys('imagekit_public', imageKitPublic)} disabled={!imageKitPublic} className="px-5 py-3 bg-bg-subtle hover:bg-ink text-ink hover:text-bg-elevated rounded-xl text-sm font-medium transition-colors border border-line hover:border-ink disabled:opacity-50 shadow-sm shrink-0">Save Key</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Private Key</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input type="password" placeholder={credentials.find(c => c.keyName === 'imagekit_private')?.preview || 'Not set'} className="flex-1 w-full bg-bg-base border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/40" value={imageKitPrivate} onChange={e => setImageKitPrivate(e.target.value)} />
                      <button onClick={() => handleSaveKeys('imagekit_private', imageKitPrivate)} disabled={!imageKitPrivate} className="px-5 py-3 bg-bg-subtle hover:bg-ink text-ink hover:text-bg-elevated rounded-xl text-sm font-medium transition-colors border border-line hover:border-ink disabled:opacity-50 shadow-sm shrink-0">Save Key</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Razorpay Card */}
              <div className="bg-bg-elevated border border-line rounded-3xl p-8 shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-ink tracking-tight">Razorpay (Payments)</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Key ID</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input type="text" placeholder={credentials.find(c => c.keyName === 'razorpay_key_id')?.preview || 'Not set'} className="flex-1 w-full bg-bg-base border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/40" value={razorpayId} onChange={e => setRazorpayId(e.target.value)} />
                      <button onClick={() => handleSaveKeys('razorpay_key_id', razorpayId)} disabled={!razorpayId} className="px-5 py-3 bg-bg-subtle hover:bg-ink text-ink hover:text-bg-elevated rounded-xl text-sm font-medium transition-colors border border-line hover:border-ink disabled:opacity-50 shadow-sm shrink-0">Save Key</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Key Secret</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input type="password" placeholder={credentials.find(c => c.keyName === 'razorpay_key_secret')?.preview || 'Not set'} className="flex-1 w-full bg-bg-base border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/40" value={razorpaySecret} onChange={e => setRazorpaySecret(e.target.value)} />
                      <button onClick={() => handleSaveKeys('razorpay_key_secret', razorpaySecret)} disabled={!razorpaySecret} className="px-5 py-3 bg-bg-subtle hover:bg-ink text-ink hover:text-bg-elevated rounded-xl text-sm font-medium transition-colors border border-line hover:border-ink disabled:opacity-50 shadow-sm shrink-0">Save Key</button>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
