"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const fadeUp = (y = 30) => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
});

const sectionViewport = { once: true, amount: 0.15 as const };

const accents = {
  forest: { bg: "bg-forest", chip: "bg-forest/10 text-forest" },
  mango: { bg: "bg-mango-orange", chip: "bg-mango-orange/15 text-mango-orange" },
  lime: { bg: "bg-fresh-lime", chip: "bg-fresh-lime/15 text-fresh-lime" },
  pink: { bg: "bg-tropical-pink", chip: "bg-tropical-pink/15 text-tropical-pink" },
  yellow: { bg: "bg-sunny-yellow", chip: "bg-sunny-yellow/20 text-yellow-700" },
  teal: { bg: "bg-ocean-teal", chip: "bg-ocean-teal/15 text-ocean-teal" },
  gold: { bg: "bg-gold", chip: "bg-gold/15 text-gold" },
} as const;

type AccentKey = keyof typeof accents;

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  accent: AccentKey;
};

const categories: Category[] = [
  { id: "bundles", name: "Bundles", slug: "bundle", accent: "forest", description: "Curated juice packs to fit your quantity and dietary needs." },
  { id: "pure-juices", name: "Pure Juices", slug: "pure-juice", accent: "mango", description: "Single strength juices and delicious juice blend combinations." },
  { id: "cleanse", name: "Cleanse Juices", slug: "cleanse", accent: "lime", description: "Cleanse your system regularly with powerful, carefully selected ingredients." },
  { id: "wellness-shots", name: "Wellness Shots", slug: "shots", accent: "pink", description: "Small but mighty potions of health. Let your shots do the waking up!" },
  { id: "smoothies", name: "Smoothies", slug: "smoothies", accent: "yellow", description: "Rich blends of powerful detoxing ingredients." },
  { id: "flavors", name: "Flavors", slug: "flavors", accent: "teal", description: "Delicious juice blends for your specific health needs." },
  { id: "cut-fruits", name: "Cut Fruits", slug: "cut-fruits", accent: "mango", description: "Fresh fruit packs for snacks and desserts." },
  { id: "gift-packs", name: "Gift Packs", slug: "gift-packs", accent: "gold", description: "Share the gift of health with beautifully curated packs." },
  { id: "events", name: "Events", slug: "events", accent: "teal", description: "Bulk juice catering for weddings, festivals, and corporate events." },
];

export default function ProductRail() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanLeft(el.scrollLeft > 8);
      setCanRight(el.scrollLeft < max - 8);
      setProgress(max > 0 ? el.scrollLeft / max : 0);
      const card = el.querySelector<HTMLElement>("[data-card]");
      const step = card ? card.getBoundingClientRect().width + 20 : 300;
      setIndex(Math.min(categories.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.getBoundingClientRect().width + 20 : 320;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <section className="overflow-hidden bg-soft-sand py-20 md:py-28">
      <div className="lg:grid lg:grid-cols-12">
        {/* Header — sticky on desktop */}
        <div className="px-4 sm:px-6 lg:sticky lg:top-28 lg:col-span-4 lg:self-start lg:pr-10 lg:pl-[max(1.5rem,calc((100vw-87.5rem)/2+1rem))]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            variants={fadeUp()}
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/70">
              Shop by category
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-charcoal sm:text-4xl md:text-5xl">
              Explore Our Products
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-neutral-charcoal/60 md:text-lg">
              Discover the perfect juice for your lifestyle
            </p>

            <div className="mt-8 flex items-center gap-5">
              <button
                type="button"
                aria-label="Scroll products left"
                onClick={() => scroll("left")}
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-forest/15 bg-white text-forest transition-all duration-300 hover:bg-forest hover:text-white ${canLeft ? "opacity-100" : "pointer-events-none opacity-30"}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="font-semibold tabular-nums text-forest">
                  {String(index + 1).padStart(2, "0")}
                  <span className="text-neutral-charcoal/40"> / {String(categories.length).padStart(2, "0")}</span>
                </span>
                <span className="h-px flex-1 bg-forest/15">
                  <span
                    className="block h-px bg-gold transition-[width] duration-300"
                    style={{ width: `${progress * 100}%` }}
                  />
                </span>
              </div>

              <button
                type="button"
                aria-label="Scroll products right"
                onClick={() => scroll("right")}
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-forest/15 bg-white text-forest transition-all duration-300 hover:bg-forest hover:text-white ${canRight ? "opacity-100" : "pointer-events-none opacity-30"}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Rail — bleeds off the right edge */}
        <div className="mt-10 min-w-0 lg:col-span-8 lg:mt-0">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            variants={fadeUp(24)}
          >
            <div
              ref={railRef}
              className="flex gap-5 overflow-x-auto px-4 pb-6 no-scrollbar sm:px-6 lg:px-8 lg:pl-10"
              style={{ scrollBehavior: "smooth" }}
            >
              {categories.map((category, i) => {
                const a = accents[category.accent];
                return (
                  <Link
                    key={category.id}
                    href={`/products/${category.slug}`}
                    data-card
                    className="group w-[280px] shrink-0 snap-start rounded-[1.5rem] border border-black/[0.06] bg-white p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-28px_rgba(16,61,22,0.4)] sm:w-[300px]"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[1.15rem] bg-[#F4EFE4]">
                      <Image
                        src={`/images/cards/${category.id}.webp`}
                        alt={category.name}
                        fill
                        sizes="300px"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                      />
                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums backdrop-blur-sm ${a.chip}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="px-2 pb-1.5 pt-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${a.bg}`} />
                        <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-forest">
                          {category.name}
                        </h3>
                      </div>
                      <p className="mt-2 line-clamp-2 pr-8 text-[13px] leading-relaxed text-neutral-charcoal/60">
                        {category.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className={`h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-14 ${a.bg}`} />
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/15 text-forest transition-all duration-300 group-hover:bg-forest group-hover:text-white">
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* trailing spacer so the last card clears the edge cleanly */}
              <div className="w-2 shrink-0" aria-hidden="true" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
