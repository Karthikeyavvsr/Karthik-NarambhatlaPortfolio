'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageSwiperProps {
  images: string[];
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
}

export const ImageSwiper: React.FC<ImageSwiperProps> = ({
  images,
  cardWidth = 320,  // Increased from 256px
  cardHeight = 450, // Increased from 352px
  className = ''
}) => {
  const cardStackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startTime = useRef(0);

  const [cardOrder, setCardOrder] = useState<number[]>(() =>
    Array.from({ length: images.length }, (_, i) => i)
  );

  // Fullscreen functionality
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);

  const getCards = useCallback((): HTMLElement[] => {
    if (!cardStackRef.current) return [];
    return [...cardStackRef.current.querySelectorAll('.image-card')] as HTMLElement[];
  }, []);

  const getActiveCard = useCallback((): HTMLElement | null => {
    const cards = getCards();
    return cards[0] || null;
  }, [getCards]);

  const resetCardStyles = useCallback(() => {
    const cards = getCards();
    cards.forEach((card, i) => {
      card.style.setProperty('--swipe-x', '0px');
      card.style.setProperty('--swipe-rotate', '0deg');
      card.style.opacity = '1';
      card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    });
  }, [getCards]);

  const handleCardClick = (originalIndex: number, displayIndex: number) => {
    // Only allow click on the top card and if not dragging
    if (displayIndex === 0 && !isDragging.current) {
      console.log('Card clicked, opening fullscreen for index:', originalIndex);
      setFullscreenIdx(originalIndex);
    }
  };

  const closeFullscreen = useCallback(() => {
    setFullscreenIdx(null);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false;
    startX.current = e.clientX;
    startTime.current = Date.now();
    
    // Add mouse move and up listeners to the document for better tracking
    const handleDocumentMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX.current;
      
      if (Math.abs(deltaX) > 5) {
        isDragging.current = true;
        
        // Apply visual feedback during drag
        const activeCard = getActiveCard();
        if (activeCard) {
          activeCard.style.transition = 'none';
          activeCard.style.setProperty('--swipe-x', `${deltaX}px`);
          activeCard.style.setProperty('--swipe-rotate', `${deltaX * 0.1}deg`);
          activeCard.style.opacity = `${Math.max(0.3, 1 - Math.abs(deltaX) / 200)}`;
        }
      }
    };

    const handleDocumentMouseUp = (upEvent: MouseEvent) => {
      const deltaX = upEvent.clientX - startX.current;
      const deltaTime = Date.now() - startTime.current;
      
      // Desktop swipe detection - more sensitive
      if (Math.abs(deltaX) > 40) {
        isDragging.current = true;
        const direction = deltaX > 0 ? 1 : -1;
        
        // Animate the card out
        const activeCard = getActiveCard();
        if (activeCard) {
          activeCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
          activeCard.style.setProperty('--swipe-x', `${direction * 300}px`);
          activeCard.style.setProperty('--swipe-rotate', `${direction * 20}deg`);
          activeCard.style.opacity = '0';
          
          setTimeout(() => {
            setCardOrder(prev => [...prev.slice(1), prev[0]]);
          }, 300);
        }
      } else {
        // Reset card position if not swiped
        const activeCard = getActiveCard();
        if (activeCard) {
          activeCard.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
          activeCard.style.setProperty('--swipe-x', '0px');
          activeCard.style.setProperty('--swipe-rotate', '0deg');
          activeCard.style.opacity = '1';
        }
      }
      
      // Clean up listeners
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      
      // Reset dragging flag after a short delay
      setTimeout(() => {
        isDragging.current = false;
      }, 100);
    };

    // Add listeners to document for better mouse tracking
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
    
    e.preventDefault();
  };

  // Keep these empty since we're using document listeners for mouse events
  const handleMouseMove = (e: React.MouseEvent) => {
    // This is handled by document listener now
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // This is handled by document listener now
  };

  // Touch events for mobile - KEEPING EXACTLY AS THEY WERE WORKING
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = false;
    startX.current = e.touches[0].clientX;
    startTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startX.current;
    
    if (Math.abs(deltaX) > 3) {
      isDragging.current = true;
      
      // Apply visual feedback during drag
      const activeCard = getActiveCard();
      if (activeCard && Math.abs(deltaX) > 10) {
        activeCard.style.transition = 'none';
        activeCard.style.setProperty('--swipe-x', `${deltaX}px`);
        activeCard.style.setProperty('--swipe-rotate', `${deltaX * 0.1}deg`);
        activeCard.style.opacity = `${Math.max(0.3, 1 - Math.abs(deltaX) / 200)}`;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - startX.current;
    const deltaTime = Date.now() - startTime.current;
    
    // KEEPING the mobile swipe detection exactly as it was working
    if (Math.abs(deltaX) > 25 || (Math.abs(deltaX) > 15 && deltaTime < 200)) {
      isDragging.current = true;
      const direction = deltaX > 0 ? 1 : -1;
      
      const activeCard = getActiveCard();
      if (activeCard) {
        activeCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        activeCard.style.setProperty('--swipe-x', `${direction * 300}px`);
        activeCard.style.setProperty('--swipe-rotate', `${direction * 20}deg`);
        activeCard.style.opacity = '0';
        
        setTimeout(() => {
          setCardOrder(prev => [...prev.slice(1), prev[0]]);
        }, 300);
      }
    } else {
      // Reset card position if not swiped
      const activeCard = getActiveCard();
      if (activeCard) {
        activeCard.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        activeCard.style.setProperty('--swipe-x', '0px');
        activeCard.style.setProperty('--swipe-rotate', '0deg');
        activeCard.style.opacity = '1';
      }
    }
    
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  };

  useEffect(() => {
    resetCardStyles();
  }, [cardOrder, resetCardStyles]);

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full">
        {/* User Guide Caption - Moved to Top */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-block mr-2">👆</span>
            Tap image to view fullscreen • Swipe to navigate
          </p>
        </div>

        <section
          className={`relative select-none ${className}`}
          ref={cardStackRef}
          style={{
            width: cardWidth + 32,
            height: cardHeight + 32,
            transformStyle: 'preserve-3d',
          } as React.CSSProperties}
        >
          {cardOrder.map((originalIndex, displayIndex) => (
            <article
              key={`${images[originalIndex]}-${originalIndex}`}
              className="image-card absolute border border-slate-400 rounded-xl
                         shadow-md overflow-hidden cursor-pointer"
              style={{
                zIndex: images.length - displayIndex,
                width: cardWidth,
                height: cardHeight,
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) 
                           perspective(700px)
                           translateZ(${-displayIndex * 12}px)
                           translateY(${displayIndex * 7}px)
                           translateX(var(--swipe-x, 0px))
                           rotateY(var(--swipe-rotate, 0deg))`,
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                touchAction: 'none' // Prevent scrolling on mobile
              } as React.CSSProperties}
              onClick={() => handleCardClick(originalIndex, displayIndex)}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={images[originalIndex]}
                alt={`Swiper image ${originalIndex + 1}`}
                className="w-full h-full object-cover select-none"
                draggable={false}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  pointerEvents: 'none' // Prevent image from interfering with card events
                }}
              />
            </article>
          ))}
        </section>
      </div>

      {/* Fullscreen Modal */}
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
              src={images[fullscreenIdx]}
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