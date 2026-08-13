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
        const { hasPin } = await apiClient.get(`http://localhost:3001/api/sites/${siteId}/credentials/pin/status`);
        setViewState(hasPin ? 'locked' : 'setup');
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, [siteId]);

  const fetchCredentials = async () => {
    try {
      const data = await apiClient.get(`http://localhost:3001/api/sites/${siteId}/credentials`);
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
      await apiClient.post(`http://localhost:3001/api/sites/${siteId}/credentials/pin/setup`, { pin });
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
      await apiClient.post(`http://localhost:3001/api/sites/${siteId}/credentials/pin/verify`, { pin });
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
      await apiClient.post(`http://localhost:3001/api/sites/${siteId}/credentials/pin/forgot`, {});
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
      await apiClient.post(`http://localhost:3001/api/sites/${siteId}/credentials/pin/reset`, { otp, newPin });
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
      await apiClient.post(`http://localhost:3001/api/sites/${siteId}/credentials`, { keys: [{ keyName, keyValue }] });
      await fetchCredentials();
      alert('Key saved securely!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save key');
    }
  };

  if (viewState === 'loading') {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;
  }

  const renderPinInput = (value: string, onChange: (v: string) => void, placeholder = "Enter 4-8 digit PIN") => (
    <div className="relative">
      <input 
        type={showPin ? "text" : "password"} 
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={8}
        className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-center text-2xl tracking-widest focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30"
        placeholder={placeholder}
      />
      <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
        {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto pt-10">
        <button onClick={() => router.push(`/dashboard`)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <AnimatePresence mode="wait">
          
          {/* SETUP STATE */}
          {viewState === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-zinc-900 border border-white/10 p-10 rounded-3xl text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-medium mb-4">Secure your Vault</h1>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">Create a 4 to 8 character Master PIN to encrypt and protect access to your API keys across all your sites.</p>
              
              <form onSubmit={handleSetupPin} className="max-w-xs mx-auto space-y-6">
                {renderPinInput(pin, setPin)}
                {error && <p className="text-red-400 text-sm flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
                <button disabled={isSubmitting || pin.length < 4} className="w-full bg-white text-black px-6 py-4 rounded-xl font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                  Set Master PIN
                </button>
              </form>
            </motion.div>
          )}

          {/* LOCKED STATE */}
          {viewState === 'locked' && (
            <motion.div key="locked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="bg-zinc-900 border border-white/10 p-10 rounded-3xl text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-medium mb-4">Vault Locked</h1>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">Enter your Master PIN to access your API keys.</p>
              
              <form onSubmit={handleUnlock} className="max-w-xs mx-auto space-y-6">
                {renderPinInput(pin, setPin, "Enter PIN")}
                {error && <p className="text-red-400 text-sm flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
                <button disabled={isSubmitting || pin.length < 4} className="w-full bg-white text-black px-6 py-4 rounded-xl font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Unlock Vault'}
                </button>
                <button type="button" onClick={handleForgotPin} className="text-sm text-zinc-500 hover:text-white mt-4">
                  Forgot PIN?
                </button>
              </form>
            </motion.div>
          )}

          {/* FORGOT OTP STATE */}
          {viewState === 'forgot_otp' && (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-zinc-900 border border-white/10 p-10 rounded-3xl text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-medium mb-4">Check your Email</h1>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">We sent a 6-digit OTP to your registered email address.</p>
              
              <form onSubmit={handleResetPin} className="max-w-xs mx-auto space-y-4">
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="6-digit OTP" className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-center tracking-widest focus:outline-none focus:border-white/30" />
                {renderPinInput(newPin, setNewPin, "New Master PIN")}
                
                {error && <p className="text-red-400 text-sm flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
                <button disabled={isSubmitting || otp.length < 6 || newPin.length < 4} className="w-full bg-white text-black px-6 py-4 rounded-xl font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Reset PIN'}
                </button>
                <button type="button" onClick={() => setViewState('locked')} className="text-sm text-zinc-500 hover:text-white mt-4">
                  Cancel
                </button>
              </form>
            </motion.div>
          )}

          {/* UNLOCKED STATE (VAULT) */}
          {viewState === 'unlocked' && (
            <motion.div key="vault" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Key className="w-8 h-8 text-green-500" /> API Keys Vault
                  </h1>
                  <p className="text-zinc-400 mt-2">Manage your third-party integrations.</p>
                </div>
                <button onClick={() => { setViewState('locked'); }} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors">
                  Lock Vault
                </button>
              </div>

              {/* ImageKit Card */}
              <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-medium mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> ImageKit (Media)</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Public Key</label>
                    <input type="text" placeholder={credentials.find(c => c.keyName === 'imagekit_public')?.preview || 'Not set'} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" value={imageKitPublic} onChange={e => setImageKitPublic(e.target.value)} />
                    <button onClick={() => handleSaveKeys('imagekit_public', imageKitPublic)} disabled={!imageKitPublic} className="mt-2 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50">Save Public Key</button>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Private Key</label>
                    <input type="password" placeholder={credentials.find(c => c.keyName === 'imagekit_private')?.preview || 'Not set'} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" value={imageKitPrivate} onChange={e => setImageKitPrivate(e.target.value)} />
                    <button onClick={() => handleSaveKeys('imagekit_private', imageKitPrivate)} disabled={!imageKitPrivate} className="mt-2 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50">Save Private Key</button>
                  </div>
                </div>
              </div>

              {/* Razorpay Card */}
              <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-medium mb-6 flex items-center gap-2"><Lock className="w-5 h-5" /> Razorpay (Payments)</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Key ID</label>
                    <input type="text" placeholder={credentials.find(c => c.keyName === 'razorpay_key_id')?.preview || 'Not set'} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" value={razorpayId} onChange={e => setRazorpayId(e.target.value)} />
                    <button onClick={() => handleSaveKeys('razorpay_key_id', razorpayId)} disabled={!razorpayId} className="mt-2 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50">Save Key ID</button>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Key Secret</label>
                    <input type="password" placeholder={credentials.find(c => c.keyName === 'razorpay_key_secret')?.preview || 'Not set'} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-white/30" value={razorpaySecret} onChange={e => setRazorpaySecret(e.target.value)} />
                    <button onClick={() => handleSaveKeys('razorpay_key_secret', razorpaySecret)} disabled={!razorpaySecret} className="mt-2 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50">Save Key Secret</button>
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
