'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import StickyScroll from '@/components/ui/sticky-scroll';
import { categoryImages } from '@/lib/imageData';

const categories = [
  {
    name: 'Landscapes',
    slug: 'landscapes',
    description: 'Chasing altitude and atmosphere',
    image: '/photos/landscapes/IMG_0341.jpg',
  },
  {
    name: 'Interiors',
    slug: 'interiors',
    description: 'Warm tones and elegant spaces',
    image: '/photos/interiors/IMG_5759.JPG',
  },
  {
    name: 'Food & Drinks',
    slug: 'food_drinks',
    description: 'Plated art and crafted drinks',
    image: '/photos/food_drinks/DD209508.jpeg',
  },
];

const placeholder = '/photos/landscapes/IMG_0341.jpg';

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].slug);
  const [modalImg, setModalImg] = useState<string | null>(null);

  const current = categories.find((c) => c.slug === selectedCategory)!;

  // Flatten all images from all categories
  const allImages = Object.values(categoryImages).flat();

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10 pt-16 flex flex-col items-center">
      {/* Compact Categories Grid at the Top */}
      <div className="w-full flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mx-auto mb-6 justify-items-center">
          {/* Landscapes Card */}
          <Link href="/portfolio/landscapes" className="block w-full max-w-xs">
            <div className="relative z-0 isolate rounded-xl overflow-hidden shadow-lg aspect-[4/5] w-full border-2 border-transparent hover:border-white/40 transition-all duration-300 bg-[#222]">
              <img
                src="/photos/landscapes/IMG_0341.jpg"
                alt="Landscapes"
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/poster.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition pointer-events-none" />
              <div className="relative z-10 p-4 w-full">
                <h3 className="text-lg font-bold mb-1 text-left">Landscapes</h3>
                <p className="text-xs text-gray-300 text-left truncate">Chasing altitude and atmosphere</p>
              </div>
            </div>
          </Link>
          {/* Interiors Card */}
          <Link href="/portfolio/interiors" className="block w-full max-w-xs">
            <div className="relative z-0 isolate rounded-xl overflow-hidden shadow-lg aspect-[4/5] w-full border-2 border-transparent hover:border-white/40 transition-all duration-300 bg-[#222]">
              <img
                src="/photos/interiors/IMG_5759.JPG"
                alt="Interiors"
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/poster.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition pointer-events-none" />
              <div className="relative z-10 p-4 w-full">
                <h3 className="text-lg font-bold mb-1 text-left">Interiors</h3>
                <p className="text-xs text-gray-300 text-left truncate">Warm tones and elegant spaces</p>
              </div>
            </div>
          </Link>
          {/* Food & Drinks Card */}
          <Link href="/portfolio/food_drinks" className="block w-full max-w-xs">
            <div className="relative z-0 isolate rounded-xl overflow-hidden shadow-lg aspect-[4/5] w-full border-2 border-transparent hover:border-white/40 transition-all duration-300 bg-[#222]">
              <img
                src="/photos/food_drinks/DD209508.jpeg"
                alt="Food & Drinks"
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/poster.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition pointer-events-none" />
              <div className="relative z-10 p-4 w-full">
                <h3 className="text-lg font-bold mb-1 text-left">Food & Drinks</h3>
                <p className="text-xs text-gray-300 text-left truncate">Plated art and crafted drinks</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
      {/* Featured Section */}
      <div className="w-full flex justify-center items-center mt-10">
        <div className="w-full max-w-7xl h-[90vh] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-6 text-left w-full">Featured:</h2>
          <StickyScroll images={allImages} />
        </div>
      </div>
      {/* Photo Grid */}
      <div className="max-w-5xl mx-auto">
        {/* The images grid is removed since images are not part of the category object anymore. Navigation to category pages should be handled elsewhere. */}
      </div>

      {/* Fullscreen Zoom Modal */}
      <AnimatePresence>
        {modalImg && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalImg(null)}
          >
            <motion.img
              src={modalImg}
              layoutId={modalImg}
              alt="Zoomed photo"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="max-h-[90vh] max-w-[95vw] rounded-lg shadow-2xl object-contain border-2 border-white"
              onClick={e => e.stopPropagation()}
            />
            <button
              className="absolute top-6 right-8 text-white text-3xl font-bold bg-black/60 rounded-full px-4 py-2 hover:bg-black/80 transition"
              onClick={() => setModalImg(null)}
              aria-label="Close image preview"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
} 