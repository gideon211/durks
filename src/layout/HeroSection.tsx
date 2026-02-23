import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileCarousel from "@/components/carousel/home/MobileCarousel";
import DesktopCarousel from "@/components/carousel/home/DesktopCarousel";

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

<div className="absolute inset-0 flex items-center justify-center  bg-gradient-to-t from-black/70 via-black/40 to-black/70">
  <div className="container mx-auto px-6">
    <motion.div
      className="max-w-3xl mx-auto text-center space-y-8"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
        🌿 100% Natural • No Additives
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold leading-tight text-white drop-shadow-2xl">
        Fall Into
        <br />
        <span className="bg-gradient-to-r from-green-300 via-emerald-400 to-lime-300 bg-clip-text text-transparent">
          Wellness
        </span>
      </h1>

      {/* Decorative line */}
      <div className="mx-auto w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />

      {/* Description */}
      <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
        Pure fruit. Thoughtfully crafted.
        No additives...  just bold flavor, clean nutrition, and refreshing wellness in every bottle.
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-4 pt-4">
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
      </div>
    </motion.div>
  </div>
</div>
      </div>

      <div className="block lg:hidden">
        <MobileCarousel />

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 }}
  className="py-10 px-5 flex flex-col items-center text-center space-y-6"
  // remove inline fontFamily and use your Tailwind font classes instead
>
  {/* Small premium badge */}
  <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-green-700">
    🌿 100% Natural • Zero Additives
  </div>

  {/* Headline (better hierarchy + spacing) */}
  <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight leading-[1.05] text-neutral-900">
    Fall into
    <br />
    <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500 bg-clip-text text-transparent">
      Wellness
    </span>
  </h1>

  {/* Copy (cleaner, easier to read) */}
  <p className="text-[15px] sm:text-base font-body leading-relaxed text-neutral-700 max-w-sm">
    Crafted from real fruits with pure intention. No additives.. only vibrant
    flavor, clean nourishment, and wellness in every sip.
  </p>

  {/* CTA (more premium) */}
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

  {/* Tiny trust line (optional but makes it feel like a real brand) */}
  <div className="text-xs text-neutral-500 font-body tracking-wide">
    Cold-pressed <span className="text-green-600">•</span> Fresh daily <span className="text-green-600">•</span> fast delivery
  </div>
</motion.div>
      </div>
    </motion.section>
  );
}

export default HeroSection;
