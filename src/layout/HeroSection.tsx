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

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-heading font-bold text-white leading-tight">
                Fall Into <br />
                <span className="text-green-400">Wellness</span>
              </h1>

              <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                Health isn't complicated. Committed to being intentional with
                every sip. Fresh Pure Natural Juices, zero additives, maximum
                flavor and function.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="md" variant="hero">
                  <Link to="/products">Shop All Juices</Link>
                </Button>
                <Button
                  asChild
                  size="md"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-foreground"
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

          <p className="text-lg text-gray-800 max-w-md font-body leading-relaxed">
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
