"use client";

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';

export default function PricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={containerRef}
      className="h-[100dvh] w-full bg-bg-base text-ink font-sans selection:bg-accent/20 selection:text-ink relative overflow-hidden flex flex-col"
    >
      <Navbar />

      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          src="/images/pricing-bg.jpg" 
          alt="Architectural Interior" 
          className="absolute inset-0 w-full h-full object-cover origin-center"
        />
        {/* Soft Overlays to blend with bg-base (ivory/beige) */}
        <div className="absolute inset-0 bg-bg-base/30 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-bg-base/95 via-bg-base/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent"></div>
      </div>

      <main className="relative z-10 flex-1 flex flex-col px-6 md:px-16 lg:px-32 pt-24 pb-12 h-full">
        <div className="max-w-[1400px] w-full mx-auto relative h-full flex flex-col justify-center gap-10 md:gap-16">
          
          {/* Top Metadata */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4">
              <span className="w-8 md:w-12 h-px bg-ink/30"></span>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-ink-soft">03 / Platform Access</span>
            </div>
          </motion.div>

          {/* Main Typography Layer */}
          <motion.div 
            className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-16 w-full"
          >
            <div className="flex-1 pointer-events-none shrink-0">
              <div className="overflow-hidden mb-[-10px] md:mb-[-20px]">
                <motion.h1 
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[clamp(4.5rem,10vw,12rem)] font-serif leading-[0.85] tracking-tighter text-ink"
                >
                  Future
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.h1 
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[clamp(4.5rem,10vw,12rem)] font-serif leading-[0.85] tracking-tighter text-ink flex items-center gap-4 md:gap-8"
                >
                  <span className="italic font-light text-ink/80">Access</span>
                </motion.h1>
              </div>
            </div>

            {/* Status & Description Box */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md relative z-20 shrink-1"
            >
              <div className="flex items-center gap-4 mb-4 md:mb-6">
                {/* Red Hardware LED */}
                <div className="relative flex items-center justify-center w-3 h-3">
                  <motion.div 
                    animate={{ opacity: [0.2, 0.7, 0.2] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-red-500 rounded-full blur-[3px]"
                  />
                  <div className="relative w-2.5 h-2.5 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.7),inset_0_1px_2px_rgba(255,255,255,0.4)] border border-red-900/30"></div>
                </div>
                <h3 className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold text-ink">Coming Soon</h3>
              </div>
              
              <p className="text-base md:text-lg lg:text-xl font-light text-ink-soft leading-relaxed">
                A new dimension of digital craftsmanship. Pricing plans and exclusive platform access are currently being architected.
              </p>
            </motion.div>

          </motion.div>
        </div>
      </main>

    </div>
  );
}
