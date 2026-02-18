import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 1. MUST keep these imports at the top
import mobileImage1 from "@/assets/carousel/mobile/add1.png";
import mobileImage2 from "@/assets/carousel/mobile/add2.png";
import mobileImage3 from "@/assets/carousel/mobile/image3.jpg";
import mobileImage4 from "@/assets/carousel/mobile/image4.jpg";
import mobileImage5 from "@/assets/carousel/mobile/image5.jpg";
import mobileImage6 from "@/assets/carousel/mobile/image6.jpg";

const MobileCarousel = () => {
  // Memoize the array so it doesn't trigger re-renders
  const mobileImages = useMemo(() => [

    mobileImage1,
    mobileImage3,
    mobileImage2,
    mobileImage4,
    mobileImage1,
    mobileImage5,
    mobileImage2,
    mobileImage6,
  ], []);

  const [currentIndex, setCurrentIndex] = useState(0);

  // PRELOAD IMAGES: This solves the "delaying to display" issue
  useEffect(() => {
    mobileImages.forEach((src) => {
      const img = new Image();
      img.src = src as string;
    });
  }, [mobileImages]);

  // Auto-slide timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % mobileImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [mobileImages.length]);

  const fadeVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="relative h-[500px] md:h-[600px] w-full overflow-hidden bg-gray-900">
      {/* popLayout prevents the "jumping" effect and allows cross-fade */}
      <AnimatePresence mode="popLayout">
        <motion.img
          key={currentIndex}
          src={mobileImages[currentIndex] as string}
          alt={`Carousel slide ${currentIndex + 1}`}
          variants={fadeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          // Removed loading="lazy" to ensure immediate display
          // Removed priority="true" because it's not a valid HTML/Motion attribute
        />
      </AnimatePresence>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {mobileImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="relative w-2 h-2"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className="w-full h-full rounded-full bg-white/30 transition-colors" />
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