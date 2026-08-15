 
import React from 'react';
import { Image as ImageIcon, MessageCircle } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage';

export type BlockType = 'Hero' | 'Gallery' | 'Contact' | 'Pricing' | 'Testimonial' | 'FAQ';

export interface Section {
  id: string;
  type: BlockType;
  props: Record<string, any>;
}

export const HeroBlock = ({ headline, subheadline, buttonText }: any) => (
  <div className="bg-bg-elevated border border-line rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-ink">{headline || 'Headline'}</h1>
    <p className="text-lg text-ink-soft mb-8 max-w-xl">{subheadline || 'Subheadline goes here'}</p>
    <button className="bg-ink text-bg-elevated px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity">
      {buttonText || 'Call to Action'}
    </button>
  </div>
);

export const GalleryBlock = ({ title, image1, image2, image3 }: any) => (
  <div className="bg-bg-elevated border border-line rounded-2xl p-8">
    <h2 className="text-2xl font-bold mb-6 text-center text-ink">{title || 'Gallery'}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[image1, image2, image3].map((imgUrl, i) => (
        <div key={i} className="aspect-square bg-bg-subtle rounded-xl flex items-center justify-center border border-line overflow-hidden">
          {imgUrl ? (
             <OptimizedImage src={imgUrl} alt={`Gallery image ${i+1}`} width={600} className="w-full h-full transition-transform hover:scale-105 duration-500" />
          ) : (
             <ImageIcon className="w-8 h-8 text-ink-soft" />
          )}
        </div>
      ))}
    </div>
  </div>
);

export const ContactBlock = ({ title, buttonText }: any) => (
  <div className="bg-bg-elevated border border-line rounded-2xl p-8 max-w-xl mx-auto w-full">
    <h2 className="text-2xl font-bold mb-6 text-center text-ink">{title || 'Contact Us'}</h2>
    <div className="space-y-4">
      <input type="text" placeholder="Name" className="w-full bg-bg-base border border-line text-ink rounded-lg px-4 py-3 placeholder:text-ink-soft" disabled />
      <input type="email" placeholder="Email" className="w-full bg-bg-base border border-line text-ink rounded-lg px-4 py-3 placeholder:text-ink-soft" disabled />
      <textarea placeholder="Message" rows={4} className="w-full bg-bg-base border border-line text-ink rounded-lg px-4 py-3 placeholder:text-ink-soft" disabled />
      <button className="w-full bg-ink text-bg-elevated px-6 py-3 rounded-lg font-medium">{buttonText || 'Send Message'}</button>
    </div>
  </div>
);

export const PricingBlock = ({ tier1Name, tier1Price, tier2Name, tier2Price }: any) => (
  <div className="bg-bg-elevated border border-line rounded-2xl p-8 max-w-4xl mx-auto w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-bg-base border border-line rounded-xl p-6 text-center text-ink">
        <h3 className="text-xl font-medium mb-2">{tier1Name || 'Starter'}</h3>
        <div className="text-4xl font-bold mb-6">{tier1Price || '$9'}<span className="text-sm text-ink-soft font-normal">/mo</span></div>
        <button className="w-full bg-ink-soft/20 text-ink px-4 py-2 rounded-lg font-medium hover:bg-ink-soft/30 transition-colors">Buy Now</button>
      </div>
      <div className="bg-bg-base border-2 border-accent rounded-xl p-6 text-center relative overflow-hidden text-ink shadow-sm">
        <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-3 py-1 rounded-bl-lg">PRO</div>
        <h3 className="text-xl font-medium mb-2">{tier2Name || 'Professional'}</h3>
        <div className="text-4xl font-bold mb-6">{tier2Price || '$29'}<span className="text-sm text-ink-soft font-normal">/mo</span></div>
        <button className="w-full bg-accent text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">Buy Now</button>
      </div>
    </div>
  </div>
);

export const TestimonialBlock = ({ quote, authorName, authorRole }: any) => (
  <div className="bg-bg-elevated border border-line rounded-2xl p-10 max-w-2xl mx-auto w-full text-center">
    <MessageCircle className="w-8 h-8 mx-auto text-ink-soft mb-6" />
    <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8 text-ink">&quot;{quote || 'This platform changed my business completely.'}&quot;</p>
    <div>
      <div className="font-bold text-ink">{authorName || 'Jane Doe'}</div>
      <div className="text-sm text-ink-soft">{authorRole || 'CEO, TechCorp'}</div>
    </div>
  </div>
);

export const FAQBlock = ({ question1, answer1, question2, answer2 }: any) => (
  <div className="bg-bg-elevated border border-line rounded-2xl p-8 max-w-3xl mx-auto w-full">
    <h2 className="text-2xl font-bold mb-8 text-center text-ink">Frequently Asked Questions</h2>
    <div className="space-y-4">
      <div className="bg-bg-base border border-line rounded-lg p-5">
        <h4 className="font-medium text-ink mb-2">{question1 || 'What is your return policy?'}</h4>
        <p className="text-ink-soft text-sm">{answer1 || 'You can return any item within 30 days.'}</p>
      </div>
      <div className="bg-bg-base border border-line rounded-lg p-5">
        <h4 className="font-medium text-ink mb-2">{question2 || 'Do you offer international shipping?'}</h4>
        <p className="text-ink-soft text-sm">{answer2 || 'Yes, we ship to over 100 countries.'}</p>
      </div>
    </div>
  </div>
);

export const RenderBlock = ({ section }: { section: Section }) => {
  switch (section.type) {
    case 'Hero': return <HeroBlock {...section.props} />;
    case 'Gallery': return <GalleryBlock {...section.props} />;
    case 'Contact': return <ContactBlock {...section.props} />;
    case 'Pricing': return <PricingBlock {...section.props} />;
    case 'Testimonial': return <TestimonialBlock {...section.props} />;
    case 'FAQ': return <FAQBlock {...section.props} />;
    default: return <div className="p-4 bg-red-500/20 text-red-500 rounded">Unknown Block</div>;
  }
};
