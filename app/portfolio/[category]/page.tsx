'use client';

import { ImageSwiper } from '@/components/ui/image-swiper';
import { categoryImages } from '@/lib/imageData';
import Link from 'next/link';

export default function CategoryPage({ params }: { params: { category: string } }) {
  const images = categoryImages[params.category] || [];

  // Center content and polish structure
  if (!images.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
        <p className="text-center text-muted-foreground text-lg">No images found for this category.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-6xl">
          <ImageSwiper images={images} />
        </div>
      </div>
    </div>
  );
} 