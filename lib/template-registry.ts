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
  name: string;
  defaultSchema: (projectName: string) => any;
  defaultProducts: any[];
}

export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
  'origin': {
    name: 'Origin',
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
              aboutTitle: 'Our Story',
              aboutSubtitle: 'Crafted with intention.'
            } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'origin' }
    })
  },
  'velocity': {
    name: 'Velocity',
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
            { id: generateId(), type: 'Contact', props: { title: 'Transmission' } },
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'velocity' }
    })
  },
  'noire': {
    name: 'Noire',
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
        }
      ],
      global: { brandName: projectName, templateSlug: 'noire' }
    })
  },
  'monument': {
    name: 'Monument',
    defaultProducts: defaultMonumentProducts || [],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
            { id: generateId(), type: 'Hero', props: { heroTitle: 'Monumental Design' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'monument' }
    })
  },
  'aurelia': {
    name: 'Aurelia',
    defaultProducts: defaultAureliaProducts || [],
    defaultSchema: (projectName: string) => ({
      pages: [
        {
          id: 'home',
          name: 'Home',
          path: '/',
          sections: [
             { id: generateId(), type: 'Hero', props: { heroTitle: 'Aurelia Collection' } }
          ]
        }
      ],
      global: { brandName: projectName, templateSlug: 'aurelia' }
    })
  },
  'vanta': {
    name: 'Vanta',
    defaultProducts: defaultVantaProducts || [],
    defaultSchema: (projectName: string) => ({
      pages: [{ id: 'home', name: 'Home', path: '/', sections: [] }],
      global: { brandName: projectName, templateSlug: 'vanta' }
    })
  },
  'atelier': {
    name: 'Atelier',
    defaultProducts: defaultAtelierProducts || [],
    defaultSchema: (projectName: string) => ({
      pages: [{ id: 'home', name: 'Home', path: '/', sections: [] }],
      global: { brandName: projectName, templateSlug: 'atelier' }
    })
  },
  // Default fallback for any other template
  'default': {
    name: 'Default',
    defaultProducts: [],
    defaultSchema: (projectName: string) => ({
      pages: [{ id: 'home', name: 'Home', path: '/', sections: [{ id: generateId(), type: 'Hero', props: { title: 'Welcome' } }] }],
      global: { brandName: projectName, templateSlug: 'default' }
    })
  }
};

export const getTemplateConfig = (slug: string): TemplateConfig => {
  return TEMPLATE_REGISTRY[slug] || TEMPLATE_REGISTRY['default'];
};
