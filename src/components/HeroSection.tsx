import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileCarousel from "@/components/carousel/home/MobileCarousel";
import DesktopCarousel from "@/components/carousel/home/DesktopCarousel";

const heroContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const heroChild = (y: number, duration: number) => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: [0.16, 1, 0.3, 1] },
  },
});

const badgeVariants = heroChild(20, 0.6);
const headlineVariants = heroChild(40, 0.8);
const descVariants = heroChild(20, 0.7);
const btnVariants = heroChild(16, 0.6);

function HeroSection({ promoActive = false }: { promoActive?: boolean }) {
  return (
    <motion.section
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Desktop hero */}
      <div className="hidden lg:block relative">
        <DesktopCarousel />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-8 lg:px-12">
            <motion.div
              className="max-w-xl"
              variants={heroContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={badgeVariants}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold tracking-wider uppercase mb-6"
              >
                100% Natural &middot; No Additives
              </motion.div>

              <motion.h1
                variants={headlineVariants}
                className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold leading-[1.05] text-white tracking-tight"
              >
                Fresh Juice<br className="sm:hidden" />{" "}
                <span className="bg-gradient-to-r from-green-300 via-emerald-400 to-lime-300 bg-clip-text text-transparent sm:whitespace-nowrap">
                  Pure Wellness
                </span>
              </motion.h1>

              <motion.div
                variants={descVariants}
                className="mt-5 mb-8"
              >
                <p className="text-base lg:text-lg text-white/80 max-w-md leading-relaxed">
                  Cold-pressed daily in Accra. Bold flavors, clean nutrition, zero additives. Delivered to your door.
                </p>
              </motion.div>

              <motion.div variants={btnVariants} className="flex items-center gap-4">
                <Button
                  asChild
                  className="group rounded-full px-7 py-5 bg-white text-gray-900 font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xl shadow-black/10"
                >
                  <Link href="/products" className="flex items-center gap-2.5">
                    Shop All Juices
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900/10 transition-all duration-300 group-hover:bg-gray-900/20 group-hover:translate-x-0.5">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  className={
                    promoActive
                      ? "rounded-full px-6 py-5 bg-black/25 text-white font-semibold text-sm backdrop-blur-sm border border-white/20 hover:bg-black/35 hover:text-white active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      : "rounded-full px-6 py-5 text-white/90 font-semibold text-sm hover:bg-white/10 hover:text-white active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  }
                >
                  {promoActive ? (
                    <Link href="#christmas" className="flex items-center gap-2">
                      Christmas Bundles — 50% off
                    </Link>
                  ) : (
                    <Link href="/products/cleanse">Start Your Cleanse</Link>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile hero */}
      <div className="block lg:hidden">
        <MobileCarousel />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="visible"
          className="absolute bottom-0 left-0 right-0 px-5 pb-10 pt-20"
        >
          <motion.div
            variants={badgeVariants}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-white/90 mb-4"
          >
            100% Natural
          </motion.div>

          <motion.h1
            variants={headlineVariants}
            className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight leading-[1.1] text-white"
          >
            Fresh Juice<br />{" "}
            <span className="bg-gradient-to-r from-green-300 via-emerald-400 to-lime-300 bg-clip-text text-transparent whitespace-nowrap">
              Pure Wellness
            </span>
          </motion.h1>

          <motion.p
            variants={descVariants}
            className="text-sm text-white/75 mt-3 mb-6 max-w-sm leading-relaxed"
          >
            Cold-pressed daily in Accra. Bold flavors, zero additives.
          </motion.p>

          <motion.div variants={btnVariants}>
            <Button
              asChild
              className="group rounded-full px-8 py-5 bg-white text-gray-900 font-semibold text-sm active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-lg"
            >
              <Link href="/products" className="flex items-center gap-2">
                Shop Now
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/10">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default HeroSection;
