import { ComponentRegistry } from './schema-types';

export const COMPONENT_REGISTRY: ComponentRegistry = {
  'Hero': {
    type: 'Hero',
    label: 'Hero Section',
    description: 'The main introductory section of the page.',
    fields: [
      { id: 'heroTitle', type: 'text', label: 'Primary Title' },
      { id: 'heroSubtitle', type: 'textarea', label: 'Subtitle / Description' },
      { id: 'primaryCta', type: 'text', label: 'Call to Action (Button text)' },
      { id: 'heroImage', type: 'image', label: 'Background Image' },
      { id: 'brandName', type: 'text', label: 'Brand Name (Optional)' },
      { id: 'title', type: 'text', label: 'Title (Alternate)' }
    ]
  },
  'Featured': {
    type: 'Featured',
    label: 'Featured Products',
    fields: [
      { id: 'featuredTitle', type: 'text', label: 'Section Title' },
      { id: 'featuredDesc', type: 'textarea', label: 'Section Description' },
      { id: 'featuredSubtitle', type: 'text', label: 'Subtitle' },
      { id: 'viewAllText', type: 'text', label: 'View All Button Text' }
    ]
  },
  'Manifesto': {
    type: 'Manifesto',
    label: 'Manifesto / Story',
    fields: [
      { id: 'manifestoTitle', type: 'text', label: 'Manifesto Title' },
      { id: 'manifestoText', type: 'textarea', label: 'Manifesto Content' },
      { id: 'manifestoCta', type: 'text', label: 'Call to Action' },
      { id: 'manifestoImage', type: 'image', label: 'Image' }
    ]
  },
  'Shop': {
    type: 'Shop',
    label: 'Shop / Catalog',
    fields: [
      { id: 'shopTitle', type: 'text', label: 'Shop Title' },
      { id: 'shopCategories', type: 'text', label: 'Categories (comma-separated)' },
      { id: 'viewAllText', type: 'text', label: 'View All Button' }
    ]
  },
  'About': {
    type: 'About',
    label: 'About Section',
    fields: [
      { id: 'aboutTitle', type: 'text', label: 'About Title' },
      { id: 'aboutSubtitle', type: 'textarea', label: 'About Subtitle' },
      { id: 'aboutImage', type: 'image', label: 'About Image' }
    ]
  },
  'Marquee': {
    type: 'Marquee',
    label: 'Marquee Banner',
    fields: [
      { id: 'marqueeText1', type: 'text', label: 'Marquee Text 1' },
      { id: 'marqueeText2', type: 'text', label: 'Marquee Text 2' }
    ]
  },
  'Arsenal': {
    type: 'Arsenal',
    label: 'Arsenal / Showcase',
    fields: [
      { id: 'shopTitle', type: 'text', label: 'Arsenal Title' },
      { id: 'featuredSubtitle', type: 'text', label: 'Subtitle' },
      { id: 'viewAllText', type: 'text', label: 'View All Text' }
    ]
  },
  'Contact': {
    type: 'Contact',
    label: 'Contact Section',
    fields: [
      { id: 'title', type: 'text', label: 'Contact Title' },
      { id: 'subtitle', type: 'textarea', label: 'Contact Subtitle' },
      { id: 'email', type: 'text', label: 'Contact Email' },
      { id: 'address', type: 'textarea', label: 'Address' }
    ]
  }
};
