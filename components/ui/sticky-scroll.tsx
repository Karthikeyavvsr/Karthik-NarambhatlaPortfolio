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
  categoryImages?: Record<string, string[]>; // Optional for category-aware mixing
}

interface ImageWithCategory {
  src: string;
  category: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Enhanced category-aware mixing function
function createCategoryMixedArray(categoryImages: Record<string, string[]>, multiplier: number = 2): string[] {
  // Create array of objects with image path and category
  const imageWithCategory: ImageWithCategory[] = [];
  
  Object.entries(categoryImages).forEach(([category, images]) => {
    images.forEach(src => {
      imageWithCategory.push({ src, category });
    });
  });

  // Shuffle the entire pool
  const shuffled = shuffleArray(imageWithCategory);
  
  // Create multiple copies for infinite scroll
  const result: ImageWithCategory[] = [];
  for (let i = 0; i < multiplier; i++) {
    const currentShuffle = shuffleArray(shuffled);
    result.push(...currentShuffle);
  }

  // Remove adjacent duplicates AND same-category clustering
  return removeAdjacentDuplicatesAndCategories(result);
}

function removeAdjacentDuplicatesAndCategories(array: ImageWithCategory[]): string[] {
  if (array.length === 0) return [];
  
  const result = [array[0]];
  
  for (let i = 1; i < array.length; i++) {
    const current = array[i];
    const previous = result[result.length - 1];
    
    // Check if current image is same as previous OR same category as previous
    if (current.src !== previous.src && current.category !== previous.category) {
      result.push(current);
    } else {
      // Find an alternative that's different image AND different category
      const alternatives = array.filter(item => 
        item.src !== current.src && 
        item.src !== previous.src &&
        item.category !== previous.category
      );
      
      if (alternatives.length > 0) {
        const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)];
        result.push(randomAlt);
      } else {
        // Fallback: at least ensure different image
        const fallbacks = array.filter(item => item.src !== previous.src);
        if (fallbacks.length > 0) {
          result.push(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
        }
      }
    }
  }
  
  // Return just the image paths
  return result.map(item => item.src);
}

const StickyScroll = forwardRef<HTMLElement, StickyScrollProps>(
  ({ images, categoryImages }, ref) => {
    const colCount = 3;
    const [colImages, setColImages] = useState<string[][]>([[], [], []]);
    const scrollRefs = [
      useRef<HTMLDivElement>(null),
      useRef<HTMLDivElement>(null),
      useRef<HTMLDivElement>(null),
    ];

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [allImages, setAllImages] = useState<string[]>([]);

    // Preload images for better performance
    useEffect(() => {
      const imagesToPreload = images.slice(0, 20); // Preload first 20 images
      imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }, [images]);

    useEffect(() => {
      let processedImages: string[];
      
      if (categoryImages && Object.keys(categoryImages).length > 0) {
        // Use category-aware mixing for better variety
        processedImages = createCategoryMixedArray(categoryImages, 2);
      } else {
        // Fallback to simple shuffle if no category data
        processedImages = shuffleArray([...images, ...images]);
      }
      
      setAllImages(processedImages);
      
      // Distribute images across columns
      const cols: string[][] = [[], [], []];
      processedImages.forEach((img, i) => {
        cols[i % colCount].push(img);
      });
      setColImages(cols);
    }, [images, categoryImages]);

    // Enhanced infinite scroll animation with alternating directions
    useEffect(() => {
      const speeds = [2.5, 1.8, 3.2];
      const directions = [1, -1, 1]; // 1 = down, -1 = up (alternating pattern)
      let animationFrame: number;
      let running = true;

      function animate() {
        scrollRefs.forEach((ref, idx) => {
          const el = ref.current;
          if (el) {
            const speed = speeds[idx] * directions[idx];
            el.scrollTop += speed;
            
            // Handle scroll boundaries for both directions
            if (directions[idx] === 1) {
              // Scrolling down
              if (el.scrollTop >= el.scrollHeight / 2) {
                el.scrollTop = 0;
              }
            } else {
              // Scrolling up
              if (el.scrollTop <= 0) {
                el.scrollTop = el.scrollHeight / 2;
              }
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

    // Smooth scrolling using Lenis
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

    // Modal navigation functions
    const nextImage = () => {
      setCurrentImageIndex(prev => (prev + 1) % allImages.length);
      setSelectedImage(allImages[(currentImageIndex + 1) % allImages.length]);
    };

    const prevImage = () => {
      setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);
      setSelectedImage(allImages[(currentImageIndex - 1 + allImages.length) % allImages.length]);
    };

    const openModal = (src: string) => {
      const index = allImages.findIndex(img => img === src);
      setCurrentImageIndex(index);
      setSelectedImage(src);
    };

    const closeModal = () => {
      setSelectedImage(null);
    };

    // Keyboard navigation for modal
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!selectedImage) return;
        
        switch(e.key) {
          case 'Escape':
            closeModal();
            break;
          case 'ArrowLeft':
            prevImage();
            break;
          case 'ArrowRight':
            nextImage();
            break;
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, currentImageIndex, allImages]);

    // Touch handling for mobile modal navigation
    const touchStartX = useRef(0);
    
    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: React.TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) nextImage(); // Swipe left = next
        else prevImage(); // Swipe right = previous
      }
    };

    function renderColumn(
      images: string[],
      ref: React.RefObject<HTMLDivElement>,
      key: string,
      columnIndex: number
    ) {
      const isReversed = columnIndex === 1; // Middle column scrolls up
      
      return (
        <div
          ref={ref}
          key={key}
          className="overflow-y-hidden h-[80vh] flex flex-col gap-2 scroll-smooth"
          style={{ 
            scrollbarWidth: 'none',
            flexDirection: isReversed ? 'column-reverse' : 'column'
          }}
        >
          {[...images, ...images].map((src, idx) => (
            <figure className="w-full" key={src + idx}>
              <img
                src={src}
                alt="Featured photo"
                className="transition-all duration-300 w-full h-96 object-cover rounded-md cursor-pointer hover:scale-105 hover:shadow-lg"
                loading="lazy"
                onClick={() => openModal(src)}
              />
            </figure>
          ))}
        </div>
      );
    }

    return (
      <main className="bg-black" ref={ref}>
        <section className="text-white w-full bg-slate-950 px-2 py-4 pb-20 sm:pb-16 md:pb-12 lg:pb-8 mb-8 sm:mb-6 md:mb-4 min-h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {renderColumn(colImages[0], scrollRefs[0], 'left', 0)}
            {renderColumn(colImages[1], scrollRefs[1], 'center', 1)}
            {renderColumn(colImages[2], scrollRefs[2], 'right', 2)}
          </div>
        </section>

        {/* Enhanced Modal Viewer with Navigation */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[9999] bg-black/90 flex justify-center items-center"
            onClick={closeModal}
          >
            {/* Close button - mobile optimized */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-black/70 touch-manipulation"
            >
              ✕
            </button>
            
            {/* Desktop arrow buttons - hidden on mobile */}
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70 hidden md:flex z-10"
            >
              ←
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70 hidden md:flex z-10"
            >
              →
            </button>
            
            {/* Image with touch handlers for mobile */}
            <img
              src={selectedImage}
              alt="Full view"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'pan-x' }}
            />
            
            {/* Mobile indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 md:hidden">
              {allImages.slice(0, Math.min(allImages.length, 50)).map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
            
            {/* Mobile swipe hint (show briefly on first open) */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white/70 text-sm md:hidden text-center">
              Swipe to navigate • Tap outside to close
            </div>
          </div>
        )}
      </main>
    );
  }
);

StickyScroll.displayName = 'StickyScroll';
export default StickyScroll;