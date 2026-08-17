"use client";

import Link from "next/link";
import { ArrowRight, Plus, PackageOpen, Play } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";

const defaultAureliaProducts = [
  { id: "aur-001", name: "Aurelia Tailored Blazer", price: 18900, image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1500&auto=format&fit=crop", category: "Outerwear" },
  { id: "aur-002", name: "Sculpted Silk Dress", price: 24500, image: "https://images.unsplash.com/photo-1566206091558-f62689615c13?q=80&w=1500&auto=format&fit=crop", category: "Dresses" },
  { id: "aur-003", name: "Atelier Wool Coat", price: 31000, image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=1500&auto=format&fit=crop", category: "Outerwear" },
  { id: "aur-004", name: "Signature Leather Shoulder Bag", price: 15400, image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1500&auto=format&fit=crop", category: "Accessories" },
  { id: "aur-005", name: "Structured Evening Heel", price: 12800, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1500&auto=format&fit=crop", category: "Footwear" }
];

export default function StarterTemplateHome({ initialCustomData, initialProducts }: { initialCustomData?: any, initialProducts?: any[] }) {
  const { items, addToCart, currencySymbol, toggleWishlist, isInWishlist, basePath } = useCart();
  const [customData, setCustomData] = useState<any>(initialCustomData || null);

  const displayProducts = initialProducts && initialProducts.length > 0 ? initialProducts : defaultAureliaProducts;

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

  const tHeroTitle = customData?.formData?.heroTitle || "NEW FORM\nNEW ATTITUDE";
  const tTagline = customData?.formData?.tagline || "Defining the modern silhouette with uncompromising luxury and architectural precision.";
  const tCta = customData?.formData?.primaryCta || "Discover Collection";
  const tAboutTitle = customData?.formData?.aboutTitle || "THE ATELIER";
  const tAboutDescription = customData?.formData?.aboutDescription || "Our garments are constructed with rigorous attention to detail, combining heritage craftsmanship with avant-garde proportions.";

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scaleHero = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] text-[#111111] overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[95vh] w-full flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: yHero, scale: scaleHero }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 bg-black/10 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2000&auto=format&fit=crop" 
            alt="Editorial Fashion" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="max-w-2xl mix-blend-difference text-white"
            >
              <h1 className="font-serif text-6xl md:text-[90px] lg:text-[110px] leading-[0.85] tracking-tight uppercase mb-6 whitespace-pre-line">
                {tHeroTitle}
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="md:max-w-xs"
            >
              <p className="text-sm font-medium leading-relaxed mix-blend-difference text-white/80 mb-8">
                {tTagline}
              </p>
              <Link 
                href={`${basePath}/products`}
                className="group inline-flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-white mix-blend-difference"
              >
                <span className="border-b border-white pb-1 group-hover:border-transparent transition-colors">
                  {tCta}
                </span>
                <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-500">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Editorial Split */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:w-1/2 aspect-[4/5] relative overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop" 
              alt="Collection Detail" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="w-full md:w-1/2 flex flex-col items-start"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-6">Chapter 01</span>
            <h2 className="font-serif text-4xl md:text-6xl tracking-tight uppercase mb-8">{tAboutTitle}</h2>
            <p className="text-lg text-black/60 leading-relaxed mb-10 max-w-md">
              {tAboutDescription}
            </p>
            <Link 
              href={`${basePath}/about`}
              className="text-xs font-bold tracking-widest uppercase hover:opacity-50 transition-opacity border-b border-black pb-1"
            >
              Read the Manifesto
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-6 py-24 bg-white border-t border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-20 border-b border-black/10 pb-8">
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight uppercase">{customData?.formData?.featuredTitle || "Selected Pieces"}</h2>
            <Link href={`${basePath}/products`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111111] hover:text-black/50 transition-colors">
              Explore All
            </Link>
          </div>

          {displayProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border border-black/5">
              <PackageOpen className="w-12 h-12 text-black/20 mb-6" />
              <p className="text-sm uppercase tracking-widest font-bold text-black/60">The collection is resting</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-20">
              {displayProducts.slice(0, 4).map((product, i) => {
                const mappedProduct = {
                  id: product.product_id || product.id,
                  name: product.product_name || product.name,
                  price: product.base_price || product.price,
                  image: product.product_images?.[0]?.image_url || product.three_d_model_url || product.image || "https://images.unsplash.com/photo-1550614000-4b95d466f910?q=80&w=1000&auto=format&fit=crop",
                  category: product.categories?.category_name || product.category || "Apparel"
                };

                return (
                  <motion.div 
                    key={mappedProduct.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="group"
                  >
                    <Link href={`${basePath}/products/${mappedProduct.id}`} className="block">
                      <div className="aspect-[3/4] mb-6 relative overflow-hidden bg-[#F5F5F0]">
                        <img 
                          src={mappedProduct.image} 
                          alt={mappedProduct.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-[0.16,1,0.3,1]"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                        
                        {/* Elegant Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(mappedProduct);
                            }}
                            className="bg-white text-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl"
                          >
                            Add to Bag
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-black/50 mb-2">{mappedProduct.category}</span>
                        <h3 className="font-serif text-lg mb-1">{mappedProduct.name}</h3>
                        <p className="text-sm tracking-wide text-black/70">{currencySymbol}{Number(mappedProduct.price).toFixed(2)}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      
      {/* Cinematic Full Width Image */}
      <section className="h-[70vh] w-full relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full"
        >
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop" 
            alt="Runway" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 rounded-full border border-white/30 backdrop-blur-sm flex items-center justify-center">
             <Play className="w-8 h-8 text-white ml-2 opacity-80" />
          </div>
        </div>
      </section>
    </div>
  );
}
