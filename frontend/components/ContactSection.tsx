"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { apiClient } from '@/lib/api-client';

export function ContactSection({ siteId }: { siteId?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  // App State
  const [step, setStep] = useState<'form' | 'loading' | 'otp' | 'verifying' | 'success'>('form');
  const [error, setError] = useState<string | null>(null);
  
  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'loading') return;
    
    setError(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setStep('loading');
    try {
      await apiClient.post('http://localhost:3001/api/enquiry/submit', {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        siteId
      });
      setStep('otp');
      setResendCooldown(45);
      
      // Auto-focus first OTP input after transition
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
      setStep('form');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newOtp = [...otp];
        for (let i = 0; i < pasted.length; i++) {
          newOtp[i] = pasted[i];
        }
        setOtp(newOtp);
        // Focus the next empty input, or the last one if all filled
        const nextIndex = Math.min(pasted.length, 5);
        otpRefs.current[nextIndex]?.focus();
      }
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (otp.every(v => v !== '')) {
        verifyOtp();
      }
    }
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setStep('verifying');
    setError(null);

    try {
      await apiClient.post('http://localhost:3001/api/enquiry/verify', {
        email: email.trim(),
        otp: code,
        siteId
      });
      setStep('success');
    } catch (err: any) {
      setError(err.message || "Invalid verification code.");
      setStep('otp');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    try {
      await apiClient.post('http://localhost:3001/api/enquiry/resend', {
        email: email.trim(),
        siteId
      });
      setResendCooldown(45);
      setError("A new code has been sent."); // Show as info
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
    }
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    if (local.length <= 2) return `${local}***@${domain}`;
    return `${local.substring(0, 2)}${'*'.repeat(local.length - 2)}@${domain}`;
  };

  return (
    <section className="bg-bg-base py-24 px-6 sm:px-12 flex justify-center z-20 relative overflow-hidden">
      {/* Soft background ambient warmth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-accent/8 blur-[130px] rounded-full pointer-events-none"></div>

      <motion.div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl bg-bg-elevated/90 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row gap-16 justify-between text-ink relative overflow-hidden border border-line/70 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(229,82,37,0.08),0_15px_35px_rgba(0,0,0,0.04)] hover:border-accent/30 hover:-translate-y-1 transition-all duration-500 ease-out group"
      >
        {/* Subtle Mouse-Following Light Spotlight */}
        <div 
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"
          style={{
            background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.8), transparent 70%)`
          }}
        />

        {/* Soft Diagonal Glass Light Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-10" />

        {/* Left Column */}
        <div className="flex-[1.2] flex flex-col justify-between relative z-20">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-subtle/80 border border-line/50 mb-8 group-hover:border-accent/30 transition-colors duration-300"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
              <span className="text-ink-soft text-[11px] font-semibold tracking-[0.18em] uppercase">
                Enterprise
              </span>
            </motion.div>
            
            <h2 className="text-5xl md:text-[5.5rem] font-serif leading-[0.9] tracking-tight mb-6 text-ink">
              LET'S TALK <br/>
              <span className="text-accent relative inline-block">
                SCALE.
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-accent/20 rounded-full group-hover:bg-accent/40 transition-colors duration-300"></span>
              </span>
            </h2>
            
            <p className="text-ink-soft text-base md:text-lg max-w-sm font-light leading-relaxed">
              Leave the limitations of standard builders behind. Tell us about your vision, and we'll engineer it with absolute visual perfection.
            </p>
          </div>
          
          <div className="mt-16 md:mt-24">
            <span className="text-ink-soft/70 text-[11px] font-semibold tracking-[0.18em] uppercase mb-2 block">Direct Line</span>
            <a 
              href="mailto:hello@buildspace.com" 
              className="text-xl md:text-2xl font-serif text-ink hover:text-accent transition-colors duration-300 relative inline-block group/link"
            >
              hello@buildspace.com
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover/link:w-full"></span>
            </a>
          </div>
        </div>

        {/* Right Column / Form Container */}
        <div className="flex-1 relative z-20 md:pt-4 min-h-[300px]">
          {error && step !== 'success' && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }} 
               animate={{ opacity: 1, y: 0 }}
               className="mb-6 flex items-start gap-2 bg-rose-500/10 text-rose-500 px-4 py-3 rounded-lg border border-rose-500/20 text-sm"
             >
               <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
               <p>{error}</p>
             </motion.div>
          )}

          <AnimatePresence mode="wait">
            {(step === 'form' || step === 'loading') && (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col space-y-9" 
                onSubmit={handleFormSubmit}
              >
                <div className="relative group/field">
                  <input 
                    type="text" 
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={step === 'loading'}
                    className="w-full bg-transparent border-b border-line pb-3 text-lg placeholder-ink-soft/40 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-ink transition-colors duration-300 text-ink disabled:opacity-50"
                    required
                  />
                  <div className="absolute bottom-0 left-0 h-[1.5px] bg-accent w-0 group-focus-within/field:w-full transition-all duration-400 ease-out"></div>
                </div>
                <div className="relative group/field">
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={step === 'loading'}
                    className="w-full bg-transparent border-b border-line pb-3 text-lg placeholder-ink-soft/40 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-ink transition-colors duration-300 text-ink disabled:opacity-50"
                    required
                  />
                  <div className="absolute bottom-0 left-0 h-[1.5px] bg-accent w-0 group-focus-within/field:w-full transition-all duration-400 ease-out"></div>
                </div>
                <div className="relative group/field">
                  <input 
                    type="text" 
                    placeholder="Project Requirements" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={step === 'loading'}
                    className="w-full bg-transparent border-b border-line pb-3 text-lg placeholder-ink-soft/40 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-ink transition-colors duration-300 text-ink disabled:opacity-50"
                    required
                  />
                  <div className="absolute bottom-0 left-0 h-[1.5px] bg-accent w-0 group-focus-within/field:w-full transition-all duration-400 ease-out"></div>
                </div>
                
                <div className="pt-6">
                  <MagneticButton className="w-full sm:w-auto">
                    <button 
                      type="submit" 
                      disabled={step === 'loading'}
                      className="group/btn flex items-center justify-between gap-6 bg-ink text-bg-elevated px-8 py-3.5 rounded-full font-semibold hover:bg-ink/90 transition-all duration-300 shadow-md hover:shadow-xl w-full sm:w-auto relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span className="tracking-widest text-xs uppercase relative z-10">
                        {step === 'loading' ? 'Sending...' : 'Send Inquiry'}
                      </span>
                      <div className="bg-bg-elevated/20 text-bg-elevated w-7 h-7 rounded-full flex items-center justify-center group-hover/btn:translate-x-1 group-hover/btn:bg-accent transition-all duration-300 relative z-10">
                        {step === 'loading' ? (
                           <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                           <ArrowRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-white/10 -translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                    </button>
                  </MagneticButton>
                </div>
              </motion.form>
            )}

            {(step === 'otp' || step === 'verifying') && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col justify-center h-full space-y-8"
              >
                <div>
                   <h3 className="text-2xl font-serif text-ink mb-2">VERIFY YOUR EMAIL</h3>
                   <p className="text-ink-soft text-sm">
                     We've sent a 6-digit verification code to<br/>
                     <strong className="text-ink font-medium">{maskEmail(email)}</strong>
                   </p>
                </div>

                <div className="flex gap-2 sm:gap-4 justify-between w-full max-w-sm">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={step === 'verifying'}
                      className="w-10 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold bg-transparent border-b-2 border-line focus:border-accent outline-none transition-colors duration-300 text-ink disabled:opacity-50"
                    />
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                  <MagneticButton className="w-full sm:w-auto">
                    <button 
                      onClick={verifyOtp}
                      disabled={step === 'verifying' || otp.some(v => !v)}
                      className="group/btn flex items-center justify-between gap-6 bg-ink text-bg-elevated px-8 py-3.5 rounded-full font-semibold hover:bg-ink/90 transition-all duration-300 shadow-md hover:shadow-xl w-full sm:w-auto relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span className="tracking-widest text-xs uppercase relative z-10">
                        {step === 'verifying' ? 'Verifying...' : 'Verify Email'}
                      </span>
                      <div className="bg-bg-elevated/20 text-bg-elevated w-7 h-7 rounded-full flex items-center justify-center group-hover/btn:translate-x-1 group-hover/btn:bg-accent transition-all duration-300 relative z-10">
                        {step === 'verifying' ? (
                           <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                           <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>
                  </MagneticButton>
                  
                  <button 
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || step === 'verifying'}
                    className="text-sm font-medium text-ink-soft hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-6 py-8"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-serif text-ink tracking-tight">ENQUIRY SENT</h3>
                <p className="text-ink-soft text-lg max-w-sm font-light">
                  Thank you. Your enquiry has been successfully sent. We'll get back to you soon.
                </p>
                <button 
                  onClick={() => {
                     setStep('form');
                     setName('');
                     setEmail('');
                     setMessage('');
                     setOtp(['','','','','','']);
                  }}
                  className="mt-8 text-sm font-semibold tracking-widest uppercase text-ink hover:text-accent transition-colors"
                >
                  Send Another
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
