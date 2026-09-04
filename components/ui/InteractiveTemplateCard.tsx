"use client";

import React, { useState, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, ArrowRight, Check, Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  img: string;
  href: string;
  badge?: string;
  features?: string[];
}

interface InteractiveTemplateCardProps {
  template: TemplateItem;
  onUseTemplate?: (template: TemplateItem) => void;
  isCreating?: boolean;
}

export const InteractiveTemplateCard = memo(function InteractiveTemplateCard({
  template,
  onUseTemplate,
  isCreating = false,
}: InteractiveTemplateCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // Mouse tracking for subtle 3D glass glare
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Primary action: Open live website preview
  const handleOpenWebsite = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsOpening(true);
    setTimeout(() => {
      router.push(template.href);
    }, 280);
  };

  // Key press listener for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenWebsite(e);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative bg-bg-elevated border border-line/70 rounded-[2rem] overflow-hidden flex flex-col h-full select-none transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.08),0_0_30px_rgba(229,82,37,0.08)] outline-none ${
        isOpening ? 'scale-95 opacity-90' : ''
      }`}
    >
      {/* Dynamic Cursor Light Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.4), transparent 70%)`,
        }}
      />

      {/* Browser Window Frame */}
      <div className="relative w-full aspect-[16/10] bg-[#EAE8E4] border-b border-line/60 overflow-hidden flex flex-col">
        {/* Browser Top Chrome Header */}
        <div className="h-9 w-full bg-bg-elevated/90 backdrop-blur-md border-b border-line/40 px-4 flex items-center justify-between z-20 transition-colors group-hover:bg-bg-elevated">
          {/* Mac Window Controls */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80 group-hover:bg-[#FF5F56] transition-colors" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80 group-hover:bg-[#FFBD2E] transition-colors" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80 group-hover:bg-[#27C93F] transition-colors" />
          </div>

          {/* Simulated Browser URL Bar */}
          <div className="flex-1 max-w-[210px] mx-2 h-5 bg-bg-subtle/80 rounded-md border border-line/40 px-2.5 flex items-center justify-center text-[10px] text-ink-soft/70 font-mono tracking-tight group-hover:text-ink transition-colors">
            <span className="truncate">buildspace.app/templates/{template.id.replace('starter-', '').replace('growth-', '')}</span>
          </div>

          {/* Status Dot */}
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider hidden sm:inline-block">Live</span>
          </div>
        </div>

        {/* Website Preview Image Container */}
        <div 
          onClick={handleOpenWebsite}
          className="relative flex-1 w-full overflow-hidden bg-bg-subtle cursor-pointer"
        >
          <img
            src={template.img}
            alt={template.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105"
          />

          {/* Subtle Dark Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-10" />

          {/* Floating "Open Website" Action Badge */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={false}
              animate={{
                scale: isHovered ? 1 : 0.85,
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 10,
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 bg-ink text-bg-elevated px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl backdrop-blur-md border border-white/20 group-hover:scale-105 transition-transform"
            >
              <Eye className="w-3.5 h-3.5 text-accent" />
              <span>Open Website</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-6 flex flex-col flex-grow justify-between relative z-10 bg-bg-elevated">
        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-xl font-semibold tracking-tight text-ink group-hover:text-accent transition-colors duration-300">
              {template.name}
            </h3>
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-bg-subtle text-ink-soft border border-line/60">
              {template.category}
            </span>
          </div>

          <p className="text-sm text-ink-soft font-light leading-relaxed mb-6 line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Bottom Interactive Controls */}
        <div className="flex items-center gap-3 pt-2 border-t border-line/40">
          {/* Primary Clickable Image Indicator */}
          <button
            type="button"
            onClick={handleOpenWebsite}
            className="flex-1 bg-ink text-bg-elevated hover:bg-ink/90 text-xs font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm group/btn"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>

          {/* Optional "Use Template" Provision Button */}
          {onUseTemplate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUseTemplate(template);
              }}
              disabled={isCreating}
              className={`flex-1 text-xs font-semibold py-3 px-4 rounded-xl transition-all duration-300 border flex items-center justify-center gap-1.5 ${
                isCreating
                  ? 'bg-accent/10 border-accent/30 text-accent cursor-not-allowed'
                  : 'bg-bg-subtle hover:bg-bg-base text-ink border-line hover:border-accent/40 active:scale-98'
              }`}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Use Template</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});
