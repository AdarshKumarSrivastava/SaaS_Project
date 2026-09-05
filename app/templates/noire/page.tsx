"use client";

import { useCustomizationContext } from "@/context/CustomizationContext";

import Link from "next/link";
import { ArrowRight, Plus, Droplet, PackageOpen } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useCart } from "./CartContext";
import { defaultNoireProducts } from "./data";

export default function NoireTemplateHome({ initialCustomData, initialProducts }: { initialCustomData?: any, initialProducts?: any[] }) {
  const { addToCart, currencySymbol, basePath } = useCart();
  const [customData, setCustomData] = useState<any>(initialCustomData || null);

  const displayProducts = initialProducts && initialProducts.length > 0 ? initialProducts : defaultNoireProducts;

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
  
  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yImage1 = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const yImage2 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="bg-[#FCFBF8] text-[#2A2A2A] overflow-hidden font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] w-full flex flex-col justify-center overflow-hidden px-6 pt-32 pb-24">
        
        {/* Soft Ambient Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#E8DCCB]/30 rounded-full blur-3xl -z-10 mix-blend-multiply" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#D4C3B3]/20 rounded-full blur-3xl -z-10 mix-blend-multiply" />
        
        <div className="max-w-7xl mx-auto w-full relative z-20 flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            style={{ y: yHero, opacity: opacityText }}
            className="w-full lg:w-1/2 flex flex-col items-start"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="w-12 h-[1px] bg-[#2A2A2A]" />
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#2A2A2A]/60">Botanical Science</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-6xl md:text-[80px] lg:text-[100px] leading-[0.9] tracking-tight font-light whitespace-pre-line text-[#2A2A2A] mb-8"
            >
              {tHeroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-[#2A2A2A]/70 mb-10 max-w-md font-light leading-relaxed"
            >
              {tTagline}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link 
                href={`${basePath}/products`}
                className="bg-[#2A2A2A] text-[#FCFBF8] px-10 py-5 rounded-full text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#A38D7D] hover:shadow-lg transition-all duration-500 flex items-center gap-3 group"
              >
                {tCta} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Composition */}
          <div className="w-full lg:w-1/2 relative h-[600px] lg:h-[800px] hidden md:block">

            
            <motion.div 
              style={{ y: yImage2 }}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="absolute bottom-[10%] left-[5%] w-[45%] aspect-square rounded-full overflow-hidden shadow-2xl border-4 border-[#FCFBF8]"
            >
              <img 
                src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1500&auto=format&fit=crop" 
                alt="Natural Texture"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-6 py-32 bg-[#F5F2EC]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-[#2A2A2A] mb-4">
              {customData?.formData?.featuredTitle}
            </h2>
            <div className="w-12 h-[1px] bg-[#A38D7D] mb-6" />
            <Link href={`${basePath}/products`} className="text-xs font-medium uppercase tracking-[0.2em] text-[#2A2A2A]/60 hover:text-[#2A2A2A] transition-colors">
              Explore the full collection
            </Link>
          </div>

          {displayProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <PackageOpen className="w-12 h-12 text-[#9A8B78]/30 mb-6" />
              <p className="font-serif italic text-2xl text-[#9A8B78]/60">The ritual begins soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
              {displayProducts.slice(0, 4).map((product, i) => {
                const mappedProduct = {
                  id: product.product_id || product.id,
                  name: product.product_name || product.name,
                  price: product.base_price || product.price,
                  image: product.product_images?.[0]?.image_url || product.three_d_model_url || product.image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1500&auto=format&fit=crop",
                  category: product.categories?.category_name || product.category || "Essence"
                };

                return (
                  <motion.div 
                    key={mappedProduct.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link href={`${basePath}/products/${mappedProduct.id}`} className="group flex flex-col h-full bg-[#FCFBF8] rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500">
                      <div className="aspect-square mb-8 relative flex items-center justify-center">
                        <img 
                          src={mappedProduct.image} 
                          alt={mappedProduct.name}
                          className="w-4/5 h-4/5 object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-[0.16,1,0.3,1] drop-shadow-2xl rounded-xl"
                        />
                      </div>
                      <div className="mt-auto text-center flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#A38D7D] mb-3">{mappedProduct.category}</span>
                        <h3 className="font-medium text-lg text-[#2A2A2A] mb-2">{mappedProduct.name}</h3>
                        <p className="text-sm font-light text-[#2A2A2A]/70 mb-6">{currencySymbol}{Number(mappedProduct.price).toFixed(2)}</p>
                        
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(mappedProduct);
                          }}
                          className="w-10 h-10 rounded-full border border-[#2A2A2A]/10 flex items-center justify-center group-hover:bg-[#2A2A2A] group-hover:text-white transition-all duration-300"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Editorial Value Prop */}
      <section className="px-6 py-32 md:py-48 max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:w-1/2 aspect-square md:aspect-[3/4] relative overflow-hidden rounded-t-full shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1500&auto=format&fit=crop"
              alt="Natural Beauty"
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="w-full md:w-1/2"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl mb-8 tracking-tight font-light text-[#2A2A2A] leading-tight">
              {tAboutTitle}
            </h2>
            <p className="text-lg text-[#2A2A2A]/70 leading-relaxed font-light max-w-md">
              {tAboutDescription}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
