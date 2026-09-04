"use client";
import { useCustomizationContext } from "@/context/CustomizationContext";

import Link from "next/link";
import { ALL_PRODUCTS, useCart } from "./CartContext";
import { ArrowRight } from "lucide-react";
import { useCustomization } from "@/hooks/useCustomization";

export default function OriginHomePage() {
  const __customContext = useCustomizationContext();
  const basePath = __customContext?.basePath || "/templates/origin";



  const { addToCart , currencySymbol } = useCart();
  const customData = useCustomization();
  
  const displayProducts = customData?.products?.length > 0 ? customData.products : ALL_PRODUCTS;
  const featuredProducts = displayProducts.slice(0, 4);
  
  const heroTitle = customData?.formData?.heroTitle;
  const heroSubtitle = customData?.formData?.heroSubtitle;
  const primaryCta = customData?.formData?.primaryCta;
  const manifestoTitle = customData?.formData?.manifestoTitle;
  const manifestoText = customData?.formData?.manifestoText;
  const featuredTitle = customData?.formData?.featuredTitle;
  const featuredDesc = customData?.formData?.featuredDesc;
  const heroImage = customData?.formData?.heroImage;
  const manifestoCta = customData?.formData?.manifestoCta;
  const manifestoImage = customData?.formData?.manifestoImage;
  const viewAllText = customData?.formData?.viewAllText;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section data-page-id="home" data-section-id="Hero" className="relative w-full bg-[#402c21] text-[#fdfbf7] min-h-[100svh] flex items-center pt-24 pb-12 md:py-0">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            data-field-key="home.Hero.heroImage"
            alt="Hero Background" 
            className="w-full h-full object-cover md:object-center object-[center_top] opacity-30 mix-blend-overlay"
          />
        </div>
        <div className="max-w-[1400px] mx-auto px-6 relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center h-full">
          <div className="flex flex-col justify-center h-full">
            <h1 data-field-key="home.Hero.heroTitle" className="font-serif text-[clamp(42px,10vw,72px)] md:text-[clamp(48px,7vw,110px)] font-bold leading-[1.1] mb-4 md:mb-6 animate-in slide-in-from-bottom-10 fade-in duration-700 w-full max-w-[600px] md:max-w-none">
              {heroTitle}
            </h1>
            <p data-field-key="home.Hero.heroSubtitle" className="text-[#fdfbf7]/80 text-base md:text-xl w-full max-w-[600px] md:max-w-md mb-8 md:mb-10 leading-relaxed font-medium animate-in slide-in-from-bottom-10 fade-in duration-700 delay-150">
              {heroSubtitle}
            </p>
            <div className="animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
              <Link 
                href={`\${basePath}/products`} 
                data-field-key="home.Hero.primaryCta"
                className="inline-flex items-center justify-center w-full sm:w-auto gap-4 bg-[#fdfbf7] text-[#402c21] px-6 md:px-8 py-4 text-xs md:text-sm font-bold tracking-widest uppercase hover:bg-[#a38c7f] hover:text-[#fdfbf7] transition-colors group min-h-[44px]"
              >
                {primaryCta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section data-page-id="home" data-section-id="FeaturedProducts" className="py-24 px-6 bg-[#efebe9]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 data-field-key="home.FeaturedProducts.featuredTitle" className="font-serif text-3xl md:text-4xl font-bold text-[#402c21] mb-2">{featuredTitle}</h2>
              <p data-field-key="home.FeaturedProducts.featuredDesc" className="text-[#402c21]/70 font-medium">{featuredDesc}</p>
            </div>
            <Link 
              href={`\${basePath}/products`} 
              data-field-key="home.FeaturedProducts.viewAllText"
              className="text-sm font-bold uppercase tracking-widest text-[#402c21] hover:text-[#a38c7f] transition-colors border-b-2 border-transparent hover:border-[#a38c7f] pb-1"
            >
              {viewAllText}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product: any, idx: number) => (
              <div 
                key={product.id || idx} 
                className="group flex flex-col gap-4 animate-in slide-in-from-bottom-5 fade-in duration-700" 
                style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
              >
                <Link href={`\${basePath}/products/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-[#e5e0dc] rounded-sm">
                  <img 
                    src={product.image || (product.images && product.images[0]) || "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2000&auto=format&fit=crop"} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#402c21]/0 group-hover:bg-[#402c21]/5 transition-colors duration-300" />
                </Link>
                <div className="flex flex-col">
                  <div className="text-[10px] uppercase tracking-widest text-[#a38c7f] font-bold mb-1">{product.category || 'Product'}</div>
                  <Link href={`\${basePath}/products/${product.id}`}>
                    <h3 className="font-serif text-xl font-bold text-[#402c21] group-hover:text-[#a38c7f] transition-colors mb-2">{product.name}</h3>
                  </Link>
                  <div className="text-base font-bold text-[#402c21]/80">{currencySymbol}{typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || 0).toFixed(2)}</div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product);
                    }}
                    className="mt-4 border border-[#402c21] text-[#402c21] py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#402c21] hover:text-[#fdfbf7] transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Highlight */}
      <section data-page-id="home" data-section-id="Manifesto" className="py-0 flex flex-col md:flex-row h-auto min-h-[60vh]">
        <div className="w-full md:w-1/2 p-12 md:p-24 bg-[#efebe9] text-[#402c21] flex flex-col justify-center items-start">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#a38c7f] mb-6">Sourcing</div>
          <h2 data-field-key="home.Manifesto.manifestoTitle" className="font-serif text-4xl md:text-5xl font-bold mb-8">{manifestoTitle}</h2>
          <p data-field-key="home.Manifesto.manifestoText" className="text-[#402c21]/80 text-lg leading-relaxed mb-10 font-medium">
            {manifestoText}
          </p>
          <Link 
            href={`\${basePath}/about`} 
            data-field-key="home.Manifesto.manifestoCta"
            className="border-b-2 border-[#a38c7f] pb-1 text-[#402c21] hover:text-[#a38c7f] font-bold tracking-widest text-xs uppercase transition-colors"
          >
            {manifestoCta}
          </Link>
        </div>
        <div className="w-full md:w-1/2 h-[50vh] md:h-auto">
          <img 
            src={manifestoImage} 
            data-field-key="home.Manifesto.manifestoImage"
            alt="Materials" 
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </div>
  );
}