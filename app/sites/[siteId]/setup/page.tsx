"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CreditCard, Image as ImageIcon, Loader2, CheckCircle2, ChevronRight, Lock, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { TransitionLink } from '@/components/TransitionLink';

export default function SetupWizard() {
  const router = useRouter();
  const params = useParams();
  const siteId = params?.siteId as string;
  
   
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
        const data = await apiClient.get(`/api/sites/${siteId}`);
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
      await apiClient.post(`/api/sites/${siteId}/credentials/test`, { keyName, keyValue });
      await apiClient.post(`/api/sites/${siteId}/credentials`, { keys: [{ keyName, keyValue }] });
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
      await apiClient.post(`/api/sites/${siteId}/credentials/test`, { keyName: 'razorpay', keyValue: razorpayKeyId + ':' + razorpayKeySecret });
      await apiClient.post(`/api/sites/${siteId}/credentials`, {
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
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
          <span className="text-sm text-ink-soft">Loading setup...</span>
        </div>
      </div>
    );
  }

  const isEcommerce = site.category === 'ecommerce';
  const totalSteps = isEcommerce ? 4 : 3;

  return (
    <div className="min-h-screen bg-bg-base text-ink flex flex-col items-center py-16 px-4">
      
      {/* Back Link */}
      <div className="w-full max-w-2xl mb-8">
        <TransitionLink href="/dashboard" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </TransitionLink>
      </div>

      {/* Progress Indicator */}
      <div className="w-full max-w-2xl mb-10 flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-line -z-10 -translate-y-1/2"></div>
        {[1, 2, 3, ...(isEcommerce ? [4] : [])].map((s, i) => (
          <div key={s} className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all border ${
            step > s 
              ? 'bg-ink text-bg-elevated border-ink' 
              : step === s 
                ? 'bg-ink text-bg-elevated border-ink shadow-sm' 
                : 'bg-bg-elevated border-line text-ink-soft'
          }`}>
            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: Intro */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-2xl bg-bg-elevated border border-line p-10 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
            <div className="w-12 h-12 bg-bg-subtle border border-line rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-5 h-5 text-ink" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-3">Zero Markup. Complete Ownership.</h1>
            <p className="text-ink-soft leading-relaxed mb-8">
              Welcome to BuildSpace. Instead of charging you monthly platform fees and taking a percentage of your sales, we use a <strong className="text-ink">Bring Your Own Keys (BYOK)</strong> architecture. You plug in your own free-tier API keys, and we encrypt them at rest using AES-256. 
            </p>
            <button onClick={() => setStep(2)} className="bg-ink text-bg-elevated px-6 py-3 rounded-xl font-medium hover:bg-ink/90 transition-colors flex items-center gap-2 shadow-sm">
              Let&apos;s setup your keys <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 2: ImageKit */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-2xl bg-bg-elevated border border-line p-10 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-6">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-1.5">Media CDN (ImageKit)</h2>
            <p className="text-ink-soft mb-8">We use ImageKit to serve your site&apos;s images at edge-speeds. The free tier gives you 20GB/month bandwidth. <a href="https://imagekit.io" target="_blank" className="text-accent font-medium hover:underline">Get your free keys here</a>.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Public Key</label>
                <input type="text" value={imageKitPublicKey} onChange={e => setImageKitPublicKey(e.target.value)} className="w-full bg-bg-base border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/50" placeholder="public_..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Private Key <Lock className="inline w-3 h-3 ml-1 text-ink-soft" /></label>
                <input type="password" value={imageKitPrivateKey} onChange={e => setImageKitPrivateKey(e.target.value)} className="w-full bg-bg-base border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/50" placeholder="private_..." />
              </div>
            </div>

            <button 
              onClick={() => handleVerifyAndSave('imagekit_private', imageKitPrivateKey, isEcommerce ? 3 : 4)}
              disabled={verifying || !imageKitPrivateKey || !imageKitPublicKey}
              className="bg-ink text-bg-elevated px-6 py-3 rounded-xl font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {verifying ? 'Verifying & Encrypting...' : 'Save Media Keys'}
            </button>
          </motion.div>
        )}

        {/* STEP 3: Razorpay (Ecommerce Only) */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-2xl bg-bg-elevated border border-line p-10 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold mb-1.5">Payments (Razorpay)</h2>
            <p className="text-ink-soft mb-8">Because you selected <strong className="text-ink">E-commerce</strong>, we need Razorpay keys to process payments natively on your domain. <a href="https://dashboard.razorpay.com/app/keys" target="_blank" className="text-accent font-medium hover:underline">Find them in your Razorpay Dashboard</a>.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Key ID</label>
                <input type="text" value={razorpayKeyId} onChange={e => setRazorpayKeyId(e.target.value)} className="w-full bg-bg-base border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/50" placeholder="rzp_test_..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Key Secret <Lock className="inline w-3 h-3 ml-1 text-ink-soft" /></label>
                <input type="password" value={razorpayKeySecret} onChange={e => setRazorpayKeySecret(e.target.value)} className="w-full bg-bg-base border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/20 transition-all placeholder:text-ink-soft/50" placeholder="..." />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="px-6 py-3 rounded-xl font-medium hover:bg-bg-subtle transition-colors border border-line text-ink-soft">Skip for now</button>
              <button 
                onClick={handleVerifyRazorpay}
                disabled={verifying || !razorpayKeyId || !razorpayKeySecret}
                className="bg-ink text-bg-elevated px-6 py-3 rounded-xl font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {verifying ? 'Verifying & Encrypting...' : 'Save Payment Keys'}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-2xl bg-bg-elevated border border-line p-10 rounded-2xl text-center shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">You are ready to build.</h2>
            <p className="text-ink-soft mb-8 max-w-md mx-auto">Your infrastructure is provisioned and your keys are heavily encrypted in our vault. It&apos;s time to design your site.</p>
            
            <button 
              onClick={() => router.push(`/sites/${siteId}/builder`)}
              className="bg-ink text-bg-elevated px-8 py-3.5 rounded-xl font-medium hover:bg-ink/90 transition-all shadow-sm"
            >
              Enter the Builder
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
