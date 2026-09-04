"use client";
import { buildCloudinaryUrl, buildSrcSet } from "@/lib/cloudinary";
import { useState } from "react";

interface Props {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export default function CloudinaryImage({ publicId, alt, width = 800, height = 800, priority, className, sizes }: Props) {
  const [loaded, setLoaded] = useState(false);
  
  // If it's a full URL (like unsplash), just return regular img
  if (publicId.startsWith("http")) {
    return (
      <img src={publicId} alt={alt} className={`w-full h-full object-cover ${className}`} />
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-[#1E2022] animate-pulse" />
      )}
      <img
        src={buildCloudinaryUrl(publicId, { width, height })}
        srcSet={buildSrcSet(publicId)}
        sizes={sizes ?? `(max-width: 768px) 100vw, ${width}px`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
