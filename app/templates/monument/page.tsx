"use client";

import Link from "next/link";
import { ArrowUpRight, Grid3x3, ExternalLink, PackageOpen } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useCart } from "./CartContext";
import { defaultMonumentProducts } from "./data";

export default function MonumentTemplateHome({ initialCustomData, initialProducts }: { initialCustomData?: any, initialProducts?: any[] }) {
  const { basePath } = useCart();
  const [customData, setCustomData] = useState<any>(initialCustomData || null);
  const displayProducts = initialProducts && initialProducts.length > 0 ? initialProducts : defaultMonumentProducts;

  useEffect(() => {
    if (window.parent && window.parent !== window) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "MONOLITH_CUSTOMIZATION") {
          setCustomData(event.data.data);
        }
      };
      window.addEventListener("message", handleMessage);
      window.parent.postMessage({ type: "MONOLITH_REQUEST_STATE" }, "*");
      return () => window.removeEventListener("message", handleMessage);
    }
  }, []);

  const tHeroTitle = customData?.formData?.heroTitle || "MONUMENT\nFOR THE NEXT ERA";
  const tTagline = customData?.formData?.tagline || "We design monolithic structures that redefine the urban landscape through brutalist elegance and sustainable precision.";
  const tCta = customData?.formData?.primaryCta || "Explore Archive";
  const tAboutTitle = customData?.formData?.aboutTitle || "STRUCTURAL INTEGRITY.";
  const tAboutDescription = customData?.formData?.aboutDescription || "Architecture is not merely about space; it is about the enduring legacy of form. We construct environments that outlast trends.";

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const yImage = useTransform(heroScroll, [0, 1], ["0%", "40%"]);
  const opacityImage = useTransform(heroScroll, [0, 1], [1, 0.2]);

  const galleryRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: galleryScroll } = useScroll({
    target: galleryRef,
    offset: ["start end", "end start"]
  });

  const xProjects = useTransform(galleryScroll, [0, 1], ["0%", "-30%"]);

  return (
    <div className="bg-[#EAE8E3] text-[#1A1A1A] overflow-hidden font-mono selection:bg-[#1A1A1A] selection:text-[#EAE8E3]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen w-full flex flex-col justify-center overflow-hidden px-6 md:px-12 border-b border-[#1A1A1A]/20 pt-16">
        <motion.div 
          style={{ y: yImage }}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-[120%] -top-[10%] -z-10 overflow-hidden"
        >
          <motion.img 
            style={{ opacity: opacityImage }}
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop" 
            alt="Monumental Architecture" 
            className="w-full h-full object-cover grayscale-[0.2]"
          />
          {/* Very subtle 15% overlay to guarantee readability without destroying the image */}
          <div className="absolute inset-0 bg-[#EAE8E3]/15 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#EAE8E3] opacity-80" />
        </motion.div>
        
        <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8"
          >
            <h1 className="text-6xl md:text-[90px] lg:text-[130px] font-bold leading-[0.85] tracking-tighter uppercase whitespace-pre-line text-[#1A1A1A]">
              {tHeroTitle}
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="lg:col-span-4 flex flex-col gap-8 pb-2 lg:pb-4"
          >
            <div className="h-[1px] w-full bg-[#1A1A1A]/30" />
            <p className="text-sm uppercase tracking-widest font-medium text-[#1A1A1A]/80 leading-relaxed">
              {tTagline}
            </p>
            <div className="flex items-center gap-6">
              <Link 
                href={`${basePath}/projects`}
                className="bg-[#1A1A1A] text-[#EAE8E3] px-8 py-4 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-transparent hover:text-[#1A1A1A] border border-[#1A1A1A] transition-colors flex items-center gap-3"
              >
                {tCta} <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-16 text-[9px] uppercase tracking-widest text-[#1A1A1A]/50 font-bold mt-8">
              <div className="flex flex-col gap-1">
                <span>Location</span>
                <span className="text-[#1A1A1A]">Zurich, CH</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>Founded</span>
                <span className="text-[#1A1A1A]">1994</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>Awards</span>
                <span className="text-[#1A1A1A]">42 Pritzker</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Manifesto Section */}
      <section className="px-6 md:px-12 py-32 md:py-48 border-b border-[#1A1A1A]/20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-[2px] w-16 bg-[#1A1A1A] origin-left mb-8"
            />
            <h2 className="text-2xl font-bold tracking-tight uppercase text-[#1A1A1A]">{tAboutTitle}</h2>
          </div>
          
          <div className="md:col-span-8 lg:col-span-6 lg:col-start-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl md:text-4xl font-medium tracking-tight leading-tight text-[#1A1A1A]"
            >
              "{tAboutDescription}"
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-16 flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-[#1A1A1A]/60"
            >
              <Grid3x3 className="w-5 h-5" />
              <span>Rigorous Proportions since 1994</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Horizontal Scroll Projects */}
      <section ref={galleryRef} className="py-32 overflow-hidden border-b border-[#1A1A1A]/20">
        <div className="px-6 md:px-12 mb-16 flex justify-between items-end">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase text-[#1A1A1A]">Selected Works</h2>
          <Link href={`${basePath}/projects`} className="text-xs font-bold uppercase tracking-[0.2em] border-b-2 border-[#1A1A1A] pb-1 hover:text-[#1A1A1A]/50 hover:border-[#1A1A1A]/50 transition-colors">
            View Index
          </Link>
        </div>

        {displayProducts.length === 0 ? (
          <div className="px-6 md:px-12 py-32 border-y border-[#1A1A1A]/10 text-center">
            <PackageOpen className="w-12 h-12 mx-auto text-[#1A1A1A]/20 mb-6" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/40">No projects indexed yet.</p>
          </div>
        ) : (
          <motion.div 
            style={{ x: xProjects }}
            className="flex gap-8 px-6 md:px-12 w-max"
          >
            {displayProducts.slice(0, 5).map((product, i) => {
              const mappedProduct = {
                id: product.product_id || product.id,
                name: product.product_name || product.name,
                image: product.product_images?.[0]?.image_url || product.three_d_model_url || product.image || "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1500&auto=format&fit=crop",
                category: product.categories?.category_name || product.category || "Commercial"
              };

              return (
                <motion.div 
                  key={mappedProduct.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="w-[85vw] md:w-[60vw] lg:w-[45vw] group cursor-pointer flex flex-col"
                >
                  <Link href={`${basePath}/projects/${mappedProduct.id}`}>
                    <div className="aspect-[16/10] overflow-hidden bg-[#1A1A1A]/10 relative">
                      <img 
                        src={mappedProduct.image} 
                        alt={mappedProduct.name}
                        className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 border border-[#1A1A1A]/20 pointer-events-none" />
                      <div className="absolute top-4 right-4 bg-[#EAE8E3] text-[#1A1A1A] p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between items-start border-t border-[#1A1A1A]/20 pt-4">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight uppercase group-hover:text-black/50 transition-colors">{mappedProduct.name}</h3>
                        <p className="text-xs uppercase tracking-widest font-medium text-[#1A1A1A]/50 mt-2">{mappedProduct.category}</p>
                      </div>
                      <span className="text-sm font-bold text-[#1A1A1A]/30">0{i + 1}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
      
      {/* Structural Image */}
      <section className="h-[80vh] w-full relative">
        <div className="absolute inset-0 bg-[#1A1A1A]/10" />
        <img 
          src="https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=2000&auto=format&fit=crop" 
          alt="Structural Detail"
          className="w-full h-full object-cover filter grayscale opacity-90"
        />
        {/* Architectual Grid Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-4 md:grid-cols-12 px-6 md:px-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-full border-l border-white/10 hidden md:block" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
