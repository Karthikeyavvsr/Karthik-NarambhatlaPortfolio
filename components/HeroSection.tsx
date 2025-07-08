"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const overlayVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1 } },
};

export default function HeroSection() {
  return (
    <>
      <section className="relative w-full h-[calc(100vh-4rem)] pt-16 flex items-center justify-center overflow-hidden bg-black z-0">
        {/* Video Background */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          poster="/poster.jpg"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
        <motion.div
          className="relative z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-auto"
          initial="hidden"
          animate="visible"
          variants={overlayVariants}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-4">
            Karthik Narambhatla
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-8 max-w-2xl">
            Crafting Stories Through the Lens
          </p>
          <Link
            href="/portfolio"
            className="inline-block px-8 py-3 bg-white text-black font-semibold rounded-full shadow-lg hover:bg-gray-200 transition z-30 relative pointer-events-auto"
            onClick={() => { console.log('View Portfolio button clicked!'); }}
          >
            View Portfolio
          </Link>
        </motion.div>
      </section>
    </>
  );
} 