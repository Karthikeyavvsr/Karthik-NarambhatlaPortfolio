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
  {
    name: 'Jewelry',
    slug: 'jewelry',
    description: 'Shine, sparkle, and elegance',
    image: '/photos/Jewellery/DSC09570.JPG',
  },
];

export default function PortfolioPage() {
  const [modalImg, setModalImg] = useState<string | null>(null);
  const allImages = Object.values(categoryImages).flat();
  // Integrate jewelry images into the featured section
  const jewelryImages = categoryImages['jewelry'] || [];
  // Mix/shuffle all images including jewelry for variety
  const featuredImages = [...allImages, ...jewelryImages];
  function shuffleArray(arr: string[]) {
    return arr
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }
  const mixedImages = shuffleArray(featuredImages);

  return (
    <main className="min-h-screen bg-black text-white px-4 pt-20 flex flex-col items-center">
      {/* Mobile-friendly Category Cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 sm:px-4">
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

      {/* Featured Section */}
      <div className="w-full max-w-6xl mt-12">
        <h2 className="text-2xl font-bold mb-6">Featured:</h2>
        <div className="w-full h-[70vh] sm:h-[80vh]">
          <StickyScroll images={mixedImages} />
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
