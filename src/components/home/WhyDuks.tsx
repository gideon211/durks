"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ClipboardCheck, HeartPulse, Leaf, Salad } from "lucide-react";

const fadeUp = (y = 30) => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
});

const sectionViewport = { once: true, amount: 0.15 as const };

const pillars = [
  {
    icon: Salad,
    title: "Science Meets Nutrition",
    text: "Every juice is carefully crafted using nutrient-dense ingredients that nourish your body naturally.",
  },
  {
    icon: ClipboardCheck,
    title: "Health Coach Approved",
    text: "Created and recommended by a Certified Health Coach who understands what your body truly needs.",
  },
  {
    icon: Leaf,
    title: "Made With Purpose",
    text: "No shortcuts. No harmful additives. Just clean, honest ingredients for real results.",
  },
  {
    icon: HeartPulse,
    title: "Supports Your Journey",
    text: "Whether you're detoxing, boosting energy or improving overall wellness, Duks Juice supports every step.",
  },
];

export default function WhyDuks() {
  return (
    <section className="bg-soft-sand py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="mb-12 text-center md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={fadeUp()}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/70">
            Why Duks
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-charcoal sm:text-4xl md:text-5xl">
            Why Choose Duks
          </h2>
        </motion.div>

        {/* Founder */}
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <motion.div
            className="lg:col-span-7"
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            variants={fadeUp()}
          >
            <p className="text-2xl font-bold leading-snug tracking-tight text-forest md:text-[2rem]">
              Backed by expertise. Driven by purpose.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-charcoal/70 md:text-lg">
              Duks Juice is more than just a drink — it&apos;s a product of
              knowledge, passion and a deep commitment to helping you live a
              healthier, stronger life.
            </p>

            <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-1">
              <span
                className="text-4xl leading-none text-forest"
                style={{ fontFamily: "var(--font-signature), cursive" }}
              >
                Duku I. Plange
              </span>
              <span className="pb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-charcoal/50">
                Founder &amp; Certified Health Coach
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-[11px] font-semibold text-forest/80">
                CPD Standards Office accredited
              </span>
              <span className="rounded-full border border-forest/15 bg-white/70 px-3 py-1 text-[11px] font-semibold text-forest/80">
                Certified Health Coach
              </span>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
              <Leaf className="h-3.5 w-3.5 text-gold" />
              Your Health Is My <span className="text-gold">Mission</span>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-5"
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            variants={fadeUp(20)}
          >
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-[2rem] bg-[#EFE9DB] shadow-xl shadow-forest/10 lg:ml-auto">
              <Image
                src="/images/founder-duku.webp"
                alt="Duku I. Plange, founder and certified health coach at Duks Juice"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 80vw, 340px"
              />
            </div>
          </motion.div>
        </div>

        {/* Rule label */}
        <motion.div
          className="mt-16 flex items-center gap-4 md:mt-20"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={fadeUp()}
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/70">
            The expertise behind Duks Juice
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
        </motion.div>

        {/* Pillars */}
        <div className="mt-10 grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:gap-y-0">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              className={`flex flex-col items-center px-2 text-center sm:px-4 ${
                index > 0 ? "lg:border-l lg:border-gold/25" : ""
              }`}
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={fadeUp(15 + index * 60)}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-forest/25 text-forest">
                <pillar.icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-forest">
                {pillar.title}
              </h3>
              <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-neutral-charcoal/60">
                {pillar.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quote */}
        <motion.blockquote
          className="mt-16 rounded-2xl border border-forest/10 bg-white/70 p-6 sm:p-8 md:mt-20"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={fadeUp()}
        >
          <p className="mx-auto max-w-3xl text-center text-base leading-relaxed text-neutral-charcoal/80 md:text-lg">
            “I combine evidence-based knowledge with real-life experience to
            help individuals and families make better health choices every day.”
          </p>
          <footer className="mt-4 text-center">
            <span
              className="text-2xl text-forest"
              style={{ fontFamily: "var(--font-signature), cursive" }}
            >
              Duku I. Plange
            </span>
            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-charcoal/50">
              Certified Health Coach
            </span>
          </footer>
        </motion.blockquote>
      </div>
    </section>
  );
}
