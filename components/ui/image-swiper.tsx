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
  cardWidth = 300,   // Slightly increased
  cardHeight = 400,  // Slightly increased
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

  const getDurationFromCSS = useCallback((variableName: string, element?: HTMLElement | null): number => {
    const targetElement = element || document.documentElement;
    const value = getComputedStyle(targetElement)?.getPropertyValue(variableName)?.trim();
    if (!value) return 0;
    if (value.endsWith("ms")) return parseFloat(value);
    if (value.endsWith("s")) return parseFloat(value) * 1000;
    return parseFloat(value) || 0;
  }, []);

  const getCards = useCallback((): HTMLElement[] => {
    if (!cardStackRef.current) return [];
    return Array.from(cardStackRef.current.querySelectorAll('.image-card')) as HTMLElement[];
  }, []);

  const getActiveCard = useCallback((): HTMLElement | null => {
    const cards = getCards();
    return cards[0] || null;
  }, [getCards]);

  const updatePositions = useCallback(() => {
    const cards = getCards();
    cards.forEach((card, i) => {
      card.style.setProperty('--i', (i + 1).toString());
      card.style.setProperty('--swipe-x', '0px');
      card.style.setProperty('--swipe-rotate', '0deg');
      card.style.opacity = '1';
    });
  }, [getCards]);

  const applySwipeStyles = useCallback((deltaX: number) => {
    const card = getActiveCard();
    if (!card) return;
    card.style.setProperty('--swipe-x', `${deltaX}px`);
    card.style.setProperty('--swipe-rotate', `${deltaX * 0.2}deg`);
    card.style.opacity = (1 - Math.min(Math.abs(deltaX) / 100, 1) * 0.75).toString();
  }, [getActiveCard]);

  const handleStart = useCallback((clientX: number) => {
    if (isSwiping.current) return;
    isSwiping.current = true;
    startX.current = clientX;
    currentX.current = clientX;
    const card = getActiveCard();
    if (card) card.style.transition = 'none';
  }, [getActiveCard]);

  const handleEnd = useCallback(() => {
    if (!isSwiping.current) return;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    const deltaX = currentX.current - startX.current;
    const threshold = 50;
    const duration = getDurationFromCSS('--card-swap-duration', cardStackRef.current);
    const card = getActiveCard();

    if (card) {
      card.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

      if (Math.abs(deltaX) > threshold) {
        const direction = Math.sign(deltaX);
        card.style.setProperty('--swipe-x', `${direction * 300}px`);
        card.style.setProperty('--swipe-rotate', `${direction * 20}deg`);

        setTimeout(() => {
          if (getActiveCard() === card) {
            card.style.setProperty('--swipe-rotate', `${-direction * 20}deg`);
          }
        }, duration * 0.5);

        setTimeout(() => {
          setCardOrder(prev => [...prev.slice(1), prev[0]]);
        }, duration);
      } else {
        applySwipeStyles(0);
      }
    }

    isSwiping.current = false;
    startX.current = 0;
    currentX.current = 0;
  }, [getDurationFromCSS, getActiveCard, applySwipeStyles]);

  const handleMove = useCallback((clientX: number) => {
    if (!isSwiping.current) return;
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(() => {
      currentX.current = clientX;
      const deltaX = currentX.current - startX.current;
      applySwipeStyles(deltaX);
      if (Math.abs(deltaX) > 50) handleEnd();
    });
  }, [applySwipeStyles, handleEnd]);

  useEffect(() => {
    const el = cardStackRef.current;
    if (!el) return;

    const down = (e: PointerEvent) => handleStart(e.clientX);
    const move = (e: PointerEvent) => handleMove(e.clientX);
    const up = () => handleEnd();

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);

    el.addEventListener('touchstart', e => e.touches.length === 1 && handleStart(e.touches[0].clientX));
    el.addEventListener('touchmove', e => e.touches.length === 1 && handleMove(e.touches[0].clientX));
    el.addEventListener('touchend', () => handleEnd());

    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
    };
  }, [handleStart, handleMove, handleEnd]);

  useEffect(() => updatePositions(), [cardOrder, updatePositions]);

  const openFullscreen = (idx: number, e: React.MouseEvent) => {
    const img = (e.target as HTMLImageElement);
    setOriginRect(img.getBoundingClientRect());
    setFullscreenIdx(idx);
  };

  const closeFullscreen = () => {
    setFullscreenIdx(null);
    setOriginRect(null);
  };

  const handleModalSwipe = (direction: number) => {
    setFullscreenIdx((prev) => {
      if (prev === null) return null;
      let next = prev + direction;
      if (next < 0) next = _imageObjects.length - 1;
      if (next >= _imageObjects.length) next = 0;
      return next;
    });
  };

  useEffect(() => {
    if (fullscreenIdx === null) return;
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullscreen();
      if (e.key === 'ArrowLeft') handleModalSwipe(-1);
      if (e.key === 'ArrowRight') handleModalSwipe(1);
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [fullscreenIdx]);

  const [fadeIdx, setFadeIdx] = useState<number | null>(null);
  useEffect(() => {
    if (fadeIdx === null) return;
    const timeout = setTimeout(() => setFadeIdx(null), 250);
    return () => clearTimeout(timeout);
  }, [fadeIdx]);

  const showCaptions = _imageObjects.some(img => img.caption);

  return (
    <>
      {/* Card Stack */}
      <section
        className={`relative flex justify-center items-center select-none ${className}`}
        ref={cardStackRef}
        style={{
          width: '100%',
          maxWidth: `${cardWidth + 80}px`,
          height: cardHeight + 32,
          margin: '0 auto',
          touchAction: 'none',
          transformStyle: 'preserve-3d',
          '--card-perspective': '700px',
          '--card-z-offset': '12px',
          '--card-y-offset': '7px',
          '--card-max-z-index': _imageObjects.length.toString(),
          '--card-swap-duration': '0.3s',
        } as React.CSSProperties}
      >
        {cardOrder.map((originalIndex, displayIndex) => (
          <motion.article
            key={`${_imageObjects[originalIndex].src}-${originalIndex}`}
            className="image-card absolute cursor-grab active:cursor-grabbing place-self-center border border-slate-400 rounded-xl shadow-md overflow-hidden"
            style={{
              '--i': (displayIndex + 1).toString(),
              zIndex: _imageObjects.length - displayIndex,
              width: cardWidth,
              height: cardHeight,
              transform: `perspective(var(--card-perspective))
                          translateZ(calc(-1 * var(--card-z-offset) * var(--i)))
                          translateY(calc(var(--card-y-offset) * var(--i)))
                          translateX(var(--swipe-x, 0px))
                          rotateY(var(--swipe-rotate, 0deg))`
            } as React.CSSProperties}
            animate={fadeIdx === originalIndex ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <img
              src={_imageObjects[originalIndex].src}
              alt={_imageObjects[originalIndex].caption || `Swiper image ${originalIndex + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              draggable={false}
              loading="lazy"
              onClick={(e) => {
                setFadeIdx(originalIndex);
                setTimeout(() => openFullscreen(originalIndex, e), 120);
              }}
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
            Click image to view fullscreen.
          </span>
        </div>
      </section>

      {/* Fullscreen Modal */}
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
              alt={_imageObjects[fullscreenIdx].caption || `Fullscreen image ${fullscreenIdx + 1}`}
              initial={originRect ? {
                width: originRect.width,
                height: originRect.height,
                x: originRect.x,
                y: originRect.y,
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
              exit={originRect ? {
                width: originRect.width,
                height: originRect.height,
                x: originRect.x,
                y: originRect.y,
                opacity: 0.7,
              } : { opacity: 0 }}
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
