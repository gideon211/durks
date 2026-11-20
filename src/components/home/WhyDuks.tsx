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

function CoachSeal() {
  return (
    <span
      aria-hidden="true"
      className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <path id="coachSealTop" d="M50 50 m -30 0 a30 30 0 0 1 60 0" fill="none" />
          <path id="coachSealBottom" d="M50 50 m 30 0 a30 30 0 0 1 -60 0" fill="none" />
        </defs>
        {/* serrated stamp edge */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="hsl(var(--gold))"
          strokeWidth="2.4"
          strokeDasharray="1.7 3.6"
          opacity="0.85"
        />
        {/* disc and rings */}
        <circle cx="50" cy="50" r="40" fill="hsl(var(--forest))" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="hsl(var(--gold))"
          strokeWidth="1"
          opacity="0.55"
        />
        <circle
          cx="50"
          cy="50"
          r="26"
          fill="none"
          stroke="hsl(var(--gold))"
          strokeWidth="0.6"
          opacity="0.4"
        />
        {/* curved labels */}
        <text
          fill="hsl(var(--gold))"
          fontSize="10"
          fontWeight="700"
          letterSpacing="1.2"
          fontFamily="Poppins, sans-serif"
        >
          <textPath href="#coachSealTop" startOffset="50%" textAnchor="middle">
            CERTIFIED
          </textPath>
        </text>
        <text
          fill="hsl(var(--gold))"
          fontSize="8.6"
          fontWeight="600"
          letterSpacing="0.8"
          fontFamily="Poppins, sans-serif"
        >
          <textPath href="#coachSealBottom" startOffset="50%" textAnchor="middle">
            HEALTH COACH
          </textPath>
        </text>
      </svg>
      <Leaf className="relative h-6 w-6 text-gold" strokeWidth={1.6} />
    </span>
  );
}

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
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
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

            {/* Signature */}
            <div className="mt-9">
              <span
                className="block text-4xl leading-none text-forest"
                style={{ fontFamily: "var(--font-signature), cursive" }}
              >
                Duku I. Plange
              </span>
              <span className="mt-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-charcoal/50">
                Founder
              </span>
            </div>

            {/* gold rule */}
            <div className="mt-6 flex items-center gap-1.5" aria-hidden="true">
              <span className="h-px w-14 bg-gold/60" />
              <span className="h-[3px] w-3 rounded-full bg-gold" />
            </div>

            {/* Credentials + mission, side by side */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-5">
              <div className="flex items-center gap-4">
                <CoachSeal />
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-forest">
                    CPD Standards Office
                  </p>
                  <p className="mt-0.5 text-[12px] text-neutral-charcoal/60">
                    Accredited Health Coach
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-3 rounded-full border border-gold/50 bg-forest py-2 pl-2 pr-5 shadow-lg shadow-forest/25">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-forest">
                  <Leaf className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white">
                  Your Health Is My{" "}
                  <span
                    className="text-xl normal-case leading-none text-gold"
                    style={{ fontFamily: "var(--font-signature), cursive" }}
                  >
                    Mission
                  </span>
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-5"
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            variants={fadeUp(20)}
          >
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] lg:ml-auto">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[2.4rem] border border-gold/30"
              />
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-[#EFE9DB] shadow-xl shadow-forest/10">
                <Image
                  src="/images/founder-duku.webp"
                  alt="Duku I. Plange, founder and certified health coach at Duks Juice"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 80vw, 340px"
                />
              </div>
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
