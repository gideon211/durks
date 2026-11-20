"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle, Phone, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CHRISTMAS_PROMO,
  formatCedis,
  preorderLink,
  type PromoBundle,
  type PromoPhase,
} from "@/lib/christmasPromo";

type Props = {
  phase: PromoPhase;
  daysLeft: number;
};

function BundleCard({ bundle, phase }: { bundle: PromoBundle; phase: PromoPhase }) {
  const [selected, setSelected] = useState(0);
  const pack = bundle.packs[selected];
  const ordering = phase === "preorder";

  return (
    <article className="w-[280px] sm:w-[300px] flex-shrink-0 flex flex-col rounded-[1.5rem] overflow-hidden bg-[#FDF8EF] shadow-xl shadow-black/25">
      <div
        className="relative aspect-[4/5] w-full"
        style={{ backgroundColor: bundle.bg }}
      >
        <Image
          src={bundle.image}
          alt={`${bundle.name} Christmas bundle`}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 78vw, 300px"
        />
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#B3121B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-md shadow-black/20">
          50% off
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-[17px] font-extrabold leading-tight tracking-tight text-[#1a2b22]">
          {bundle.name}
        </h3>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-gray-600">
          {bundle.contents}
        </p>

        <div className="mt-4 space-y-1.5" role="group" aria-label="Choose a pack size">
          {bundle.packs.map((option, index) => {
            const isSelected = index === selected;
            return (
              <button
                key={`${option.size}-${option.count}`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(index)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-[#0E3B24] bg-white shadow-sm"
                    : "border-transparent bg-black/[0.035] hover:bg-black/[0.06]"
                }`}
              >
                <span className="text-[12px] font-semibold text-gray-700">
                  {option.size} × {option.count}
                </span>
                <span className="flex items-baseline gap-1.5">
                  <s className="text-[11px] text-gray-400">{formatCedis(option.was)}</s>
                  <span className="text-[13px] font-bold text-[#0E3B24]">
                    {formatCedis(option.price)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {bundle.note ? (
          <p className="mt-3 text-[11px] leading-snug text-gray-500">{bundle.note}</p>
        ) : null}

        <div className="mt-auto pt-4">
          {ordering ? (
            <a
              href={preorderLink(bundle, pack)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#0E3B24] px-4 py-2.5 text-[12.5px] font-bold tracking-wide text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#145232] active:scale-[0.98]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Preorder {formatCedis(pack.price)}
            </a>
          ) : (
            <Link
              href="/products"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#0E3B24] px-4 py-2.5 text-[12.5px] font-bold tracking-wide text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#145232] active:scale-[0.98]"
            >
              Shop regular bundles
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ChristmasBundles({ phase, daysLeft }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  if (phase === "hidden" || phase === "ended") return null;

  const preordering = phase === "preorder";

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.floor(el.clientWidth * 0.8);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section
      id="christmas"
      className="relative scroll-mt-20 overflow-hidden bg-[#0B2E1F] py-20 text-white md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(214,164,58,0.18) 0%, rgba(11,46,31,0) 70%)",
        }}
      />

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E0B75A]">
            {CHRISTMAS_PROMO.eyebrow}
          </p>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            {CHRISTMAS_PROMO.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/70 md:text-base">
            {CHRISTMAS_PROMO.subhead}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#E0B75A]/40 bg-[#E0B75A]/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#F0D18A] sm:text-[11px]">
            {preordering ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-[#E0B75A]" />
                Preorder closes 30 Nov
                {daysLeft > 0 ? (
                  <span className="text-white/60">· {daysLeft} days left</span>
                ) : null}
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-[#E0B75A]" />
                Deliveries until 31 Dec
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy("left")}
          className={`absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-110 active:scale-95 md:flex ${
            canLeft ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <ChevronLeft className="h-5 w-5 text-gray-800" />
        </button>

        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy("right")}
          className={`absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-110 active:scale-95 md:flex ${
            canRight ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <ChevronRight className="h-5 w-5 text-gray-800" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="no-scrollbar flex w-full snap-x snap-mandatory items-stretch gap-5 overflow-x-auto px-4 pb-4 sm:px-6 scroll-pl-4 sm:scroll-pl-6"
          style={{ scrollBehavior: "smooth" }}
        >
          {CHRISTMAS_PROMO.bundles.map((bundle) => (
            <div key={bundle.id} className="flex snap-start">
              <BundleCard bundle={bundle} phase={phase} />
            </div>
          ))}
        </div>
      </div>

      <div className="container relative mx-auto mt-10 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-md">
              <h3 className="font-heading text-sm font-bold tracking-tight text-white">
                Before you preorder
              </h3>
              <ul className="mt-3 space-y-2">
                {CHRISTMAS_PROMO.terms.map((term) => (
                  <li
                    key={term}
                    className="flex gap-2 text-[12.5px] leading-relaxed text-white/65"
                  >
                    <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-[#E0B75A]" />
                    {term}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full border border-white/20 px-4 py-2 text-[12px] font-semibold text-white/85 transition-colors hover:bg-white/10"
                  >
                    View the promo poster
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md p-2 sm:p-3">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Duks Christmas promo terms and conditions</DialogTitle>
                  </DialogHeader>
                  <div className="relative aspect-[1022/1280] w-full overflow-hidden rounded-lg">
                    <Image
                      src={CHRISTMAS_PROMO.poster}
                      alt="Duks Christmas promo terms and conditions, 50% off juice bundles"
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 92vw, 448px"
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <a
                href={`tel:${CHRISTMAS_PROMO.whatsapp}`}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/60 transition-colors hover:text-white"
              >
                <Phone className="h-3 w-3" />
                {CHRISTMAS_PROMO.whatsappDisplay} · {CHRISTMAS_PROMO.phoneAlt}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
