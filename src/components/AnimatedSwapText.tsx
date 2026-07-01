import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedSwapTextProps {
  texts: string[];
  interval?: number;
  className?: string;
}

export default function AnimatedSwapText({ texts, interval = 3000, className }: AnimatedSwapTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % texts.length), interval);
    return () => clearInterval(id);
  }, [texts.length, interval]);

  const longest = texts.reduce((a, b) => (a.length > b.length ? a : b));

  return (
    <span className={`inline-flex items-center justify-center ${className || ""}`}>
      <span className="relative">
        <span className="invisible whitespace-nowrap">{longest}</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={texts[index]}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {texts[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
