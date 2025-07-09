'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export interface ImageObject {
  src: string;
  caption: string;
}

interface ImageSwiperProps {
  images?: string[];
  imageObjects?: ImageObject[];
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
}

export const ImageSwiper: React.FC<ImageSwiperProps> = ({
  images,
  imageObjects,
  cardWidth = 300,
  cardHeight = 400,
  className = ''
}) => {
  let _imageObjects: ImageObject[] = [];
  if (imageObjects && imageObjects.length > 0) {
    _imageObjects = imageObjects;
  } else if (images && images.length > 0) {
    _imageObjects = images.map(src => ({ src, caption: '' }));
  }

  const cardStackRef = useRef<HTMLDivElement>(null);
  const isSwiping = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const [cardOrder, setCardOrder] = useState<number[]>(() =>
    Array.from({ length: _imageObjects.length }, (_, i) => i)
  );
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  const getActiveCard = useCallback((): HTMLElement | null => {
    if (!cardStackRef.current) return null;
    const cards = Array.from(cardStackRef.current.querySelectorAll('.image-card'));
    return cards[0] as HTMLElement;
  }, []);

  const updatePositions = () => {
    const cards = cardStackRef.current?.querySelectorAll('.image-card');
    cards?.forEach((card, i) => {
      (card as HTMLElement).style.setProperty('--i', (i + 1).toString());
      (card as HTMLElement).style.setProperty('--swipe-x', '0px');
      (card as HTMLElement).style.setProperty('--swipe-rotate', '0deg');
      (card as HTMLElement).style.opacity = '1';
    });
  };

  useEffect(() => updatePositions(), [cardOrder]);

  const openFullscreen = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.target as HTMLImageElement).getBoundingClientRect();
    setOriginRect(rect);
    setFullscreenIdx(idx);
  };

  const closeFullscreen = () => {
    setFullscreenIdx(null);
    setOriginRect(null);
  };

  const handleModalSwipe = (direction: number) => {
    setFullscreenIdx(prev => {
      if (prev === null) return null;
      let next = prev + direction;
      if (next < 0) next = _imageObjects.length - 1;
      if (next >= _imageObjects.length) next = 0;
      return next;
    });
  };

  useEffect(() => {
    if (fullscreenIdx === null) return;
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullscreen();
      if (e.key === 'ArrowLeft') handleModalSwipe(-1);
      if (e.key === 'ArrowRight') handleModalSwipe(1);
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [fullscreenIdx]);

  const showCaptions = _imageObjects.some(img => img.caption);

  return (
    <>
      <section
        className={`relative flex justify-center items-center select-none ${className}`}
        ref={cardStackRef}
        style={{
          width: '100%',
          maxWidth: `${cardWidth + 80}px`,
          height: cardHeight + 32,
          margin: '0 auto',
          touchAction: 'none',
        } as React.CSSProperties}
      >
        {cardOrder.map((originalIndex, displayIndex) => (
          <motion.article
            key={`${_imageObjects[originalIndex].src}-${originalIndex}`}
            className="image-card absolute cursor-pointer border border-slate-400 rounded-xl shadow-md overflow-hidden"
            style={{
              '--i': (displayIndex + 1).toString(),
              zIndex: _imageObjects.length - displayIndex,
              width: cardWidth,
              height: cardHeight,
              transform: `translateX(var(--swipe-x, 0px)) rotateY(var(--swipe-rotate, 0deg))`
            } as React.CSSProperties}
          >
            <img
              src={_imageObjects[originalIndex].src}
              alt={_imageObjects[originalIndex].caption || `Swiper image ${originalIndex + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
              loading="lazy"
              onClick={(e) => openFullscreen(originalIndex, e)}
              onTouchEnd={(e) => openFullscreen(originalIndex, e)}
            />
            {showCaptions && _imageObjects[originalIndex].caption && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <span className="bg-black/70 text-white px-3 py-1 rounded text-xs font-medium shadow-lg">
                  {_imageObjects[originalIndex].caption}
                </span>
              </div>
            )}
          </motion.article>
        ))}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
          <span className="bg-black/60 text-white px-3 py-1 rounded text-xs font-medium shadow-lg opacity-80">
            Tap image to view fullscreen.
          </span>
        </div>
      </section>

      <AnimatePresence>
        {fullscreenIdx !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFullscreen}
          >
            <Link
              href="/portfolio"
              className="absolute top-6 left-8 text-white text-lg font-semibold bg-black/60 rounded-full px-5 py-2 hover:bg-black/80 transition z-50 border border-white/20 shadow-lg"
              onClick={e => e.stopPropagation()}
            >
              ← Back to Portfolio
            </Link>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl bg-black/40 rounded-full px-3 py-2 hover:bg-black/70 transition"
              onClick={e => { e.stopPropagation(); handleModalSwipe(-1); }}
            >
              ←
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl bg-black/40 rounded-full px-3 py-2 hover:bg-black/70 transition"
              onClick={e => { e.stopPropagation(); handleModalSwipe(1); }}
            >
              →
            </button>
            <motion.img
              src={_imageObjects[fullscreenIdx].src}
              alt={`Fullscreen image ${fullscreenIdx + 1}`}
              initial={originRect ? {
                width: originRect.width,
                height: originRect.height,
                x: originRect.x,
                y: originRect.y
              } : { opacity: 0 }}
              animate={{
                width: 'auto',
                height: '80vh',
                x: 0,
                y: 0,
                opacity: 1,
                left: '50%',
                top: '50%',
                translateX: '-50%',
                translateY: '-50%',
                position: 'fixed',
                borderRadius: 16,
              }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="z-50 object-contain shadow-2xl border-2 border-white"
              style={{ maxWidth: '90vw', maxHeight: '80vh' }}
              onClick={e => e.stopPropagation()}
              loading="lazy"
            />
            {showCaptions && _imageObjects[fullscreenIdx].caption && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <span className="bg-black/70 text-white px-4 py-2 rounded text-sm font-medium shadow-lg">
                  {_imageObjects[fullscreenIdx].caption}
                </span>
              </div>
            )}
            <button
              className="absolute top-6 right-8 text-white text-3xl font-bold bg-black/60 rounded-full px-4 py-2 hover:bg-black/80 transition"
              onClick={e => { e.stopPropagation(); closeFullscreen(); }}
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
