"use client";

import { useCustomizationContext } from "@/context/CustomizationContext";

import Link from "next/link";
import { ArrowUpRight, Play, Eye } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useCart } from "./CartContext";
import { defaultAtelierProducts } from "./data";

export default function AtelierTemplateHome({ initialCustomData, initialProducts }: { initialCustomData?: any, initialProducts?: any[] }) {
  const { basePath } = useCart();
  const [customData, setCustomData] = useState<any>(initialCustomData || null);

  const displayProducts = initialProducts && initialProducts.length > 0 ? initialProducts : defaultAtelierProducts;

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

  const tHeroTitle = customData?.formData?.heroTitle;
  const tTagline = customData?.formData?.tagline;
  const tCta = customData?.formData?.primaryCta;
  const tAboutTitle = customData?.formData?.aboutTitle;
  const tAboutDescription = customData?.formData?.aboutDescription;

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const yMarquee = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  
  // Interactive Cursor logic
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="bg-[#FF4D00] text-[#111111] overflow-hidden">
      
      {/* Custom Cursor */}
      <motion.div 
        className="fixed top-0 left-0 w-8 h-8 rounded-full bg-white mix-blend-difference pointer-events-none z-[100] hidden lg:flex items-center justify-center font-bold text-[#FF4D00] text-[8px] uppercase tracking-widest"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovered ? 4 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5 }}
      >
        {isHovered && "Play"}
      </motion.div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] w-full flex flex-col justify-center px-6 md:px-12 pt-32 overflow-hidden">
        
        {/* Kinetic Marquee Background */}
        <motion.div 
          style={{ y: yMarquee }}
          className="absolute inset-0 z-0 flex flex-col justify-center opacity-10 pointer-events-none overflow-hidden"
        >
          <div className="whitespace-nowrap font-serif italic text-[15vw] md:text-[10vw] leading-[0.8] tracking-tighter">
             EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL EXPERIMENTAL
          </div>
          <div className="whitespace-nowrap font-sans font-black text-[15vw] md:text-[10vw] leading-[0.8] tracking-tighter ml-[-50vw]">
             ATELIER ATELIER ATELIER ATELIER ATELIER ATELIER
          </div>
        </motion.div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.h1 
              initial={{ opacity: 0, rotate: 5, y: 50 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[12vw] lg:text-[180px] leading-[0.8] tracking-tighter uppercase font-black mix-blend-color-burn"
            >
              {tHeroTitle}
            </motion.h1>
          </div>
          
          <div className="lg:col-span-5 flex flex-col items-start gap-8">
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-2xl md:text-3xl font-medium leading-tight text-[#111111]/90"
            >
              {tTagline}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <button 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full border border-[#111111] hover:bg-[#111111] hover:text-[#FF4D00] transition-colors duration-500 relative overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  <Play className="w-8 h-8 ml-2" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rotate-12 group-hover:rotate-0 transform transition-transform">
                  <span className="text-xs font-black uppercase tracking-widest">{tCta}</span>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Manifesto Image */}
      <section className="px-6 md:px-12 py-24 relative z-20">
        <div className="w-full h-[60vh] md:h-[80vh] relative overflow-hidden rounded-[2rem] md:rounded-[4rem]">
          <motion.div
            style={{ y: yContent }}
            className="absolute inset-[-10%] w-[120%] h-[120%]"
          >
            <img 
              src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop" 
              alt="Creative Abstract"
              className="w-full h-full object-cover filter contrast-125 saturate-150"
            />
          </motion.div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm p-6 text-center">
             <h2 className="text-4xl md:text-7xl font-serif italic text-[#FF4D00] mb-4">{tAboutTitle}</h2>
             <p className="text-xl md:text-3xl font-bold text-white max-w-3xl">{tAboutDescription}</p>
          </div>
        </div>
      </section>

      {/* Selected Work Grid */}
      <section className="py-32 px-6 md:px-12 bg-[#111111] text-[#EFEFEF] rounded-t-[3rem] md:rounded-t-[5rem] relative z-30 mt-[-5rem]">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-end mb-24">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase">{customData?.formData?.featuredTitle}</h2>
            <Link href={`${basePath}/projects`} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-[#FF4D00] transition-colors pb-4">
              All Projects <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

          {displayProducts.length === 0 ? (
            <div className="py-40 flex flex-col items-center text-center border border-white/10 rounded-[2rem]">
              <Eye className="w-16 h-16 text-white/20 mb-6" />
              <p className="text-2xl font-bold">Showcase is empty</p>
              <p className="text-white/50 mt-2">Projects will appear here once added.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
              {displayProducts.slice(0, 4).map((product, i) => {
                const mappedProduct = {
                  id: product.product_id || product.id,
                  name: product.product_name || product.name,
                  image: product.product_images?.[0]?.image_url || product.three_d_model_url || product.image || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1500&auto=format&fit=crop",
                  category: product.categories?.category_name || product.category || "Creative"
                };

                return (
                  <motion.div 
                    key={mappedProduct.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={i % 2 !== 0 ? "md:mt-32" : ""}
                  >
                    <Link href={`${basePath}/projects/${mappedProduct.id}`} className="group block">
                      <div className="aspect-[4/5] overflow-hidden rounded-2xl relative mb-8 bg-[#1A1A1A]">
                        <img 
                          src={mappedProduct.image} 
                          alt={mappedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter group-hover:contrast-125"
                        />
                        <div className="absolute inset-0 bg-[#FF4D00]/0 group-hover:bg-[#FF4D00]/20 transition-colors duration-500 mix-blend-color" />
                        
                        {/* Hover reveal button */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#FF4D00] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 text-[#111111] font-bold text-xs uppercase tracking-widest">
                          View
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter group-hover:text-[#FF4D00] transition-colors">{mappedProduct.name}</h3>
                        <span className="text-sm font-medium uppercase tracking-widest border border-white/20 rounded-full px-4 py-1">{mappedProduct.category}</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
