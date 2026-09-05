"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCustomization } from "@/hooks/useCustomization";
import { useCustomizationContext } from "@/context/CustomizationContext";

export default function OriginAboutPage() {
  const __customContext = useCustomizationContext();
  const basePath = typeof __customContext?.basePath === "string" ? __customContext.basePath : "";

  const customData = useCustomization();
  const formData = customData?.formData || {};

  // Editorial content with intentional fallbacks
  const tEyebrow = formData.aboutEyebrow || "OUR PHILOSOPHY";
  const tHeading = formData.aboutHeading || formData.aboutTitle || "Designed with intention.\nMade to endure.";
  const tDescription = formData.aboutDescription || formData.aboutSubtitle || formData.aboutText1 || "We believe the objects around us should feel considered, honest, and timeless. Every piece begins with thoughtful materials, purposeful form, and a respect for the details that make everyday life beautiful.";
  const tHeroImage = formData.aboutHeroImage || formData.aboutImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2940&auto=format&fit=crop";

  // Philosophy Items
  const tPhil1Num = formData.phil1Number || "01";
  const tPhil1Title = formData.phil1Title || formData.feature1Title || "CONSIDERED MATERIALS";
  const tPhil1Desc = formData.phil1Desc || formData.aboutText2 || "Natural materials chosen for their character, texture, and longevity.";

  const tPhil2Num = formData.phil2Number || "02";
  const tPhil2Title = formData.phil2Title || formData.feature2Title || "TIMELESS FORM";
  const tPhil2Desc = formData.phil2Desc || formData.aboutText3 || "Quiet silhouettes designed to remain relevant beyond trends.";

  const tPhil3Num = formData.phil3Number || "03";
  const tPhil3Title = formData.phil3Title || "MADE WITH INTENTION";
  const tPhil3Desc = formData.phil3Desc || "Every detail is considered to create objects that feel meaningful in everyday life.";

  return (
    <div className="w-full bg-[var(--color-background,#fdfbf7)] min-h-screen pt-12 md:pt-20 pb-32 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Main Editorial Story Section */}
        <section 
          data-section-id="about-section" 
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-center mb-28 md:mb-36"
        >
          {/* Left Column: Image */}
          <div className="lg:col-span-6 xl:col-span-5 w-full">
            <div className="relative aspect-[4/5] w-full bg-[var(--color-foreground,#402c21)]/5 overflow-hidden rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              <img 
                data-field-key="aboutHeroImage"
                src={tHeroImage} 
                alt="Our Philosophy & Craftsmanship"
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* Right Column: Refined Editorial Philosophy Layout */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center py-4 lg:py-6 xl:pl-6">
            
            {/* Eyebrow */}
            <div 
              data-field-key="aboutEyebrow"
              className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.28em] uppercase text-[var(--color-accent,#a38c7f)] mb-4 sm:mb-5 select-none"
            >
              {tEyebrow}
            </div>

            {/* Main Heading */}
            <h1 
              data-field-key="aboutHeading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[42px] xl:text-[50px] leading-[1.12] tracking-tight font-bold text-[var(--color-foreground,#402c21)] mb-6 whitespace-pre-line"
            >
              {tHeading}
            </h1>

            {/* Supporting Paragraph */}
            <p 
              data-field-key="aboutDescription"
              className="text-sm sm:text-base md:text-base lg:text-[17px] leading-relaxed text-[var(--color-foreground,#402c21)]/80 font-normal max-w-2xl mb-8 sm:mb-10"
            >
              {tDescription}
            </p>

            {/* Subtle Editorial Divider */}
            <div className="w-full h-px bg-[var(--color-foreground,#402c21)]/15 mb-8 sm:mb-10" />

            {/* Three Compact Philosophy Items */}
            <div className="flex flex-col gap-7 sm:gap-8 max-w-2xl">
              
              {/* Item 01 */}
              <div className="grid grid-cols-[36px_1fr] sm:grid-cols-[44px_1fr] gap-3 sm:gap-5 items-start group">
                <span 
                  data-field-key="phil1Number"
                  className="text-xs sm:text-sm font-mono font-semibold tracking-wider text-[var(--color-accent,#a38c7f)] pt-0.5 select-none"
                >
                  {tPhil1Num}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 
                    data-field-key="phil1Title"
                    className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-foreground,#402c21)] group-hover:text-[var(--color-accent,#a38c7f)] transition-colors"
                  >
                    {tPhil1Title}
                  </h3>
                  <p 
                    data-field-key="phil1Desc"
                    className="text-xs sm:text-sm text-[var(--color-foreground,#402c21)]/75 leading-relaxed font-normal"
                  >
                    {tPhil1Desc}
                  </p>
                </div>
              </div>

              {/* Item 02 */}
              <div className="grid grid-cols-[36px_1fr] sm:grid-cols-[44px_1fr] gap-3 sm:gap-5 items-start group">
                <span 
                  data-field-key="phil2Number"
                  className="text-xs sm:text-sm font-mono font-semibold tracking-wider text-[var(--color-accent,#a38c7f)] pt-0.5 select-none"
                >
                  {tPhil2Num}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 
                    data-field-key="phil2Title"
                    className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-foreground,#402c21)] group-hover:text-[var(--color-accent,#a38c7f)] transition-colors"
                  >
                    {tPhil2Title}
                  </h3>
                  <p 
                    data-field-key="phil2Desc"
                    className="text-xs sm:text-sm text-[var(--color-foreground,#402c21)]/75 leading-relaxed font-normal"
                  >
                    {tPhil2Desc}
                  </p>
                </div>
              </div>

              {/* Item 03 */}
              <div className="grid grid-cols-[36px_1fr] sm:grid-cols-[44px_1fr] gap-3 sm:gap-5 items-start group">
                <span 
                  data-field-key="phil3Number"
                  className="text-xs sm:text-sm font-mono font-semibold tracking-wider text-[var(--color-accent,#a38c7f)] pt-0.5 select-none"
                >
                  {tPhil3Num}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 
                    data-field-key="phil3Title"
                    className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-foreground,#402c21)] group-hover:text-[var(--color-accent,#a38c7f)] transition-colors"
                  >
                    {tPhil3Title}
                  </h3>
                  <p 
                    data-field-key="phil3Desc"
                    className="text-xs sm:text-sm text-[var(--color-foreground,#402c21)]/75 leading-relaxed font-normal"
                  >
                    {tPhil3Desc}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-20 sm:py-24 px-6 bg-[var(--color-foreground,#402c21)] text-[var(--color-background,#fdfbf7)] rounded-sm">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Discover the Collection
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-background,#fdfbf7)]/70 max-w-md mx-auto mb-10 leading-relaxed font-light">
            Thoughtfully curated pieces designed to elevate your everyday rituals.
          </p>
          <Link 
            href={`${basePath}/products`} 
            className="inline-flex items-center gap-3.5 bg-[var(--color-background,#fdfbf7)] text-[var(--color-foreground,#402c21)] px-9 py-4 text-xs font-bold tracking-[0.18em] uppercase hover:bg-[var(--color-accent,#a38c7f)] hover:text-white transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            <span>Shop Now</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>
        
      </div>
    </div>
  );
}