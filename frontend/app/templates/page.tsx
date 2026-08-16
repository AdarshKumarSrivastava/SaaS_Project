"use client";

import Link from "next/link";
import { ArrowUpRight, Zap, Palette, Code2, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { TransitionLink } from "@/components/TransitionLink";
import { useRouter } from "next/navigation";
import { ProfileDropdown } from "@/components/ProfileDropdown";

import { InteractiveTemplateCard } from "@/components/ui/InteractiveTemplateCard";
import { Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const templates = [
  { id: "starter-minimalist", name: "Minimalist", category: "Fashion & Commerce", description: "Clean, focused e-commerce storefront with high conversion primitives.", img: "/images/templates/minimalist.jpg", href: "/templates/minimalist" },
  { id: "starter-essence", name: "Essence", category: "Skincare & Salon", description: "Elegant salon & luxury beauty booking experience.", img: "/images/templates/salon.jpg", href: "/templates/essence" },
  { id: "starter-origin", name: "Origin", category: "Architecture & Portfolio", description: "Refined architectural portfolio showcase with editorial depth.", img: "/images/templates/portfolio.jpg", href: "/templates/origin" },
  { id: "starter-canvas", name: "Canvas", category: "Editorial & Art", description: "Creative portfolio with immersive layout and typography.", img: "/images/templates/portfolio.jpg", href: "/templates/canvas" },
  { id: "growth-nexus-pro", name: "Nexus Pro", category: "Tech & Gadgets", description: "Full-featured tech & gadgets commerce platform.", img: "/images/templates/minimalist.jpg", href: "/templates/nexus-pro" },
  { id: "growth-velocity", name: "Velocity", category: "Dark Cyberpunk", description: "Performance-first cyberpunk developer portfolio.", img: "/images/templates/tech.jpg", href: "/templates/velocity" },
  { id: "growth-quantum", name: "Quantum", category: "Kinetic Commerce", description: "Advanced kinetic commerce engine with dynamic product cards.", img: "/images/templates/tech.jpg", href: "/templates/quantum" },
  { id: "growth-horizon", name: "Horizon", category: "Digital Studio", description: "Expansive digital agency & studio portfolio.", img: "/images/templates/portfolio.jpg", href: "/templates/horizon" }
];

export default function TemplatesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCat = activeCategory === "all" || tpl.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesQuery = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-bg-base text-ink font-sans relative w-full selection:bg-accent/20 selection:text-ink">

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] pt-36 pb-16 px-8 max-w-[1600px] mx-auto flex items-end bg-bg-base overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-ink/[0.04] to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-accent/[0.08] to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-20 w-full flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line/50 bg-bg-elevated/50 backdrop-blur-md mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-bold text-ink">The Architecture</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-[90px] lg:text-[110px] leading-[0.9] tracking-tighter text-ink uppercase max-w-4xl font-medium"
            >
              Architect <br /> Perfection.
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 max-w-sm pb-4"
          >
            <p className="text-ink-soft text-lg font-medium leading-relaxed">
              Stop settling for generic layouts. Deploy award-winning, WebGL-ready storefront templates that command absolute authority.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid Showcase Section */}
      <div className="w-full bg-bg-base relative z-20 pb-32">
        <section className="px-6 md:px-12 max-w-[1500px] mx-auto relative z-10 pt-12">
          {/* Header Controls & Filter Bar */}
          <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 border-b border-line/50 pb-8">
            <div>
              <h2 className="text-4xl md:text-5xl tracking-tighter text-ink uppercase font-medium">The Vault</h2>
              <p className="text-ink-soft text-sm font-medium mt-1">Click directly on any template image to launch its live preview website.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full sm:w-64 bg-bg-elevated border border-line/50 rounded-full pl-9 pr-4 py-2.5 text-xs text-ink focus:outline-none focus:border-ink transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['all', 'fashion', 'skincare', 'architecture', 'tech'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                      activeCategory === cat
                        ? 'bg-ink text-bg-elevated shadow-sm'
                        : 'bg-bg-elevated/60 text-ink-soft hover:text-ink hover:bg-bg-elevated border border-line/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[480px]">
            <AnimatePresence mode="sync">
              {filteredTemplates.map((tpl) => (
                <motion.div
                  key={tpl.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <InteractiveTemplateCard template={tpl} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-20 bg-bg-elevated/50 rounded-3xl border border-line/50">
              <p className="text-ink-soft text-lg font-medium">No templates match your search query.</p>
              <button 
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="mt-4 text-sm font-bold text-accent hover:underline uppercase tracking-wider"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-bg-base border-t border-line/50 pt-24 pb-12 px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
                  <span className="text-bg-elevated font-bold text-sm">B</span>
                </div>
                <span className="font-semibold tracking-tight text-xl text-ink">BuildSpace</span>
              </div>
              <p className="text-ink-soft font-medium max-w-sm leading-relaxed">
                Elevating ecommerce for the modern brand. Design, scale, and convert with confidence.
              </p>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs text-ink mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-medium text-ink-soft">
                <li><TransitionLink href="/#features" className="hover:text-ink transition-colors">Features</TransitionLink></li>
                <li><TransitionLink href="/#pricing" className="hover:text-ink transition-colors">Pricing</TransitionLink></li>
                <li><TransitionLink href="/templates" className="hover:text-ink transition-colors">Templates</TransitionLink></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-widest text-xs text-ink mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-ink-soft">
                <li><Link href="/#about" className="hover:text-ink transition-colors">About Us</Link></li>
                <li><Link href="/#contact" className="hover:text-ink transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-line/30 text-xs font-medium text-ink-soft uppercase tracking-wider">
            <p>&copy; 2026 BuildSpace Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-ink transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
