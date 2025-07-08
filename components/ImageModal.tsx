"use client";

import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageModalProps {
  imageSrc: string;
  alt?: string;
  onClose: () => void;
  originRect?: DOMRect | null;
}

const spring = {
  type: 'spring',
  stiffness: 400,
  damping: 40,
};

export default function ImageModal({ imageSrc, alt, onClose, originRect }: ImageModalProps) {
  const [modalRect, setModalRect] = useState<{ width: number; height: number; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ESC key closes modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Get modal target rect for animation
  useLayoutEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setModalRect({ width: rect.width, height: rect.height, x: rect.x, y: rect.y });
    }
  }, []);

  // Extract filename for caption
  const filename = imageSrc.split('/').pop();

  // Calculate initial and animate states
  const initial = originRect
    ? {
        width: originRect.width,
        height: originRect.height,
        x: originRect.x,
        y: originRect.y,
        opacity: 1,
      }
    : { opacity: 0 };
  const animate = modalRect
    ? {
        width: modalRect.width,
        height: modalRect.height,
        x: modalRect.x,
        y: modalRect.y,
        opacity: 1,
      }
    : { opacity: 1 };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* The animated image */}
        <motion.img
          src={imageSrc}
          alt={alt || filename}
          initial={initial}
          animate={animate}
          exit={initial}
          transition={spring}
          style={{ position: 'fixed', left: 0, top: 0, margin: 0, zIndex: 60, borderRadius: 12, objectFit: 'contain' }}
          onClick={e => e.stopPropagation()}
        />
        {/* The invisible container to get modal rect */}
        <div ref={containerRef} className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={imageSrc}
            alt=""
            className="max-h-[90vh] max-w-[95vw] opacity-0"
            style={{ pointerEvents: 'none' }}
          />
        </div>
        {/* Caption */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <span className="bg-black/70 text-white px-4 py-2 rounded text-sm font-medium shadow-lg">
            {alt || filename}
          </span>
        </div>
        {/* Close button */}
        <button
          className="absolute top-6 right-8 text-white text-3xl font-bold bg-black/60 rounded-full px-4 py-2 hover:bg-black/80 transition"
          onClick={onClose}
          aria-label="Close image preview"
        >
          &times;
        </button>
      </motion.div>
    </AnimatePresence>
  );
} 