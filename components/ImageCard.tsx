import React from 'react';

type ImageCardProps = {
  src: string;
  alt: string;
};

export default function ImageCard({ src, alt }: ImageCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg group bg-gray-800 aspect-[4/5]">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/poster.jpg';
        }}
      />
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition" />
    </div>
  );
} 