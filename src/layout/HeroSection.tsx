import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileCarousel from "@/components/carousel/home/MobileCarousel";
import DesktopCarousel from "@/components/carousel/home/DesktopCarousel";

const heroContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.3 },
  },
};

const heroChild = (y: number, duration: number) => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: [0.25, 0.46, 0.45, 0.94] },
  },
});

const badgeVariants = heroChild(30, 0.7);
const headlineVariants = heroChild(50, 1.0);
const dividerVariants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const descVariants = heroChild(30, 0.85);
const btnVariants = heroChild(20, 0.7);

function HeroSection() {
  return (
    <motion.section
      className="relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      <div className="hidden lg:block relative">
        <DesktopCarousel />

<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-black/20 to-black/30">
  <div className="container mx-auto px-6">
    <motion.div
      className="max-w-3xl mx-auto text-center space-y-8"
      variants={heroContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={badgeVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
        🌿 100% Natural • No Additives
      </motion.div>

      <motion.h1 variants={headlineVariants} className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold leading-tight text-white drop-shadow-2xl">
        Fall Into
        <br />
        <span className="bg-gradient-to-r from-green-300 via-emerald-400 to-lime-300 bg-clip-text text-transparent">
          Wellness
        </span>
      </motion.h1>

      <motion.div variants={dividerVariants} className="mx-auto w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full origin-center" />

      <motion.p variants={descVariants} className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
        Pure fruit. Thoughtfully crafted.
        No additives... just bold flavor, clean nutrition, and refreshing wellness in every bottle.
      </motion.p>

      <motion.div variants={btnVariants} className="flex flex-wrap justify-center gap-4 pt-4">
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-6 rounded-full shadow-xl hover:scale-105 transition-transform drop-shadow-md"
        >
          <Link to="/products">Shop All Juices</Link>
        </Button>

        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-2 border-white text-white px-8 py-6 rounded-full hover:bg-white hover:text-black transition-all drop-shadow-md"
        >
          <Link to="/products/cleanse">Start Your Cleanse</Link>
        </Button>
      </motion.div>
    </motion.div>
  </div>
</div>
      </div>

      <div className="block lg:hidden">
        <MobileCarousel />

<motion.div
  variants={heroContainer}
  initial="hidden"
  animate="visible"
  className="py-10 px-5 flex flex-col items-center text-center space-y-6"
>
  <motion.div variants={badgeVariants} className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-green-700">
    🌿 100% Natural • Zero Additives
  </motion.div>

  <motion.h1 variants={headlineVariants} className="text-5xl sm:text-5xl font-heading font-extrabold tracking-tight leading-[1.05] text-neutral-900">
    Fall into
    <br />
    <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500 bg-clip-text text-transparent">
      Wellness
    </span>
  </motion.h1>

  <motion.p variants={descVariants} className="text-[15px] sm:text-base font-body leading-relaxed text-neutral-700 max-w-sm">
    Crafted from real fruits with pure intention. No additives.. only vibrant
    flavor, clean nourishment, and wellness in every sip.
  </motion.p>

  <motion.div variants={btnVariants}>
    <Button
      asChild
      size="lg"
      className="rounded-full px-10 py-6 font-semibold tracking-wide shadow-lg bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-95 active:scale-[0.98] transition text-white"
    >
      <Link to="/products" className="flex items-center gap-2">
        Shop Now
        <ArrowRight className="w-5 h-5" />
      </Link>
    </Button>
  </motion.div>

  <motion.div
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    }}
    className="text-xs text-neutral-500 font-body tracking-wide"
  >
    Cold-pressed <span className="text-green-600">•</span> Fresh daily <span className="text-green-600">•</span> fast delivery
  </motion.div>
</motion.div>
      </div>
    </motion.section>
  );
}

export default HeroSection;
