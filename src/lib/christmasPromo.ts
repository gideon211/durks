/**
 * Christmas 2026 campaign configuration.
 *
 * The dates drive everything: the homepage section, the hero CTA and the
 * checkout delivery window all read from here, so the campaign switches itself
 * off on 1 January without a deploy.
 */

export type PromoPack = {
  size: string;
  count: number;
  price: number;
  was: number;
};

export type PromoBundle = {
  id: string;
  name: string;
  contents: string;
  note?: string;
  image: string;
  /** Poster background, used to letterbox the artwork inside a 4:5 card. */
  bg: string;
  packs: PromoPack[];
};

export type PromoPhase = "hidden" | "preorder" | "delivery" | "ended";

const GHANA_OFFSET = "+00:00";

export const CHRISTMAS_PROMO = {
  year: 2026,
  eyebrow: "Christmas 2026",
  headline: "A Taste of Christmas",
  subhead:
    "Five bundle offers at 50% off. Preorder by 30 November, deliveries run 1–31 December.",
  /** Campaign goes live. */
  opensAt: new Date(`2026-11-01T00:00:00${GHANA_OFFSET}`),
  /** Last moment to place a preorder. */
  preorderClosesAt: new Date(`2026-11-30T23:59:59${GHANA_OFFSET}`),
  /** Deliveries run across this window. */
  deliveryFrom: new Date(`2026-12-01T00:00:00${GHANA_OFFSET}`),
  deliveryTo: new Date(`2026-12-31T23:59:59${GHANA_OFFSET}`),
  whatsapp: "233202427880",
  whatsappDisplay: "0202427880",
  phoneAlt: "0240076685",
  poster: "/images/christmas/terms.webp",
  terms: [
    "Delivery fees are not included and are calculated by your location.",
    "Promo bundles come with fixed flavour selections. To choose specific flavours and quantities, order from our regular bundles.",
    "All Christmas deliveries are completed on or before 31 December 2026.",
  ],
  bundles: [
    {
      id: "merry-family-treat",
      name: "Merry Family Treat",
      contents: "Child-friendly flavours and adult delicacies",
      note: "Flavours depend on availability",
      image: "/images/christmas/merry-family.webp",
      bg: "#6B0F1A",
      packs: [
        { size: "250ml", count: 30, price: 350, was: 700 },
        { size: "250ml", count: 50, price: 550, was: 1100 },
      ],
    },
    {
      id: "oh-my-jingle",
      name: "Oh My Jingle Sweetness",
      contents: "Pineapple and melon-based blends",
      image: "/images/christmas/oh-my-jingle.webp",
      bg: "#FBF3E4",
      packs: [
        { size: "330ml", count: 24, price: 410, was: 820 },
        { size: "330ml", count: 50, price: 800, was: 1600 },
      ],
    },
    {
      id: "jolly-combo",
      name: "Jolly Combo Bundle",
      contents: "Pineapple and pineapple-free juices",
      image: "/images/christmas/jolly-combo.webp",
      bg: "#0E3B24",
      packs: [
        { size: "330ml", count: 24, price: 470, was: 940 },
        { size: "330ml", count: 50, price: 925, was: 1850 },
      ],
    },
    {
      id: "santas-treat-box",
      name: "Santa's Treat Box",
      contents: "Our most-requested juices in a cooler box, packed with ice",
      image: "/images/christmas/santas-treat-box.webp",
      bg: "#0B2C4D",
      packs: [
        { size: "330ml", count: 24, price: 710, was: 1420 },
        { size: "330ml", count: 50, price: 1100, was: 2200 },
      ],
    },
    {
      id: "big-gallons",
      name: "Big Gallons! Santa's Treat",
      contents: "More juice, more sharing",
      note: "Pineapple and watermelon-based juices only",
      image: "/images/christmas/big-gallons.webp",
      bg: "#123A1F",
      packs: [
        { size: "4.5L", count: 5, price: 800, was: 1600 },
        { size: "4.5L", count: 10, price: 1600, was: 3200 },
        { size: "4.5L", count: 20, price: 3200, was: 6400 },
      ],
    },
  ] as PromoBundle[],
};

export function getPromoPhase(now: Date = new Date()): PromoPhase {
  if (now < CHRISTMAS_PROMO.opensAt) return "hidden";
  if (now <= CHRISTMAS_PROMO.preorderClosesAt) return "preorder";
  if (now <= CHRISTMAS_PROMO.deliveryTo) return "delivery";
  return "ended";
}

/** Whole days left to preorder, floored at zero. */
export function daysLeftToPreorder(now: Date = new Date()): number {
  const ms = CHRISTMAS_PROMO.preorderClosesAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function formatCedis(amount: number): string {
  return `GHC ${amount.toLocaleString("en-GH")}`;
}

export function preorderLink(bundle: PromoBundle, pack: PromoPack): string {
  const message = `Hello Duks! I'd like to preorder the ${bundle.name} (${pack.size} × ${pack.count}) at ${formatCedis(pack.price)} for Christmas.`;
  return `https://wa.me/${CHRISTMAS_PROMO.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Delivery dates the checkout may offer while the campaign is running. */
export function promoDeliveryWindow(
  now: Date = new Date()
): { from: Date; to: Date } | null {
  if (getPromoPhase(now) !== "preorder") return null;
  return { from: CHRISTMAS_PROMO.deliveryFrom, to: CHRISTMAS_PROMO.deliveryTo };
}
