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
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="py-8 px-4 flex flex-col items-center text-center space-y-5"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-neutral-900 tracking-tight">
            Fall into
            <br />
            <span className="text-green-500 font-bold">Wellness..</span>
          </h1>

          <p className="text-md text-gray-800 max-w-md font-body leading-tight">
            Health isn't complicated. Committed to being intentional with every
            sip. Fresh Pure Natural Juices, zero additives, maximum flavor and
            function.
          </p>

          <Button
            asChild
            size="lg"
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full px-8 py-6 font-semibold"
          >
            <Link to="/products" className="flex items-center gap-2">
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default HeroSection;
