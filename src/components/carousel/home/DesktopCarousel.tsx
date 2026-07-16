import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const DesktopCarousel: React.FC = () => {
  const desktopImages = useMemo<string[]>(() => {
    return [
      "/images/carousel/desktop/image3.webp",
      "/images/carousel/desktop/image4.webp",
      "/images/carousel/desktop/image5.webp",
      "/images/carousel/desktop/image6.webp",
      "/images/carousel/desktop/image7.webp",
    ];
  }, []);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [preloaded, setPreloaded] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preload all images (same as your mobile carousel)
  useEffect(() => {
    const preload = async () => {
      await Promise.all(
        desktopImages.map((src: string) => {
          return new Promise<void>((resolve) => {
            const img: HTMLImageElement = new window.Image();
            img.src = src;
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      );
      setPreloaded(true);
    };

    preload();
  }, [desktopImages]);

  // Auto slide (same pattern as mobile)
  useEffect(() => {
    if (!preloaded) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % desktopImages.length);
    }, 5000); // same as mobile timing

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [preloaded, desktopImages.length]);

  // Same transition/variants as mobile
    const fadeVariants = {
    enter: { opacity: 0, scale: 1.03 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gray-900">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          variants={fadeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 1.6, ease: "easeInOut" },
            scale: { duration: 2.2, ease: "easeOut" },
          }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={desktopImages[currentIndex]}
            alt={`Carousel slide ${currentIndex + 1}`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Keep your desktop overlay (optional) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />

      {/* Use the same dot behavior as mobile (but positioned like your desktop) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {desktopImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="relative w-3 h-3"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className="w-full h-full rounded-full bg-white/30" />
            {index === currentIndex && (
              <motion.div
                className="absolute inset-0 rounded-full bg-green-500"
                layoutId="desktopActiveDot"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DesktopCarousel;