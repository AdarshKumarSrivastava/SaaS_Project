"use client";

import Link from "next/link";
import { ChevronRight, Cpu, Zap, Shield, PlayCircle, PackageOpen } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useCart } from "./CartContext";
import { defaultVantaProducts } from "./data";

export default function VantaTemplateHome({ initialCustomData, initialProducts }: { initialCustomData?: any, initialProducts?: any[] }) {
  const { basePath, currencySymbol } = useCart();
  const [customData, setCustomData] = useState<any>(initialCustomData || null);

  const displayProducts = initialProducts && initialProducts.length > 0 ? initialProducts : defaultVantaProducts;

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

  const tHeroTitle = customData?.formData?.heroTitle || "Intelligence.\nAbsolute.";
  const tTagline = customData?.formData?.tagline || "The most advanced neural engine ever built. Pro-level performance meets unprecedented efficiency.";
  const tCta = customData?.formData?.primaryCta || "Pre-order";
  const tAboutTitle = customData?.formData?.aboutTitle || "Pro to the core.";
  const tAboutDescription = customData?.formData?.aboutDescription || "Built on a revolutionary 3nm architecture, pushing the boundaries of what is physically possible in consumer electronics.";

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });
  
  const yHeroText = useTransform(smoothProgress, [0, 1], ["0%", "50%"]);
  const opacityHeroText = useTransform(smoothProgress, [0, 0.4], [1, 0]);
  const scaleHeroImage = useTransform(smoothProgress, [0, 0.8], [1, 1.4]);
  const yHeroImage = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);

  return (
    <div ref={containerRef} className="bg-[#0A0A0A] text-[#FAFAFA] overflow-hidden font-sans selection:bg-white/20 selection:text-white min-h-screen">
      
      {/* Cinematic Hero */}
      <section className="relative h-screen w-full flex flex-col items-center justify-start pt-32 overflow-hidden">
        <motion.div 
          style={{ y: yHeroText, opacity: opacityHeroText }}
          className="text-center relative z-20 flex flex-col items-center px-6"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-[100px] lg:text-[130px] font-semibold tracking-tighter leading-[1.05] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 pb-2 whitespace-pre-line"
          >
            {tHeroTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/50 font-medium max-w-2xl mt-4"
          >
            {tTagline}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-10 flex items-center gap-6"
          >
            <Link 
              href={`${basePath}/products`}
              className="bg-white text-black px-8 py-3 rounded-full font-semibold text-[15px] hover:scale-105 transition-transform"
            >
              {tCta}
            </Link>
            <Link 
              href={`${basePath}/about`}
              className="text-white hover:text-white/70 font-semibold text-[15px] flex items-center gap-1 group transition-colors"
            >
              Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* 3D-like Hardware Reveal */}
        <motion.div 
          style={{ scale: scaleHeroImage, y: yHeroImage }}
          className="absolute bottom-[-10%] md:bottom-[-20%] w-full max-w-[1400px] aspect-video z-10 flex justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent z-20" />
          <img 
            src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2000&auto=format&fit=crop" 
            alt="Premium Hardware" 
            className="w-[80%] h-full object-cover rounded-t-[3rem] border-t border-x border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.1)]"
          />
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-40 max-w-7xl mx-auto relative z-30 bg-[#0A0A0A]">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter">{tAboutTitle}</h2>
          <p className="text-xl text-white/50 mt-6 max-w-2xl mx-auto">{tAboutDescription}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Cpu, title: "Neural Architecture", desc: "40% faster machine learning workloads with dedicated cores." },
            { icon: Zap, title: "Quantum Efficiency", desc: "All-day battery life even under maximum processing load." },
            { icon: Shield, title: "Absolute Security", desc: "Hardware-level encryption for your most critical data." }
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="bg-[#121212] border border-white/5 p-10 rounded-[2rem] hover:bg-[#1A1A1A] transition-colors"
            >
              <feat.icon className="w-10 h-10 text-white/80 mb-6" />
              <h3 className="text-xl font-semibold mb-3">{feat.title}</h3>
              <p className="text-white/50 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cinematic Product Presentation */}
      <section className="py-24 bg-black overflow-hidden border-y border-white/5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">{customData?.formData?.featuredTitle || "Explore Lineup"}</h2>
            <Link href={`${basePath}/products`} className="text-[15px] font-semibold text-white/60 hover:text-white flex items-center gap-1 group transition-colors">
              Compare models <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {displayProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] rounded-3xl border border-white/5">
              <PackageOpen className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-lg font-medium text-white/60">No hardware available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
              {displayProducts.slice(0, 2).map((product, i) => {
                const mappedProduct = {
                  id: product.product_id || product.id,
                  name: product.product_name || product.name,
                  price: product.base_price || product.price,
                  image: product.product_images?.[0]?.image_url || product.three_d_model_url || product.image || "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1500&auto=format&fit=crop"
                };

                return (
                  <motion.div 
                    key={mappedProduct.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: i * 0.2 }}
                  >
                    <Link href={`${basePath}/products/${mappedProduct.id}`} className="block bg-[#121212] border border-white/5 rounded-[2rem] p-8 md:p-12 hover:scale-[1.02] transition-transform duration-500 group">
                      <div className="flex justify-between items-start mb-12">
                        <div>
                          <h3 className="text-2xl md:text-3xl font-semibold mb-2">{mappedProduct.name}</h3>
                          <p className="text-white/50">From {currencySymbol}{Number(mappedProduct.price).toFixed(2)}</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="aspect-[4/3] relative flex items-center justify-center mt-8">
                        <img 
                          src={mappedProduct.image} 
                          alt={mappedProduct.name}
                          className="w-full h-full object-contain filter drop-shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-700"
                        />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      
      {/* Deep Dive Section */}
      <section className="h-[80vh] w-full relative flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-[#0A0A0A]" />
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop" 
            alt="Macro Technology"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        </motion.div>
        
        <div className="relative z-10 flex flex-col items-center">
          <PlayCircle className="w-16 h-16 text-white mb-6 opacity-80 cursor-pointer hover:opacity-100 transition-opacity hover:scale-110" />
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Watch the Keynote.</h2>
        </div>
      </section>
    </div>
  );
}
