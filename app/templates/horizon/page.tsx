"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useVelocity, useAnimationFrame } from "framer-motion";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { useHorizon } from "./HorizonContext";
import { useCustomization } from "@/hooks/useCustomization";

function KineticMarquee({ text, direction = 1 }: { text: string, direction?: number }) {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  
  const [x, setX] = useState(0);

  const baseVelocity = -0.05 * direction;

  useAnimationFrame((t, delta) => {
    let moveBy = baseVelocity * (delta / 16);
    
    // Add scroll velocity to speed up the marquee when scrolling (reduced factor)
    moveBy += (velocityFactor.get() * direction * delta) / 100;
    
    setX(prev => {
      const next = prev + moveBy;
      // Loop seamlessly
      if (next <= -50) return 0;
      if (next > 0) return -50;
      return next;
    });
  });

  return (
    <div className="overflow-hidden flex whitespace-nowrap opacity-10">
      <motion.div
        style={{ x: `${x}%` }}
        className="flex whitespace-nowrap"
      >
        <span className="font-cormorant text-[20vw] font-light tracking-tighter uppercase mr-8">
          {text} • {text} • {text} • {text} •
        </span>
      </motion.div>
    </div>
  );
}

function KineticHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yOrb = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const scaleOrb = useTransform(scrollYProgress, [0, 1], [1, 3]);
  const opacityOrb = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  const customData = useCustomization();
  const brandName = customData?.formData?.brandName;
  const heroTitle = customData?.formData?.heroTitle;
  const heroSubtitle = customData?.formData?.heroSubtitle;
  const ctaText = customData?.formData?.ctaText;
  const marqueeText1 = customData?.formData?.marqueeText1;
  const marqueeText2 = customData?.formData?.marqueeText2;

  // Simple heuristic to style the last word of hero title
  const titleWords = (heroTitle || "Horizon Studio").split(" ");
  const lastWord = titleWords.pop() || "";
  const initialTitle = titleWords.join(" ");

  return (
    <div ref={containerRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FAFAFA] w-full">
      
      {/* Background Kinetic Marquees */}
      <div className="absolute inset-0 flex flex-col justify-center pointer-events-none z-0">
        <motion.div style={{ y: yText }}>
           <KineticMarquee text={marqueeText1} direction={1} />
           <KineticMarquee text={marqueeText2} direction={-1} />
        </motion.div>
      </div>

      {/* Central Abstract Glass Orb */}
      <motion.div
        style={{ y: yOrb, scale: scaleOrb, opacity: opacityOrb }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      >
        <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
          {/* Base gradient shadow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 via-black/5 to-transparent blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
          
          {/* Glass sphere */}
          <div className="absolute inset-4 rounded-full border border-black/10 bg-gradient-to-br from-white/80 to-white/10 backdrop-blur-2xl shadow-[inset_0_-20px_60px_rgba(0,0,0,0.05),0_40px_80px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden">
             {/* Inner reflections */}
             <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-full opacity-60" />
             <div className="absolute bottom-4 right-4 w-1/3 h-1/3 bg-white/40 blur-xl rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Foreground Hero Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <span className="font-outfit text-[10px] uppercase tracking-[0.6em] text-black/60 mb-6 block font-medium">
            {brandName} Studio
          </span>
          <h1 className="font-cormorant text-7xl md:text-9xl font-light tracking-tight leading-none text-[#111] mix-blend-difference mb-6">
            {initialTitle} <span className="italic font-medium">{lastWord}</span>
          </h1>
          {heroSubtitle && (
            <p className="font-outfit text-sm tracking-wider text-black/70 max-w-md mx-auto">
              {heroSubtitle}
            </p>
          )}
        </motion.div>
      </div>

      {/* Enter Vault CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-12 right-6 md:right-12 z-30 pointer-events-auto"
      >
        <Link href="/templates/horizon/products" className="group flex items-center gap-4 cursor-none pointer-events-auto">
          <span className="font-outfit text-[10px] uppercase tracking-[0.3em] text-[#111]/50 group-hover:text-[#111] transition-colors duration-500">
            {ctaText}
          </span>
          <MoveRight className="w-4 h-4 text-[#111]/50 group-hover:text-[#111] transition-all group-hover:translate-x-2" strokeWidth={1.5} />
        </Link>
      </motion.div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 font-outfit text-[9px] uppercase tracking-[0.4em] text-[#111]/30 flex flex-col items-center gap-2 pointer-events-none">
        Scroll
        <div className="w-[1px] h-8 bg-[#111]/10 overflow-hidden relative">
           <motion.div 
             className="w-full h-full bg-[#111]"
             animate={{ y: ["-100%", "100%"] }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
           />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: any; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [-1000, 0, 1000], [0.05, 0, -0.05], { clamp: false });
  
  const [skew, setSkew] = useState(0);

  useAnimationFrame(() => {
    const currentVelocity = velocityFactor.get();
    setSkew(currentVelocity * 10);
  });

  return (
    <motion.div
      ref={ref}
      style={{ skewY: skew }}
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, delay: (index % 2) * 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative pointer-events-auto ${index % 2 === 1 ? 'md:mt-48' : ''}`}
    >
      <Link href={`/templates/horizon/products/${project.id}`} className="block cursor-none pointer-events-auto">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F5] mb-8">
          <img 
            src={project.image} 
            alt={project.name}
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        </div>
      </Link>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-cormorant text-3xl font-medium text-[#111] mb-2 group-hover:opacity-70 transition-opacity">
            {project.name}
          </h3>
          <p className="font-outfit text-[10px] font-medium text-[#111]/40 tracking-[0.2em] uppercase">{project.category}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function HorizonHome({ initialCustomData, initialProducts }: { initialCustomData?: any, initialProducts?: any[] }) {
  const { currencySymbol } = useHorizon();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const customData = useCustomization();
  const shopTitle = customData?.formData?.shopTitle;
  const ethosTitle = customData?.formData?.ethosTitle;
  const ethosText = customData?.formData?.ethosText;
  const ethosCta = customData?.formData?.ethosCta;
  
  const titleWords = (shopTitle || "Selected Works").split(" ");
  const lastWord = titleWords.pop() || "";
  const initialTitle = titleWords.join(" ");

  return (
    <div ref={containerRef} className="bg-[#FAFAFA] min-h-[200vh]">
      
      <KineticHero />

      {/* Featured Products */}
      <section className="py-32 md:py-48 px-6 relative z-20 bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12 border-b border-black/5 pb-12">
            <div className="overflow-hidden">
              <motion.h2 
                initial={{ opacity: 0, y: "100%" }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="font-cormorant text-5xl md:text-7xl font-light text-[#111] tracking-tight"
              >
                {initialTitle} <span className="italic font-medium">{lastWord}</span>
              </motion.h2>
            </div>
            <Link href="/templates/horizon/products" className="group inline-flex items-center gap-4 cursor-none pointer-events-auto">
              <span className="font-outfit text-[10px] uppercase tracking-[0.2em] text-[#111]/60 group-hover:text-[#111] transition-colors duration-500 font-medium">
                View Archive
              </span>
              <MoveRight className="w-4 h-4 text-[#111]/60 group-hover:text-[#111] transition-all group-hover:translate-x-2" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
            {(initialProducts || []).slice(0, 4).map((p, idx) => {
              const project = {
                id: p.product_id || p.id,
                name: p.product_name || p.name,
                image: p.product_images?.[0]?.image_url || p.three_d_model_url || p.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
                category: p.categories?.category_name || p.category || "Case Study"
              };
              return <ProjectCard key={project.id} project={project} index={idx} />;
            })}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-40 bg-white text-center relative overflow-hidden border-t border-black/5">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto px-6 relative z-10"
        >
          <span className="font-outfit text-[10px] uppercase tracking-[0.4em] text-black/40 font-medium mb-12 block">{ethosTitle}</span>
          <h2 className="font-cormorant text-4xl md:text-6xl font-light leading-snug mb-16 text-[#111]">
            {(ethosText || "").split('\\n').map((line: string, i: number) => (
              <span key={i} className={i === 1 ? "italic font-medium" : ""}>"{line}"{i === 0 && <br/>}</span>
            ))}
          </h2>
          <Link href="/templates/horizon/about" className="inline-flex items-center gap-4 group cursor-none pointer-events-auto">
            <span className="font-outfit text-xs uppercase tracking-[0.2em] text-black/60 group-hover:text-black font-medium transition-colors duration-500 pb-2 border-b border-black/10 group-hover:border-black">
              {ethosCta}
            </span>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
