"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Layout, Globe, Command, ArrowRight } from 'lucide-react';
import { TransitionLink } from '@/components/TransitionLink';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { TextReveal } from '@/components/ui/TextReveal';
import { ContactSection } from '@/components/ContactSection';
import { Navbar } from '@/components/Navbar';
import { ThreeDHero } from '@/components/builder/ThreeDHero';

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-bg-base text-ink font-sans selection:bg-accent/20 selection:text-ink relative" ref={containerRef}>
      
      {/* Dynamic Island Nav */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div 
          style={{ y: yHero, opacity: opacityHero }}
          className="absolute inset-0 z-0"
        >
          <ThreeDHero />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-base/30 via-bg-base/10 to-bg-base"></div>
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto flex flex-col items-center mt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-elevated/40 backdrop-blur-xl border border-line/50 mb-8"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">The Absolute Pinnacle</span>
          </motion.div>

          <h1 className="text-[5rem] md:text-[8rem] font-medium tracking-tight mb-6 text-ink max-w-5xl mx-auto leading-[0.9] mix-blend-multiply">
            <TextReveal delay={0.1}>Engineered for elegance.</TextReveal>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-ink max-w-2xl mx-auto mb-14 leading-relaxed font-normal opacity-90 mix-blend-multiply"
          >
            A visual React engine crafted with zero compromises. Experience the convergence of supreme aesthetics and Edge routing.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <TransitionLink href="/login">
              <MagneticButton className="group relative overflow-hidden bg-ink text-bg-elevated px-10 py-5 rounded-xl text-lg font-medium shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
                <span className="relative z-10 flex items-center">
                  Launch Your Vision <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-500" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0 rounded-xl" />
              </MagneticButton>
            </TransitionLink>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid - Asymmetric & Premium */}
      <section className="relative py-40 px-6 bg-bg-base z-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 md:pl-12">
            <h2 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 leading-[1.1]">
              <TextReveal>Architectural supremacy.</TextReveal>
            </h2>
            <p className="text-2xl text-ink-soft max-w-2xl font-light">
              Meticulously crafted primitives that bridge the gap between imagination and production.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            
            {/* Feature 1 - Large Left */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-7 relative group transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] rounded-[2.5rem]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated/80 to-bg-subtle/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 shadow-xl overflow-hidden z-10 group-hover:border-white/60 transition-colors duration-500"></div>
              <img src="/images/shapes_bg.jpg" alt="Abstract Shapes" className="absolute inset-0 w-full h-full object-cover rounded-[2.5rem] opacity-30 group-hover:scale-105 group-hover:opacity-40 transition-all duration-700 ease-out" />
              
              <div className="relative z-20 p-12 md:p-16 h-full flex flex-col justify-end min-h-[500px]">
                <Layout className="w-12 h-12 text-ink mb-8 group-hover:scale-110 group-hover:text-accent transition-all duration-500" />
                <h3 className="text-4xl font-medium mb-4 tracking-tight group-hover:text-accent transition-colors duration-500">Visual Engine</h3>
                <p className="text-xl text-ink-soft leading-relaxed max-w-md group-hover:text-ink/80 transition-colors duration-500">1:1 pixel parity from canvas to edge. Construct dynamic React components effortlessly with absolute precision.</p>
              </div>
            </motion.div>

            {/* Feature 2 - Small Right */}
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-5 relative group transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] rounded-[2.5rem]"
            >
              <div className="absolute inset-0 bg-bg-elevated/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-lg z-10 group-hover:bg-bg-elevated/100 transition-colors duration-500"></div>
              <div className="relative z-20 p-12 h-full flex flex-col min-h-[500px]">
                <Shield className="w-10 h-10 text-ink mb-auto group-hover:scale-110 group-hover:text-accent transition-all duration-500" />
                <div>
                  <h3 className="text-3xl font-medium mb-4 tracking-tight group-hover:text-accent transition-colors duration-500">BYOK Encryption</h3>
                  <p className="text-lg text-ink-soft leading-relaxed group-hover:text-ink/80 transition-colors duration-500">Military-grade AES-256 encryption for your external API keys, seamlessly integrated.</p>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 - Small Left */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-5 relative group transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] rounded-[2.5rem]"
            >
              <div className="absolute inset-0 bg-bg-elevated/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-lg z-10 group-hover:bg-bg-elevated/100 transition-colors duration-500"></div>
              <div className="relative z-20 p-12 h-full flex flex-col min-h-[500px]">
                <Globe className="w-10 h-10 text-ink mb-auto group-hover:scale-110 group-hover:text-accent transition-all duration-500" />
                <div>
                  <h3 className="text-3xl font-medium mb-4 tracking-tight group-hover:text-accent transition-colors duration-500">Edge Routing</h3>
                  <p className="text-lg text-ink-soft leading-relaxed group-hover:text-ink/80 transition-colors duration-500">Next.js Edge Middleware powers dynamic domain resolution natively at light speed.</p>
                </div>
              </div>
            </motion.div>

            {/* Feature 4 - Large Right */}
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-7 relative group transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-[2.5rem]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated/80 to-bg-subtle/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 shadow-xl overflow-hidden z-10 group-hover:border-white/60 transition-colors duration-500"></div>
              <img src="/images/shapes_bg.jpg" alt="Abstract Dark" className="absolute inset-0 w-full h-full object-cover rounded-[2.5rem] opacity-30 group-hover:scale-105 group-hover:opacity-40 transition-all duration-700 ease-out" />
              
              <div className="relative z-20 p-12 md:p-16 h-full flex flex-col justify-end min-h-[500px]">
                <Command className="w-12 h-12 text-ink mb-8 group-hover:scale-110 group-hover:text-accent transition-all duration-500" />
                <h3 className="text-4xl font-medium mb-4 tracking-tight group-hover:text-accent transition-colors duration-500">Spotlight Search</h3>
                <p className="text-xl text-ink-soft leading-relaxed max-w-md group-hover:text-ink/80 transition-colors duration-500">Your entire workspace, accessible in milliseconds. Hit Cmd+K and teleport across your ecosystem instantly.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <ContactSection />

      {/* Ultra Premium Footer */}
      <footer className="relative py-24 bg-bg-base overflow-hidden border-t border-line/50">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
                  <span className="text-bg-elevated font-bold text-sm">B</span>
                </div>
                <span className="font-semibold tracking-tight text-xl">BuildSpace</span>
              </div>
              <p className="text-ink-soft text-lg max-w-sm font-light">
                Engineered for absolute visual perfection. A zero-compromise React deployment engine.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-ink mb-6 text-sm tracking-widest uppercase">Product</h4>
              <ul className="space-y-4 text-ink-soft font-light">
                <li><a href="#" className="hover:text-ink transition-colors">Visual Builder</a></li>
                <li><a href="#" className="hover:text-ink transition-colors">Edge Routing</a></li>
                <li><a href="#" className="hover:text-ink transition-colors">Encryption</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-ink mb-6 text-sm tracking-widest uppercase">Legal</h4>
              <ul className="space-y-4 text-ink-soft font-light">
                <li><a href="#" className="hover:text-ink transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-ink transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-line/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-ink-soft text-sm font-light">© 2026 BuildSpace Engine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
