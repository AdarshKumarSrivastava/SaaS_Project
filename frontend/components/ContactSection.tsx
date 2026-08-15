"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';

export function ContactSection() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
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

        {/* Right Column / Form */}
        <div className="flex-1 relative z-20 md:pt-4">
          <form className="flex flex-col space-y-9" onSubmit={(e) => e.preventDefault()}>
            <div className="relative group/field">
              <input 
                type="text" 
                placeholder="Your Name" 
                className="w-full bg-transparent border-b border-line pb-3 text-lg placeholder-ink-soft/40 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-ink transition-colors duration-300 text-ink"
                required
              />
              <div className="absolute bottom-0 left-0 h-[1.5px] bg-accent w-0 group-focus-within/field:w-full transition-all duration-400 ease-out"></div>
            </div>
            <div className="relative group/field">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-transparent border-b border-line pb-3 text-lg placeholder-ink-soft/40 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-ink transition-colors duration-300 text-ink"
                required
              />
              <div className="absolute bottom-0 left-0 h-[1.5px] bg-accent w-0 group-focus-within/field:w-full transition-all duration-400 ease-out"></div>
            </div>
            <div className="relative group/field">
              <input 
                type="text" 
                placeholder="Project Requirements" 
                className="w-full bg-transparent border-b border-line pb-3 text-lg placeholder-ink-soft/40 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-ink transition-colors duration-300 text-ink"
                required
              />
              <div className="absolute bottom-0 left-0 h-[1.5px] bg-accent w-0 group-focus-within/field:w-full transition-all duration-400 ease-out"></div>
            </div>
            
            <div className="pt-6">
              <MagneticButton className="w-full sm:w-auto">
                <button 
                  type="submit" 
                  className="group/btn flex items-center justify-between gap-6 bg-ink text-bg-elevated px-8 py-3.5 rounded-full font-semibold hover:bg-ink/90 transition-all duration-300 shadow-md hover:shadow-xl w-full sm:w-auto relative overflow-hidden"
                >
                  <span className="tracking-widest text-xs uppercase relative z-10">Send Inquiry</span>
                  <div className="bg-bg-elevated/20 text-bg-elevated w-7 h-7 rounded-full flex items-center justify-center group-hover/btn:translate-x-1 group-hover/btn:bg-accent transition-all duration-300 relative z-10">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  {/* Subtle Light reflection in button */}
                  <div className="absolute inset-0 bg-white/10 -translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                </button>
              </MagneticButton>
            </div>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
