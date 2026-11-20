"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ban, HeartPulse, Leaf, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const child = (y = 24) => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
});

const trustItems = [
  { icon: Leaf, label: "100% Natural" },
  { icon: Ban, label: "No Added Sugar" },
  { icon: ShieldCheck, label: "No Preservatives" },
  { icon: HeartPulse, label: "Health-Coach Approved" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-soft-sand">
      {/* soft radial accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 60% at 82% 8%, rgba(135,101,29,0.10) 0%, rgba(249,244,238,0) 62%)",
        }}
      />

      <div className="container relative mx-auto px-5 pb-14 pt-24 sm:px-6 md:pb-24 md:pt-32 lg:px-8 lg:pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:min-h-[calc(88vh-8rem)]">
          {/* Product — seen first on mobile; sits right on desktop */}
          <motion.div
            className="order-1 lg:order-2 lg:col-span-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-[3/2] w-full lg:max-w-[560px] lg:ml-auto xl:max-w-[640px]">
              {/* offset gold hairline */}
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[2.4rem] border border-gold/30"
              />

              <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-[#F4EFE4] shadow-2xl shadow-forest/15">
                <Image
                  src="/images/hero-image.webp"
                  alt="Duks Juice, cold-pressed and additive-free"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 42vw, 640px"
                  className="object-cover"
                />
              </div>

              {/* floating chip */}
              <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-full border border-forest/10 bg-white px-4 py-2.5 shadow-lg shadow-forest/10">
                <Leaf className="h-4 w-4 text-forest" strokeWidth={1.9} />
                <span className="text-[12px] font-semibold text-forest">
                  Pressed fresh daily
                </span>
              </div>
            </div>
          </motion.div>

          {/* Copy — below the image on mobile, left column on desktop */}
          <motion.div
            className="order-2 lg:order-1 lg:col-span-6"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={child(20)}
              className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Cold-Pressed Daily · Accra
            </motion.span>

            <motion.h1
              variants={child(32)}
              className="mt-6 text-balance text-4xl font-extrabold leading-[1.03] tracking-tight text-neutral-charcoal sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl"
            >
              Pressed this morning.
              <br className="hidden sm:block" />
              <span className="text-forest">Pure by design.</span>
            </motion.h1>

            <motion.p
              variants={child(24)}
              className="mt-6 max-w-md text-base leading-relaxed text-neutral-charcoal/60 md:text-lg"
            >
              Fresh cold-pressed juice, delivered to your door.
            </motion.p>

            {/* Primary CTA — full-width on mobile, inline on desktop */}
            <motion.div variants={child(20)} className="mt-8">
              <Button
                asChild
                size="lg"
                showArrow
                className="w-full rounded-full text-primary-foreground shadow-lg shadow-black/5 hover:shadow-xl sm:w-auto"
              >
                <Link href="/products">Shop All Juices</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Trust strip — its own full-width row: 2×2 on mobile, 4-across with dividers at lg */}
        <motion.ul
          variants={container}
          initial="hidden"
          animate="visible"
          className="mt-12 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-forest/10 pt-7 md:mt-16 lg:grid-cols-4"
        >
          {trustItems.map((item, i) => (
            <motion.li
              key={item.label}
              variants={child(14)}
              className={`flex items-center gap-3 ${
                i > 0 ? "lg:border-l lg:border-forest/10 lg:pl-8" : ""
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
                <item.icon className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span className="text-[13px] font-medium leading-snug text-neutral-charcoal/80">
                {item.label}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
