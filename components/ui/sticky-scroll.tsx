'use client';
import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import Lenis from 'lenis';

interface StickyScrollProps {
  images: string[];
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const StickyScroll = forwardRef<HTMLElement, StickyScrollProps>(
  ({ images }, ref) => {
    const colCount = 3;
    const [colImages, setColImages] = useState<string[][]>([[], [], []]);
    const scrollRefs = [
      useRef<HTMLDivElement>(null),
      useRef<HTMLDivElement>(null),
      useRef<HTMLDivElement>(null),
    ];

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
      const shuffled = shuffleArray(images);
      const cols: string[][] = [[], [], []];
      shuffled.forEach((img, i) => {
        cols[i % colCount].push(img);
      });
      setColImages(cols);
    }, [images]);

    // Infinite scroll animation
    useEffect(() => {
      const speeds = [2.5, 1.8, 3.2]; // slight boost
      let animationFrame: number;
      let running = true;

      function animate() {
        scrollRefs.forEach((ref, idx) => {
          const el = ref.current;
          if (el) {
            el.scrollTop += speeds[idx];
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

    // ✅ Smooth scrolling using Lenis
    useEffect(() => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    }, []);

    function renderColumn(
      images: string[],
      ref: React.RefObject<HTMLDivElement>,
      key: string
    ) {
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
                className="transition-all duration-300 w-full h-96 object-cover rounded-md cursor-pointer"
                loading="lazy"
                onClick={() => setSelectedImage(src)}
              />
            </figure>
          ))}
        </div>
      );
    }

    return (
      <main className="bg-black" ref={ref}>
        <section className="text-white w-full bg-slate-950 px-2 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {renderColumn(colImages[0], scrollRefs[0], 'left')}
            {renderColumn(colImages[1], scrollRefs[1], 'center')}
            {renderColumn(colImages[2], scrollRefs[2], 'right')}
          </div>
        </section>

        {/* Modal Viewer */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex justify-center items-center"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Full view"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-3xl font-bold"
            >
              ×
            </button>
          </div>
        )}
      </main>
    );
  }
);

StickyScroll.displayName = 'StickyScroll';
export default StickyScroll;
