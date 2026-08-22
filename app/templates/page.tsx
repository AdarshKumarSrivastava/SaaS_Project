"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { TransitionLink } from "@/components/TransitionLink";

const templates = [
  { id: "starter-minimalist", name: "Minimalist", category: "Fashion & Commerce", description: "Clean, focused e-commerce storefront with high conversion primitives.", img: "/images/templates/minimalist.jpg", href: "/templates/minimalist" },
  { id: "starter-essence", name: "Essence", category: "Skincare & Salon", description: "Elegant salon & luxury beauty booking experience.", img: "/images/templates/essence.jpg", href: "/templates/essence" },
  { id: "starter-origin", name: "Origin", category: "Architecture & Portfolio", description: "Refined architectural portfolio showcase with editorial depth.", img: "/images/templates/origin.jpg", href: "/templates/origin" },
  { id: "starter-canvas", name: "Canvas", category: "Editorial & Art", description: "Creative portfolio with immersive layout and typography.", img: "/images/templates/canvas.jpg", href: "/templates/canvas" },
  { id: "growth-nexus-pro", name: "Nexus Pro", category: "Tech & Gadgets", description: "Full-featured tech & gadgets commerce platform.", img: "/images/templates/nexus_pro.jpg", href: "/templates/nexus-pro" },
  { id: "growth-velocity", name: "Velocity", category: "Dark Cyberpunk", description: "Performance-first cyberpunk developer portfolio.", img: "/images/templates/velocity.jpg", href: "/templates/velocity" },
  { id: "growth-quantum", name: "Quantum", category: "Kinetic Commerce", description: "Advanced kinetic commerce engine with dynamic product cards.", img: "/images/templates/quantum.jpg", href: "/templates/quantum" },
  { id: "growth-horizon", name: "Horizon", category: "Digital Studio", description: "Expansive digital agency & studio portfolio.", img: "/images/templates/horizon.jpg", href: "/templates/horizon" },
  { id: "premium-aurelia", name: "Aurelia", category: "Fashion", description: "High-fashion editorial website inspired by luxury fashion houses.", img: "/images/templates/aurelia.jpg", href: "/templates/aurelia" },
  { id: "premium-noire", name: "Noiré", category: "Skincare", description: "Premium luxury skincare and beauty brand experience.", img: "/images/templates/noire.jpg", href: "/templates/noire" },
  { id: "premium-monument", name: "Monument", category: "Architecture", description: "World-class architectural studio website with rigorous grids.", img: "/images/templates/monument.jpg", href: "/templates/monument" },
  { id: "premium-vanta", name: "Vanta", category: "Tech", description: "Sophisticated technology product experience.", img: "/images/templates/vanta.jpg", href: "/templates/vanta" },
  { id: "premium-atelier", name: "Atelier", category: "Digital Studio", description: "Experimental creative agency and digital studio portfolio.", img: "/images/templates/atelier.jpg", href: "/templates/atelier" }
];

const categories = ['all', 'fashion', 'skincare', 'architecture', 'tech', 'studio'];

export default function TemplatesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCat = activeCategory === "all" || tpl.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesQuery = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-[#FDFCF8] text-[#111111] font-sans selection:bg-[#E55225]/20 selection:text-[#111111]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden bg-[#FDFCF8]">
        {/* Parallax Background Image */}
        <motion.div 
          style={{ y: bgY }}
          className="absolute inset-0 w-full h-[120%] -top-[10%] origin-top"
        >
          <img 
            src="/images/templates-hero.jpg" 
            alt="Architectural Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFCF8]/40 via-transparent to-[#FDFCF8] z-10" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-20 h-full w-full max-w-[1600px] mx-auto px-8 flex items-end pb-32">
          <motion.div 
            style={{ y: textY }}
            className="flex flex-col gap-12 w-full"
          >
            <div className="flex justify-between items-end w-full gap-8">
              <div className="flex flex-col gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="flex items-center gap-4"
                >
                  <div className="h-[1px] w-12 bg-[#111111]/30" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#111111]/70">The Architecture</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-7xl md:text-[120px] lg:text-[150px] leading-[0.85] tracking-tighter uppercase font-medium"
                >
                  Architect <br /> Perfection.
                </motion.h1>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="hidden md:flex max-w-[320px] pb-6"
              >
                <p className="text-sm font-medium text-[#111111]/60 leading-relaxed">
                  Stop settling for generic layouts. Deploy award-winning, WebGL-ready storefront templates that command absolute authority.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Vault Section */}
      <section className="relative z-30 bg-[#FDFCF8] px-8 pt-32 pb-48">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Section Header & Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-24">
            <div>
              <h2 className="text-5xl md:text-7xl tracking-tighter uppercase font-medium mb-4">The Vault</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-[1px] bg-[#E55225]" />
                <span className="text-xs uppercase tracking-widest text-[#111111]/50 font-bold">Curated Collection</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-12 w-full lg:w-auto">
              {/* Refined Search */}
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-[#111111]/30 group-focus-within:text-[#E55225] transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full sm:w-64 bg-transparent border-b border-[#111111]/10 rounded-none pl-8 pr-4 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#E55225] placeholder:text-[#111111]/30 transition-colors"
                />
              </div>

              {/* Minimal Filters */}
              <div className="flex items-center gap-8 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="relative pb-1 group"
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${
                      activeCategory === cat ? 'text-[#111111]' : 'text-[#111111]/40 group-hover:text-[#111111]/70'
                    }`}>
                      {cat}
                    </span>
                    {activeCategory === cat && (
                      <motion.div 
                        layoutId="activeFilter"
                        className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#E55225]"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Asymmetrical Gallery Layout */}
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16 items-start">
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((tpl, idx) => {
                  const isFeatured = idx === 0;
                  return (
                  <motion.div
                    key={tpl.id}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative group cursor-pointer ${isFeatured ? 'md:col-span-2' : 'col-span-1'}`}
                    onClick={() => router.push(tpl.href)}
                  >
                    <div className="relative overflow-hidden bg-[#EAE8E4]">
                      <motion.img 
                        src={tpl.img} 
                        alt={tpl.name}
                        className="w-full h-auto object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:scale-105"
                      />
                      
                      {/* Interaction Overlay */}
                      <div className="absolute inset-0 bg-[#111111]/0 group-hover:bg-[#111111]/10 transition-colors duration-500" />
                      
                      {/* Floating Metadata */}
                      <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0">
                        <span className="px-3 py-1 bg-[#FDFCF8] text-[#111111] text-[9px] uppercase tracking-widest font-bold">
                          {tpl.category}
                        </span>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100">
                        <div className="px-6 py-3 bg-[#111111]/90 backdrop-blur-md text-[#FDFCF8] text-xs uppercase tracking-[0.2em] font-semibold border border-white/10 hover:bg-[#E55225] hover:border-[#E55225] hover:text-white transition-colors duration-300">
                          Open Preview
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-medium tracking-tight text-[#111111]">{tpl.name}</h3>
                        <p className="text-xs text-[#111111]/50 mt-1 max-w-xs leading-relaxed">{tpl.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#111111]/30 pt-1">0{idx + 1}</span>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-[40vh] flex flex-col items-center justify-center border border-[#111111]/10">
              <p className="text-sm font-medium text-[#111111]/50 mb-4">No curated pieces match this criteria.</p>
              <button 
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="text-[10px] font-bold text-[#E55225] uppercase tracking-widest hover:text-[#111111] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] text-[#FDFCF8] pt-32 pb-16 px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-32">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-4xl tracking-tighter uppercase font-medium mb-6 text-white">BuildSpace</h2>
              <p className="text-white/50 font-medium max-w-sm leading-relaxed text-sm">
                Elevating the digital experience. Design, scale, and convert with absolute authority.
              </p>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] text-white/40 mb-8">Navigation</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><TransitionLink href="/#features" className="text-white/70 hover:text-white transition-colors">Features</TransitionLink></li>
                <li><TransitionLink href="/pricing" className="text-white/70 hover:text-white transition-colors">Pricing</TransitionLink></li>
                <li><TransitionLink href="/templates" className="text-white/70 hover:text-white transition-colors">Templates</TransitionLink></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] text-white/40 mb-8">Legal</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-[10px] font-medium text-white/40 uppercase tracking-widest">
            <p>&copy; 2026 BuildSpace Inc. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
              <Link href="#" className="hover:text-white transition-colors">Awwwards</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
