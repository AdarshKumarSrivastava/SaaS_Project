import { defaultAureliaProducts } from '@/app/templates/aurelia/data';
import { defaultNoireProducts } from '@/app/templates/noire/data';
import { defaultMonumentProducts } from '@/app/templates/monument/data';
import { defaultVantaProducts } from '@/app/templates/vanta/data';
import { defaultAtelierProducts } from '@/app/templates/atelier/data';

// Basic utility to generate unique IDs securely in the browser/node
const generateId = () => {
   if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
   }
   return Math.random().toString(36).substring(2, 15);
};

export interface TemplateConfig {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  defaultSchema: (projectName: string) => any;
  defaultProducts: any[];
  defaultTheme?: Record<string, any>;
}

export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
  'origin': {
    id: 'starter-origin',
    slug: 'origin',
    name: 'Origin',
    description: 'Refined architectural portfolio showcase with editorial depth.',
    category: 'portfolio',
    defaultProducts: [
      { id: "o1", name: "Leather Tote Bag", price: 185.00, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2000&auto=format&fit=crop", category: "Accessories" },
      { id: "o2", name: "Walnut Serving Tray", price: 75.00, image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?q=80&w=2000&auto=format&fit=crop", category: "Home" },
      { id: "o3", name: "Roasted Coffee Beans", price: 24.00, image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=2000&auto=format&fit=crop", category: "Pantry" },
      { id: "o4", name: "Amber Glass Vase", price: 45.00, image: "https://images.unsplash.com/photo-1580974582391-a6649c82a85f?q=80&w=2000&auto=format&fit=crop", category: "Decor" }
    ],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              heroTitle: 'Return to The Source.', 
              heroSubtitle: 'Goods crafted with intention, deeply rooted in natural materials and timeless design.', 
              primaryCta: 'Shop Collection',
              heroImage: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2940&auto=format&fit=crop'
            } },
            { id: generateId(), type: 'Featured', props: { 
              featuredTitle: 'Featured Goods', 
              featuredDesc: 'Carefully selected staples for everyday living.',
              viewAllText: 'View All'
            } },
            { id: generateId(), type: 'Manifesto', props: { 
              manifestoTitle: 'Honest Materials.', 
              manifestoText: 'From vegetable-tanned leathers that develop a rich patina over time, to sustainably harvested walnut wood. We don\'t believe in shortcuts.',
              manifestoCta: 'Read Our Story',
              manifestoImage: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2940&auto=format&fit=crop'
            } }
          ]
        },
        {
          id: 'shop',
          name: 'Shop',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { 
              shopTitle: 'All Goods',
              shopCategories: 'All, Accessories, Home, Pantry, Decor, Apparel, Brewing, Apothecary, Office'
            } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { 
              aboutEyebrow: 'OUR PHILOSOPHY',
              aboutHeading: 'Designed with intention.\nMade to endure.',
              aboutDescription: 'We believe the objects around us should feel considered, honest, and timeless. Every piece begins with thoughtful materials, purposeful form, and a respect for the details that make everyday life beautiful.',
              aboutHeroImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2940&auto=format&fit=crop',
              phil1Number: '01',
              phil1Title: 'CONSIDERED MATERIALS',
              phil1Desc: 'Natural materials chosen for their character, texture, and longevity.',
              phil2Number: '02',
              phil2Title: 'TIMELESS FORM',
              phil2Desc: 'Quiet silhouettes designed to remain relevant beyond trends.',
              phil3Number: '03',
              phil3Title: 'MADE WITH INTENTION',
              phil3Desc: 'Every detail is considered to create objects that feel meaningful in everyday life.'
            } }
          ]
        }
      ],
      global: { 
        brandName: projectName, 
        templateSlug: 'origin',
        footerText: 'Goods crafted with intention. Deeply rooted in natural materials and timeless design.',
        copyrightText: '© 2026 ORIGIN. ALL RIGHTS RESERVED.',
        footerCol1: 'Shop',
        footerCol2: 'About',
        footerCol3: 'Help',
        socialInsta: '#',
        socialTwitter: '#',
        socialFacebook: '#'
      }
    })
  },
  'velocity': {
    id: 'growth-velocity',
    slug: 'velocity',
    name: 'Velocity',
    description: 'Performance-first cyberpunk developer portfolio.',
    category: 'portfolio',
    defaultProducts: [
      { id: "v1", name: "CyberDeck Pro", price: 1299.00, image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop", category: "Hardware" },
      { id: "v2", name: "Neural Link V2", price: 899.00, image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop", category: "Implants" },
      { id: "v3", name: "Holo Emitter", price: 450.00, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop", category: "Optics" }
    ],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              brandName: projectName, 
              heroSubtitle: 'System // Override // Active', 
              primaryCta: 'Initialize Sequence',
              heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop'
            } },
            { id: generateId(), type: 'Marquee', props: { marqueeText1: 'Cybernetic Enhance', marqueeText2: 'Neo-Tokyo Aesthetics' } },
            { id: generateId(), type: 'Arsenal', props: { shopTitle: 'The Arsenal', featuredSubtitle: 'Latest Deployments', viewAllText: 'Access Full Grid' } }
          ]
        },
        {
          id: 'products',
          name: 'Products',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { shopTitle: 'Full Grid', viewAllText: 'Initialize' } },
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { 
              contactTitle: 'Transmission', 
              contactPreTitle: 'Contact Information', 
              contactAddress: '35.6762° N, 139.6503° E\nTokyo, Japan',
              contactEmail: 'support@velocity.com',
              contactPhone: 'Usually within 24 hours'
            } },
          ]
        }
      ],
      global: { 
        brandName: projectName, 
        templateSlug: 'velocity',
        footerText: 'Engineered armor for the digital age. Pushing the boundaries of human performance with cutting-edge cybernetics.',
        copyrightText: '© 2026 VELOCITY. SYSTEM SECURED.',
        footerCol1: 'Grid Access',
        footerCol2: 'System',
        footerCol3: 'Network',
        socialInsta: '#',
        socialTwitter: '#',
        socialFacebook: '#'
      }
    })
  },
  'essence': {
    id: 'starter-essence',
    slug: 'essence',
    name: 'Essence',
    description: 'Elegant salon & luxury beauty booking experience.',
    category: 'salon',
    defaultProducts: [
      { id: "e1", name: "Ceramic Vase", price: 85.00, image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=2000&auto=format&fit=crop", category: "Decor" },
      { id: "e2", name: "Linen Throw", price: 120.00, image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=2000&auto=format&fit=crop", category: "Textiles" },
      { id: "e3", name: "Oak Side Table", price: 340.00, image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=2000&auto=format&fit=crop", category: "Furniture" },
      { id: "e4", name: "Stoneware Mug", price: 35.00, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=2000&auto=format&fit=crop", category: "Dining" },
      { id: "e5", name: "Artisan Candle", price: 45.00, image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=2000&auto=format&fit=crop", category: "Fragrance" },
      { id: "e6", name: "Minimalist Lamp", price: 215.00, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=2000&auto=format&fit=crop", category: "Lighting" },
      { id: "e7", name: "Cotton Pillow", price: 65.00, image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2000&auto=format&fit=crop", category: "Textiles" },
      { id: "e8", name: "Woven Basket", price: 95.00, image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=2000&auto=format&fit=crop", category: "Storage" }
    ],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              preTitle: 'ESTABLISHED 2026',
              heroTitle: 'Quiet Luxury for the Modern Ritual', 
              heroTitleItalic: 'Sanctuary',
              heroDescription: 'An intentional collection of elevated home and living essentials designed for serene living.',
              heroCta: 'Explore Collection',
              heroImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop'
            } },
            { id: generateId(), type: 'Featured', props: { 
              featuredTitle: 'Curated Essentials', 
              featuredDesc: 'Timeless craftsmanship, organic textures, and understated elegance.',
              viewAllText: 'View All'
            } },
            { id: generateId(), type: 'Manifesto', props: { 
              philosophyQuote: 'True luxury lies in the harmony between space, form, and quiet intention.',
              philosophyAuthor: 'Maison Essence'
            } }
          ]
        },
        {
          id: 'shop',
          name: 'Shop',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { 
              shopTitle: 'The Collection',
              shopCategories: 'All, Decor, Textiles, Furniture, Dining, Fragrance, Lighting, Storage'
            } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { 
              aboutTitle: 'Our Philosophy',
              aboutSubtitle: 'Designed for stillness and longevity.'
            } }
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { 
              contactTitle: 'Inquiries & Concierge'
            } }
          ]
        }
      ],
      global: { 
        brandName: projectName, 
        templateSlug: 'essence',
        theme: { primaryColor: '#F3EDE2', accentColor: '#111111' }
      }
    })
  },
  'canvas': {
    id: 'starter-canvas',
    slug: 'canvas',
    name: 'Canvas',
    description: 'Creative portfolio with immersive layout and typography.',
    category: 'portfolio',
    defaultProducts: [
      { id: "c1", name: "Structural Tote Bag", price: 120.00, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2000&auto=format&fit=crop", category: "Apparel" },
      { id: "c2", name: "Type Specimen Zine", price: 35.00, image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2000&auto=format&fit=crop", category: "Print" },
      { id: "c3", name: "Steel Bookend", price: 85.00, image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=2000&auto=format&fit=crop", category: "Object" },
      { id: "c4", name: "Monospace Poster", price: 40.00, image: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=2000&auto=format&fit=crop", category: "Print" },
      { id: "c5", name: "Clear Acetate Frame", price: 65.00, image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop", category: "Object" },
      { id: "c6", name: "Industrial Chair", price: 320.00, image: "https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=2000&auto=format&fit=crop", category: "Furniture" }
    ],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              heroHeadline: 'Canvas Archive', 
              heroSubtext: 'A curated study in contemporary form, typography, and raw material.', 
              primaryCta: 'Enter Archive',
              shopTitle: 'Selected Objects',
              philosophyQuote: 'Objects that command nothing but your quiet attention.',
              philosophyCta: 'Discover the Maison',
              editorialImage1: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop',
              editorialTitle: 'The Gallery Edit',
              editorialText: 'Our newest curation explores the intersection of brutalist architecture and soft modernism.',
              editorialImage2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop'
            } }
          ]
        },
        {
          id: 'products',
          name: 'Products',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { shopTitle: 'Archive Catalog' } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { aboutTitle: 'Studio Profile' } }
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { contactTitle: 'Connect' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'canvas' }
    })
  },
  'minimalist': {
    id: 'starter-minimalist',
    slug: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, focused e-commerce storefront with high conversion primitives.',
    category: 'ecommerce',
    defaultProducts: [
      { id: "m1", name: "Minimalist Oversized Tee", price: 65.00, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2000&auto=format&fit=crop", category: "Apparel" },
      { id: "m2", name: "Raw Hem Denim", price: 145.00, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=2000&auto=format&fit=crop", category: "Apparel" },
      { id: "m3", name: "Tailored Linen Blazer", price: 280.00, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=2000&auto=format&fit=crop", category: "Outerwear" },
      { id: "m4", name: "Structured Leather Bag", price: 210.00, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=2000&auto=format&fit=crop", category: "Accessories" }
    ],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              heroTitle: 'Essential Simplicity', 
              tagline: 'High-conversion minimalist storefront crafted with precision.', 
              primaryCta: 'Shop Essentials',
              featuredTitle: 'New Arrivals',
              aboutTitle: 'About Our Brand',
              aboutDescription: 'We focus on pure silhouettes and intentional craftsmanship.'
            } }
          ]
        },
        {
          id: 'products',
          name: 'Products',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { shopTitle: 'All Essentials' } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { aboutTitle: 'Our Story' } }
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { contactTitle: 'Get in Touch' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'minimalist' }
    })
  },
  'nexus-pro': {
    id: 'growth-nexus-pro',
    slug: 'nexus-pro',
    name: 'Nexus Pro',
    description: 'Full-featured tech & gadgets commerce platform.',
    category: 'ecommerce',
    defaultProducts: [
      { id: "nx-001", name: "Aero X1 Tech Jacket", price: 349.00, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=2000&auto=format&fit=crop", category: "Outerwear" },
      { id: "nx-002", name: "Lumina Stealth Pants", price: 189.00, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=2000&auto=format&fit=crop", category: "Pants" },
      { id: "nx-003", name: "Apex Cyber Vest", price: 229.00, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop", category: "Vests" }
    ],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              heroTitle: 'Next-Gen Performance Gear', 
              heroSubtitle: 'Engineered for technical precision and urban resilience.', 
              primaryCta: 'Explore Nexus' 
            } }
          ]
        },
        {
          id: 'products',
          name: 'Products',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { shopTitle: 'The Gear Grid' } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { aboutTitle: 'The Nexus Vision' } }
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { contactTitle: 'Connect with Nexus' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'nexus-pro' }
    })
  },
  'quantum': {
    id: 'growth-quantum',
    slug: 'quantum',
    name: 'Quantum',
    description: 'Advanced kinetic commerce engine with dynamic product cards.',
    category: 'ecommerce',
    defaultProducts: [
      { id: "q-1", name: "Aether Levitation Planter", price: 450.00, image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=2000&auto=format&fit=crop", category: "Decor" },
      { id: "q-2", name: "Prism Contour Chair", price: 1200.00, image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=2000&auto=format&fit=crop", category: "Furniture" },
      { id: "q-3", name: "Nova Ambient Sphere", price: 320.00, image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=2000&auto=format&fit=crop", category: "Lighting" }
    ],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              heroTitle: 'Kinetic Commerce', 
              heroSubtitle: 'Objects sculpted through motion and ambient light.', 
              primaryCta: 'Discover Collection' 
            } }
          ]
        },
        {
          id: 'products',
          name: 'Products',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { shopTitle: 'Quantum Catalog' } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { aboutTitle: 'Our Physics' } }
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { contactTitle: 'Transmission' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'quantum' }
    })
  },
  'horizon': {
    id: 'growth-horizon',
    slug: 'horizon',
    name: 'Horizon',
    description: 'Expansive digital agency & studio portfolio.',
    category: 'portfolio',
    defaultProducts: [
      { id: "h-1", name: "Obsidian UI Framework", price: 149.00, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop", category: "Design System" },
      { id: "h-2", name: "Noir 3D Abstract Objects", price: 89.00, image: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=2000&auto=format&fit=crop", category: "3D Assets" }
    ],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              heroTitle: 'Horizon Studio', 
              heroSubtitle: 'Expansive digital experiences crafted for industry leaders.', 
              primaryCta: 'View Work' 
            } }
          ]
        },
        {
          id: 'products',
          name: 'Products',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { shopTitle: 'Digital Artifacts' } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { aboutTitle: 'About Horizon' } }
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { contactTitle: 'Start a Project' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'horizon' }
    })
  },
  'noire': {
    id: 'premium-noire',
    slug: 'noire',
    name: 'Noire',
    description: 'Premium luxury skincare and beauty brand experience.',
    category: 'skincare',
    defaultProducts: defaultNoireProducts || [],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              heroTitle: 'THE ART\nOF SKIN', 
              tagline: 'Scientifically proven, organically sourced. Elevate your daily ritual.', 
              primaryCta: 'Shop Formulations'
            } }
          ]
        },
        {
          id: 'products',
          name: 'Products',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { shopTitle: 'Botanical Formulations' } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { aboutTitle: 'Our Clean Standard' } }
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { contactTitle: 'Consultation' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'noire' }
    })
  },
  'monument': {
    id: 'premium-monument',
    slug: 'monument',
    name: 'Monument',
    description: 'World-class architectural studio website with rigorous grids.',
    category: 'architecture',
    defaultProducts: defaultMonumentProducts || [],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              heroTitle: 'MONUMENTAL ARCHITECTURE',
              primaryCta: 'Explore Monographs'
            } }
          ]
        },
        {
          id: 'products',
          name: 'Products',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { shopTitle: 'Architectural Works' } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { aboutTitle: 'Studio Practice' } }
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { contactTitle: 'Commissions' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'monument' }
    })
  },
  'aurelia': {
    id: 'premium-aurelia',
    slug: 'aurelia',
    name: 'Aurelia',
    description: 'High-fashion editorial website inspired by luxury fashion houses.',
    category: 'fashion',
    defaultProducts: defaultAureliaProducts || [],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
             { id: generateId(), type: 'Hero', props: { 
               heroTitle: 'Aurelia Haute Couture',
               primaryCta: 'Explore Runway'
             } }
          ]
        },
        {
          id: 'products',
          name: 'Products',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { shopTitle: 'Runway Collection' } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { aboutTitle: 'Maison Heritage' } }
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { contactTitle: 'Private Appointments' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'aurelia' }
    })
  },
  'vanta': {
    id: 'premium-vanta',
    slug: 'vanta',
    name: 'Vanta',
    description: 'Sophisticated technology product experience.',
    category: 'tech',
    defaultProducts: defaultVantaProducts || [],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              heroTitle: 'Vanta Dark System',
              primaryCta: 'Acquire Hardware'
            } }
          ]
        },
        {
          id: 'products',
          name: 'Products',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { shopTitle: 'Hardware Line' } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { aboutTitle: 'Our Engineering' } }
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { contactTitle: 'Support Line' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'vanta' }
    })
  },
  'atelier': {
    id: 'premium-atelier',
    slug: 'atelier',
    name: 'Atelier',
    description: 'Experimental creative agency and digital studio portfolio.',
    category: 'studio',
    defaultProducts: defaultAtelierProducts || [],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { 
              heroTitle: 'Atelier Collective',
              primaryCta: 'View Curations'
            } }
          ]
        },
        {
          id: 'products',
          name: 'Products',
          path: '/products',
          sections: [
            { id: generateId(), type: 'Shop', props: { shopTitle: 'Studio Editions' } }
          ]
        },
        {
          id: 'about',
          name: 'About',
          path: '/about',
          sections: [
            { id: generateId(), type: 'About', props: { aboutTitle: 'About Atelier' } }
          ]
        },
        {
          id: 'contact',
          name: 'Contact',
          path: '/contact',
          sections: [
            { id: generateId(), type: 'Contact', props: { contactTitle: 'Collaborate' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'atelier' }
    })
  },
  // Canonical default fallback
  'default': {
    id: 'starter-minimalist',
    slug: 'minimalist',
    name: 'Minimalist',
    description: 'Default project renderer.',
    category: 'ecommerce',
    defaultProducts: [
      { id: "m1", name: "Minimalist Oversized Tee", price: 65.00, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2000&auto=format&fit=crop", category: "Apparel" }
    ],
    defaultSchema: (projectName: string) => ({
      pages: [{ id: 'home', name: 'Home', path: '/', sections: [{ id: generateId(), type: 'Hero', props: { heroTitle: 'Welcome to ' + projectName } }] }],
      global: { brandName: projectName, templateSlug: 'minimalist' }
    })
  }
};

/**
 * Normalizes any template identifier (id, slug, category, name) into a canonical template key.
 * Guarantees backward compatibility with existing databases containing "default" or full IDs.
 */
export function normalizeTemplateKey(key: string | null | undefined, siteDataOrHint?: any): string {
  if (!key || key === 'default' || key === 'undefined' || key === 'null') {
    if (typeof siteDataOrHint === 'string') {
      return normalizeFromHint(siteDataOrHint);
    }
    if (siteDataOrHint && typeof siteDataOrHint === 'object') {
      const hint = siteDataOrHint.global?.brandName || siteDataOrHint.name || siteDataOrHint.category || '';
      return normalizeFromHint(hint);
    }
    return 'velocity';
  }

  const clean = key.toLowerCase().trim().replace(/^(starter|growth|premium)[-_]/, '');

  if (clean === 'origin') return 'origin';
  if (clean === 'velocity') return 'velocity';
  if (clean === 'essence') return 'essence';
  if (clean === 'canvas') return 'canvas';
  if (clean === 'minimalist') return 'minimalist';
  if (clean === 'nexus-pro' || clean === 'nexus_pro' || clean === 'nexus') return 'nexus-pro';
  if (clean === 'quantum') return 'quantum';
  if (clean === 'horizon') return 'horizon';
  if (clean === 'aurelia') return 'aurelia';
  if (clean === 'noire' || clean === 'noiré') return 'noire';
  if (clean === 'monument') return 'monument';
  if (clean === 'vanta') return 'vanta';
  if (clean === 'atelier') return 'atelier';

  // Check hint if key didn't match directly
  if (siteDataOrHint) {
    const hint = typeof siteDataOrHint === 'string' 
      ? siteDataOrHint 
      : (siteDataOrHint.global?.brandName || siteDataOrHint.name || siteDataOrHint.category || '');
    const inferred = normalizeFromHint(hint);
    if (inferred !== 'velocity') return inferred;
  }

  return 'velocity';
}

function normalizeFromHint(hint: string): string {
  if (!hint) return 'velocity';
  const lower = hint.toLowerCase();
  if (lower.includes('essence') || lower.includes('salon')) return 'essence';
  if (lower.includes('origin') || lower.includes('architect')) return 'origin';
  if (lower.includes('canvas')) return 'canvas';
  if (lower.includes('minimalist')) return 'minimalist';
  if (lower.includes('nexus')) return 'nexus-pro';
  if (lower.includes('velocity') || lower.includes('cyberpunk')) return 'velocity';
  if (lower.includes('quantum')) return 'quantum';
  if (lower.includes('horizon')) return 'horizon';
  if (lower.includes('aurelia') || lower.includes('fashion')) return 'aurelia';
  if (lower.includes('noire') || lower.includes('noir') || lower.includes('skincare')) return 'noire';
  if (lower.includes('monument')) return 'monument';
  if (lower.includes('vanta')) return 'vanta';
  if (lower.includes('atelier')) return 'atelier';
  return 'velocity';
}

export const getTemplateConfig = (slugOrId: string, siteDataOrHint?: any): TemplateConfig => {
  const normalized = normalizeTemplateKey(slugOrId, siteDataOrHint);
  return TEMPLATE_REGISTRY[normalized] || TEMPLATE_REGISTRY['default'];
};
