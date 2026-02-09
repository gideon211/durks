import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import desktopImage1 from "@/assets/carousel/desktop/image1.jpg";
import desktopImage2 from "@/assets/carousel/desktop/image2.jpg";
import desktopImage3 from "@/assets/carousel/desktop/image3.jpg";
import desktopImage4 from "@/assets/carousel/desktop/image4.jpg";
import desktopImage5 from "@/assets/carousel/desktop/image5.jpg";
import desktopImage6 from "@/assets/carousel/desktop/image6.jpg";

const DesktopCarousel = () => {
  const desktopImages = [
    desktopImage1,
    desktopImage2,
    desktopImage3,
    desktopImage4,
    desktopImage5,
    desktopImage6,
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % desktopImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [desktopImages.length]);

  const fadeVariants = {
    enter: {
      opacity: 0,
      scale: 1.08,
      filter: "blur(2px)",
    },
    center: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(2px)",
    },
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={desktopImages[currentIndex]}
          alt={`Carousel slide ${currentIndex + 1}`}
          variants={fadeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 2,
            ease: "easeInOut",
            opacity: { duration: 1 },
            scale: { duration: 1.5, ease: "easeOut" },
          }}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-3">
        {desktopImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="relative group"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className="w-3 h-3 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/40 transition-all duration-300">
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                  layoutId="activeDot"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                />
              )}
            </div>
            <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-black/70 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Slide {index + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DesktopCarousel;
