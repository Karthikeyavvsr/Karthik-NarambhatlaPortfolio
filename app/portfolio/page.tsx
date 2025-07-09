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

export default function PortfolioPage() {
  const [modalImg, setModalImg] = useState<string | null>(null);
  const allImages = Object.values(categoryImages).flat();

  return (
    <main className="min-h-screen bg-black text-white px-2 sm:px-4 py-10 pt-16 flex flex-col items-center pb-24">
      {/* Compact Categories Grid at the Top */}
      <div className="w-full flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xs sm:max-w-3xl w-full mx-auto mb-6 justify-items-center">
          {categories.map((category) => (
            <Link key={category.slug} href={`/portfolio/${category.slug}`} className="w-full">
              <div className="relative rounded-xl overflow-hidden shadow-md aspect-[4/5] bg-[#222] hover:shadow-lg transition border border-white/10 hover:border-white/30">
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/poster.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 p-4">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-300">{category.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <div className="w-full flex justify-center items-center mt-10">
        <div className="w-full max-w-full sm:max-w-7xl h-[60vh] sm:h-[90vh] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-6 text-left w-full">Featured:</h2>
          <StickyScroll images={allImages} />
        </div>
      </div>

      {/* Fullscreen Modal for Images */}
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
