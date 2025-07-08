// component.tsx
'use client';
import { ReactLenis } from 'lenis/react';
import React, { forwardRef, useEffect, useRef, useState } from 'react';

interface StickyScrollProps {
  images: string[];
}

function shuffleArray<T>(array: T[]): T[] {
  // Fisher-Yates shuffle
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const StickyScroll = forwardRef<HTMLElement, StickyScrollProps>(({ images }, ref) => {
  const colCount = 3;
  const [colImages, setColImages] = useState<string[][]>([[], [], []]);
  const scrollRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  useEffect(() => {
    // Shuffle and split images for columns
    const shuffled = shuffleArray(images);
    const cols: string[][] = [[], [], []];
    shuffled.forEach((img, i) => {
      cols[i % colCount].push(img);
    });
    setColImages(cols);
  }, [images]);

  // Infinite scroll effect
  useEffect(() => {
    // All columns scroll up, but with different speeds for each column
    const speeds = [2.0, 1.5, 2.7]; // px per frame for each column (all positive, different speeds)
    let animationFrame: number;
    let running = true;

    function animate() {
      scrollRefs.forEach((ref, idx) => {
        const el = ref.current;
        if (el) {
          el.scrollTop += speeds[idx];
          // If scrolled to bottom, reset to top
          if (el.scrollTop >= el.scrollHeight / 2) {
            el.scrollTop = 0;
          }
        }
      });
      if (running) {
        animationFrame = requestAnimationFrame(animate);
      }
    }
    animate();
    return () => {
      running = false;
      cancelAnimationFrame(animationFrame);
    };
  }, [colImages]);

  // Duplicate images for seamless infinite scroll
  function renderColumn(images: string[], ref: React.RefObject<HTMLDivElement>, key: string) {
    return (
      <div
        ref={ref}
        key={key}
        className="overflow-y-hidden h-[80vh] flex flex-col gap-2 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {[...images, ...images].map((src, idx) => (
          <figure className="w-full" key={src + idx}>
            <img
              src={src}
              alt="Featured photo"
              className="transition-all duration-300 w-full h-96 align-bottom object-cover rounded-md"
              loading="lazy"
            />
          </figure>
        ))}
      </div>
    );
  }

  return (
    <ReactLenis root>
      <main className="bg-black" ref={ref}>
        <section className="text-white w-full bg-slate-950">
          <div className="grid grid-cols-12 gap-2">
            {/* Left column */}
            <div className="col-span-4">
              {renderColumn(colImages[0], scrollRefs[0], 'left')}
            </div>
            {/* Center sticky column */}
            <div className="col-span-4">
              {renderColumn(colImages[1], scrollRefs[1], 'center')}
            </div>
            {/* Right column */}
            <div className="col-span-4">
              {renderColumn(colImages[2], scrollRefs[2], 'right')}
            </div>
          </div>
        </section>
      </main>
    </ReactLenis>
  );
});

StickyScroll.displayName = 'StickyScroll';

export default StickyScroll; 