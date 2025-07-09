"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import ImageModal from "@/components/ImageModal";
import classNames from "classnames";

interface CategoryImageGridProps {
  images: string[];
  category: string;
}

export default function CategoryImageGrid({ images, category }: CategoryImageGridProps) {
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  // Touch state for swipe navigation
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Navigation handlers
  const nextImage = useCallback(() => {
    setModalIdx((idx) => (idx !== null ? (idx + 1) % images.length : null));
  }, [images.length]);
  const prevImage = useCallback(() => {
    setModalIdx((idx) => (idx !== null ? (idx - 1 + images.length) % images.length : null));
  }, [images.length]);
  const closeFullscreen = useCallback(() => {
    setModalIdx(null);
  }, []);

  // Keyboard navigation for modal
  useEffect(() => {
    if (modalIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalIdx, closeFullscreen, nextImage, prevImage]);

  // Touch handlers for modal
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    // Horizontal swipe
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) nextImage(); // Swipe left
      else prevImage(); // Swipe right
      setShowSwipeHint(false);
    }
    // Vertical swipe down to close
    if (diffY < -50 && Math.abs(diffY) > Math.abs(diffX)) {
      closeFullscreen();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Alt text generator
  const getAlt = (src: string) => {
    const file = src.split("/").pop();
    return `${category} - ${file}`;
  };

  return (
    <>
      <div
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto"
        tabIndex={-1}
        aria-label={`Image gallery for ${category}`}
      >
        {images.map((src, idx) => (
          <button
            key={src}
            className={classNames(
              "relative overflow-hidden rounded-lg shadow-lg group bg-gray-800 aspect-[4/5] focus:outline-none",
              focusedIdx === idx && "ring-2 ring-blue-400"
            )}
            style={{ minWidth: 0 }}
            onClick={() => setModalIdx(idx)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setModalIdx(idx);
              if (e.key === "ArrowRight") gridRef.current?.querySelectorAll('button')[Math.min(idx+1, images.length-1)]?.focus();
              if (e.key === "ArrowLeft") gridRef.current?.querySelectorAll('button')[Math.max(idx-1, 0)]?.focus();
            }}
            onFocus={() => setFocusedIdx(idx)}
            onBlur={() => setFocusedIdx(null)}
            tabIndex={0}
            aria-label={`View image ${idx + 1} of ${images.length}`}
          >
            <img
              src={src}
              alt={getAlt(src)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:z-10 group-hover:brightness-95 rounded-lg border border-gray-700"
              loading="lazy"
              draggable={false}
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition" />
          </button>
        ))}
      </div>
      {modalIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button - mobile optimized */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl hover:bg-black/70 touch-manipulation focus:outline-none"
              aria-label="Close image preview"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              ✕
            </button>
            {/* Desktop arrow buttons - hidden on mobile */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70 hidden md:flex focus:outline-none"
              aria-label="Previous image"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70 hidden md:flex focus:outline-none"
              aria-label="Next image"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              →
            </button>
            {/* Image container with touch handlers */}
            <img
              src={images[modalIdx]}
              alt={getAlt(images[modalIdx])}
              className="max-w-full max-h-full object-contain select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'pan-x', userSelect: 'none' }}
              draggable={false}
              onClick={closeFullscreen}
            />
            {/* Mobile indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 md:hidden">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === modalIdx ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
            {/* Mobile swipe hint (show briefly on first open) */}
            {showSwipeHint && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white/70 text-sm md:hidden">
                Swipe to navigate • Tap to close
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 