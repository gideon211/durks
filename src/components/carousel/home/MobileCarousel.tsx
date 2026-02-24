import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import mobileImage1 from "@/assets/carousel/mobile/add1.png";
import mobileImage2 from "@/assets/carousel/mobile/add2.png";
import mobileImage3 from "@/assets/carousel/mobile/image3.jpg";
import mobileImage4 from "@/assets/carousel/mobile/image4.jpg";
import mobileImage5 from "@/assets/carousel/mobile/image5.jpg";
import mobileImage6 from "@/assets/carousel/mobile/image6.jpg";

const MobileCarousel: React.FC = () => {
  const mobileImages = useMemo<string[]>(() => {
    return [
      mobileImage6,
      mobileImage1,
      mobileImage3,
      mobileImage2,
      mobileImage4,
      mobileImage5,
      
      
    ];
  }, []);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [preloaded, setPreloaded] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const preload = async () => {
      await Promise.all(
        mobileImages.map((src: string) => {
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
  }, [mobileImages]);

  useEffect(() => {
    if (!preloaded) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mobileImages.length);
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [preloaded, mobileImages.length]);

  const fadeVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="relative h-[500px] md:h-[600px] w-full overflow-hidden bg-gray-900">
      <AnimatePresence initial={false}>
        <motion.img
          key={currentIndex}
          src={mobileImages[currentIndex]}
          alt={`Carousel slide ${currentIndex + 1}`}
          variants={fadeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {mobileImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="relative w-2 h-2"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className="w-full h-full rounded-full bg-white/30" />
            {index === currentIndex && (
              <motion.div
                className="absolute inset-0 rounded-full bg-green-500"
                layoutId="mobileActiveDot"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileCarousel;
