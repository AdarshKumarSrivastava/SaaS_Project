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
    label: 'About & Philosophy Section',
    fields: [
      { id: 'aboutEyebrow', type: 'text', label: 'Eyebrow' },
      { id: 'aboutHeading', type: 'text', label: 'Main Heading' },
      { id: 'aboutDescription', type: 'textarea', label: 'Supporting Description' },
      { id: 'aboutHeroImage', type: 'image', label: 'Hero Image' },
      { id: 'phil1Number', type: 'text', label: 'Item 1 Number' },
      { id: 'phil1Title', type: 'text', label: 'Item 1 Title' },
      { id: 'phil1Desc', type: 'textarea', label: 'Item 1 Description' },
      { id: 'phil2Number', type: 'text', label: 'Item 2 Number' },
      { id: 'phil2Title', type: 'text', label: 'Item 2 Title' },
      { id: 'phil2Desc', type: 'textarea', label: 'Item 2 Description' },
      { id: 'phil3Number', type: 'text', label: 'Item 3 Number' },
      { id: 'phil3Title', type: 'text', label: 'Item 3 Title' },
      { id: 'phil3Desc', type: 'textarea', label: 'Item 3 Description' }
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
