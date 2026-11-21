"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ban, HeartPulse, Leaf, ShieldCheck, Snowflake } from "lucide-react";
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
  { icon: Leaf, label: "100% Natural", tint: "bg-fresh-lime/15" },
  { icon: Ban, label: "No Added Sugar", tint: "bg-mango-orange/15" },
  { icon: ShieldCheck, label: "No Preservatives", tint: "bg-ocean-teal/15" },
  { icon: HeartPulse, label: "Health-Coach Approved", tint: "bg-gold/20" },
];

const categoryPills = [
  { label: "Pure Juices", href: "/products/pure-juice", dot: "bg-mango-orange" },
  { label: "Cleanse", href: "/products/cleanse", dot: "bg-fresh-lime" },
  { label: "Wellness Shots", href: "/products/shots", dot: "bg-tropical-pink" },
  { label: "Smoothies", href: "/products/smoothies", dot: "bg-sunny-yellow" },
  { label: "Flavors", href: "/products/flavors", dot: "bg-ocean-teal" },
  { label: "Gift Packs", href: "/products/gift-packs", dot: "bg-gold" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* warm radial glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 60% at 82% 8%, rgba(135,101,29,0.14) 0%, rgba(255,255,255,0) 62%), radial-gradient(45% 55% at 0% 100%, rgba(16,61,22,0.07) 0%, rgba(255,255,255,0) 65%)",
        }}
      />
      {/* decorative rings (desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-16 hidden h-56 w-56 rounded-full border border-forest/10 lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -left-28 hidden h-80 w-80 rounded-full border-2 border-gold/25 lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 hidden h-72 w-72 rounded-full border border-forest/10 lg:block"
      />

      <div className="container relative mx-auto px-5 pb-14 pt-24 sm:px-6 md:pb-24 md:pt-32 lg:px-8 lg:pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-14 lg:min-h-[calc(80vh-8rem)]">
          {/* Product — seen first on mobile; sits right on desktop */}
          <motion.div
            className="order-1 lg:order-2 lg:col-span-6"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative mx-auto aspect-[3/2] w-full lg:ml-auto lg:max-w-[560px] xl:max-w-[640px]">
              {/* offset forest block for depth */}
              <div
                aria-hidden="true"
                className="absolute left-6 -bottom-3 -right-5 top-10 rounded-[2.2rem] bg-gradient-to-br from-forest via-forest to-[#1B5127] sm:-bottom-5"
              />

              {/* image frame */}
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] border-[6px] border-white bg-white shadow-2xl shadow-forest/25">
                <Image
                  src="/images/hero-image.webp"
                  alt="Duks Juice, cold-pressed and additive-free"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 42vw, 640px"
                  className="object-cover"
                />
              </div>

              {/* freshness card (desktop) */}
              <div className="absolute -left-5 -top-5 hidden items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-xl shadow-forest/15 lg:flex">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-teal/10 text-ocean-teal">
                  <Snowflake className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[12px] font-bold leading-tight text-neutral-charcoal">
                    Stays fresh 3 days
                  </p>
                  <p className="text-[11px] leading-tight text-neutral-charcoal/55">
                    Up to 3 months frozen
                  </p>
                </div>
              </div>

              {/* floating pill */}
              <div className="absolute -bottom-3 left-6 flex items-center gap-2 rounded-full border border-forest/10 bg-white px-4 py-2.5 shadow-lg shadow-forest/15 sm:-bottom-4">
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
              className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-forest/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest"
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
              <span className="relative inline-block text-forest">
                Pure by design.
                {/* gold brush underline */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  className="absolute left-0 -bottom-2.5 h-2.5 w-full text-gold"
                >
                  <path
                    d="M4 8.5C58 3.2 116 9.6 176 5.4C220 2.3 262 4.1 296 6.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              variants={child(24)}
              className="mt-6 max-w-md text-base leading-relaxed text-neutral-charcoal/70 md:text-lg"
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

            {/* Category quick-links */}
            <motion.ul
              variants={child(20)}
              className="mt-6 grid grid-cols-2 justify-items-start gap-2.5 sm:grid-cols-3"
            >
              {categoryPills.map((pill) => (
                <li key={pill.href}>
                  <Link
                    href={pill.href}
                    className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-4 py-2 text-[13px] font-medium text-neutral-charcoal/75 transition-all duration-300 hover:border-forest/40 hover:text-forest hover:shadow-sm"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ring-1 ring-black/5 ${pill.dot}`}
                    />
                    {pill.label}
                  </Link>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>

        {/* Trust strip — 2×2 on mobile, 4-across with dividers at lg */}
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
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center text-forest ${item.tint}`}
              >
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
