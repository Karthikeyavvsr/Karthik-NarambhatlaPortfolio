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
  className = '',
}) => {
  let _imageObjects: ImageObject[] = [];
  if (imageObjects?.length) {
    _imageObjects = imageObjects;
  } else if (images?.length) {
    _imageObjects = images.map(src => ({ src, caption: '' }));
  }

  const cardStackRef = useRef<HTMLDivElement>(null);
  const isSwiping = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  const [cardOrder, setCardOrder] = useState<number[]>(
    Array.from({ length: _imageObjects.length }, (_, i) => i)
  );

  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  const getCards = useCallback((): HTMLElement[] => {
    if (!cardStackRef.current) return [];
    return Array.from(
      cardStackRef.current.querySelectorAll('.image-card')
    ) as HTMLElement[];
  }, []);

  const getActiveCard = useCallback((): HTMLElement | null => {
    const cards = getCards();
    return cards[0] || null;
  }, [getCards]);

  const applySwipeStyles = (deltaX: number) => {
    const card = getActiveCard();
    if (!card) return;
    card.style.setProperty('--swipe-x', `${deltaX}px`);
    card.style.setProperty('--swipe-rotate', `${deltaX * 0.2}deg`);
    card.style.opacity = (1 - Math.min(Math.abs(deltaX) / 100, 1) * 0.75).toString();
  };

  const handleStart = (clientX: number) => {
    isSwiping.current = true;
    startX.current = clientX;
    currentX.current = clientX;
    const card = getActiveCard();
    if (card) card.style.transition = 'none';
  };

  const handleEnd = (tapCallback?: () => void) => {
    if (!isSwiping.current) return;

    const deltaX = currentX.current - startX.current;
    const card = getActiveCard();

    const swipeThreshold = 50;
    if (Math.abs(deltaX) < 10 && tapCallback) {
      // tap detected
      tapCallback();
      return;
    }

    const duration = 300;
    if (card) {
      card.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

      if (Math.abs(deltaX) > swipeThreshold) {
        const direction = Math.sign(deltaX);
        card.style.setProperty('--swipe-x', `${direction * 300}px`);
        card.style.setProperty('--swipe-rotate', `${direction * 20}deg`);

        setTimeout(() => {
          setCardOrder(prev => [...prev.slice(1), prev[0]]);
        }, duration);
      } else {
        applySwipeStyles(0);
      }
    }

    isSwiping.current = false;
  };

  const handleMove = (clientX: number) => {
    if (!isSwiping.current) return;
    currentX.current = clientX;
    const deltaX = currentX.current - startX.current;
    applySwipeStyles(deltaX);
  };

  useEffect(() => {
    const el = cardStackRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => handleStart(e.clientX);
    const onMove = (e: PointerEvent) => handleMove(e.clientX);
    const onUp = () => handleEnd();

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
    };
  }, []);

  const openFullscreen = (idx: number, e: React.MouseEvent) => {
    const img = e.target as HTMLImageElement;
    setOriginRect(img.getBoundingClientRect());
    setFullscreenIdx(idx);
  };

  const closeFullscreen = () => {
    setFullscreenIdx(null);
    setOriginRect(null);
  };

  const handleModalSwipe = (direction: number) => {
    setFullscreenIdx(prev => {
      if (prev === null) return null;
      const next = (prev + direction + _imageObjects.length) % _imageObjects.length;
      return next;
    });
  };

  return (
    <>
      <section
        ref={cardStackRef}
        className={`relative flex justify-center items-center select-none ${className}`}
        style={{
          width: '100%',
          maxWidth: `${cardWidth + 80}px`,
          height: cardHeight + 32,
          margin: '0 auto',
          touchAction: 'none',
          transformStyle: 'preserve-3d',
        }}
      >
        {cardOrder.map((originalIndex, displayIndex) => (
          <motion.article
            key={`${_imageObjects[originalIndex].src}-${originalIndex}`}
            className="image-card absolute border rounded-xl shadow-md overflow-hidden"
            style={{
              zIndex: _imageObjects.length - displayIndex,
              width: cardWidth,
              height: cardHeight,
              transform: `translateX(var(--swipe-x, 0px)) rotateY(var(--swipe-rotate, 0deg)) translateZ(-${displayIndex * 12}px) translateY(${displayIndex * 8}px)`,
            }}
          >
            <img
              src={_imageObjects[originalIndex].src}
              alt={_imageObjects[originalIndex].caption || 'Image'}
              className="w-full h-full object-cover cursor-pointer"
              onPointerDown={e => handleStart(e.clientX)}
              onPointerUp={e => handleEnd(() => openFullscreen(originalIndex, e))}
              onPointerMove={e => handleMove(e.clientX)}
              draggable={false}
            />
          </motion.article>
        ))}
      </section>

      <AnimatePresence>
        {fullscreenIdx !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFullscreen}
          >
            <img
              src={_imageObjects[fullscreenIdx].src}
              alt="Fullscreen"
              className="object-contain max-h-[80vh] max-w-[90vw] rounded-xl shadow-2xl border"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
