"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Ban, HeartPulse, Leaf, ShieldCheck } from "lucide-react";
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

      <div className="container relative mx-auto grid items-center gap-12 px-4 pb-16 pt-24 sm:px-6 lg:min-h-[88vh] lg:grid-cols-12 lg:gap-10 lg:pb-20 lg:pt-32">
        {/* Left — copy */}
        <motion.div
          className="lg:col-span-6"
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
            className="mt-6 text-4xl font-extrabold leading-[1.03] tracking-tight text-neutral-charcoal sm:text-5xl lg:text-6xl"
          >
            Pressed this morning.
            <br />
            <span className="text-forest">Pure by design.</span>
          </motion.h1>

          <motion.p
            variants={child(24)}
            className="mt-6 max-w-md text-base leading-relaxed text-neutral-charcoal/60 md:text-lg"
          >
            Bold flavors, clean nutrition — delivered to your door.
          </motion.p>

          <motion.div variants={child(20)} className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              showArrow
              className="rounded-full text-primary-foreground shadow-lg shadow-black/5 hover:shadow-xl"
            >
              <Link href="/products">Shop All Juices</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-forest/30 text-forest hover:border-forest/60 hover:bg-forest/5"
            >
              <Link href="/products/cleanse">Start Your Cleanse</Link>
            </Button>
          </motion.div>

          <motion.ul
            variants={child(16)}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {trustItems.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-[13px] font-medium text-neutral-charcoal/70"
              >
                <item.icon className="h-4 w-4 text-forest" strokeWidth={1.9} />
                {item.label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Right — product */}
        <motion.div
          className="lg:col-span-6"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px] lg:ml-auto">
            {/* offset gold hairline */}
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[2.4rem] border border-gold/30"
            />

            <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-[#F4EFE4] shadow-2xl shadow-forest/15">
              <Image
                src="/images/hero-bottle.webp"
                alt="Duks Juice bottle, cold-pressed and additive-free"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 440px"
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
      </div>
    </section>
  );
}
