import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import mobileImage1 from "@/assets/carousel/mobile/image1.jpg";
import mobileImage2 from "@/assets/carousel/mobile/image2.jpg";
import mobileImage3 from "@/assets/carousel/mobile/image3.jpg";
import mobileImage4 from "@/assets/carousel/mobile/image4.jpg";
import mobileImage5 from "@/assets/carousel/mobile/image5.jpg";
import mobileImage6 from "@/assets/carousel/mobile/image6.jpg";

const MobileCarousel = () => {
  const mobileImages = [
    mobileImage1,
    mobileImage2,
    mobileImage3,
    mobileImage4,
    mobileImage5,
    mobileImage6,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % mobileImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [mobileImages.length]);

  const fadeVariants = {
    enter: { opacity: 0, scale: 1.1 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    <div className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={mobileImages[currentIndex]}
          alt={`Carousel slide ${currentIndex + 1}`}
          variants={fadeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {mobileImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="relative group"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className="w-2 h-2 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors">
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-green-500"
                  layoutId="mobileActiveDot"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileCarousel;
