"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Layout, Globe, Command, ArrowRight, Sparkles, Code, Layers, Search, Mail } from 'lucide-react';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  
  // Mouse position for parallax magnetic effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-hidden selection:bg-fuchsia-500/30">
      {/* Insane Animated Background Gradients (The 'Crazy' UI part) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/30 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-500/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-violet-600/30 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Glass Navbar */}
      <nav className="fixed top-6 inset-x-0 z-50 flex justify-center px-6">
        <motion.div 
          initial={{ y: -100, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex items-center justify-between w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center gap-3">
             <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <span className="text-black font-black text-lg">B</span>
             </div>
             <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">BuildSpace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">Login</Link>
            <Link href="/login" className="relative group overflow-hidden px-6 py-2 rounded-full bg-white/10 border border-white/20 transition-all hover:bg-white/20">
               <span className="relative z-10 text-sm font-semibold">Start Building</span>
               <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-fuchsia-500 opacity-0 group-hover:opacity-20 transition-opacity" />
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-40 pb-32 flex flex-col items-center justify-center text-center min-h-screen">
         
         <motion.div
           initial={{ scale: 0.8, opacity: 1 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
         >
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
            <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400">The Ultimate Deployment Engine</span>
         </motion.div>

         <motion.h1 
           initial={{ y: 40, opacity: 1 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="text-7xl md:text-9xl font-black tracking-tighter mb-6 leading-[0.9]"
         >
           DEFINE <br />
           <span className="relative">
             THE FUTURE
             {/* Glowing Text Overlay */}
             <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 animate-gradient-x blur-sm opacity-50">THE FUTURE</span>
             <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 animate-gradient-x">THE FUTURE</span>
           </span>
         </motion.h1>

         <motion.p 
           initial={{ y: 20, opacity: 1 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 0.8, delay: 0.4 }}
           className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto mb-12"
         >
           A visual React engine engineered for absolute perfection. BYOK encryption, Edge routing, and zero-compromise aesthetics.
         </motion.p>

         <motion.div 
           initial={{ y: 20, opacity: 1 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 0.8, delay: 0.6 }}
           className="relative group"
         >
            {/* Magnetic glowing button */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
            <Link href="/login" className="relative flex items-center gap-2 bg-black px-10 py-5 rounded-full leading-none font-bold text-lg text-white border border-white/10 hover:bg-zinc-900 transition-colors">
              Launch Your Vision <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
         </motion.div>

         {/* 3D Floating Elements Parallax */}
         <div className="absolute top-[30%] left-[5%] hidden lg:block" style={{ transform: `translate3d(${mousePosition.x * -2}px, ${mousePosition.y * -2}px, 0)` }}>
           <motion.div style={{ y: y1 }} className="w-48 h-48 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/5 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-500">
             <Code className="w-16 h-16 text-cyan-400" />
           </motion.div>
         </div>

         <div className="absolute top-[40%] right-[5%] hidden lg:block" style={{ transform: `translate3d(${mousePosition.x * 2}px, ${mousePosition.y * 2}px, 0)` }}>
           <motion.div style={{ y: y2 }} className="w-64 h-64 rounded-3xl bg-gradient-to-tr from-fuchsia-500/20 to-purple-500/5 border border-fuchsia-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(217,70,239,0.2)] flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500">
             <Layers className="w-24 h-24 text-fuchsia-400" />
           </motion.div>
         </div>
      </main>

      {/* Crazy Bento Grid */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-24">
           <h2 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-6">
             Architectural Supremacy.
           </h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bento 1: Massive 3D feel */}
            <motion.div 
              initial={{ opacity: 1, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100 }}
              className="md:col-span-2 group relative overflow-hidden rounded-[40px] bg-white/5 border border-white/10 p-12 hover:bg-white/10 transition-colors"
            >
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] group-hover:bg-cyan-500/30 transition-colors" />
              <Layout className="w-16 h-16 text-cyan-400 mb-8" />
              <h3 className="text-4xl font-bold mb-4">Visual Engine.</h3>
              <p className="text-xl text-white/50 max-w-md">1:1 pixel parity from canvas to edge. Drag, drop, and construct dynamic React components effortlessly.</p>
            </motion.div>

            {/* Bento 2 */}
            <motion.div 
              initial={{ opacity: 1, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
              className="group relative overflow-hidden rounded-[40px] bg-white/5 border border-white/10 p-12 hover:bg-white/10 transition-colors"
            >
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] group-hover:bg-amber-500/30 transition-colors" />
              <Shield className="w-16 h-16 text-amber-400 mb-8" />
              <h3 className="text-4xl font-bold mb-4">AES-256 BYOK.</h3>
              <p className="text-lg text-white/50">Military-grade encryption for your external API keys.</p>
            </motion.div>

            {/* Bento 3 */}
            <motion.div 
              initial={{ opacity: 1, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              className="group relative overflow-hidden rounded-[40px] bg-white/5 border border-white/10 p-12 hover:bg-white/10 transition-colors"
            >
              <div className="absolute -left-10 -top-10 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[80px] group-hover:bg-fuchsia-500/30 transition-colors" />
              <Globe className="w-16 h-16 text-fuchsia-400 mb-8" />
              <h3 className="text-4xl font-bold mb-4">Edge Routing.</h3>
              <p className="text-lg text-white/50">Next.js Edge Middleware dynamic domain resolution.</p>
            </motion.div>

            {/* Bento 4 */}
            <motion.div 
              initial={{ opacity: 1, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
              className="md:col-span-2 group relative overflow-hidden rounded-[40px] bg-white/5 border border-white/10 p-12 hover:bg-white/10 transition-colors flex flex-col justify-end min-h-[400px]"
            >
              {/* Fake UI Overlay simulating 3D depth */}
              <div className="absolute right-10 top-10 bottom-10 w-[50%] rounded-2xl bg-black/80 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden flex flex-col transform group-hover:-translate-y-4 group-hover:-translate-x-4 transition-transform duration-700">
                <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/50" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                   <div className="w-3 h-3 rounded-full bg-green-500/50" />
                   <div className="flex-1 text-center text-xs text-white/30 font-mono">⌘K</div>
                </div>
                <div className="p-4 space-y-3">
                   <div className="h-8 bg-white/5 rounded px-3 flex items-center text-sm text-white/50"><Search className="w-4 h-4 mr-2"/>Search your sites...</div>
                   <div className="h-12 bg-blue-500/20 border border-blue-500/30 rounded flex items-center px-3"><Globe className="w-4 h-4 mr-3 text-blue-400"/><span className="text-sm">Apple Campaign</span></div>
                   <div className="h-12 bg-white/5 rounded flex items-center px-3"><Globe className="w-4 h-4 mr-3 text-zinc-500"/><span className="text-sm">Beta Launch</span></div>
                </div>
              </div>

              <div className="relative z-10 w-1/2">
                <Command className="w-16 h-16 text-white mb-8" />
                <h3 className="text-4xl font-bold mb-4">Spotlight Search.</h3>
                <p className="text-xl text-white/50">Your entire workspace, accessible in milliseconds. Hit Cmd+K and teleport across your ecosystem instantly.</p>
              </div>
            </motion.div>
         </div>
      </section>
      
      {/* Comprehensive Cyberpunk Footer */}
      <footer className="border-t border-white/10 bg-[#030014]/50 backdrop-blur-3xl pt-24 pb-12 relative z-10">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                    <span className="text-black font-black text-lg">B</span>
                  </div>
                  <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">BuildSpace</span>
               </div>
               <p className="text-white/40 text-sm max-w-sm mb-8 leading-relaxed">
                 Engineered for absolute visual perfection. A zero-compromise React deployment engine built for creators, by creators.
               </p>
               <div className="flex gap-4">
                  <a href="mailto:adarsh.25scse1280059@galgotiasuniveristy.ac.in" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-cyan-400 transition-colors border border-white/10 hover:border-cyan-500/50 shadow-inner">
                    <Mail className="w-4 h-4" />
                  </a>
                  <a href="https://adarsh-portfilio.vercel.app/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-fuchsia-400 transition-colors border border-white/10 hover:border-fuchsia-500/50 shadow-inner">
                    <Globe className="w-4 h-4" />
                  </a>
               </div>
            </div>
            
            <div>
               <h4 className="font-bold text-white tracking-wide uppercase text-xs mb-6 opacity-80">Engine</h4>
               <ul className="space-y-4 text-sm text-white/40 font-medium">
                 <li><a href="#" className="hover:text-cyan-400 transition-colors">Visual Builder</a></li>
                 <li><a href="#" className="hover:text-cyan-400 transition-colors">Edge Routing</a></li>
                 <li><a href="#" className="hover:text-cyan-400 transition-colors">BYOK Encryption</a></li>
                 <li><a href="#" className="hover:text-cyan-400 transition-colors">Neon Postgres Integration</a></li>
               </ul>
            </div>
            
            <div>
               <h4 className="font-bold text-white tracking-wide uppercase text-xs mb-6 opacity-80">About Me</h4>
               <ul className="space-y-4 text-sm text-white/40 font-medium">
                 <li><a href="#" className="hover:text-fuchsia-400 transition-colors flex items-center gap-2">My Journey <Sparkles className="w-3 h-3 text-fuchsia-400/50" /></a></li>
                 <li><a href="https://adarsh-portfilio.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-fuchsia-400 transition-colors">Portfolio</a></li>
                 <li><a href="mailto:adarsh.25scse1280059@galgotiasuniveristy.ac.in" className="hover:text-fuchsia-400 transition-colors">Contact Information</a></li>
                 <li><Link href="/hire-me" className="hover:text-fuchsia-400 transition-colors">Hire Me</Link></li>
               </ul>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-white/30 text-xs font-medium">© 2026 BuildSpace Engine. Engineered with absolute precision.</p>
           <div className="flex gap-6 text-xs text-white/30 font-medium">
             <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
           </div>
         </div>
      </footer>
    </div>
  );
}
