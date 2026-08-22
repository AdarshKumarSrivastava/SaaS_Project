 
import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number; // Target width in pixels for edge resizing
  quality?: number; // Target quality 1-100
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  width, 
  quality = 80, 
  className,
  ...props 
}) => {
  // Function to dynamically append ImageKit edge transformation parameters
  const getOptimizedSrc = (url: string) => {
    if (!url) return '';
    
    // For MVP, we use a simple regex check. If the URL is from imagekit.io, we apply transformations.
    // In production, we would map this strictly to the user's saved BYOK ImageKit endpoint.
    if (url.includes('ik.imagekit.io')) {
      const urlObj = new URL(url);
      
      // Build transformation string
      const transforms = [];
      if (width) transforms.push(`w-${width}`);
      transforms.push(`q-${quality}`);
      transforms.push('f-auto'); // Automatically serve WebP/AVIF to compatible browsers
      
      const trString = transforms.join(',');
      
      // ImageKit supports appending ?tr= to the URL
      urlObj.searchParams.set('tr', trString);
      return urlObj.toString();
    }
    
    // If it's a generic URL (like Unsplash), just return it raw
    return url;
  };

  return (
    <img 
      src={getOptimizedSrc(src)} 
      alt={alt} 
      className={`object-cover ${className || ''}`}
      {...props} 
    />
  );
};
