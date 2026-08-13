"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CreditCard, Image as ImageIcon, Loader2, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function SetupWizard() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [site, setSite] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  
  // Credentials State
  const [imageKitPublicKey, setImageKitPublicKey] = useState('');
  const [imageKitPrivateKey, setImageKitPrivateKey] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  
  useEffect(() => {
    const fetchSite = async () => {
      try {
        const data = await apiClient.get(`http://localhost:3001/api/sites/${siteId}`);
        setSite(data);
      } catch (err) {
        console.error(err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [siteId, router]);

  const handleVerifyAndSave = async (keyName: string, keyValue: string, nextStep: number) => {
    setVerifying(true);
    try {
      await apiClient.post(`http://localhost:3001/api/sites/${siteId}/credentials/test`, { keyName, keyValue });
      await apiClient.post(`http://localhost:3001/api/sites/${siteId}/credentials`, { keys: [{ keyName, keyValue }] });
      setStep(nextStep);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : (err as { message?: string })?.message || 'Key verification failed. Please check the key and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyRazorpay = async () => {
    setVerifying(true);
    try {
      await apiClient.post(`http://localhost:3001/api/sites/${siteId}/credentials/test`, { keyName: 'razorpay', keyValue: razorpayKeyId + ':' + razorpayKeySecret });
      await apiClient.post(`http://localhost:3001/api/sites/${siteId}/credentials`, {
        keys: [
          { keyName: 'razorpay_key_id', keyValue: razorpayKeyId },
          { keyName: 'razorpay_key_secret', keyValue: razorpayKeySecret }
        ]
      });
      setStep(4);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : (err as { message?: string })?.message || 'Razorpay verification failed. Please check the keys and try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading || !site) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;
  }

  const isEcommerce = site.category === 'ecommerce';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-20 px-4">
      
      {/* Progress Indicator */}
      <div className="w-full max-w-2xl mb-12 flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s ? 'bg-white text-black' : 'bg-zinc-900 border border-white/10 text-zinc-500'}`}>
            {s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: Intro */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl bg-zinc-900 border border-white/10 p-10 rounded-3xl">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight mb-4">Zero Markup. Complete Ownership.</h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Welcome to BuildSpace. Instead of charging you monthly platform fees and taking a percentage of your sales, we use a <strong>Bring Your Own Keys (BYOK)</strong> architecture. You plug in your own free-tier API keys, and we encrypt them at rest using AES-256. 
            </p>
            <button onClick={() => setStep(2)} className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2">
              Let&apos;s setup your keys <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 2: ImageKit */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl bg-zinc-900 border border-white/10 p-10 rounded-3xl">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-medium mb-2">Media CDN (ImageKit)</h2>
            <p className="text-zinc-400 mb-8">We use ImageKit to serve your site&apos;s images at edge-speeds. The free tier gives you 20GB/month bandwidth. <a href="https://imagekit.io" target="_blank" className="text-blue-400 hover:underline">Get your free keys here</a>.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Public Key</label>
                <input type="text" value={imageKitPublicKey} onChange={e => setImageKitPublicKey(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30" placeholder="public_..." />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Private Key <Lock className="inline w-3 h-3 ml-1" /></label>
                <input type="password" value={imageKitPrivateKey} onChange={e => setImageKitPrivateKey(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30" placeholder="private_..." />
              </div>
            </div>

            <button 
              onClick={() => handleVerifyAndSave('imagekit_private', imageKitPrivateKey, isEcommerce ? 3 : 4)}
              disabled={verifying || !imageKitPrivateKey || !imageKitPublicKey}
              className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {verifying ? 'Verifying & Encrypting...' : 'Save Media Keys'}
            </button>
          </motion.div>
        )}

        {/* STEP 3: Razorpay (Ecommerce Only) */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl bg-zinc-900 border border-white/10 p-10 rounded-3xl">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-medium mb-2">Payments (Razorpay)</h2>
            <p className="text-zinc-400 mb-8">Because you selected <strong>E-commerce</strong>, we need Razorpay keys to process payments natively on your domain. <a href="https://dashboard.razorpay.com/app/keys" target="_blank" className="text-blue-400 hover:underline">Find them in your Razorpay Dashboard</a>.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Key ID</label>
                <input type="text" value={razorpayKeyId} onChange={e => setRazorpayKeyId(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30" placeholder="rzp_test_..." />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Key Secret <Lock className="inline w-3 h-3 ml-1" /></label>
                <input type="password" value={razorpayKeySecret} onChange={e => setRazorpayKeySecret(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30" placeholder="..." />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(4)} className="px-6 py-3 rounded-lg font-medium hover:bg-white/5 transition-colors border border-white/10">Skip for now</button>
              <button 
                onClick={handleVerifyRazorpay}
                disabled={verifying || !razorpayKeyId || !razorpayKeySecret}
                className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {verifying ? 'Verifying & Encrypting...' : 'Save Payment Keys'}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-zinc-900 border border-white/10 p-10 rounded-3xl text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-medium mb-4">You are ready to build.</h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">Your infrastructure is provisioned and your keys are heavily encrypted in our vault. It&apos;s time to design your site.</p>
            
            <button 
              onClick={() => router.push(`/sites/${siteId}/builder`)}
              className="bg-white text-black px-8 py-4 rounded-xl font-medium hover:bg-zinc-200 transition-all hover:scale-105 shadow-2xl shadow-white/10"
            >
              Enter the Builder
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
