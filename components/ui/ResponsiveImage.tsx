"use client";

import { useState, ImgHTMLAttributes } from 'react';

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function ResponsiveImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  aspectRatio,
  objectFit = 'cover',
  className = '',
  loading = 'lazy',
  ...props
}: ResponsiveImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const containerStyle = aspectRatio ? { aspectRatio } : {};
  const imgClassName = `${className} ${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : ''}`;

  return (
    <div style={containerStyle} className="w-full max-w-full overflow-hidden">
      <img
        src={imgSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        className={imgClassName}
        {...props}
      />
    </div>
  );
}
